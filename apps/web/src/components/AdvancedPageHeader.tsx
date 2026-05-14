import Link from "next/link";

import { LanguageSelector } from "@/components/LanguageSelector";
import { MobileBottomNavItem } from "@/components/MobileBottomNav";
import { MadridAireWordmark } from "@/components/branding/MadridAireWordmark";
import { Language } from "@/lib/i18n";

export type AdvancedNavLabels = {
  guide: string;
  dashboard: string;
  model: string;
  methodology: string;
  reports: string;
  system: string;
  eyebrow: string;
  body: string;
};

type AdvancedPageKey = "model" | "methodology" | "reports" | "system";

type AdvancedPageHeaderProps = {
  language: Language;
  pathname: string;
  currentPage: AdvancedPageKey;
  labels: AdvancedNavLabels;
};

type NavLink = {
  key: AdvancedPageKey;
  href: string;
  label: string;
};

function buildAdvancedLinks(language: Language, labels: AdvancedNavLabels): NavLink[] {
  return [
    { key: "model", href: `/model?lang=${language}`, label: labels.model },
    { key: "methodology", href: `/methodology?lang=${language}`, label: labels.methodology },
    { key: "reports", href: `/reports?lang=${language}`, label: labels.reports },
    { key: "system", href: `/system?lang=${language}`, label: labels.system },
  ];
}

export function buildAdvancedMobileNavItems(
  language: Language,
  labels: AdvancedNavLabels,
): MobileBottomNavItem[] {
  return buildAdvancedLinks(language, labels).map(({ key, href, label }) => ({ key, href, label }));
}

export function AdvancedPageHeader({ language, pathname, currentPage, labels }: AdvancedPageHeaderProps) {
  const links = buildAdvancedLinks(language, labels);

  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-5">
          <div className="glass-panel w-max rounded-full px-4 py-3 shadow-atmosphere">
            <MadridAireWordmark className="items-center" size="compact" />
          </div>
          <div className="max-w-2xl rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="eyebrow text-soft/55">{labels.eyebrow}</p>
            <p className="mt-2 text-sm leading-6 text-soft/72">{labels.body}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-soft/76 transition hover:bg-white/[0.08] hover:text-soft"
            href={`/about?lang=${language}#advanced`}
          >
            {labels.guide}
          </Link>
          <Link
            className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-soft/76 transition hover:bg-white/[0.08] hover:text-soft"
            href={`/dashboard?lang=${language}`}
          >
            {labels.dashboard}
          </Link>
          <LanguageSelector currentLanguage={language} pathname={pathname} />
        </div>
      </div>

      <nav
        className="hidden flex-wrap items-center gap-2 md:flex"
        aria-label={language === "es" ? "Navegación avanzada" : "Advanced navigation"}
      >
        {links.map((item) => {
          const active = item.key === currentPage;

          return (
            <Link
              key={item.key}
              className={[
                "rounded-full border px-4 py-3 text-sm transition",
                active
                  ? "border-lime/60 bg-lime/15 text-bone shadow-[0_18px_40px_rgba(216,255,79,0.12)]"
                  : "border-white/10 bg-white/[0.03] text-soft/76 hover:bg-white/[0.08] hover:text-soft",
              ].join(" ")}
              href={item.href}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}