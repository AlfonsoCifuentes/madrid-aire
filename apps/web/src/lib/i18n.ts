export type Language = "es" | "en";

type Copy = {
  languageLabel: string;
  spanishLabel: string;
  englishLabel: string;
  headerStatus: string;
  heroEyebrow: string;
  heroClaim: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  signalTitle: string;
  signalReady: string;
  signalPending: string;
  signalReadyBody: string;
  signalPendingBody: string;
  forecastPolicy: string;
  forecastBody: string;
  currentSignal: string;
  noSyntheticMetrics: string;
  constraintLabel: string;
  workspaceBuild: string;
  buildTimestampBody: string;
  cycleLabel: string;
  cycleTitle: string;
  cycleFocus: [string, string, string];
  principles: [string, string, string];
  dashboardTitle: string;
  dashboardSubtitle: string;
  backHome: string;
  openMap: string;
  openPredictions: string;
  openModel: string;
  openStations: string;
  openSystem: string;
  openMethodology: string;
  openReports: string;
  mobileNavAriaLabel: string;
  mobileNavDashboard: string;
  mobileNavMap: string;
  mobileNavStations: string;
  mobileNavPredictions: string;
  mobileNavModel: string;
  mobileNavMethodology: string;
  mobileNavReports: string;
  mobileNavSystem: string;
  dashboardMetricsTitle: string;
  worstStation: string;
  latestTimestamp: string;
  pollutantCoverage: string;
  stationsOnline: string;
  observationsPanel: string;
  tableStation: string;
  tablePollutant: string;
  tableValue: string;
  tableMeasuredAt: string;
  mapStatusTitle: string;
  mapStatusBody: string;
  pendingCoords: string;
  sourceLabel: string;
  localFileLabel: string;
  mapPageTitle: string;
  mapPageSubtitle: string;
  mapStationsReady: string;
  mapCoordinatesReady: string;
  mapMetadataStatus: string;
  mapRosterTitle: string;
  mapLegendTitle: string;
  mapNodeSize: string;
  mapNodeColor: string;
  mapNodeFreshness: string;
  mapPriorityStations: string;
  mapStationContext: string;
  stationsPageTitle: string;
  stationsPageSubtitle: string;
  stationsTableMunicipality: string;
  stationsTableAreaType: string;
  stationsTableStationType: string;
  stationsTableLatestNo2: string;
  stationsTableFreshness: string;
  stationsOpenDetail: string;
  stationDetailTitle: string;
  stationDetailSubtitle: string;
  stationCurrentValuesTitle: string;
  stationHistoryForecastTitle: string;
  stationModelErrorTitle: string;
  stationAvailablePollutantsTitle: string;
  stationOfficialContextTitle: string;
  stationMunicipality: string;
  stationAreaType: string;
  stationStationType: string;
  stationAddress: string;
  stationZone: string;
  stationAltitude: string;
  stationCoordinates: string;
  stationLatestNo2: string;
  stationGlobalErrorReference: string;
  stationGlobalErrorNote: string;
  stationBackToExplorer: string;
  stationNoHistory: string;
  stationNoPredictions: string;
  predictionsTitle: string;
  predictionsSubtitle: string;
  modelTitle: string;
  modelSubtitle: string;
  methodologyTitle: string;
  methodologySubtitle: string;
  reportsTitle: string;
  reportsSubtitle: string;
  systemTitle: string;
  systemSubtitle: string;
  systemOperationalLabel: string;
  systemEnvironmentLabel: string;
  systemGlobalStatusLabel: string;
  systemAlertsLabel: string;
  systemPipelineRunsTitle: string;
  systemDataQualityTitle: string;
  systemPredictionRunsTitle: string;
  systemActiveAlertsTitle: string;
  systemModelProductionTitle: string;
  systemCronStatusTitle: string;
  systemQualityStatusLabel: string;
  systemPredictionRowsLabel: string;
  systemGeneratedAtLabel: string;
  systemImprovementLabel: string;
  systemJobsConfiguredLabel: string;
  systemSupabaseConfiguredLabel: string;
  systemProtectedJobsLabel: string;
  systemBooleanYes: string;
  systemBooleanNo: string;
  systemNoAlerts: string;
  historyLabel: string;
  observedLabel: string;
  predictedLabel: string;
  selectedBaseline: string;
  horizonLabel: string;
  metricMae: string;
  metricRmse: string;
  metricR2: string;
  trainingWindow: string;
  validationWindow: string;
  testWindow: string;
  notOfficialForecast: string;
  freshness: Record<string, string>;
};

export const copyByLanguage: Record<Language, Copy> = {
  es: {
    languageLabel: "Idioma",
    spanishLabel: "ES",
    englishLabel: "EN",
    headerStatus: "Build local · datos oficiales",
    heroEyebrow: "Inteligencia atmosférica viva para Madrid",
    heroClaim:
      "Un atlas atmosférico vivo de Madrid construido con datos abiertos oficiales, ingeniería disciplinada y una superficie de producto que rechaza el dashboard genérico.",
    heroCtaPrimary: "Seguir",
    heroCtaSecondary: "Abrir dashboard",
    signalTitle: "Estado de la señal",
    signalReady: "Observaciones oficiales activas",
    signalPending: "A la espera de ingestión oficial",
    signalReadyBody:
      "El shell premium ya está conectado al flujo oficial y el atlas geoespacial ya opera con coordenadas reales de estación de la Comunidad de Madrid.",
    signalPendingBody:
      "La primera capa visual está lista. Las observaciones reales aparecerán cuando el API pueda leer un CSV oficial normalizado.",
    forecastPolicy: "Política de forecast",
    forecastBody: "El modelo v1 ya está entrenado con split temporal honesto y las predicciones siguen sirviéndose como artefactos precalculados, nunca desde el frontend.",
    currentSignal: "Señal actual",
    noSyntheticMetrics: "Sin métricas sintéticas",
    constraintLabel: "Condición",
    workspaceBuild: "Build del workspace",
    buildTimestampBody: "Esta marca temporal refleja el build local del shell de producto, no una marca de frescura observacional.",
    cycleLabel: "Ciclo 01",
    cycleTitle: "Fundación antes de la señal atmosférica.",
    cycleFocus: [
      "Fundación del monorepo y sistema visual",
      "Skeleton de FastAPI con estados honestos",
      "Ingesta real y ETL conectados en el siguiente slice",
    ],
    principles: [
      "Solo observaciones oficiales",
      "Predicciones precalculadas tras baselines honestos",
      "Layouts premium y adaptativos para cada pantalla",
    ],
    dashboardTitle: "Dashboard de observación real",
    dashboardSubtitle:
      "La vista operativa usa el CSV oficial normalizado y enlaza ya con un mapa de nodos reales construido sobre coordenadas oficiales de estación.",
    backHome: "Volver a portada",
    openMap: "Abrir mapa",
    openPredictions: "Abrir predicciones",
    openModel: "Abrir modelo",
    openStations: "Abrir estaciones",
    openSystem: "Abrir sistema",
    openMethodology: "Abrir metodología",
    openReports: "Abrir reports",
    mobileNavAriaLabel: "Navegación inferior",
    mobileNavDashboard: "Panel",
    mobileNavMap: "Mapa",
    mobileNavStations: "Red",
    mobileNavPredictions: "Forecast",
    mobileNavModel: "Modelo",
    mobileNavMethodology: "Método",
    mobileNavReports: "Reports",
    mobileNavSystem: "Estado",
    dashboardMetricsTitle: "Métricas actuales",
    worstStation: "Peor estación",
    latestTimestamp: "Última marca temporal",
    pollutantCoverage: "Cobertura de contaminantes",
    stationsOnline: "Estaciones activas",
    observationsPanel: "Últimas observaciones disponibles",
    tableStation: "Estación",
    tablePollutant: "Contaminante",
    tableValue: "Valor",
    tableMeasuredAt: "Medido a las",
    mapStatusTitle: "Estado del atlas geoespacial",
    mapStatusBody:
      "La API ya sirve nombres, direcciones y coordenadas oficiales de estación, y el mapa dibuja nodos reales sin geometría inventada.",
    pendingCoords: "Nodos geoespaciales activos",
    sourceLabel: "Fuente",
    localFileLabel: "Archivo local",
    mapPageTitle: "Preparación del mapa atmosférico",
    mapPageSubtitle:
      "El atlas geoespacial ya usa coordenadas oficiales de la Comunidad de Madrid y dibuja nodos reales sin recurrir a bases cartográficas genéricas.",
    mapStationsReady: "Estaciones con señal",
    mapCoordinatesReady: "Coordenadas oficiales listas",
    mapMetadataStatus: "Estado del metadato",
    mapRosterTitle: "Roster oficial disponible",
    mapLegendTitle: "Leyenda del nodo",
    mapNodeSize: "Tamaño = NO2 relativo",
    mapNodeColor: "Color = riesgo actual",
    mapNodeFreshness: "Opacidad = frescura",
    mapPriorityStations: "Estaciones prioritarias",
    mapStationContext: "Contexto oficial de estación",
    stationsPageTitle: "Explorer de estaciones",
    stationsPageSubtitle:
      "La vista de estaciones cruza metadatos oficiales con la última señal observada para ofrecer tabla premium en desktop y tarjetas táctiles en mobile.",
    stationsTableMunicipality: "Municipio",
    stationsTableAreaType: "Área",
    stationsTableStationType: "Tipo",
    stationsTableLatestNo2: "NO2 actual",
    stationsTableFreshness: "Frescura",
    stationsOpenDetail: "Abrir detalle",
    stationDetailTitle: "Detalle de estación",
    stationDetailSubtitle:
      "La ficha reúne valores actuales, histórico observado, forecast del modelo v1 y contexto oficial de la estación sin introducir datos sintéticos.",
    stationCurrentValuesTitle: "Valores actuales",
    stationHistoryForecastTitle: "Histórico y forecast",
    stationModelErrorTitle: "Error de modelo",
    stationAvailablePollutantsTitle: "Contaminantes disponibles",
    stationOfficialContextTitle: "Contexto oficial",
    stationMunicipality: "Municipio",
    stationAreaType: "Tipo de área",
    stationStationType: "Tipo de estación",
    stationAddress: "Dirección",
    stationZone: "Zona",
    stationAltitude: "Altitud",
    stationCoordinates: "Coordenadas",
    stationLatestNo2: "NO2 actual",
    stationGlobalErrorReference: "Referencia global del modelo",
    stationGlobalErrorNote:
      "La API todavía no expone error por estación; esta referencia usa las métricas globales del modelo seleccionado sobre la ventana de test.",
    stationBackToExplorer: "Volver al explorer",
    stationNoHistory: "No hay histórico reciente disponible para esta estación y contaminante.",
    stationNoPredictions: "No hay forecast precalculado disponible todavía para esta estación.",
    predictionsTitle: "Forecast modelo v1 NO2 24h",
    predictionsSubtitle:
      "Las predicciones están precalculadas fuera del frontend a partir del predictor seleccionado y se muestran junto al histórico observado de la estación prioritaria.",
    modelTitle: "Modelo v1 y métricas",
    modelSubtitle:
      "Este slice documenta el modelo v1 NO2 a 24 horas con `HistGradientBoostingRegressor`, split temporal honesto y comparación contra los baselines de referencia.",
    methodologyTitle: "Metodología y trazabilidad",
    methodologySubtitle:
      "Esta superficie documenta fuentes, ETL, validación, feature engineering, split temporal, evaluación y limitaciones con el mismo criterio honesto que gobierna el producto.",
    reportsTitle: "Reports operativos",
    reportsSubtitle:
      "Daily summary, lectura del modelo vigente, frescura del dato y known issues en una capa editorial construida sobre APIs y artefactos reales.",
    systemTitle: "Estado operativo del sistema",
    systemSubtitle:
      "La superficie de sistema resume runs de pipeline, calidad del dato, forecast, alertas activas, modelo en producción y preparación de cron sin maquillar el estado real del stack.",
    systemOperationalLabel: "Superficie operativa",
    systemEnvironmentLabel: "Entorno",
    systemGlobalStatusLabel: "Estado global",
    systemAlertsLabel: "Alertas activas",
    systemPipelineRunsTitle: "Pipeline runs",
    systemDataQualityTitle: "Data quality checks",
    systemPredictionRunsTitle: "Prediction runs",
    systemActiveAlertsTitle: "Active alerts",
    systemModelProductionTitle: "Model production",
    systemCronStatusTitle: "Cron status",
    systemQualityStatusLabel: "Estado de calidad",
    systemPredictionRowsLabel: "Filas de forecast",
    systemGeneratedAtLabel: "Generado a las",
    systemImprovementLabel: "Mejora vs baseline",
    systemJobsConfiguredLabel: "Jobs protegidos",
    systemSupabaseConfiguredLabel: "Supabase listo",
    systemProtectedJobsLabel: "Endpoints protegidos",
    systemBooleanYes: "sí",
    systemBooleanNo: "no",
    systemNoAlerts: "No hay alertas activas para mostrar con el estado actual del sistema.",
    historyLabel: "Histórico observado",
    observedLabel: "Observado",
    predictedLabel: "Predicho",
    selectedBaseline: "Predictor seleccionado",
    horizonLabel: "Horizonte",
    metricMae: "MAE",
    metricRmse: "RMSE",
    metricR2: "R²",
    trainingWindow: "Ventana de entrenamiento",
    validationWindow: "Ventana de validación",
    testWindow: "Ventana de test",
    notOfficialForecast: "No es un forecast oficial. Es una referencia ML/baseline interna precalculada para evaluación de producto.",
    freshness: {
      fresh: "fresco",
      delayed: "retrasado",
      stale: "desactualizado",
      unknown: "desconocido",
      pending: "pendiente",
    },
  },
  en: {
    languageLabel: "Language",
    spanishLabel: "ES",
    englishLabel: "EN",
    headerStatus: "Local build · official data",
    heroEyebrow: "Living atmospheric intelligence for Madrid",
    heroClaim:
      "A living atmospheric atlas of Madrid built on official open data, disciplined engineering, and a product surface that refuses generic dashboards.",
    heroCtaPrimary: "Continue",
    heroCtaSecondary: "Open dashboard",
    signalTitle: "Signal state",
    signalReady: "Official observations active",
    signalPending: "Awaiting official ingestion",
    signalReadyBody:
      "The premium shell is now wired to the official data flow, and the geospatial atlas already runs on real Comunidad de Madrid station coordinates.",
    signalPendingBody:
      "The first visual layer is ready. Real observations will appear once the API can read an official normalized CSV.",
    forecastPolicy: "Forecast policy",
    forecastBody: "Model v1 is now trained with an honest temporal split, and forecasts are still served strictly as precomputed artifacts, never from the frontend.",
    currentSignal: "Current signal",
    noSyntheticMetrics: "No synthetic metrics",
    constraintLabel: "Constraint",
    workspaceBuild: "Workspace build",
    buildTimestampBody: "This timestamp reflects the local build of the product shell, not an observation freshness marker.",
    cycleLabel: "Cycle 01",
    cycleTitle: "Foundation before the atmospheric signal.",
    cycleFocus: [
      "Monorepo foundation and visual system",
      "FastAPI skeleton with honest states",
      "Real ingestion and ETL connected in the next slice",
    ],
    principles: [
      "Official observations only",
      "Precomputed predictions after honest baselines",
      "Responsive premium layouts for every screen type",
    ],
    dashboardTitle: "Real-observation dashboard",
    dashboardSubtitle:
      "This operational view uses the normalized official CSV and now links to a real-node map built on official station coordinates.",
    backHome: "Back to landing",
    openMap: "Open map",
    openPredictions: "Open predictions",
    openModel: "Open model",
    openStations: "Open stations",
    openSystem: "Open system",
    openMethodology: "Open methodology",
    openReports: "Open reports",
    mobileNavAriaLabel: "Bottom navigation",
    mobileNavDashboard: "Board",
    mobileNavMap: "Map",
    mobileNavStations: "Stations",
    mobileNavPredictions: "Forecast",
    mobileNavModel: "Model",
    mobileNavMethodology: "Method",
    mobileNavReports: "Reports",
    mobileNavSystem: "System",
    dashboardMetricsTitle: "Current metrics",
    worstStation: "Worst station",
    latestTimestamp: "Latest timestamp",
    pollutantCoverage: "Pollutant coverage",
    stationsOnline: "Stations online",
    observationsPanel: "Latest available observations",
    tableStation: "Station",
    tablePollutant: "Pollutant",
    tableValue: "Value",
    tableMeasuredAt: "Measured at",
    mapStatusTitle: "Geospatial atlas status",
    mapStatusBody:
      "The API now serves official station names, addresses, and coordinates, and the map draws real nodes without invented geometry.",
    pendingCoords: "Geospatial nodes active",
    sourceLabel: "Source",
    localFileLabel: "Local file",
    mapPageTitle: "Atmospheric map readiness",
    mapPageSubtitle:
      "The geospatial atlas now uses official Comunidad de Madrid coordinates and draws real station nodes without falling back to generic basemaps.",
    mapStationsReady: "Stations with signal",
    mapCoordinatesReady: "Official coordinates ready",
    mapMetadataStatus: "Metadata status",
    mapRosterTitle: "Available official roster",
    mapLegendTitle: "Node legend",
    mapNodeSize: "Size = relative NO2",
    mapNodeColor: "Color = current risk",
    mapNodeFreshness: "Opacity = freshness",
    mapPriorityStations: "Priority stations",
    mapStationContext: "Official station context",
    stationsPageTitle: "Stations explorer",
    stationsPageSubtitle:
      "The station surface blends official metadata with the latest observed signal to provide a premium desktop table and touch-first mobile cards.",
    stationsTableMunicipality: "Municipality",
    stationsTableAreaType: "Area",
    stationsTableStationType: "Type",
    stationsTableLatestNo2: "Current NO2",
    stationsTableFreshness: "Freshness",
    stationsOpenDetail: "Open detail",
    stationDetailTitle: "Station detail",
    stationDetailSubtitle:
      "This view combines current values, observed history, model-v1 forecast, and official station context without introducing synthetic data.",
    stationCurrentValuesTitle: "Current values",
    stationHistoryForecastTitle: "History and forecast",
    stationModelErrorTitle: "Model error",
    stationAvailablePollutantsTitle: "Available pollutants",
    stationOfficialContextTitle: "Official context",
    stationMunicipality: "Municipality",
    stationAreaType: "Area type",
    stationStationType: "Station type",
    stationAddress: "Address",
    stationZone: "Zone",
    stationAltitude: "Altitude",
    stationCoordinates: "Coordinates",
    stationLatestNo2: "Current NO2",
    stationGlobalErrorReference: "Global model reference",
    stationGlobalErrorNote:
      "The API does not expose station-level error yet; this reference uses the selected model global metrics over the test window.",
    stationBackToExplorer: "Back to explorer",
    stationNoHistory: "No recent history is available for this station and pollutant.",
    stationNoPredictions: "No precomputed forecast is available yet for this station.",
    predictionsTitle: "NO2 24h model-v1 forecast",
    predictionsSubtitle:
      "Predictions are precomputed outside the frontend from the selected predictor and shown together with the observed history of the priority station.",
    modelTitle: "Model v1 and metrics",
    modelSubtitle:
      "This slice documents the NO2 24h model v1 with `HistGradientBoostingRegressor`, an honest temporal split, and direct comparison against reference baselines.",
    methodologyTitle: "Methodology and traceability",
    methodologySubtitle:
      "This surface documents sources, ETL, validation, feature engineering, temporal split, evaluation, and limitations with the same honest standard that governs the product.",
    reportsTitle: "Operational reports",
    reportsSubtitle:
      "Daily summary, the current model readout, data freshness, and known issues in an editorial layer built on real APIs and artifacts.",
    systemTitle: "System operational status",
    systemSubtitle:
      "The system surface summarizes pipeline runs, data quality, forecast readiness, active alerts, the production model, and cron preparation without hiding the real state of the stack.",
    systemOperationalLabel: "Operational surface",
    systemEnvironmentLabel: "Environment",
    systemGlobalStatusLabel: "Global status",
    systemAlertsLabel: "Active alerts",
    systemPipelineRunsTitle: "Pipeline runs",
    systemDataQualityTitle: "Data quality checks",
    systemPredictionRunsTitle: "Prediction runs",
    systemActiveAlertsTitle: "Active alerts",
    systemModelProductionTitle: "Model production",
    systemCronStatusTitle: "Cron status",
    systemQualityStatusLabel: "Quality status",
    systemPredictionRowsLabel: "Forecast rows",
    systemGeneratedAtLabel: "Generated at",
    systemImprovementLabel: "Improvement vs baseline",
    systemJobsConfiguredLabel: "Protected jobs",
    systemSupabaseConfiguredLabel: "Supabase ready",
    systemProtectedJobsLabel: "Protected endpoints",
    systemBooleanYes: "yes",
    systemBooleanNo: "no",
    systemNoAlerts: "There are no active alerts to show for the current system state.",
    historyLabel: "Observed history",
    observedLabel: "Observed",
    predictedLabel: "Predicted",
    selectedBaseline: "Selected predictor",
    horizonLabel: "Horizon",
    metricMae: "MAE",
    metricRmse: "RMSE",
    metricR2: "R²",
    trainingWindow: "Training window",
    validationWindow: "Validation window",
    testWindow: "Test window",
    notOfficialForecast: "This is not an official forecast. It is a precomputed internal ML/baseline reference for product evaluation.",
    freshness: {
      fresh: "fresh",
      delayed: "delayed",
      stale: "stale",
      unknown: "unknown",
      pending: "pending",
    },
  },
};

export function resolveLanguage(input: string | string[] | undefined): Language {
  if (Array.isArray(input)) {
    return resolveLanguage(input[0]);
  }

  return input === "en" ? "en" : "es";
}
