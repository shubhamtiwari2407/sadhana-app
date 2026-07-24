export default function LotusDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <span className="flex-1 divider-gold" />
      <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
        <path
          d="M14 18C14 18 4 15 4 8C4 4 8 2 14 6C20 2 24 4 24 8C24 15 14 18 14 18Z"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1.1"
        />
        <path d="M14 18C14 18 9 14 9 9C9 6.5 11 5 14 7C17 5 19 6.5 19 9C19 14 14 18 14 18Z" fill="#D4AF37" opacity="0.5" />
      </svg>
      <span className="flex-1 divider-gold" />
    </div>
  );
}