type CinematicOverlayProps = {
  className?: string;
  variant?: "hero" | "panel";
};

const VARIANT_CLASSNAME: Record<NonNullable<CinematicOverlayProps["variant"]>, string> = {
  hero: "bg-[radial-gradient(circle_at_50%_35%,rgba(255,176,0,0.12),transparent_0_20%),linear-gradient(180deg,rgba(8,10,12,0),rgba(8,10,12,0.9))]",
  panel: "bg-[radial-gradient(circle_at_50%_40%,rgba(210,255,92,0.16),rgba(14,18,24,0.82)_55%,rgba(6,8,12,0.96))]",
};

export function CinematicOverlay({ className = "", variant = "hero" }: CinematicOverlayProps) {
  return <div aria-hidden className={`${VARIANT_CLASSNAME[variant]} ${className}`.trim()} />;
}