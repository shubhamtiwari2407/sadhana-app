import Image from "next/image";
import { ArrowUp, ArrowDown, Minus, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import LotusDivider from "@/components/LotusDivider";
import ScoreFilter from "@/components/ScoreFilter";
import { scoringBreakdown } from "@/lib/scoring";

function daysInMonth(year: number, month: number): number {
  // month is 1-indexed here
  return new Date(year, month, 0).getDate();
}

function getPeriodRange(year: string, month: string): { startDate: string; endDate: string } {
  if (month === "all") {
    return { startDate: `${year}-01-01`, endDate: `${year}-12-31` };
  }
  const monthNum = Number(month);
  return {
    startDate: `${year}-${month}-01`,
    endDate: `${year}-${month}-${String(daysInMonth(Number(year), monthNum)).padStart(2, "0")}`,
  };
}

function getPreviousPeriod(year: string, month: string): { startDate: string; endDate: string } {
  if (month === "all") {
    return getPeriodRange(String(Number(year) - 1), "all");
  }
  const y = Number(year);
  const m = Number(month);
  const prevM = m === 1 ? 12 : m - 1;
  const prevY = m === 1 ? y - 1 : y;
  return getPeriodRange(String(prevY), String(prevM).padStart(2, "0"));
}

async function fetchRanking(supabase: any, startDate: string, endDate: string) {
  const { data: rows } = await supabase
    .from("sadhana_entries")
    .select("user_id, score, rounds_chanted, entry_date, profiles(full_name, avatar_url)")
    .gte("entry_date", startDate)
    .lte("entry_date", endDate);

  const byUser = new Map<string, { score: number; rounds: number; days: number; profile: any }>();
  for (const row of rows ?? []) {
    const existing = byUser.get(row.user_id) ?? { score: 0, rounds: 0, days: 0, profile: row.profiles };
    existing.score += row.score ?? 0;
    existing.rounds += row.rounds_chanted ?? 0;
    existing.days += 1;
    byUser.set(row.user_id, existing);
  }

  return Array.from(byUser.entries())
    .map(([userId, stats]) => ({ userId, ...stats }))
    .sort((a, b) => b.score - a.score);
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

  const { startDate, endDate } = getPeriodRange(year, month);
  const ranked = await fetchRanking(supabase, startDate, endDate);

  const prevRange = getPreviousPeriod(year, month);
  const prevRanked = await fetchRanking(supabase, prevRange.startDate, prevRange.endDate);
  const prevRankByUser = new Map(prevRanked.map((e, i) => [e.userId, i]));

  const top = ranked[0];
  const rest = ranked.slice(1);
  const topPrevRank = top ? prevRankByUser.get(top.userId) : undefined;
  const topMoved = topPrevRank === undefined ? null : topPrevRank - 0;

  return (
    <div className="flex flex-col gap-6 fade-in-up">
      <div>
        <h1 className="font-display text-2xl text-ink">Scoreboard</h1>
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
          {/* Top devotee — premium featured card */}
          <div
            className="card p-5 flex items-center gap-4 fade-in-up relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(212,175,55,0.22), rgba(249,115,22,0.1))",
              borderColor: "rgba(212,175,55,0.6)",
            }}
          >
            <div
              className="absolute -top-8 -right-8 w-28 h-28 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(212,175,55,0.35), transparent 70%)" }}
              aria-hidden="true"
            />
            <div className="flex flex-col items-center gap-1 relative">
              <Crown className="w-5 h-5 text-gold-soft" />
              {topMoved !== null && topMoved !== 0 && (
                <span
                  className={`flex items-center text-[10px] font-semibold ${
                    topMoved > 0 ? "text-tulsi" : "text-saffron"
                  }`}
                >
                  {topMoved > 0 ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
                  {Math.abs(topMoved)}
                </span>
              )}
            </div>
            <div
              className="w-16 h-16 rounded-full overflow-hidden shrink-0 relative"
              style={{ border: "2.5px solid #D4AF37", boxShadow: "0 6px 16px rgba(212,175,55,0.4)" }}
            >
              {top.profile?.avatar_url ? (
                <Image src={top.profile.avatar_url} alt="" width={64} height={64} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-bg-elevated" />
              )}
            </div>
            <div className="flex-1 min-w-0 relative">
              <p className="font-display text-lg text-ink truncate">{top.profile?.full_name ?? "Devotee"}</p>
              <p className="text-ink-muted text-xs mt-0.5">
                {top.rounds} rounds · {top.days} day{top.days === 1 ? "" : "s"} logged
              </p>
            </div>
            <p className="font-numeric text-2xl text-ink relative">{top.score}</p>
          </div>

          {rest.map((entry, idx) => {
            const i = idx + 1;
            const prevRank = prevRankByUser.get(entry.userId);
            const moved = prevRank === undefined ? null : prevRank - i;

            return (
              <div
                key={entry.userId}
                className="card flex items-center gap-3 p-3.5 fade-in-up"
                style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
              >
                <div className="flex flex-col items-center w-6 shrink-0">
                  <span className="text-base font-numeric text-ink-muted leading-none">{i + 1}</span>
                  {moved !== null && moved !== 0 && (
                    <span
                      className={`flex items-center text-[10px] font-semibold mt-0.5 ${
                        moved > 0 ? "text-tulsi" : "text-saffron"
                      }`}
                    >
                      {moved > 0 ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
                      {Math.abs(moved)}
                    </span>
                  )}
                  {moved === 0 && <Minus className="w-2.5 h-2.5 text-ink-muted/40 mt-0.5" />}
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gold/25 shrink-0">
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
                <p className="font-numeric text-lg text-ink">{entry.score}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-ink mb-4">How scoring works</h3>
        <div className="space-y-2.5 text-sm">
          {scoringBreakdown().map((item) => (
            <div key={item.label} className="flex justify-between">
              <span className="text-ink-muted">{item.label}</span>
              <span className="font-medium text-ink font-numeric">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}