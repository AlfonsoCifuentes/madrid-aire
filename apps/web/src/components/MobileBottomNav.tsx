import Link from "next/link";

import { Language } from "@/lib/i18n";

export type MobileBottomNavItem = {
  key: string;
  href: string;
  label: string;
};

type MobileBottomNavProps = {
  currentLanguage: Language;
  currentPage: string;
  ariaLabel: string;
  items: MobileBottomNavItem[];
};

export function MobileBottomNav({ currentLanguage, currentPage, ariaLabel, items }: MobileBottomNavProps) {
  return (
    <nav className="fixed inset-x-4 bottom-4 z-50 md:hidden" aria-label={ariaLabel} data-language={currentLanguage}>
      <div className="glass-panel flex items-stretch gap-1 rounded-[1.75rem] p-2 shadow-atmosphere">
        {items.map((item) => {
          const active = item.key === currentPage;

          return (
            <Link
              key={item.key}
              className={[
                "flex min-w-0 flex-1 items-center justify-center rounded-[1.2rem] px-1 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition",
                active ? "bg-lime text-graphite" : "text-soft/72 hover:bg-white/8 hover:text-soft",
              ].join(" ")}
              href={item.href}
              aria-current={active ? "page" : undefined}
            >
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}