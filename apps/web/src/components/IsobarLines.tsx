type IsobarLinesProps = {
  className?: string;
};

export function IsobarLines({ className = "" }: IsobarLinesProps) {
  return <div aria-hidden className={`atmosphere-isobars animate-drift reduced-motion:animate-none ${className}`.trim()} />;
}