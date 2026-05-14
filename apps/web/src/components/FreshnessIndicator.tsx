const DOT_CLASS: Record<string, string> = {
  fresh: "bg-[#d8ff4f]",
  delayed: "bg-[#ffb000]",
  stale: "bg-[#ff7a00]",
  unknown: "bg-white/40",
};

type FreshnessIndicatorProps = {
  freshness: string;
  label?: string;
};

export function FreshnessIndicator({ freshness, label }: FreshnessIndicatorProps) {
  const dotClass = DOT_CLASS[freshness] ?? DOT_CLASS.unknown;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${dotClass}`} />
      {label ? <span className="text-xs text-soft/60">{label}</span> : null}
    </span>
  );
}
