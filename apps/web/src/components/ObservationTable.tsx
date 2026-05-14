import { LatestObservationItem } from "@/lib/api";
import { copyByLanguage, Language } from "@/lib/i18n";

type ObservationTableProps = {
  items: LatestObservationItem[];
  language: Language;
};

export function ObservationTable({ items, language }: ObservationTableProps) {
  const copy = copyByLanguage[language];
  const locale = language === "es" ? "es-ES" : "en-GB";

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/4">
      <table className="w-full border-collapse text-left">
        <thead className="border-b border-white/10 bg-white/[0.03]">
          <tr>
            <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.18em] text-soft/55">{copy.tableStation}</th>
            <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.18em] text-soft/55">{copy.tablePollutant}</th>
            <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.18em] text-soft/55">{copy.tableValue}</th>
            <th className="px-4 py-4 text-xs font-medium uppercase tracking-[0.18em] text-soft/55">{copy.tableMeasuredAt}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={`${item.station_id}-${item.pollutant_code}`} className="border-b border-white/6 last:border-b-0">
              <td className="px-4 py-4 font-data text-sm text-bone">{item.station_id}</td>
              <td className="px-4 py-4 text-sm text-soft/80">{item.pollutant_code}</td>
              <td className="px-4 py-4 font-data text-sm text-soft">{item.value.toLocaleString(locale, { maximumFractionDigits: 1 })}</td>
              <td className="px-4 py-4 font-data text-sm text-soft/70">
                {new Intl.DateTimeFormat(locale, {
                  dateStyle: "short",
                  timeStyle: "short",
                  timeZone: "Europe/Madrid",
                }).format(new Date(item.measured_at))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
