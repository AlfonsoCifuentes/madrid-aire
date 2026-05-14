type KpiMetricProps = {
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
};

export function KpiMetric({ label, value, sub, highlight = false }: KpiMetricProps) {
  return (
    <div className="glass-panel rounded-[1.75rem] p-5 shadow-atmosphere">
      <p className="eyebrow text-soft/55">{label}</p>
      <p className={`mt-4 font-data text-3xl ${highlight ? "text-[#d8ff4f]" : "text-bone"}`}>{value}</p>
      {sub ? <p className="mt-3 text-sm text-soft/70">{sub}</p> : null}
    </div>
  );
}
