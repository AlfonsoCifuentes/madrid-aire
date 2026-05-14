import type { CSSProperties } from "react";

type PollutantGlowProps = {
  className?: string;
  style?: CSSProperties;
  variant?: "lime" | "alert" | "cool" | "amber";
};

const VARIANT_CLASSNAME: Record<NonNullable<PollutantGlowProps["variant"]>, string> = {
  lime: "bg-halo",
  alert: "bg-[radial-gradient(circle_at_center,rgba(198,11,30,0.18),rgba(198,11,30,0))]",
  cool: "bg-[radial-gradient(circle_at_center,rgba(135,242,255,0.18),rgba(135,242,255,0))]",
  amber: "bg-[radial-gradient(circle_at_center,rgba(255,176,0,0.18),rgba(255,176,0,0))]",
};

export function PollutantGlow({ className = "", style, variant = "lime" }: PollutantGlowProps) {
  return <div aria-hidden className={`${VARIANT_CLASSNAME[variant]} rounded-full blur-3xl ${className}`.trim()} style={style} />;
}