# MADRID Aire — Ultimate Product, Design & Engineering Bible v6.0
## Especificación definitiva ultra-premium para crear un producto profesional, sublime y técnicamente impecable

**Producto:** MADRID Aire / Madrid Air Intelligence  
**Versión:** 6.0 final acumulativa  
**Uso previsto:** entregar este documento a GitHub Copilot Agent en Visual Studio Code como especificación absoluta de construcción.  
**Objetivo:** construir una plataforma premium, funcional, robusta, visualmente extraordinaria y técnicamente defendible para análisis, visualización y predicción de calidad del aire en Madrid.  
**Stack principal:** Next.js, React, TypeScript, Tailwind CSS, Framer Motion, MapLibre GL, Python, FastAPI, pandas, NumPy, scikit-learn, Supabase Pro, Vercel.  
**Filosofía:** no hacer una web. Crear un producto. No hacer un dashboard. Crear un observatorio atmosférico interactivo. No hacer una demo. Crear una demostración de genialidad técnica y visual.

---

# 0. Contrato absoluto de calidad

Este documento es la fuente de verdad. Si hay conflicto entre una decisión rápida y este documento, prevalece este documento.

## 0.1 Reglas no negociables

```text
1. No usar datos mock sintéticos.
2. No inventar estaciones, coordenadas, valores, contaminantes ni predicciones.
3. Usar datos reales oficiales desde el primer flujo funcional.
4. Se permite usar cache local solo si proviene de una fuente oficial y está documentada.
5. La landing debe ser ultra-premium desde el primer commit visual.
6. La marca debe ser exactamente: [Bandera Comunidad de Madrid] [MADRID] [Aire].
7. El producto debe verse diferente y excelente en cada tipo de pantalla.
8. La API debe ser ligera, segura y clara.
9. El ETL debe estar escrito con pandas y NumPy de forma reproducible.
10. El ML debe empezar con baseline, split temporal y métricas honestas.
11. Las predicciones deben estar precalculadas y guardadas en base de datos.
12. Supabase Pro es el núcleo de datos, logs, storage, cron, métricas y predicciones.
13. Vercel es frontend y API ligera, no servidor pesado de entrenamiento.
14. OpenClaw, si se usa, es supervisor MLOps, no dependencia crítica.
15. Todo debe estar documentado.
16. Todo debe ser defendible en una entrevista técnica.
17. Todo debe tener intención visual.
18. Nada debe parecer plantilla genérica de IA.
```

## 0.2 Definición de excelencia

El proyecto es excelente si cumple estas tres condiciones:

```text
Primera impresión:
  El usuario siente que entra en una pieza digital premium y memorable.

Segunda impresión:
  El usuario entiende que los datos son reales, útiles y explorables.

Tercera impresión:
  Un perfil técnico comprueba que hay arquitectura real, ETL, SQL, ML, evaluación y despliegue profesional.
```

## 0.3 Definición de fracaso

El proyecto ha fracasado si ocurre cualquiera de estas cosas:

```text
La web parece una plantilla.
La landing parece generada por IA.
Hay datos inventados.
El mapa usa estilo default sin personalidad.
Las gráficas parecen Recharts por defecto.
El ML no tiene baseline.
El frontend depende de datos falsos.
El backend expone secretos.
El diseño mobile es simplemente desktop apilado.
El proyecto no se puede explicar en una entrevista.
```

---

# 1. Visión del producto

## 1.1 Qué es MADRID Aire

MADRID Aire es un observatorio atmosférico urbano interactivo para Madrid. Combina datos oficiales de calidad del aire, análisis histórico, visualización geoespacial y predicción con machine learning en una experiencia visual premium.

Debe funcionar como:

```text
Producto público.
Portfolio Data/AI.
Caso de estudio full-stack.
Demostración de diseño premium.
Proyecto técnico defendible.
Base futura para MLOps con automatización.
```

## 1.2 Qué resuelve

Debe responder a:

```text
¿Cómo está el aire en Madrid ahora?
¿Qué contaminante domina?
¿Qué estación está peor?
¿Cómo ha cambiado la calidad del aire en las últimas 24h, 7d o 30d?
¿Qué zonas presentan mayor riesgo?
¿Qué predice el modelo para las próximas 24h/48h?
¿Qué precisión tiene el modelo?
¿Qué datos se han usado?
¿Cuándo se actualizó el sistema?
¿Hay fallos de ingesta o datos incompletos?
```

## 1.3 Qué demuestra profesionalmente

```text
Product thinking.
Data engineering.
Data analysis.
UX/UI premium.
Frontend avanzado.
Backend Python.
SQL/PostgreSQL.
Supabase.
ETL con pandas y NumPy.
Machine learning aplicado.
Model evaluation.
MLOps thinking.
Cloud deployment.
Technical documentation.
```

---

# 2. Identidad de marca

## 2.1 Nombre visual

```text
MADRID Aire
```

## 2.2 Nombre técnico

```text
Madrid Air Intelligence
```

## 2.3 Claim principal

```text
A living atmospheric atlas of Madrid.
```

## 2.4 Claim español

```text
Un atlas atmosférico vivo de Madrid.
```

## 2.5 Subclaim

```text
Official open data, machine learning forecasts and urban air quality intelligence.
```

## 2.6 Tono de voz

Debe ser:

```text
Preciso.
Sobrio.
Técnico.
Editorial.
Elegante.
Confiable.
Internacional.
No exagerado.
```

Evitar:

```text
Revolutionary AI.
Magic insights.
Next-gen platform.
Unlock the power.
Smart air dashboard.
```

Usar:

```text
Official observations.
Temporal forecast.
Model performance.
Baseline comparison.
Data freshness.
Atmospheric signal.
Precomputed predictions.
```

---

# 3. Wordmark obligatorio

## 3.1 Estructura exacta

La marca debe renderizarse así:

```text
[Bandera Comunidad de Madrid] [MADRID] [Aire]
```

Todo en una sola línea.

## 3.2 Bandera Comunidad de Madrid

Crear como SVG propio.

Archivo:

```text
apps/web/components/branding/CommunityMadridFlag.tsx
```

Características:

```text
Rojo: #C60B1E.
Siete estrellas blancas.
Estrellas vectoriales nítidas.
Proporción horizontal elegante.
Sin clipart.
Sin imagen raster.
Sin sombra vulgar.
Debe sentirse como símbolo institucional integrado en una marca premium.
```

Implementación conceptual:

```tsx
export function CommunityMadridFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" aria-label="Bandera de la Comunidad de Madrid">
      <rect width="120" height="80" rx="4" fill="#C60B1E" />
      {/* Renderizar 7 estrellas blancas como polygons o paths */}
    </svg>
  )
}
```

## 3.3 MADRID

La palabra MADRID debe usar una tipografía pesada, urbana y clara.

Recomendadas:

```text
Archivo Black
Anton
League Spartan ExtraBold
Arial Black fallback
Impact fallback
```

CSS:

```css
.logo-madrid {
  font-family: var(--font-logo-heavy), Impact, Arial Black, sans-serif;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.055em;
  line-height: 0.9;
}
```

## 3.4 Aire

La palabra Aire debe usar script/caligrafía elegante.

Recomendadas:

```text
Allura
Parisienne
Cormorant Garamond Italic si se estiliza cuidadosamente
Great Vibes solo si no queda cursi
```

CSS:

```css
.logo-aire {
  font-family: var(--font-logo-script), cursive;
  font-weight: 400;
  letter-spacing: -0.025em;
  line-height: 0.9;
  transform: translateY(0.07em);
}
```

## 3.5 Componente wordmark

Archivo:

```text
apps/web/components/branding/MadridAireWordmark.tsx
```

Props:

```ts
export type MadridAireWordmarkProps = {
  size?: 'hero' | 'header' | 'footer' | 'compact'
  theme?: 'dark' | 'light'
  showFlag?: boolean
  className?: string
}
```

Debe usarse en:

```text
Hero.
Header.
Footer.
Loading screen.
Open Graph futura.
Pantalla de error premium.
```

## 3.6 Escalado por dispositivo

```text
4K / exhibition:
  MADRID: 180px-260px
  Aire: 170px-250px
  bandera: 140px-190px ancho

Ultra-wide:
  MADRID: 140px-210px
  Aire: 130px-200px
  bandera: 110px-160px ancho

Desktop:
  MADRID: 96px-170px
  Aire: 88px-160px
  bandera: 80px-120px ancho

Tablet:
  MADRID: 72px-120px
  Aire: 66px-112px
  bandera: 58px-90px ancho

Mobile:
  MADRID: 44px-76px
  Aire: 42px-74px
  bandera: 38px-62px ancho

Small mobile:
  MADRID: 36px-58px
  Aire: 34px-56px
  bandera: 30px-46px ancho
```

Regla:

```text
Reducir tamaño antes que apilar.
Solo apilar si el viewport es extremadamente estrecho y aun así mantener armonía.
```

---

# 4. Dirección visual sublime

## 4.1 Concepto

```text
Atmospheric Intelligence Atlas
```

El producto debe parecer una combinación de:

```text
Atlas científico.
Observatorio urbano.
Interfaz ambiental.
Pieza editorial premium.
Mapa nocturno.
Sistema de inteligencia territorial.
Control room atmosférico.
```

## 4.2 Sensaciones

```text
Cinematográfico.
Sobrio.
Silencioso.
Preciso.
Elegante.
Frío pero humano.
Técnico pero comprensible.
Urbano.
Memorable.
```

## 4.3 Referencias conceptuales permitidas

No copiar diseños concretos, pero inspirarse en:

```text
Cartografía meteorológica.
Mapas topográficos.
Interfaces científicas.
Publicaciones editoriales premium.
Control rooms.
Data art funcional.
Fotografía nocturna urbana.
```

## 4.4 Prohibiciones visuales

```text
Gradientes azul/morado tipo IA.
Hero con ilustración 3D genérica.
Cards SaaS con blur.
Glassmorphism excesivo.
Iconos stock decorativos.
Mapa Google/Leaflet default.
Gráficas default.
Sidebar de admin panel.
Sombras de neón baratas.
Fondos de partículas aleatorias.
Demasiados emojis o iconos.
Mockups falsos.
Lorem ipsum.
```

---

# 5. Sistema de color definitivo

## 5.1 Base

```text
Graphite Black: #080A0C
Deep Asphalt: #111418
Cold Charcoal: #1A1E23
Steel Line: #2A3037
Smog Grey: #8B949E
Bone White: #E8E2D5
Soft White: #F4F1EA
Madrid Red: #C60B1E
Star White: #FFFFFF
```

## 5.2 Acento principal

```text
Atmospheric Lime: #D8FF4F
```

Uso:

```text
Solo para acciones clave, highlights de sistema o estados positivos.
No usar como fondo principal.
No abusar.
```

## 5.3 Contaminantes

```text
NO2: #FFB000
O3: #8B5CF6
PM10: #C2410C
PM2.5: #B6FF3B
SO2: #22D3EE
CO: #F0ABFC
NO: #F97316
NOX: #FB7185
```

## 5.4 Riesgo

```text
Good: #80FFB2
Acceptable: #D8FF4F
Moderate: #FFB000
Poor: #FF6B35
Very Poor: #C2410C
Extreme: #F43F5E
Unknown: #8B949E
```

## 5.5 Reglas

```text
El fondo nunca debe ser negro plano sin textura.
Los datos usan color con significado.
La marca roja vive principalmente en la bandera.
El sistema cromático cambia sutilmente según contaminante seleccionado.
No usar más de un acento fuerte por módulo.
```

---

# 6. Tipografía definitiva

## 6.1 Fuentes

Usar `next/font/google`.

```ts
import { Archivo_Black, Allura, Inter, IBM_Plex_Mono } from 'next/font/google'
```

## 6.2 Roles

```text
Archivo Black:
  Palabra MADRID.

Allura:
  Palabra Aire.

Inter:
  UI general y texto.

IBM Plex Mono:
  Datos, unidades, timestamps, métricas, código.
```

## 6.3 Jerarquía

```text
Hero wordmark:
  clamp(3rem, 11vw, 13rem)

Section display:
  clamp(2.75rem, 7vw, 7rem)

Section title:
  clamp(2rem, 4vw, 4rem)

Body:
  16px-18px

Technical labels:
  10px-12px uppercase
  letter-spacing: 0.14em-0.18em

Data values:
  32px-96px mono
```

## 6.4 Ritmo

```text
Mucho espacio negativo.
Párrafos cortos.
Bloques de texto estrechos.
Datos grandes.
Labels pequeños.
No saturar el hero.
```

---

# 7. Experiencia por dispositivo

## 7.1 Breakpoints

```ts
screens: {
  'xs': '360px',
  'sm': '480px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
  '3xl': '1800px',
  '4xl': '2200px',
  'mobile-landscape': { raw: '(max-height: 520px) and (orientation: landscape)' },
  'tablet-portrait': { raw: '(min-width: 768px) and (max-width: 1023px) and (orientation: portrait)' },
  'tablet-landscape': { raw: '(min-width: 1024px) and (max-width: 1279px) and (orientation: landscape)' },
  'pointer-coarse': { raw: '(pointer: coarse)' },
  'pointer-fine': { raw: '(pointer: fine)' },
  'reduced-motion': { raw: '(prefers-reduced-motion: reduce)' },
  'high-contrast': { raw: '(prefers-contrast: more)' }
}
```

## 7.2 Experiencia por formato

```text
Small mobile:
  Estado esencial, navegación inferior, mini visualizaciones.

Standard mobile:
  Experiencia narrativa táctil.

Large mobile:
  Dashboard móvil enriquecido.

Tablet portrait:
  Lectura editorial + exploración táctil.

Tablet landscape:
  Consola táctil con mapa y paneles.

Laptop:
  Producto completo compacto.

Desktop:
  Experiencia principal premium.

Ultra-wide:
  Observatorio expandido.

4K:
  Sala de control / instalación visual.
```

## 7.3 Reglas táctiles

Si `pointer: coarse`:

```text
Tap targets >= 44px.
No depender de hover.
Tooltips pasan a tap cards.
Map drawer como bottom sheet.
Filtros grandes.
Menos densidad.
```

## 7.4 Reglas escritorio

Si `pointer: fine`:

```text
Hover states.
Tooltips.
Paneles laterales.
Atajos de teclado.
Microinteracciones precisas.
```

---

# 8. Landing fullscreen final

## 8.1 Objetivo

La landing debe ser una portada de producto. Debe impresionar sin parecer decorativa vacía.

## 8.2 Desktop layout

```text
Top-left:
  [flag] MADRID Aire compact

Top-right:
  LIVE · MADRID · AIR QUALITY

Center:
  [flag] MADRID Aire huge

Below:
  A living atmospheric atlas of Madrid.

CTA:
  Seguir

Bottom-left:
  NO2 · latest value · risk

Bottom-right:
  Updated · timestamp
```

## 8.3 Ultra-wide layout

```text
Left:
  Wordmark huge
  Claim
  CTA

Center/right:
  Atmospheric map field

Right rail:
  Current signal
  Worst station
  Forecast trend
  Stations online
```

## 8.4 Mobile layout

```text
Top:
  Compact wordmark

Center:
  Wordmark scaled in one line
  Short claim
  CTA

Bottom:
  Current pollutant status
```

## 8.5 Background layers

```text
1. Graphite radial gradient.
2. Real hero image or procedural atmospheric scene.
3. Abstract Madrid line map.
4. Isobar curves.
5. Real station nodes.
6. Editorial noise.
7. Dark cinematic overlay.
8. Pollutant glow.
```

## 8.6 Asset paths

```text
public/images/hero/madrid-aire-hero-320.jpg
public/images/hero/madrid-aire-hero-640.jpg
public/images/hero/madrid-aire-hero-1024.jpg
public/images/hero/madrid-aire-hero-1440.jpg
public/images/hero/madrid-aire-hero-2160.jpg
public/textures/noise.webp
public/textures/isobars.svg
public/textures/fine-grid.svg
```

If hero images are missing, use procedural CSS/SVG. Do not use random stock imagery.

---

# 9. Navigation

## 9.1 Desktop header

```text
Height: 72px.
Position: sticky/fixed.
Transparent on hero, graphite blur after scroll.
Left: wordmark.
Center/right: navigation.
Right: live status dot.
```

Links:

```text
Dashboard
Map
Predictions
Model
Methodology
System
```

## 9.2 Mobile navigation

Use bottom nav.

Items:

```text
Home
Map
Forecast
Model
```

Style:

```text
Graphite translucent.
Fine top border.
Safe-area support.
No generic hamburger as primary nav.
```

## 9.3 Tablet

Use editorial menu panel:

```text
Wordmark left.
Menu button right.
Fullscreen/side panel menu.
Large items.
Mini system status.
```

---

# 10. Frontend pages

## 10.1 `/`

Landing + dashboard preview.

Sections:

```text
Hero fullscreen.
Live Atmospheric Status.
Map preview.
Forecast preview.
Model Intelligence.
Methodology preview.
Footer.
```

## 10.2 `/dashboard`

Executive overview.

Modules:

```text
Dominant pollutant.
Worst station.
Average values.
Stations online.
Forecast trend.
Map preview.
History chart.
Model status.
Data quality.
```

## 10.3 `/map`

Full atmospheric map.

Modules:

```text
Pollutant selector.
Map.
Legend.
Station drawer.
Observed/predicted toggle.
Freshness indicator.
```

## 10.4 `/stations`

Station explorer.

Desktop: premium table.  
Mobile: station cards.

## 10.5 `/stations/[id]`

Station detail.

```text
Current values.
History.
Forecast.
Model error.
Freshness.
Available pollutants.
```

## 10.6 `/predictions`

```text
Forecast horizon selector.
Observed vs predicted.
Risk evolution.
Prediction generated_at.
Model version.
```

## 10.7 `/model`

```text
Model card.
Metrics.
Baseline comparison.
Feature list.
Error by station.
Limitations.
```

## 10.8 `/methodology`

```text
Sources.
ETL.
Validation.
Feature engineering.
Temporal split.
Evaluation.
Limitations.
```

## 10.9 `/system`

```text
Pipeline runs.
Data quality checks.
Prediction runs.
Active alerts.
Model production.
Cron status.
```

## 10.10 `/reports`

```text
Daily summary.
Weekly model report.
Data freshness.
Known issues.
```

---

# 11. Components

## 11.1 Branding

```text
CommunityMadridFlag.tsx
MadridAireWordmark.tsx
```

## 11.2 Landing

```text
AtmosphericHero.tsx
LiveStatusStrip.tsx
DashboardPreview.tsx
EditorialIntro.tsx
ScrollCue.tsx
```

## 11.3 Visual

```text
AtmosphericField.tsx
NoiseOverlay.tsx
IsobarLines.tsx
StationPulseField.tsx
CinematicOverlay.tsx
PollutantGlow.tsx
```

## 11.4 Map

```text
AtmosphericMap.tsx
StationNode.tsx
MapLegend.tsx
StationDrawer.tsx
PollutantMapLayer.tsx
MapControls.tsx
```

## 11.5 Data

```text
PollutantSelector.tsx
RiskBadge.tsx
KpiMetric.tsx
DataTimestamp.tsx
SystemStatus.tsx
FreshnessIndicator.tsx
```

## 11.6 Charts

```text
ForecastChart.tsx
HistoryChart.tsx
ModelErrorChart.tsx
BaselineComparisonChart.tsx
HourlyHeatmap.tsx
Sparkline.tsx
```

## 11.7 Model

```text
ModelPerformancePanel.tsx
BaselineComparison.tsx
FeatureList.tsx
ModelCard.tsx
MetricsGrid.tsx
```

## 11.8 System

```text
PipelineTimeline.tsx
DataQualityPanel.tsx
PredictionRunPanel.tsx
AlertList.tsx
CronStatus.tsx
```

---

# 12. Data sources

## 12.1 Comunidad de Madrid — historical air quality

```text
Dataset:
Red de Calidad del Aire. Datos horarios desde 2005

Catalog URL:
https://datos.comunidad.madrid/dataset/calidad_aire_datos_historico

Use:
Historical analysis and ML training.
```

Contains hourly annual data from 2005 to the last complete month of the current year. Pollutants include NO, NO2, O3, PM10, PM2.5, SO2, CO, Bencene, Toluene, M-Xylene, total hydrocarbons and non-methane hydrocarbons.

## 12.2 Comunidad de Madrid — current day

```text
Dataset:
Red de Calidad del Aire. Datos del día en curso

Catalog URL:
https://datos.comunidad.madrid/dataset/calidad_aire_datos_dia

Use:
Current/latest observations.
```

## 12.3 Comunidad de Madrid — current month

```text
Dataset:
Red de Calidad del Aire. Datos del mes en curso

Use:
Incremental ingestion.
```

## 12.4 Comunidad de Madrid — meteorological historical

```text
Dataset:
Red de Calidad del Aire. Datos meteorológicos horarios desde 2020

Catalog URL:
https://datos.comunidad.madrid/dataset/calidad_aire_datos_meteo_historico

Use:
Weather features.
```

Variables:

```text
Wind speed.
Wind direction.
Temperature.
Relative humidity.
Atmospheric pressure.
Solar radiation.
Precipitation.
```

## 12.5 Ayuntamiento de Madrid

Use as complementary source:

```text
Calidad del aire. Datos en tiempo real.
Calidad del aire. Datos horarios desde 2001.
```

Catalog search:

```text
https://datos.madrid.es
```

## 12.6 AEMET

Optional official weather enrichment:

```text
https://www.aemet.es/es/datos_abiertos/AEMET_OpenData
```

---

# 13. No mock data policy

## 13.1 Prohibited

```text
No fakeStations.ts.
No random observations.
No fabricated predictions.
No invented coordinates.
No synthetic station names.
```

## 13.2 Allowed

```text
Official downloaded CSV.
Official cached snapshot.
Official sample extracted from real source.
Development fixture generated from official data.
```

## 13.3 Naming

Allowed:

```text
data/sample_real/community_2026_no2_sample.csv
data/sample_real/stations_from_official_source.json
```

Forbidden:

```text
mockAirQuality.ts
dummyStations.ts
fakePredictions.json
```

---

# 14. Backend architecture

## 14.1 FastAPI structure

```text
apps/api/src/
├── main.py
├── settings.py
├── db/
│   └── supabase_client.py
├── routes/
│   ├── health.py
│   ├── stations.py
│   ├── pollutants.py
│   ├── observations.py
│   ├── predictions.py
│   ├── metrics.py
│   ├── system.py
│   └── jobs.py
├── services/
│   ├── stations_service.py
│   ├── observations_service.py
│   ├── predictions_service.py
│   ├── metrics_service.py
│   ├── system_service.py
│   └── jobs_service.py
└── schemas/
    ├── station.py
    ├── pollutant.py
    ├── observation.py
    ├── prediction.py
    └── metric.py
```

## 14.2 Requirements

```text
fastapi
uvicorn
pydantic
pydantic-settings
python-dotenv
supabase
requests
pandas
numpy
scikit-learn
joblib
```

If Vercel bundle becomes too heavy, split:

```text
API-light requirements:
  fastapi
  uvicorn
  pydantic
  pydantic-settings
  supabase
  requests

Jobs/ML requirements:
  pandas
  numpy
  scikit-learn
  joblib
```

## 14.3 Public endpoints

```text
GET /api/health
GET /api/stations
GET /api/pollutants
GET /api/latest
GET /api/history
GET /api/predictions
GET /api/model-metrics
GET /api/alerts
GET /api/summary
GET /api/system-status
```

## 14.4 Protected endpoints

```text
POST /api/jobs/ingest-air-quality
POST /api/jobs/ingest-weather
POST /api/jobs/generate-predictions
POST /api/jobs/refresh-aggregates
POST /api/jobs/register-model-version
```

All protected endpoints require:

```text
x-job-token: <JOB_SECRET>
```

---

# 15. pandas and NumPy ETL

## 15.1 Read CSV flexibly

```python
import pandas as pd

def read_csv_flexible(path_or_url: str) -> pd.DataFrame:
    for sep in [',', ';']:
        try:
            df = pd.read_csv(path_or_url, sep=sep, encoding='utf-8', low_memory=False)
            if df.shape[1] > 1:
                return df
        except UnicodeDecodeError:
            df = pd.read_csv(path_or_url, sep=sep, encoding='latin1', low_memory=False)
            if df.shape[1] > 1:
                return df
        except Exception:
            continue
    raise ValueError(f'Could not parse CSV: {path_or_url}')
```

## 15.2 Wide to long

Community data often comes with columns:

```text
provincia
municipio
estacion
magnitud
punto_muestreo
ano
mes
dia
h01/v01 ... h24/v24
```

Normalize:

```python
import pandas as pd

def normalize_air_quality_wide(df: pd.DataFrame, source: str) -> pd.DataFrame:
    df.columns = [c.lower().strip() for c in df.columns]

    base_cols = [
        'provincia', 'municipio', 'estacion', 'magnitud',
        'punto_muestreo', 'ano', 'mes', 'dia'
    ]

    frames = []

    for hour in range(1, 25):
        h_col = f'h{hour:02d}'
        v_col = f'v{hour:02d}'

        cols = base_cols + [h_col, v_col]
        missing = [c for c in cols if c not in df.columns]
        if missing:
            continue

        temp = df[cols].copy()
        temp = temp.rename(columns={h_col: 'value', v_col: 'valid_flag'})
        temp['hour'] = hour
        frames.append(temp)

    if not frames:
        raise ValueError('No hourly hXX/vXX columns found.')

    long_df = pd.concat(frames, ignore_index=True)

    long_df['value'] = pd.to_numeric(long_df['value'], errors='coerce')
    long_df['valid'] = long_df['valid_flag'].astype(str).str.upper().eq('V')

    long_df['measured_at'] = pd.to_datetime(
        dict(
            year=long_df['ano'].astype(int),
            month=long_df['mes'].astype(int),
            day=long_df['dia'].astype(int),
            hour=(long_df['hour'] - 1).astype(int)
        ),
        errors='coerce'
    )

    long_df['station_id'] = (
        long_df['provincia'].astype(str).str.zfill(2) + '_' +
        long_df['municipio'].astype(str).str.zfill(3) + '_' +
        long_df['estacion'].astype(str).str.zfill(3)
    )

    long_df['pollutant_code'] = long_df['magnitud'].map(MAGNITUDE_TO_POLLUTANT)
    long_df['source'] = source

    return long_df[
        [
            'station_id',
            'pollutant_code',
            'measured_at',
            'value',
            'valid',
            'source',
            'punto_muestreo'
        ]
    ].dropna(subset=['station_id', 'pollutant_code', 'measured_at'])
```

## 15.3 Magnitude mapping

```python
MAGNITUDE_TO_POLLUTANT = {
    1: 'SO2',
    6: 'CO',
    7: 'NO',
    8: 'NO2',
    9: 'PM25',
    10: 'PM10',
    12: 'NOX',
    14: 'O3',
    20: 'TOL',
    30: 'BEN',
    35: 'EBE',
    37: 'MXY',
    38: 'PXY',
    39: 'OXY',
    42: 'TCH',
    43: 'CH4',
    44: 'NMHC',
}
```

Validate this against official data dictionary before production.

## 15.4 NumPy validation

```python
import numpy as np

def detect_invalid_values(values: np.ndarray, pollutant: str) -> np.ndarray:
    values = np.asarray(values, dtype=float)

    invalid = np.isnan(values)
    invalid |= values < 0

    # Conservative sanity upper bounds, not legal thresholds.
    upper_bounds = {
        'NO2': 1000,
        'O3': 1000,
        'PM10': 2000,
        'PM25': 1000,
        'SO2': 2000,
        'CO': 100,
    }

    if pollutant in upper_bounds:
        invalid |= values > upper_bounds[pollutant]

    return invalid
```

## 15.5 Risk assignment

```python
import numpy as np

def assign_risk_level(values: np.ndarray, pollutant: str) -> np.ndarray:
    values = np.asarray(values, dtype=float)

    if pollutant == 'NO2':
        return np.select(
            [
                values <= 40,
                values <= 90,
                values <= 120,
                values <= 230,
                values > 230
            ],
            [
                'good',
                'acceptable',
                'moderate',
                'poor',
                'very_poor'
            ],
            default='unknown'
        )

    return np.full(values.shape, 'unknown', dtype=object)
```

Document that risk bands are product categories unless tied to a specific official standard.

---

# 16. Supabase schema

Tables:

```text
data_sources
stations
pollutants
air_quality_observations
weather_observations
predictions
prediction_runs
model_metrics
model_versions
pipeline_runs
data_quality_checks
alerts
system_events
ai_usage_log
```

## 16.1 Required SQL

Create SQL files:

```text
sql/schema.sql
sql/indexes.sql
sql/views.sql
sql/policies.sql
sql/cron.sql
```

Use UUIDs only where helpful. Use natural station IDs from source where possible.

---

# 17. Machine Learning

## 17.1 Goal

Initial:

```text
Predict NO2 value 24 hours ahead.
```

Expanded:

```text
NO2, O3, PM10, PM2.5
Horizons: 1h, 6h, 12h, 24h, 48h
```

## 17.2 Baselines

```text
Persistence.
Same hour yesterday.
Rolling mean 24h.
```

## 17.3 Model

Initial:

```text
HistGradientBoostingRegressor
```

## 17.4 Feature engineering

```python
def add_time_features(df):
    df = df.copy()
    df['hour'] = df['measured_at'].dt.hour
    df['day_of_week'] = df['measured_at'].dt.dayofweek
    df['month'] = df['measured_at'].dt.month
    df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
    return df
```

Lags:

```python
def add_lag_features(df):
    df = df.sort_values(['station_id', 'pollutant_code', 'measured_at']).copy()
    group = df.groupby(['station_id', 'pollutant_code'])['value']

    for lag in [1, 3, 6, 24, 168]:
        df[f'value_lag_{lag}h'] = group.shift(lag)

    for window in [3, 6, 24]:
        df[f'rolling_mean_{window}h'] = (
            group.shift(1)
            .rolling(window=window, min_periods=max(1, window // 2))
            .mean()
            .reset_index(level=[0, 1], drop=True)
        )

    return df
```

Target:

```python
def add_target(df, horizon_hours=24):
    df = df.sort_values(['station_id', 'pollutant_code', 'measured_at']).copy()
    df[f'target_{horizon_hours}h'] = (
        df.groupby(['station_id', 'pollutant_code'])['value']
        .shift(-horizon_hours)
    )
    return df
```

## 17.5 Temporal split

```python
train = df[df['measured_at'] < '2025-01-01']
valid = df[(df['measured_at'] >= '2025-01-01') & (df['measured_at'] < '2026-01-01')]
test = df[df['measured_at'] >= '2026-01-01']
```

Adjust years based on actual data availability.

## 17.6 Metrics

```text
MAE
RMSE
R2
Baseline MAE
Baseline RMSE
Improvement %
Error by station
Error by hour
Error by month
```

## 17.7 Model card

Create:

```text
docs/ml-model-card.md
```

Must include:

```text
Model name.
Version.
Target.
Horizon.
Training period.
Validation period.
Test period.
Features.
Baseline.
Metrics.
Known limitations.
Not official forecast disclaimer.
```

---

# 18. Predictions

Predictions must be precomputed.

Flow:

```text
1. Load production model.
2. Load latest valid observations.
3. Generate features.
4. Predict.
5. Assign risk.
6. Insert predictions.
7. Record prediction_run.
```

No frontend ML.

---

# 19. Supabase Cron

Use Supabase Cron + pg_net to call protected endpoints.

Jobs:

```text
daily-ingest-air-quality
daily-ingest-weather
daily-refresh-aggregates
daily-generate-predictions
weekly-model-evaluation-report
```

Example:

```sql
select cron.schedule(
  'daily-ingest-air-quality',
  '10 4 * * *',
  $$
  select net.http_post(
    url := 'https://YOUR_DOMAIN/api/jobs/ingest-air-quality',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-job-token', 'YOUR_SECRET'
    ),
    body := jsonb_build_object('source', 'supabase_cron')
  );
  $$
);
```

---

# 20. Map design

## 20.1 MapLibre

Use MapLibre GL. Create a custom dark style.

```text
No Google style.
No default bright roads.
No default markers.
```

## 20.2 Station nodes

Visual:

```text
Central dot.
Outer ring.
Subtle pulse.
Color = risk.
Size = normalized pollutant value.
Opacity = freshness.
```

## 20.3 Freshness encoding

```text
Fresh < 3h:
  full opacity.

Stale 3-12h:
  reduced opacity.

Very stale > 12h:
  dashed ring or warning mark.
```

---

# 21. Charts

Charts must be custom.

## 21.1 Forecast

```text
Observed line.
Predicted line.
Future zone.
Risk bands.
Now marker.
Tooltip custom.
```

## 21.2 History

```text
24h / 7d / 30d.
Moving average.
Min/max.
Risk background.
```

## 21.3 Model

```text
Baseline vs model.
Error by station.
Error distribution.
```

---

# 22. Responsive device experience

## 22.1 Desktop

```text
Observatory mode.
Map + panels.
Hover interactions.
Full charts.
```

## 22.2 Ultra-wide

```text
Control room mode.
Left filters.
Center map.
Right station/system panel.
Bottom timeline.
```

## 22.3 Tablet

```text
Touch console.
Bottom sheets.
Large controls.
No hover dependency.
```

## 22.4 Mobile

```text
Narrative mode.
Current status first.
Bottom nav.
Map with bottom sheet.
Charts simplified.
No desktop table.
```

## 22.5 Small mobile

```text
Essential mode.
Wordmark compact.
Current pollutant.
Worst station.
Mini forecast.
```

---

# 23. Loading, error, empty states

## 23.1 Loading

Text:

```text
CALIBRATING ATMOSPHERIC DATA
```

Visual:

```text
Animated isobar lines.
No spinner.
Dark skeleton.
```

## 23.2 Error

Text:

```text
DATA SIGNAL INTERRUPTED
The latest atmospheric feed could not be reached.
Showing last known valid state.
```

## 23.3 Empty

Text:

```text
NO SIGNAL FOR THIS POLLUTANT
This station has no recent observations for the selected compound.
```

---

# 24. Security

```text
No service role in frontend.
RLS enabled.
Job token required.
CORS restricted.
No secrets in logs.
No raw stack traces in public.
Rate limit protected endpoints.
```

---

# 25. Testing and QA

## 25.1 Viewports

Test:

```text
320x568
375x667
390x844
430x932
768x1024
1024x768
1366x768
1440x900
1920x1080
2560x1440
3840x2160
```

## 25.2 Data QA

```text
No duplicates.
No future timestamps.
No invalid negative values.
Known pollutants only.
Known stations only.
Latest timestamp recent.
```

## 25.3 ML QA

```text
Baseline exists.
Model beats baseline.
Temporal split.
No leakage.
Metrics stored.
Predictions reasonable.
```

## 25.4 Visual QA

```text
No default markers.
No default chart styling.
No generic cards.
No overflow.
Wordmark works.
Mobile experience is intentional.
```

---

# 26. Documentation

Create:

```text
README.md
docs/sources.md
docs/data-dictionary.md
docs/etl.md
docs/architecture.md
docs/design-system.md
docs/ml-model-card.md
docs/mlops.md
docs/deployment.md
docs/known-limitations.md
docs/portfolio-case-study.md
```

---

# 27. Build order

```text
1. Repo structure.
2. Design tokens.
3. Wordmark and flag.
4. Landing fullscreen.
5. Data source downloader.
6. Real snapshot cache.
7. Supabase schema.
8. ETL normalization.
9. API health/stations/latest.
10. Frontend data layer.
11. Dashboard preview with real data.
12. Map with real stations.
13. Charts with real observations.
14. Baseline ML.
15. Model v1.
16. Predictions table.
17. Forecast UI.
18. Cron jobs.
19. System page.
20. Documentation.
21. Device QA.
22. Final polish.
```

---

# 28. Final acceptance criteria

The product is complete only if:

```text
It uses real official data.
It has no synthetic mock data.
It has a premium landing.
It has a correct wordmark.
It has a real ETL pipeline.
It has Supabase schema.
It has FastAPI endpoints.
It has a custom map.
It has custom charts.
It has baseline ML.
It has model metrics.
It has precomputed predictions.
It has responsive/adaptive premium layouts.
It has documentation.
It deploys.
It can be explained professionally.
```

---

# 29. Final product statement

When finished, MADRID Aire must be describable as:

```text
MADRID Aire is a premium full-stack atmospheric intelligence platform for Madrid.
It ingests official open data, transforms it with Python, pandas and NumPy,
stores it in Supabase Pro, exposes it through a lightweight FastAPI backend,
visualizes it in a custom Next.js/React interface and produces evaluated,
precomputed machine learning forecasts for urban air quality.
```

The result must be visually sublime, technically honest, robust, maintainable and worthy of being shown as a flagship portfolio project.
