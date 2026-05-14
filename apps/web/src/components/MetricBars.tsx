import { MetricItem } from "@/lib/api";

type MetricBarsProps = {
  items: MetricItem[];
  maeLabel: string;
  rmseLabel: string;
  r2Label: string;
};

export function MetricBars({ items, maeLabel, rmseLabel, r2Label }: MetricBarsProps) {
  const maxValue = Math.max(...items.flatMap((item) => [item.mae, item.rmse]), 1);

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <div key={item.baseline_name} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-data text-sm uppercase tracking-[0.16em] text-bone">{item.baseline_name}</p>
            <p className="text-xs text-soft/55">n={item.sample_count}</p>
          </div>
          <div className="mt-4 grid gap-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm text-soft/72">
                <span>{maeLabel}</span>
                <span className="font-data">{item.mae.toFixed(2)}</span>
              </div>
              <div className="h-2 rounded-full bg-white/8">
                <div className="h-2 rounded-full bg-lime" style={{ width: `${(item.mae / maxValue) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm text-soft/72">
                <span>{rmseLabel}</span>
                <span className="font-data">{item.rmse.toFixed(2)}</span>
              </div>
              <div className="h-2 rounded-full bg-white/8">
                <div className="h-2 rounded-full bg-no2" style={{ width: `${(item.rmse / maxValue) * 100}%` }} />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-soft/72">
              <span>{r2Label}</span>
              <span className="font-data">{item.r2 == null ? "-" : item.r2.toFixed(3)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
