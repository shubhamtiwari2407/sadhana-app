export default function Flute({ className = "", size = 120 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.28}
      viewBox="0 0 200 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="4" y="22" width="192" height="12" rx="6" fill="url(#flute-body)" stroke="#D4AF37" strokeWidth="1" />
      {[30, 60, 90, 120, 150, 175].map((x) => (
        <circle key={x} cx={x} cy="28" r="2.6" fill="#7C2D12" />
      ))}
      <circle cx="190" cy="28" r="3.5" fill="none" stroke="#9A6C3A" strokeWidth="1" />
      <defs>
        <linearGradient id="flute-body" x1="4" y1="22" x2="196" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
    </svg>
  );
}