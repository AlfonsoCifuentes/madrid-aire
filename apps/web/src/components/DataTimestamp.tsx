type DataTimestampProps = {
  isoString: string | null | undefined;
  language?: "es" | "en";
  className?: string;
};

const LOCALE_MAP = {
  es: "es-ES",
  en: "en-GB",
} as const;

export function DataTimestamp({ isoString, language = "es", className }: DataTimestampProps) {
  if (!isoString) {
    return (
      <span className={className}>
        <span className="text-soft/40">{language === "es" ? "sin dato" : "no data"}</span>
      </span>
    );
  }

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return (
      <span className={className}>
        <span className="text-soft/40">{language === "es" ? "fecha inválida" : "invalid date"}</span>
      </span>
    );
  }

  const locale = LOCALE_MAP[language];

  const datePart = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);

  const timePart = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return (
    <time dateTime={date.toISOString()} className={className}>
      {datePart} · {timePart}
    </time>
  );
}
