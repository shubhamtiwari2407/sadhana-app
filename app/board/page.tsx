import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import LotusDivider from "@/components/LotusDivider";
import ScoreFilter from "@/components/ScoreFilter";
import { scoringBreakdown } from "@/lib/scoring";

const RANK_STYLES = [
  "bg-gradient-to-r from-gold/25 to-gold-soft/10 border-gold/50",
  "bg-bg-card border-peacock/25",
  "bg-bg-card border-saffron/25",
];

function daysInMonth(year: number, month: number): number {
  // month is 1-indexed here
  return new Date(year, month, 0).getDate();
}

export default async function BoardPage({
  searchParams,
}: {
  searchParams: { year?: string; month?: string };
}) {
  const supabase = createClient();

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2].map(String);

  const year = searchParams.year && years.includes(searchParams.year) ? searchParams.year : String(currentYear);
  const month = searchParams.month ?? "all";

  let startDate: string;
  let endDate: string;
  if (month === "all") {
    startDate = `${year}-01-01`;
    endDate = `${year}-12-31`;
  } else {
    const monthNum = Number(month);
    startDate = `${year}-${month}-01`;
    endDate = `${year}-${month}-${String(daysInMonth(Number(year), monthNum)).padStart(2, "0")}`;
  }

  const { data: rows } = await supabase
    .from("sadhana_entries")
    .select("user_id, score, rounds_chanted, entry_date, profiles(full_name, avatar_url)")
    .gte("entry_date", startDate)
    .lte("entry_date", endDate);

  // aggregate per user in JS: total score (for ranking), total rounds, days logged
  const byUser = new Map<
    string,
    { score: number; rounds: number; days: number; profile: any }
  >();
  for (const row of rows ?? []) {
    const existing = byUser.get(row.user_id) ?? { score: 0, rounds: 0, days: 0, profile: row.profiles };
    existing.score += row.score ?? 0;
    existing.rounds += row.rounds_chanted ?? 0;
    existing.days += 1;
    byUser.set(row.user_id, existing);
  }

  const ranked = Array.from(byUser.entries())
    .map(([userId, stats]) => ({ userId, ...stats }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col gap-6 fade-in-up">
      <div>
        <h1 className="font-display text-2xl text-gold-soft">Scoreboard</h1>
        <p className="text-ink-muted text-sm mt-1">
          {ranked.length} devotee{ranked.length === 1 ? "" : "s"} on the board this period
        </p>
      </div>

      <ScoreFilter year={year} month={month} years={years} />

      <LotusDivider />

      {ranked.length === 0 ? (
        <div className="card p-10 text-center flex flex-col items-center gap-3">
          <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="20" cy="20" r="19" fill="none" stroke="#D97706" strokeWidth="1" opacity="0.5" />
            <circle cx="20" cy="20" r="4" fill="#D97706" opacity="0.7" />
          </svg>
          <p className="text-ink-muted max-w-xs">No sadhana logged for this period yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {ranked.map((entry, i) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-3 rounded-xl p-3 border fade-in-up ${
                RANK_STYLES[i] ?? "bg-bg-card border-white/5"
              }`}
              style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
            >
              <span className="text-lg font-display w-6 text-center text-gold-soft">{i + 1}</span>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gold/30 shrink-0">
                {entry.profile?.avatar_url ? (
                  <Image
                    src={entry.profile.avatar_url}
                    alt=""
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-bg-elevated" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink truncate text-sm">
                  {entry.profile?.full_name ?? "Devotee"}
                </p>
                <p className="text-ink-muted text-xs mt-0.5">
                  {entry.rounds} rounds · {entry.days} day{entry.days === 1 ? "" : "s"} logged
                </p>
              </div>
              <p className="font-display font-bold text-gold-soft text-lg">{entry.score}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card p-4">
        <h3 className="text-sm font-semibold text-ink mb-3">How scoring works</h3>
        <div className="space-y-2 text-sm">
          {scoringBreakdown().map((item) => (
            <div key={item.label} className="flex justify-between">
              <span className="text-ink-muted">{item.label}</span>
              <span className="font-medium text-ink">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
