import Link from "next/link";

import { LanguageSelector } from "@/components/LanguageSelector";
import { MobileBottomNavItem } from "@/components/MobileBottomNav";
import { MadridAireWordmark } from "@/components/branding/MadridAireWordmark";
import { Language } from "@/lib/i18n";

export type PublicNavLabels = {
  home: string;
  dashboard: string;
  map: string;
  stations: string;
  predictions: string;
  about: string;
};

type PublicPageKey = "dashboard" | "map" | "stations" | "predictions" | "about";

type PublicPageHeaderProps = {
  language: Language;
  pathname: string;
  currentPage: PublicPageKey;
  labels: PublicNavLabels;
};

type NavLink = {
  key: PublicPageKey;
  href: string;
  label: string;
};

function buildPublicLinks(language: Language, labels: PublicNavLabels): NavLink[] {
  return [
    { key: "dashboard", href: `/dashboard?lang=${language}`, label: labels.dashboard },
    { key: "map", href: `/map?lang=${language}`, label: labels.map },
    { key: "stations", href: `/stations?lang=${language}`, label: labels.stations },
    { key: "predictions", href: `/predictions?lang=${language}`, label: labels.predictions },
    { key: "about", href: `/about?lang=${language}`, label: labels.about },
  ];
}

export function buildPublicMobileNavItems(
  language: Language,
  labels: PublicNavLabels,
): MobileBottomNavItem[] {
  return buildPublicLinks(language, labels).map(({ key, href, label }) => ({ key, href, label }));
}

export function PublicPageHeader({ language, pathname, currentPage, labels }: PublicPageHeaderProps) {
  const links = buildPublicLinks(language, labels);

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="glass-panel rounded-full px-4 py-3 shadow-atmosphere">
        <MadridAireWordmark className="items-center" size="compact" />
      </div>
      <div className="flex items-center gap-3">
        <nav className="hidden flex-wrap items-center gap-2 md:flex" aria-label={language === "es" ? "Navegación principal" : "Primary navigation"}>
          <Link
            className="rounded-full px-3 py-2 text-sm text-soft/55 transition hover:text-soft"
            href={`/landing?lang=${language}`}
          >
            {labels.home}
          </Link>
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
        <LanguageSelector currentLanguage={language} pathname={pathname} />
      </div>
    </header>
  );
}