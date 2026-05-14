import Link from "next/link";

import { copyByLanguage, Language } from "@/lib/i18n";

type LanguageSelectorProps = {
  currentLanguage: Language;
  pathname: string;
};

function buttonClasses(active: boolean) {
  return [
    "inline-flex min-h-10 min-w-10 items-center justify-center rounded-full px-3 text-xs font-semibold transition",
    active ? "bg-lime text-graphite" : "bg-white/5 text-soft hover:bg-white/10",
  ].join(" ");
}

export function LanguageSelector({ currentLanguage, pathname }: LanguageSelectorProps) {
  const copy = copyByLanguage[currentLanguage];

  return (
    <div className="glass-panel flex items-center gap-2 rounded-full px-2 py-2 shadow-atmosphere">
      <span className="eyebrow px-2 text-soft/65">{copy.languageLabel}</span>
      <Link className={buttonClasses(currentLanguage === "es")} href={`${pathname}?lang=es`} scroll={false}>
        {copy.spanishLabel}
      </Link>
      <Link className={buttonClasses(currentLanguage === "en")} href={`${pathname}?lang=en`} scroll={false}>
        {copy.englishLabel}
      </Link>
    </div>
  );
}
