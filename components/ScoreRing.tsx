const BEAD_COUNT = 16; // standard daily rounds target

export default function ScoreRing({
  roundsChanted,
  score,
  size = 88,
}: {
  roundsChanted: number;
  score: number;
  size?: number;
}) {
  const radius = size / 2 - 8;
  const center = size / 2;

  const beads = Array.from({ length: BEAD_COUNT }, (_, i) => {
    const angle = (i / BEAD_COUNT) * Math.PI * 2 - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    const lit = i < Math.min(roundsChanted, BEAD_COUNT);
    return { x, y, lit };
  });

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true">
        {beads.map((bead, i) => (
          <circle
            key={i}
            cx={bead.x}
            cy={bead.y}
            r={size * 0.032}
            fill={bead.lit ? "#D97706" : "rgba(180,83,9,0.18)"}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-lg leading-none text-ink">{score}</span>
        <span className="text-[10px] text-ink-muted uppercase tracking-wide mt-0.5">pts</span>
      </div>
    </div>
  );
}
