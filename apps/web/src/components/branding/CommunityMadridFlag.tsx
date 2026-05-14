type CommunityMadridFlagProps = {
  className?: string;
};

const starPositions = [
  [26, 24],
  [50, 24],
  [74, 24],
  [98, 24],
  [38, 54],
  [62, 54],
  [86, 54],
] as const;

function starPoints(cx: number, cy: number, outerRadius: number, innerRadius: number) {
  const points = Array.from({ length: 10 }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    const radius = index % 2 === 0 ? outerRadius : innerRadius;

    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  });

  return points.join(" ");
}

export function CommunityMadridFlag({ className }: CommunityMadridFlagProps) {
  return (
    <svg
      aria-label="Community of Madrid flag"
      className={className}
      fill="none"
      viewBox="0 0 120 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="120" height="80" rx="8" fill="#C60B1E" />
      {starPositions.map(([cx, cy], index) => (
        <polygon key={`${cx}-${cy}-${index}`} fill="#FFFFFF" points={starPoints(cx, cy, 7.5, 3.3)} />
      ))}
    </svg>
  );
}
