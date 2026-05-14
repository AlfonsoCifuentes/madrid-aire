import { CommunityMadridFlag } from "@/components/branding/CommunityMadridFlag";

export type MadridAireWordmarkProps = {
  size?: "hero" | "landing" | "header" | "footer" | "compact";
  theme?: "dark" | "light";
  showFlag?: boolean;
  className?: string;
};

const wrapperSizes: Record<NonNullable<MadridAireWordmarkProps["size"]>, string> = {
  hero: "gap-3 xs:gap-4 lg:gap-5",
  landing: "gap-3 xs:gap-4 lg:gap-5",
  header: "gap-2.5",
  footer: "gap-2.5",
  compact: "gap-2",
};

const flagSizes: Record<NonNullable<MadridAireWordmarkProps["size"]>, string> = {
  hero: "h-[clamp(2.45rem,8.2vw,9.4rem)]",
  landing: "h-[clamp(2.55rem,8.6vw,9.8rem)] 2xl:h-[clamp(2.55rem,7.4vw,7.4rem)]",
  header: "h-7 sm:h-8",
  footer: "h-7 sm:h-8",
  compact: "h-6 sm:h-7",
};

const madridSizes: Record<NonNullable<MadridAireWordmarkProps["size"]>, string> = {
  hero: "text-[clamp(2.75rem,11vw,13rem)]",
  landing: "text-[clamp(3rem,12.2vw,13.5rem)] 2xl:text-[clamp(3rem,10.5vw,10.5rem)]",
  header: "text-[clamp(1.25rem,2vw,1.8rem)]",
  footer: "text-[clamp(1.25rem,2vw,1.8rem)]",
  compact: "text-[clamp(1rem,1.7vw,1.35rem)]",
};

const aireSizes: Record<NonNullable<MadridAireWordmarkProps["size"]>, string> = {
  hero: "text-[clamp(2.55rem,10.4vw,12.35rem)]",
  landing: "text-[clamp(2.7rem,11.1vw,11.9rem)] 2xl:text-[clamp(2.7rem,9.5vw,9.5rem)]",
  header: "text-[clamp(1.2rem,1.8vw,1.7rem)]",
  footer: "text-[clamp(1.2rem,1.8vw,1.7rem)]",
  compact: "text-[clamp(0.95rem,1.5vw,1.25rem)]",
};

function joinClasses(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function MadridAireWordmark({
  size = "hero",
  theme = "dark",
  showFlag = true,
  className,
}: MadridAireWordmarkProps) {
  const isDark = theme === "dark";

  return (
    <div className={joinClasses("inline-flex items-center", wrapperSizes[size], className)}>
      {showFlag ? (
        <span className={joinClasses("inline-flex shrink-0 items-center self-center", flagSizes[size])}>
          <CommunityMadridFlag className="h-full w-auto" />
        </span>
      ) : null}
      <div className="inline-flex items-center gap-[0.08em] leading-none">
        <span
          className={joinClasses(
            "font-logo-heavy font-black uppercase leading-[0.9] tracking-[-0.055em]",
            madridSizes[size],
            isDark ? "text-soft" : "text-graphite",
          )}
        >
          MADRID
        </span>
        <span
          className={joinClasses(
            "font-logo-script leading-[0.9] tracking-[-0.025em] translate-y-[0.07em]",
            aireSizes[size],
            isDark ? "text-bone" : "text-charcoal",
          )}
        >
          Aire
        </span>
      </div>
    </div>
  );
}
