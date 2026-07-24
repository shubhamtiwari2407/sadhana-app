export function daysInMonth(year: number, month: number): number {
  // month is 1-indexed here
  return new Date(year, month, 0).getDate();
}

export function getPeriodRange(year: string, month: string): { startDate: string; endDate: string } {
  if (month === "all") {
    return { startDate: `${year}-01-01`, endDate: `${year}-12-31` };
  }
  const monthNum = Number(month);
  return {
    startDate: `${year}-${month}-01`,
    endDate: `${year}-${month}-${String(daysInMonth(Number(year), monthNum)).padStart(2, "0")}`,
  };
}

export function getPreviousPeriod(year: string, month: string): { startDate: string; endDate: string } {
  if (month === "all") {
    return getPeriodRange(String(Number(year) - 1), "all");
  }
  const y = Number(year);
  const m = Number(month);
  const prevM = m === 1 ? 12 : m - 1;
  const prevY = m === 1 ? y - 1 : y;
  return getPeriodRange(String(prevY), String(prevM).padStart(2, "0"));
}

export type RankedEntry = {
  userId: string;
  score: number;
  rounds: number;
  days: number;
  profile: any;
};

export async function fetchRanking(supabase: any, startDate: string, endDate: string): Promise<RankedEntry[]> {
  const { data: rows } = await supabase
    .from("sadhana_entries")
    .select("user_id, score, rounds_chanted, entry_date, profiles(full_name, avatar_url)")
    .gte("entry_date", startDate)
    .lte("entry_date", endDate);

  const byUser = new Map<string, RankedEntry>();
  for (const row of rows ?? []) {
    const existing = byUser.get(row.user_id) ?? { userId: row.user_id, score: 0, rounds: 0, days: 0, profile: row.profiles };
    existing.score += row.score ?? 0;
    existing.rounds += row.rounds_chanted ?? 0;
    existing.days += 1;
    byUser.set(row.user_id, existing);
  }

  return Array.from(byUser.values()).sort((a, b) => b.score - a.score);
}