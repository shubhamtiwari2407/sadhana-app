export default function PeacockFeather({
  className = "",
  size = 48,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size * 1.6}
      viewBox="0 0 60 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* quill */}
      <path d="M30 94 L30 40" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
      {/* plume */}
      <path
        d="M30 4C42 16 48 32 44 48C41 60 35 68 30 72C25 68 19 60 16 48C12 32 18 16 30 4Z"
        fill="url(#feather-body)"
        stroke="#D97706"
        strokeWidth="1"
      />
      {/* barbs */}
      {Array.from({ length: 7 }).map((_, i) => {
        const y = 18 + i * 7;
        const spread = 4 + i * 2.4;
        return (
          <g key={i} stroke="#3FA0A8" strokeWidth="0.6" opacity={0.55}>
            <path d={`M30 ${y} L${30 - spread} ${y + 5}`} />
            <path d={`M30 ${y} L${30 + spread} ${y + 5}`} />
          </g>
        );
      })}
      {/* eye */}
      <ellipse cx="30" cy="34" rx="9" ry="13" fill="#123C42" stroke="#D97706" strokeWidth="1" />
      <ellipse cx="30" cy="34" rx="5" ry="8" fill="#1F6F78" />
      <ellipse cx="30" cy="34" rx="2" ry="3.4" fill="#0E262A" />
      <defs>
        <linearGradient id="feather-body" x1="16" y1="4" x2="44" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1F6F78" />
          <stop offset="55%" stopColor="#123C42" />
          <stop offset="100%" stopColor="#7C2D12" />
        </linearGradient>
      </defs>
    </svg>
  );
}
