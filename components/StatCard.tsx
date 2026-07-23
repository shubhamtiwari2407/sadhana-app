import { LucideIcon } from "lucide-react";

export default function StatCard({
  icon: Icon,
  value,
  label,
  accent,
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
  accent: "gold" | "peacock" | "saffron" | "tulsi";
}) {
  const accentMap = {
    gold: "text-gold-soft bg-gold/10",
    peacock: "text-peacock-light bg-peacock/15",
    saffron: "text-saffron bg-saffron/10",
    tulsi: "text-tulsi bg-tulsi/10",
  };

  return (
    <div className="card p-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${accentMap[accent]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="font-display text-2xl text-ink">{value}</p>
      <p className="text-xs text-ink-muted mt-1">{label}</p>
    </div>
  );
}
