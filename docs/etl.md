# ETL Notes

## Current workflow

1. Download official CSV exports from Comunidad de Madrid.
2. Normalize the source structure from wide hourly columns to long observations.
3. Parse timestamps, canonicalize station identifiers, and coerce numeric values.
4. Apply validity and conservative risk labeling.
5. Merge all normalized local files into a bundle and deduplicate by `station_id`, `pollutant_code`, and `measured_at`.
6. Enrich station metadata from the official station roster.
7. Produce downstream API responses and model artifacts from the normalized bundle.

## Important implementation details

- Local mode must merge every available normalized snapshot instead of only the newest file.
- Duplicates are resolved by keeping the newest row for the same station, pollutant, and timestamp.
- Station metadata coordinates are parsed from official DMS-like strings into decimal latitude and longitude.
- Risk labels are conservative internal product labels, not legal threshold classifications.

## Outputs currently feeding the product

- Latest observations and summary endpoints.
- History endpoint for station views.
- System and alert surfaces.
- Model metrics and forecast artifacts.

## Known ETL gap

Meteorological feature ingestion is documented but not yet joined into the running model-v1 path.
