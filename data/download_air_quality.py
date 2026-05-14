from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from datetime import datetime, timezone
from hashlib import sha256
from pathlib import Path
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen


BASE_DIR = Path(__file__).resolve().parent
DEFAULT_OUTPUT_DIR = BASE_DIR / "sample_real"
DEFAULT_METADATA_DIR = BASE_DIR / "metadata"
CKAN_PACKAGE_SHOW = "https://datos.comunidad.madrid/api/3/action/package_show"
USER_AGENT = "madrid-aire-downloader/0.1"


@dataclass(frozen=True)
class DatasetConfig:
    key: str
    slug: str
    prefix: str
    description: str


DATASETS: dict[str, DatasetConfig] = {
    "stations": DatasetConfig(
        key="stations",
        slug="calidad_aire_estaciones",
        prefix="stations_from_official_source",
        description="Official air-quality station metadata from Comunidad de Madrid",
    ),
    "current-day": DatasetConfig(
        key="current-day",
        slug="calidad_aire_datos_dia",
        prefix="community_current_day",
        description="Official current-day air-quality observations from Comunidad de Madrid",
    ),
    "historical": DatasetConfig(
        key="historical",
        slug="calidad_aire_datos_historico",
        prefix="community_historical",
        description="Official historical hourly air-quality data from Comunidad de Madrid",
    ),
    "meteo-historical": DatasetConfig(
        key="meteo-historical",
        slug="calidad_aire_datos_meteo_historico",
        prefix="community_meteo_historical",
        description="Official historical meteorological data from Comunidad de Madrid",
    ),
}


def fetch_json(url: str) -> dict[str, Any]:
    request = Request(url, headers={"User-Agent": USER_AGENT})

    with urlopen(request) as response:
        return json.load(response)


def fetch_bytes(url: str) -> bytes:
    request = Request(url, headers={"User-Agent": USER_AGENT})

    with urlopen(request) as response:
        return response.read()


def package_show_url(slug: str) -> str:
    return f"{CKAN_PACKAGE_SHOW}?{urlencode({'id': slug})}"


def get_package_metadata(dataset: DatasetConfig) -> dict[str, Any]:
    payload = fetch_json(package_show_url(dataset.slug))

    if not payload.get("success"):
        raise RuntimeError(f"CKAN package_show failed for dataset '{dataset.slug}'.")

    return payload["result"]


def select_resource(
    resources: list[dict[str, Any]],
    resource_format: str,
    resource_label: str | None,
) -> dict[str, Any]:
    normalized_format = resource_format.upper()
    candidates = [resource for resource in resources if str(resource.get("format", "")).upper() == normalized_format]

    if not candidates:
        raise RuntimeError(f"No resources with format '{resource_format}' were found.")

    if resource_label is None:
        return candidates[0]

    lowered_label = resource_label.casefold()

    for resource in candidates:
        name = str(resource.get("name", "")).casefold()
        description = str(resource.get("description", "")).casefold()
        url = str(resource.get("url", "")).casefold()

        if lowered_label in name or lowered_label in description or lowered_label in url:
            return resource

    raise RuntimeError(
        f"No '{resource_format}' resource matched label '{resource_label}'. Available names: "
        + ", ".join(str(resource.get("name", "unnamed")) for resource in candidates)
    )


def infer_extension(resource: dict[str, Any]) -> str:
    resource_format = str(resource.get("format", "bin")).lower()

    if resource_format == "csv":
        return "csv"

    if resource_format == "json":
        return "json"

    return resource_format or "bin"


def infer_output_stem(dataset: DatasetConfig, resource: dict[str, Any], resource_label: str | None) -> str:
    if resource_label:
        safe_label = resource_label.strip().lower().replace(" ", "-")
        return f"{dataset.prefix}_{safe_label}"

    last_modified = str(resource.get("last_modified") or resource.get("metadata_modified") or "")[:10]
    if last_modified:
        return f"{dataset.prefix}_{last_modified}"

    today = datetime.now(timezone.utc).date().isoformat()
    return f"{dataset.prefix}_{today}"


def build_metadata(dataset: DatasetConfig, package: dict[str, Any], resource: dict[str, Any], file_path: Path) -> dict[str, Any]:
    file_bytes = file_path.read_bytes()

    return {
        "dataset_key": dataset.key,
        "dataset_slug": dataset.slug,
        "dataset_title": package.get("title"),
        "dataset_description": dataset.description,
        "resource_id": resource.get("id"),
        "resource_name": resource.get("name"),
        "resource_format": resource.get("format"),
        "resource_url": resource.get("url"),
        "license_title": package.get("license_title"),
        "license_url": package.get("license_url"),
        "downloaded_at_utc": datetime.now(timezone.utc).isoformat(),
        "source_metadata_modified": resource.get("metadata_modified"),
        "source_last_modified": resource.get("last_modified"),
        "bytes": len(file_bytes),
        "sha256": sha256(file_bytes).hexdigest(),
        "local_file": str(file_path.relative_to(BASE_DIR)),
    }


def write_file(path: Path, content: bytes, force: bool) -> None:
    if path.exists() and not force:
        raise FileExistsError(f"Refusing to overwrite existing file: {path}")

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(content)


def download_dataset(
    dataset_key: str,
    resource_format: str,
    resource_label: str | None,
    output_dir: Path,
    metadata_dir: Path,
    force: bool,
) -> dict[str, Any]:
    dataset = DATASETS[dataset_key]
    package = get_package_metadata(dataset)
    resource = select_resource(package["resources"], resource_format=resource_format, resource_label=resource_label)
    extension = infer_extension(resource)
    output_stem = infer_output_stem(dataset, resource, resource_label)
    output_path = output_dir / f"{output_stem}.{extension}"
    metadata_path = metadata_dir / f"{output_stem}.metadata.json"

    content = fetch_bytes(str(resource["url"]))
    write_file(output_path, content, force=force)

    metadata = build_metadata(dataset, package, resource, output_path)
    metadata_path.parent.mkdir(parents=True, exist_ok=True)
    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    return {
        "file": str(output_path),
        "metadata": str(metadata_path),
        "resource_url": resource["url"],
        "resource_name": resource.get("name"),
        "resource_format": resource.get("format"),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Download official Comunidad de Madrid air-quality resources.")
    parser.add_argument("dataset", choices=sorted(DATASETS.keys()))
    parser.add_argument("--format", default="CSV", help="Resource format to download, for example CSV or JSON.")
    parser.add_argument(
        "--label",
        dest="resource_label",
        help="Optional resource label filter, for example 2026 for historical yearly files.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help="Directory where the downloaded resource will be stored.",
    )
    parser.add_argument(
        "--metadata-dir",
        type=Path,
        default=DEFAULT_METADATA_DIR,
        help="Directory where the metadata sidecar JSON will be stored.",
    )
    parser.add_argument("--force", action="store_true", help="Overwrite the target file if it already exists.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    result = download_dataset(
        dataset_key=args.dataset,
        resource_format=args.format,
        resource_label=args.resource_label,
        output_dir=args.output_dir,
        metadata_dir=args.metadata_dir,
        force=args.force,
    )
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
