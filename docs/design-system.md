# Design System

## Core direction

MADRID Aire is intentionally positioned away from generic dashboard aesthetics. The interface uses an editorial premium shell with atmospheric glass surfaces, restrained color accents, and a strict no-boilerplate attitude.

## Branding rules already reflected in code

- Mandatory MADRID Aire wordmark.
- Comunidad de Madrid flag integrated into the lockup.
- High-contrast typography for headings and data readouts.

## Surface rules

- `glass-panel` cards define the primary container language.
- Pages prioritize strong hero framing before metrics or tables.
- Desktop and mobile layouts are intentionally adapted rather than simple stacked clones.
- Public surfaces must answer a user question first: what is happening now, where is it happening, and what should I look at next.
- Technical depth must never compete with the public journey in the primary navigation.

## Navigation rules

- Primary public navigation is limited to `Dashboard`, `Map`, `Stations`, `Predictions`, and `About/Guide`.
- `Model`, `Methodology`, `Reports`, and `System` belong to a secondary advanced layer reachable from the guide/about surface.
- Repeated page-by-page navigation variants should be avoided; the public layer should feel like one continuous product.

## Visual semantics

- Size encodes relative NO2 importance on the map.
- Color encodes internal risk state.
- Opacity encodes freshness.
- The public map must keep Madrid geographically readable at a glance. A basemap that feels like a flat color field is a design failure.
- The map needs a print-safe representation. PDF/export should not depend on a live WebGL canvas alone.

## Implemented page families

- Editorial landing.
- Operational dashboards and maps.
- Technical transparency pages for model, methodology, system, and reports.

## Language rules

- Landing, dashboard, map, stations, and station detail must use public-facing language.
- Use words like `forecast`, `station`, `current signal`, `last update`, and `guide`.
- Avoid foregrounding internal terms such as `artifact`, `temporal split`, `normalized CSV`, `node`, or `baseline` on public surfaces.
- If a technical concept is necessary, explain what the user is seeing before naming the concept.

## Constraint

The design layer must never hide missing data. Empty or partial states should stay elegant, but truthful.
