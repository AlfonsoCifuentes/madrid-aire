type NoiseOverlayProps = {
  className?: string;
};

export function NoiseOverlay({ className = "" }: NoiseOverlayProps) {
  return <div aria-hidden className={`noise-layer ${className}`.trim()} />;
}