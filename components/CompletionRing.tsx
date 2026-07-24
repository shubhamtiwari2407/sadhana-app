export default function CompletionRing({
  percent,
  score,
  size = 176,
}: {
  percent: number;
  score: number;
  size?: number;
}) {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(percent, 100));
  const offset = circumference * (1 - clamped / 100);
  const glowRadius = radius + strokeWidth / 2 + 6;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute ring-glow" style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={glowRadius}
          stroke="url(#ringGlow)"
          strokeWidth={2}
          fill="none"
          opacity={clamped > 0 ? 1 : 0}
        />
      </svg>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(212,175,55,0.15)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.34,1.2,0.4,1)" }}
        />
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
          <radialGradient id="ringGlow">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-numeric text-4xl text-ink leading-none">{Math.round(clamped)}%</span>
        <span className="text-[11px] text-ink-muted mt-1.5 font-numeric">{score} pts today</span>
      </div>
    </div>
  );
}