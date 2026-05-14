# Known Limitations

## Data and platform

- Cloudflare D1 is the live production source of truth for observations, but artifacts, alerts, and reports are not fully persisted there yet.
- Cron automation is represented structurally but not fully operational.
- The frontend depends on the API being available locally or through a configured deployment.

## Modeling

- The public API does not yet expose station-level error, even though the artifact computes it.
- Model v1 does not include weather features.
- Predictions remain precomputed local artifacts rather than persisted forecast tables.

## Reporting

- Weekly historical reporting is not persisted yet.
- Known issues and reports are current-state views, not full longitudinal audit logs.

## Product scope

- Methodology and reports are implemented, but reporting and model artifacts are still backed by the local-first pipeline rather than fully persisted platform tables.
