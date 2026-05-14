import Link from "next/link";

import { LanguageSelector } from "@/components/LanguageSelector";
import { MobileBottomNav, type MobileBottomNavItem } from "@/components/MobileBottomNav";
import { MadridAireWordmark } from "@/components/branding/MadridAireWordmark";
import { AlertItem, getAlertsPayload, getSystemStatusPayload } from "@/lib/api";
import { copyByLanguage, resolveLanguage } from "@/lib/i18n";

type SystemPageProps = {
  searchParams?: Promise<{ lang?: string | string[] }>;
};

function formatMoment(value: string | null) {
  if (!value) {
    return "-";
  }

  return value.replace("T", " ").slice(0, 16);
}

function formatWindow(start: string | null, end: string | null) {
  if (!start || !end) {
    return "-";
  }

  return `${start.slice(0, 10)} → ${end.slice(0, 10)}`;
}

function severityClasses(severity: string) {
  if (severity === "critical") {
    return "border-[#ff7b7b]/30 bg-[#ff7b7b]/10 text-[#ffd1d1]";
  }
  if (severity === "warning") {
    return "border-[#f2d06b]/30 bg-[#f2d06b]/10 text-[#fff1bf]";
  }
  return "border-white/10 bg-white/5 text-soft/78";
}

function AlertCard({ alert }: { alert: AlertItem }) {
  return (
    <article className={`rounded-[1.5rem] border p-4 ${severityClasses(alert.severity)}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">{alert.category}</p>
        <p className="font-data text-xs uppercase tracking-[0.24em]">{alert.severity}</p>
      </div>
      <h3 className="mt-3 text-lg font-medium text-bone">{alert.title}</h3>
      <p className="mt-2 text-sm leading-6">{alert.body}</p>
      <div className="mt-4 flex flex-wrap gap-3 font-data text-xs text-current/80">
        {alert.station_id ? <span>{alert.station_id}</span> : null}
        {alert.predicted_for ? <span>{formatMoment(alert.predicted_for)}</span> : null}
        {alert.measured_at ? <span>{formatMoment(alert.measured_at)}</span> : null}
        <span>{alert.source}</span>
      </div>
    </article>
  );
}

export default async function SystemPage({ searchParams }: SystemPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const language = resolveLanguage(params?.lang);
  const copy = copyByLanguage[language];
  const [system, alerts] = await Promise.all([getSystemStatusPayload(), getAlertsPayload()]);
  const mobileNavItems: MobileBottomNavItem[] = [
    { key: "dashboard", href: `/dashboard?lang=${language}`, label: copy.mobileNavDashboard },
    { key: "model", href: `/model?lang=${language}`, label: copy.mobileNavModel },
    { key: "methodology", href: `/methodology?lang=${language}`, label: copy.mobileNavMethodology },
    { key: "reports", href: `/reports?lang=${language}`, label: copy.mobileNavReports },
    { key: "system", href: `/system?lang=${language}`, label: copy.mobileNavSystem },
  ];

  return (
    <main className="min-h-screen bg-graphite px-5 py-5 pb-28 text-soft sm:px-7 md:pb-5 lg:px-10 3xl:px-14">
      <section className="mx-auto flex w-full max-w-[1800px] flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="glass-panel rounded-full px-4 py-3 shadow-atmosphere">
            <MadridAireWordmark className="items-center" size="compact" />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden flex-wrap items-center gap-3 md:flex">
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/landing?lang=${language}`}>
              {copy.backHome}
            </Link>
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/dashboard?lang=${language}`}>
              {copy.dashboardTitle}
            </Link>
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/predictions?lang=${language}`}>
              {copy.openPredictions}
            </Link>
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/model?lang=${language}`}>
              {copy.openModel}
            </Link>
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/methodology?lang=${language}`}>
              {copy.openMethodology}
            </Link>
            <Link className="glass-panel rounded-full px-4 py-3 text-sm text-soft/80 shadow-atmosphere hover:bg-white/10" href={`/reports?lang=${language}`}>
              {copy.openReports}
            </Link>
            </div>
            <LanguageSelector currentLanguage={language} pathname="/system" />
          </div>
        </header>

        <div className="grid gap-10 xl:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="eyebrow text-soft/55">{copy.systemOperationalLabel}</p>
            <h1 className="mt-4 max-w-[12ch] text-4xl font-medium tracking-[-0.04em] text-soft sm:text-5xl lg:text-6xl">
              {copy.systemTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-soft/74">{copy.systemSubtitle}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.systemEnvironmentLabel}</p>
              <p className="mt-4 font-data text-3xl text-bone">{system?.environment ?? "-"}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.systemGlobalStatusLabel}</p>
              <p className="mt-4 font-data text-3xl text-bone">{system?.status ?? "system_pending"}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.latestTimestamp}</p>
              <p className="mt-4 font-data text-sm text-bone">{formatMoment(system?.pipeline.latest_timestamp ?? null)}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
              <p className="eyebrow text-soft/55">{copy.systemAlertsLabel}</p>
              <p className="mt-4 font-data text-3xl text-bone">{alerts?.items.length ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-medium text-bone">{copy.systemPipelineRunsTitle}</h2>
              <p className="font-data text-xs uppercase tracking-[0.24em] text-soft/55">{system?.pipeline.status ?? "foundation_ready"}</p>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <p className="eyebrow text-soft/55">{copy.sourceLabel}</p>
                <p className="mt-2 font-data text-sm text-bone">{system?.pipeline.source ?? "-"}</p>
              </div>
              <div>
                <p className="eyebrow text-soft/55">{copy.localFileLabel}</p>
                <p className="mt-2 break-all font-data text-sm text-bone">{system?.pipeline.local_file ?? "-"}</p>
              </div>
            </div>
          </section>

          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-medium text-bone">{copy.systemDataQualityTitle}</h2>
              <p className="font-data text-xs uppercase tracking-[0.24em] text-soft/55">{copy.freshness[system?.data_quality.freshness ?? "unknown"] ?? system?.data_quality.freshness ?? "-"}</p>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <p className="eyebrow text-soft/55">{copy.stationsOnline}</p>
                <p className="mt-2 font-data text-3xl text-bone">{system?.data_quality.station_count ?? 0}</p>
              </div>
              <div>
                <p className="eyebrow text-soft/55">{copy.pollutantCoverage}</p>
                <p className="mt-2 font-data text-3xl text-bone">{system?.data_quality.pollutant_count ?? 0}</p>
              </div>
              <div>
                <p className="eyebrow text-soft/55">{copy.systemQualityStatusLabel}</p>
                <p className="mt-2 font-data text-sm text-bone">{system?.data_quality.status ?? "quality_pending"}</p>
              </div>
            </div>
          </section>

          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-medium text-bone">{copy.systemPredictionRunsTitle}</h2>
              <p className="font-data text-xs uppercase tracking-[0.24em] text-soft/55">{system?.predictions.status ?? "predictions_pending"}</p>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <p className="eyebrow text-soft/55">{copy.systemPredictionRowsLabel}</p>
                <p className="mt-2 font-data text-3xl text-bone">{system?.predictions.row_count ?? 0}</p>
              </div>
              <div>
                <p className="eyebrow text-soft/55">{copy.stationsOnline}</p>
                <p className="mt-2 font-data text-3xl text-bone">{system?.predictions.station_count ?? 0}</p>
              </div>
              <div>
                <p className="eyebrow text-soft/55">{copy.horizonLabel}</p>
                <p className="mt-2 font-data text-3xl text-bone">{system?.predictions.horizon_count ?? 0}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <p className="eyebrow text-soft/55">{copy.sourceLabel}</p>
                <p className="mt-2 font-data text-sm text-bone">{system?.predictions.source ?? "-"}</p>
              </div>
              <div>
                <p className="eyebrow text-soft/55">{copy.systemGeneratedAtLabel}</p>
                <p className="mt-2 font-data text-sm text-bone">{formatMoment(system?.predictions.generated_at ?? null)}</p>
              </div>
            </div>
          </section>

          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-medium text-bone">{copy.systemModelProductionTitle}</h2>
              <p className="font-data text-xs uppercase tracking-[0.24em] text-soft/55">{system?.model.status ?? "model_pending"}</p>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <p className="eyebrow text-soft/55">{copy.selectedBaseline}</p>
                <p className="mt-2 font-data text-sm text-bone">{system?.model.selected_model ?? "-"}</p>
              </div>
              <div>
                <p className="eyebrow text-soft/55">{copy.horizonLabel}</p>
                <p className="mt-2 font-data text-sm text-bone">{system?.model.horizon_hours ? `${system.model.horizon_hours}h` : "-"}</p>
              </div>
              <div>
                <p className="eyebrow text-soft/55">{copy.systemImprovementLabel}</p>
                <p className="mt-2 font-data text-sm text-bone">
                  {typeof system?.model.improvement_pct_vs_best_baseline === "number"
                    ? `${system.model.improvement_pct_vs_best_baseline.toFixed(2)}%`
                    : "-"}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <p className="eyebrow text-soft/55">{copy.trainingWindow}</p>
                <p className="mt-2 font-data text-sm text-bone">{formatWindow(system?.model.training_period_start ?? null, system?.model.training_period_end ?? null)}</p>
              </div>
              <div>
                <p className="eyebrow text-soft/55">{copy.testWindow}</p>
                <p className="mt-2 font-data text-sm text-bone">{formatWindow(system?.model.test_period_start ?? null, system?.model.test_period_end ?? null)}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-medium text-bone">{copy.systemActiveAlertsTitle}</h2>
              <p className="font-data text-xs uppercase tracking-[0.24em] text-soft/55">{alerts?.status ?? "quiet"}</p>
            </div>
            <div className="mt-5 grid gap-4">
              {alerts?.items.length ? alerts.items.map((alert) => <AlertCard key={alert.id} alert={alert} />) : <p className="text-sm leading-6 text-soft/70">{copy.systemNoAlerts}</p>}
            </div>
          </section>

          <section className="glass-panel rounded-[2rem] p-5 shadow-atmosphere">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-medium text-bone">{copy.systemCronStatusTitle}</h2>
              <p className="font-data text-xs uppercase tracking-[0.24em] text-soft/55">{system?.cron.status ?? "cron_pending_secret"}</p>
            </div>
            <div className="mt-5 grid gap-4">
              <div>
                <p className="eyebrow text-soft/55">{copy.systemJobsConfiguredLabel}</p>
                <p className="mt-2 font-data text-sm text-bone">{system?.cron.jobs_configured ? copy.systemBooleanYes : copy.systemBooleanNo}</p>
              </div>
              <div>
                <p className="eyebrow text-soft/55">{copy.systemSupabaseConfiguredLabel}</p>
                <p className="mt-2 font-data text-sm text-bone">{system?.cron.supabase_configured ? copy.systemBooleanYes : copy.systemBooleanNo}</p>
              </div>
              <div>
                <p className="eyebrow text-soft/55">{copy.systemProtectedJobsLabel}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(system?.cron.protected_jobs ?? []).map((job) => (
                    <span key={job} className="rounded-full bg-white/6 px-3 py-2 font-data text-xs text-soft/78">
                      {job}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
      <MobileBottomNav currentLanguage={language} currentPage="system" ariaLabel={copy.mobileNavAriaLabel} items={mobileNavItems} />
    </main>
  );
}