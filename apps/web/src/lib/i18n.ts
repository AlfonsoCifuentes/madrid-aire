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
  landingMapPreviewEyebrow: string;
  landingDeepDiveEyebrow: string;
  landingDeepDiveTitle: string;
  landingDeepDiveBody: string;
  landingFooterTitle: string;
  landingFooterBody: string;
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
  openAbout: string;
  mobileNavAriaLabel: string;
  mobileNavDashboard: string;
  mobileNavMap: string;
  mobileNavStations: string;
  mobileNavPredictions: string;
  mobileNavModel: string;
  mobileNavMethodology: string;
  mobileNavReports: string;
  mobileNavSystem: string;
  mobileNavAbout: string;
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
  systemCloudflareConfiguredLabel: string;
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
  aboutEyebrow: string;
  aboutTitle: string;
  aboutSubtitle: string;
  aboutPublicRoutesTitle: string;
  aboutPublicRoutesBody: string;
  aboutTechnicalRoutesTitle: string;
  aboutTechnicalRoutesBody: string;
  aboutLiveLabel: string;
  aboutTechnicalLabel: string;
  aboutDashboardDesc: string;
  aboutMapDesc: string;
  aboutStationsDesc: string;
  aboutPredictionsDesc: string;
  aboutModelDesc: string;
  aboutMethodologyDesc: string;
  aboutReportsDesc: string;
  aboutSystemDesc: string;
  dashboardHistoryTitle: string;
  dashboardForecastTrendTitle: string;
  dashboardForecastTrendBody: string;
  dashboardForecastTrendReady: string;
  dashboardModelStatusTitle: string;
  dashboardModelImprovementLabel: string;
  dashboardDominantPollutant: string;
  dashboardAverageNo2Label: string;
  mapPollutantSelector: string;
  mapNoStation: string;
  mapStationDrawerClose: string;
  mapStationDrawerCoords: string;
  freshness: Record<string, string>;
};

export const copyByLanguage: Record<Language, Copy> = {
  es: {
    languageLabel: "Idioma",
    spanishLabel: "ES",
    englishLabel: "EN",
    headerStatus: "Datos oficiales en seguimiento",
    heroEyebrow: "Inteligencia atmosférica viva para Madrid",
    heroClaim:
      "Una guía viva para seguir la calidad del aire en Madrid con datos oficiales, previsiones a corto plazo y contexto claro para cualquier persona.",
    heroCtaPrimary: "Ver situación actual",
    heroCtaSecondary: "Explorar el mapa",
    signalTitle: "Estado de la señal",
    signalReady: "Observaciones oficiales activas",
    signalPending: "Esperando la siguiente actualización oficial",
    signalReadyBody:
      "La red de estaciones ya aporta lecturas oficiales y la web te muestra dónde está la lectura más alta, cuándo se actualizó y cómo cambia entre zonas de Madrid.",
    signalPendingBody:
      "La red está lista. Los datos aparecerán en cuanto llegue la siguiente actualización oficial.",
    forecastPolicy: "Próximas 24 horas",
    forecastBody:
      "La previsión resume lo que puede pasar con el NO2 durante las próximas 24 horas y se muestra junto a la evolución observada recientemente.",
    currentSignal: "Situación actual",
    noSyntheticMetrics: "Solo datos observados",
    constraintLabel: "Condición",
    workspaceBuild: "Momento de esta consulta",
    buildTimestampBody: "Esta hora corresponde a la versión local de la web, no al momento exacto de la última medición oficial.",
    cycleLabel: "Qué puedes hacer aquí",
    cycleTitle: "Mirar el aire de Madrid con contexto, no solo con cifras.",
    cycleFocus: [
      "Seguir las mediciones oficiales más recientes",
      "Localizar estaciones y comparar zonas de la ciudad",
      "Consultar la previsión y ampliar contexto cuando lo necesites",
    ],
    landingMapPreviewEyebrow: "Vista previa del mapa",
    landingDeepDiveEyebrow: "Empieza por aquí",
    landingDeepDiveTitle: "Rutas claras para seguir el aire sin perderte.",
    landingDeepDiveBody:
      "Empieza por el resumen si quieres saber qué pasa ahora. Usa el mapa para situarte, estaciones para comparar y la guía cuando quieras contexto o acceso a la parte avanzada.",
    landingFooterTitle: "Seguir Madrid Aire",
    landingFooterBody:
      "Consulta la señal actual, explora el mapa o profundiza en el método desde una navegación única y clara.",
    principles: [
      "Mediciones oficiales para leer la situación actual",
      "Previsiones a corto plazo para anticipar cambios",
      "Diseño claro en móvil y escritorio",
    ],
    dashboardTitle: "Resumen del aire",
    dashboardSubtitle:
      "Consulta de un vistazo dónde se registra la lectura más alta ahora, cuándo se actualizó la red y cómo está el aire en Madrid.",
    backHome: "Ir al resumen",
    openMap: "Abrir mapa",
    openPredictions: "Abrir predicciones",
    openModel: "Abrir modelo",
    openStations: "Abrir estaciones",
    openSystem: "Abrir sistema",
    openMethodology: "Abrir metodología",
    openReports: "Abrir informes",
    openAbout: "Guía",
    mobileNavAriaLabel: "Navegación inferior",
    mobileNavDashboard: "Resumen",
    mobileNavMap: "Mapa",
    mobileNavStations: "Estaciones",
    mobileNavPredictions: "Pronóstico",
    mobileNavModel: "Modelo",
    mobileNavMethodology: "Método",
    mobileNavReports: "Informes",
    mobileNavSystem: "Estado",
    mobileNavAbout: "Guía",
    dashboardMetricsTitle: "Qué está pasando ahora",
    worstStation: "Lectura más alta ahora",
    latestTimestamp: "Última actualización",
    pollutantCoverage: "Cobertura de contaminantes",
    stationsOnline: "Estaciones activas",
    observationsPanel: "Últimas observaciones disponibles",
    tableStation: "Estación",
    tablePollutant: "Contaminante",
    tableValue: "Valor",
    tableMeasuredAt: "Medido a las",
    mapStatusTitle: "Mapa de Madrid",
    mapStatusBody:
      "Este mapa reúne las estaciones con lectura reciente para que puedas ver de un vistazo dónde se concentra el aire más cargado.",
    pendingCoords: "Puntos con lectura reciente",
    sourceLabel: "Fuente",
    localFileLabel: "Archivo local",
    mapPageTitle: "El aire, punto por punto",
    mapPageSubtitle:
      "Localiza las estaciones de Madrid, compara zonas y toca un punto para entender qué está pasando en ese lugar ahora mismo.",
    mapStationsReady: "Estaciones con lectura ahora",
    mapCoordinatesReady: "Lecturas situadas en el mapa",
    mapMetadataStatus: "Actualización de la señal",
    mapRosterTitle: "Mapa actual",
    mapLegendTitle: "Cómo leer cada punto",
    mapNodeSize: "El tamaño refleja el nivel relativo de NO2.",
    mapNodeColor: "El color resume el nivel de riesgo en ese punto.",
    mapNodeFreshness: "La intensidad ayuda a distinguir si la lectura es más reciente o más antigua.",
    mapPriorityStations: "Puntos a vigilar ahora",
    mapStationContext: "Lugares destacados",
    stationsPageTitle: "Estaciones de medida",
    stationsPageSubtitle:
      "Consulta la red de estaciones de Madrid, ordena las que ahora muestran más NO2 y entra al detalle de cada punto.",
    stationsTableMunicipality: "Municipio",
    stationsTableAreaType: "Zona",
    stationsTableStationType: "Entorno",
    stationsTableLatestNo2: "NO2 actual",
    stationsTableFreshness: "Frescura",
    stationsOpenDetail: "Abrir detalle",
    stationDetailTitle: "Detalle de estación",
    stationDetailSubtitle:
      "Aquí puedes ver la situación actual de esta estación, su evolución reciente y una referencia orientativa para las próximas horas.",
    stationCurrentValuesTitle: "Valores actuales",
    stationHistoryForecastTitle: "Histórico y previsión",
    stationModelErrorTitle: "Cómo de bien suele acertar la previsión",
    stationAvailablePollutantsTitle: "Contaminantes disponibles",
    stationOfficialContextTitle: "Contexto oficial",
    stationMunicipality: "Municipio",
    stationAreaType: "Zona",
    stationStationType: "Entorno",
    stationAddress: "Dirección",
    stationZone: "Zona",
    stationAltitude: "Altitud",
    stationCoordinates: "Coordenadas",
    stationLatestNo2: "NO2 actual",
    stationGlobalErrorReference: "Referencia general del modelo",
    stationGlobalErrorNote:
      "Todavía no mostramos un acierto específico para cada estación. Esta referencia resume el comportamiento general del modelo con datos recientes.",
    stationBackToExplorer: "Volver al explorer",
    stationNoHistory: "No hay histórico reciente disponible para esta estación y contaminante.",
    stationNoPredictions: "Todavía no hay previsión disponible para esta estación.",
    predictionsTitle: "Previsión de NO2 para las próximas 24 horas",
    predictionsSubtitle:
      "Esta vista combina lo observado recientemente con una previsión orientativa para ayudarte a anticipar cambios de las próximas horas.",
    modelTitle: "Modelo v1 y métricas",
    modelSubtitle:
      "Aquí resumimos qué modelo de previsión usamos, con qué datos se ha comprobado y cómo interpretar sus errores sin perder la trazabilidad técnica.",
    methodologyTitle: "Metodología y trazabilidad",
    methodologySubtitle:
      "Aquí explicamos de dónde salen los datos, cómo se preparan y qué límites tiene el sistema antes de convertirlos en previsiones.",
    reportsTitle: "Informes y contexto",
    reportsSubtitle:
      "Una lectura editorial del día: qué está pasando, cómo responde el modelo y qué puntos conviene vigilar en el estado general del proyecto.",
    systemTitle: "Estado operativo del sistema",
    systemSubtitle:
      "Panel para revisar actualizaciones de datos, salud del sistema, alertas y automatización, sin ocultar el estado real del proyecto.",
    systemOperationalLabel: "Seguimiento operativo",
    systemEnvironmentLabel: "Entorno",
    systemGlobalStatusLabel: "Estado global",
    systemAlertsLabel: "Alertas activas",
    systemPipelineRunsTitle: "Actualizaciones de datos",
    systemDataQualityTitle: "Salud del dato",
    systemPredictionRunsTitle: "Actualización de previsiones",
    systemActiveAlertsTitle: "Alertas activas",
    systemModelProductionTitle: "Modelo actual",
    systemCronStatusTitle: "Automatización",
    systemQualityStatusLabel: "Estado de calidad",
    systemPredictionRowsLabel: "Filas de previsión",
    systemGeneratedAtLabel: "Generado a las",
    systemImprovementLabel: "Mejora frente a referencia",
    systemJobsConfiguredLabel: "Jobs protegidos",
    systemCloudflareConfiguredLabel: "Cloudflare D1 listo",
    systemProtectedJobsLabel: "Endpoints protegidos",
    systemBooleanYes: "sí",
    systemBooleanNo: "no",
    systemNoAlerts: "No hay alertas activas para mostrar con el estado actual del sistema.",
    historyLabel: "Histórico observado",
    observedLabel: "Observado",
    predictedLabel: "Predicho",
    selectedBaseline: "Modelo de previsión",
    horizonLabel: "Horizonte",
    metricMae: "MAE",
    metricRmse: "RMSE",
    metricR2: "R²",
    trainingWindow: "Ventana de entrenamiento",
    validationWindow: "Ventana de validación",
    testWindow: "Ventana de test",
    notOfficialForecast: "Es una previsión orientativa basada en patrones recientes. No sustituye a los avisos oficiales.",
    aboutEyebrow: "Cómo leer MADRID Aire",
    aboutTitle: "Guía para seguir el aire de Madrid",
    aboutSubtitle:
      "Empieza aquí si quieres entender qué está pasando ahora, dónde mirar en Madrid y cómo profundizar solo cuando te haga falta. La parte técnica sigue disponible, pero ya no compite con la lectura pública.",
    aboutPublicRoutesTitle: "Empieza por aquí",
    aboutPublicRoutesBody:
      "Estas rutas están pensadas para cualquiera: ver la situación actual, ubicarla en el mapa, comparar estaciones y mirar el pronóstico de las próximas horas.",
    aboutTechnicalRoutesTitle: "Si quieres más detalle",
    aboutTechnicalRoutesBody:
      "Aquí están la metodología, las métricas del modelo, los informes y el estado operativo. Entra solo cuando quieras profundizar.",
    aboutLiveLabel: "Para cualquier persona",
    aboutTechnicalLabel: "Parte técnica",
    aboutDashboardDesc:
      "Resumen general con las estaciones más comprometidas, la hora de actualización y la señal más reciente.",
    aboutMapDesc:
      "Mapa de puntos de medición para ver la distribución espacial del aire en la ciudad.",
    aboutStationsDesc:
      "Explorador por estaciones con detalle de ubicación, valores actuales e histórico reciente.",
    aboutPredictionsDesc:
      "Previsión de NO2 para las próximas horas, con evolución del riesgo y comparación con lo observado.",
    aboutModelDesc:
      "Página para revisar la precisión del modelo y entender qué significan sus métricas.",
    aboutMethodologyDesc:
      "Explicación paso a paso de las fuentes, la preparación de datos y los límites de la metodología.",
    aboutReportsDesc:
      "Resúmenes e interpretación para contextualizar el estado del sistema y del modelo.",
    aboutSystemDesc:
      "Estado operativo del proyecto: actualizaciones de datos, alertas y señales de mantenimiento.",
    dashboardHistoryTitle: "NO2 · últimas 24 h",
    dashboardForecastTrendTitle: "Próximas horas",
    dashboardForecastTrendBody:
      "Consulta cómo podría cambiar el NO2 en las próximas horas y compáralo con la última lectura disponible.",
    dashboardForecastTrendReady: "Pronóstico listo",
    dashboardModelStatusTitle: "Cómo se calcula",
    dashboardModelImprovementLabel: "frente a métodos simples",
    dashboardDominantPollutant: "Indicador principal",
    dashboardAverageNo2Label: "Media de la red",
    mapPollutantSelector: "Contaminante",
    mapNoStation: "Selecciona una estación",
    mapStationDrawerClose: "Cerrar",
    mapStationDrawerCoords: "Coordenadas",
    freshness: {
      fresh: "menos de 3 h",
      delayed: "3 a 12 h",
      stale: "más de 12 h",
      unknown: "sin dato reciente",
      pending: "actualizando",
    },
  },
  en: {
    languageLabel: "Language",
    spanishLabel: "ES",
    englishLabel: "EN",
    headerStatus: "Official data in view",
    heroEyebrow: "Living atmospheric intelligence for Madrid",
    heroClaim:
      "A living guide to Madrid's air quality built with official data, short-term forecasts, and clear context for any reader.",
    heroCtaPrimary: "See current conditions",
    heroCtaSecondary: "Explore the map",
    signalTitle: "Signal state",
    signalReady: "Official observations active",
    signalPending: "Waiting for the next official update",
    signalReadyBody:
      "The station network is already providing official readings, and the site shows where the highest reading is right now, when it was updated, and how conditions change across Madrid.",
    signalPendingBody:
      "The monitoring network is ready. Data will appear as soon as the next official update arrives.",
    forecastPolicy: "Next 24 hours",
    forecastBody:
      "The forecast summarises what may happen with NO2 over the next 24 hours and is shown together with the most recent observed trend.",
    currentSignal: "Current situation",
    noSyntheticMetrics: "Observed data only",
    constraintLabel: "Constraint",
    workspaceBuild: "Moment of this view",
    buildTimestampBody: "This time belongs to the local version of the site, not to the exact moment of the latest official measurement.",
    cycleLabel: "What you can do here",
    cycleTitle: "Read Madrid's air quality with context, not just raw numbers.",
    cycleFocus: [
      "Follow the latest official measurements",
      "Locate stations and compare areas across the city",
      "Check the forecast and go deeper when you need more context",
    ],
    landingMapPreviewEyebrow: "Map preview",
    landingDeepDiveEyebrow: "Start here",
    landingDeepDiveTitle: "Clear routes to follow the air without getting lost.",
    landingDeepDiveBody:
      "Start with the overview if you want to know what is happening now. Use the map to orient yourself, stations to compare locations, and the guide when you want context or the advanced layer.",
    landingFooterTitle: "Keep reading Madrid Aire",
    landingFooterBody:
      "Check the current signal, explore the map, or go deeper into the method from one clear navigation layer.",
    principles: [
      "Official measurements to understand current conditions",
      "Short-term forecasts to anticipate change",
      "Clear design on mobile and desktop",
    ],
    dashboardTitle: "Air quality overview",
    dashboardSubtitle:
      "See at a glance where the highest reading is right now, when the network last updated, and how air quality looks across Madrid.",
    backHome: "Go to overview",
    openMap: "Open map",
    openPredictions: "Open predictions",
    openModel: "Open model",
    openStations: "Open stations",
    openSystem: "Open system",
    openMethodology: "Open methodology",
    openReports: "Open reports",
    openAbout: "Guide",
    mobileNavAriaLabel: "Bottom navigation",
    mobileNavDashboard: "Overview",
    mobileNavMap: "Map",
    mobileNavStations: "Stations",
    mobileNavPredictions: "Forecast",
    mobileNavModel: "Model",
    mobileNavMethodology: "Method",
    mobileNavReports: "Reports",
    mobileNavSystem: "System",
    mobileNavAbout: "Guide",
    dashboardMetricsTitle: "What is happening now",
    worstStation: "Highest reading now",
    latestTimestamp: "Latest update",
    pollutantCoverage: "Pollutant coverage",
    stationsOnline: "Stations online",
    observationsPanel: "Latest available observations",
    tableStation: "Station",
    tablePollutant: "Pollutant",
    tableValue: "Value",
    tableMeasuredAt: "Measured at",
    mapStatusTitle: "Madrid map",
    mapStatusBody:
      "This map gathers the stations with recent readings so you can quickly see where air quality is under the most pressure.",
    pendingCoords: "Points with recent readings",
    sourceLabel: "Source",
    localFileLabel: "Local file",
    mapPageTitle: "Air quality, point by point",
    mapPageSubtitle:
      "Find Madrid's monitoring stations, compare areas, and tap a point to understand what is happening there right now.",
    mapStationsReady: "Stations with readings now",
    mapCoordinatesReady: "Readings placed on the map",
    mapMetadataStatus: "Signal update",
    mapRosterTitle: "Current map",
    mapLegendTitle: "How to read each point",
    mapNodeSize: "Size reflects the relative NO2 level.",
    mapNodeColor: "Color summarises the risk level at each point.",
    mapNodeFreshness: "Intensity helps distinguish fresher and older readings.",
    mapPriorityStations: "Points to watch now",
    mapStationContext: "Highlighted locations",
    stationsPageTitle: "Measurement stations",
    stationsPageSubtitle:
      "Browse Madrid's station network, sort the places currently showing more NO2, and open the detail view for each point.",
    stationsTableMunicipality: "Municipality",
    stationsTableAreaType: "Area",
    stationsTableStationType: "Setting",
    stationsTableLatestNo2: "Current NO2",
    stationsTableFreshness: "Freshness",
    stationsOpenDetail: "Open detail",
    stationDetailTitle: "Station detail",
    stationDetailSubtitle:
      "See the current situation at this station, its recent trend, and an indicative reference for the next few hours.",
    stationCurrentValuesTitle: "Current values",
    stationHistoryForecastTitle: "History and forecast",
    stationModelErrorTitle: "How well the forecast usually performs",
    stationAvailablePollutantsTitle: "Available pollutants",
    stationOfficialContextTitle: "Official context",
    stationMunicipality: "Municipality",
    stationAreaType: "Area",
    stationStationType: "Setting",
    stationAddress: "Address",
    stationZone: "Zone",
    stationAltitude: "Altitude",
    stationCoordinates: "Coordinates",
    stationLatestNo2: "Current NO2",
    stationGlobalErrorReference: "General model reference",
    stationGlobalErrorNote:
      "We do not yet show a station-specific accuracy score. This reference summarises the model's overall behaviour on recent data.",
    stationBackToExplorer: "Back to explorer",
    stationNoHistory: "No recent history is available for this station and pollutant.",
    stationNoPredictions: "There is no forecast available yet for this station.",
    predictionsTitle: "NO2 forecast for the next 24 hours",
    predictionsSubtitle:
      "This view combines recent observations with an indicative forecast to help you anticipate how the next few hours may evolve.",
    modelTitle: "Model v1 and metrics",
    modelSubtitle:
      "This page explains which forecast model we use, which data it was checked against, and how to interpret its errors without losing the technical traceability.",
    methodologyTitle: "Methodology and traceability",
    methodologySubtitle:
      "This page explains where the data comes from, how it is prepared, and which limits shape the forecast before it reaches the site.",
    reportsTitle: "Reports and context",
    reportsSubtitle:
      "An editorial reading of the day: what is happening, how the model is responding, and which points deserve attention in the overall project status.",
    systemTitle: "System operational status",
    systemSubtitle:
      "A panel for reviewing data updates, system health, alerts, and automation without hiding the real state of the project.",
    systemOperationalLabel: "Operational monitoring",
    systemEnvironmentLabel: "Environment",
    systemGlobalStatusLabel: "Global status",
    systemAlertsLabel: "Active alerts",
    systemPipelineRunsTitle: "Data updates",
    systemDataQualityTitle: "Data health",
    systemPredictionRunsTitle: "Forecast updates",
    systemActiveAlertsTitle: "Active alerts",
    systemModelProductionTitle: "Current model",
    systemCronStatusTitle: "Automation",
    systemQualityStatusLabel: "Quality status",
    systemPredictionRowsLabel: "Forecast rows",
    systemGeneratedAtLabel: "Generated at",
    systemImprovementLabel: "Improvement vs baseline",
    systemJobsConfiguredLabel: "Protected jobs",
    systemCloudflareConfiguredLabel: "Cloudflare D1 ready",
    systemProtectedJobsLabel: "Protected endpoints",
    systemBooleanYes: "yes",
    systemBooleanNo: "no",
    systemNoAlerts: "There are no active alerts to show for the current system state.",
    historyLabel: "Observed history",
    observedLabel: "Observed",
    predictedLabel: "Predicted",
    selectedBaseline: "Forecast model",
    horizonLabel: "Horizon",
    metricMae: "MAE",
    metricRmse: "RMSE",
    metricR2: "R²",
    trainingWindow: "Training window",
    validationWindow: "Validation window",
    testWindow: "Test window",
    notOfficialForecast: "This is an indicative forecast based on recent patterns. It does not replace official public warnings.",
    aboutEyebrow: "How to read MADRID Aire",
    aboutTitle: "Guide to following Madrid's air quality",
    aboutSubtitle:
      "Start here if you want to understand what is happening now, where to look in Madrid, and how to go deeper only when you need it. The technical layer is still available, but it no longer competes with the public reading.",
    aboutPublicRoutesTitle: "Start here",
    aboutPublicRoutesBody:
      "These routes are meant for anyone: see current conditions, place them on the map, compare stations, and check the short-term forecast.",
    aboutTechnicalRoutesTitle: "If you want more detail",
    aboutTechnicalRoutesBody:
      "This is where methodology, model metrics, reports, and operational status live. Open it only when you want to go deeper.",
    aboutLiveLabel: "For everyone",
    aboutTechnicalLabel: "Technical details",
    aboutDashboardDesc:
      "A quick overview of the most affected stations, the last update time, and the latest signal.",
    aboutMapDesc:
      "A measurement-point map to see how air quality is distributed across the city.",
    aboutStationsDesc:
      "A station explorer with location details, current values, and recent history.",
    aboutPredictionsDesc:
      "NO2 forecast for the next few hours, with risk evolution and comparison against what has been observed.",
    aboutModelDesc:
      "A page to review model accuracy and understand what its metrics mean.",
    aboutMethodologyDesc:
      "A step-by-step explanation of sources, data preparation, and the limits of the methodology.",
    aboutReportsDesc:
      "Editorial summaries that add context to the state of the system and the model.",
    aboutSystemDesc:
      "Operational project status: data updates, alerts, and maintenance signals.",
    dashboardHistoryTitle: "NO2 · last 24 h",
    dashboardForecastTrendTitle: "Next hours",
    dashboardForecastTrendBody:
      "See how NO2 may change over the next hours and compare it with the latest observed reading.",
    dashboardForecastTrendReady: "Forecast ready",
    dashboardModelStatusTitle: "How it is estimated",
    dashboardModelImprovementLabel: "vs simple methods",
    dashboardDominantPollutant: "Main indicator",
    dashboardAverageNo2Label: "Network average",
    mapPollutantSelector: "Pollutant",
    mapNoStation: "Select a station",
    mapStationDrawerClose: "Close",
    mapStationDrawerCoords: "Coordinates",
    freshness: {
      fresh: "under 3h old",
      delayed: "3 to 12h old",
      stale: "over 12h old",
      unknown: "no recent data",
      pending: "updating",
    },
  },
};

export function resolveLanguage(input: string | string[] | undefined): Language {
  if (Array.isArray(input)) {
    return resolveLanguage(input[0]);
  }

  return input === "en" ? "en" : "es";
}
