export type EntryForBadges = {
  entry_date: string;
  rounds_chanted: number;
  reading_minutes: number;
  wake_time: string | null;
};

export type Badge = { key: string; label: string; earned: boolean };

export function computeBadges(entries: EntryForBadges[], streak: number): Badge[] {
  const totalRounds = entries.reduce((s, e) => s + (e.rounds_chanted ?? 0), 0);
  const totalReadingMinutes = entries.reduce((s, e) => s + (e.reading_minutes ?? 0), 0);
  const earlyRiseDays = entries.filter((e) => {
    if (!e.wake_time) return false;
    const [h, m] = e.wake_time.split(":").map(Number);
    return h * 60 + m <= 4 * 60 + 30;
  }).length;

  return [
    { key: "streak", label: "7 Day Streak", earned: streak >= 7 },
    { key: "rounds", label: "1,008 Rounds", earned: totalRounds >= 1008 },
    { key: "reading", label: "10 Hrs Read", earned: totalReadingMinutes >= 600 },
    { key: "earlyRiser", label: "Early Riser ×5", earned: earlyRiseDays >= 5 },
  ];
}