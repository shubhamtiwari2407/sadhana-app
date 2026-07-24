export type EntryForBadges = {
  entry_date: string;
  rounds_chanted: number;
  reading_minutes: number;
  wake_time: string | null;
};

export type Badge = {
  key: string;
  label: string;
  earned: boolean;
  progressLabel?: string; // shown only when not earned, e.g. "12 rounds to go"
};

const TARGETS = {
  streak: 7,
  rounds: 1008,
  readingMinutes: 600,
  earlyRiserDays: 5,
};

export function computeBadges(entries: EntryForBadges[], streak: number): Badge[] {
  const totalRounds = entries.reduce((s, e) => s + (e.rounds_chanted ?? 0), 0);
  const totalReadingMinutes = entries.reduce((s, e) => s + (e.reading_minutes ?? 0), 0);
  const earlyRiseDays = entries.filter((e) => {
    if (!e.wake_time) return false;
    const [h, m] = e.wake_time.split(":").map(Number);
    return h * 60 + m <= 4 * 60 + 30;
  }).length;

  const streakLeft = TARGETS.streak - streak;
  const roundsLeft = TARGETS.rounds - totalRounds;
  const readingLeft = TARGETS.readingMinutes - totalReadingMinutes;
  const earlyRiserLeft = TARGETS.earlyRiserDays - earlyRiseDays;

  return [
    {
      key: "streak",
      label: "7 Day Streak",
      earned: streak >= TARGETS.streak,
      progressLabel: streakLeft > 0 ? `${streakLeft} more day${streakLeft === 1 ? "" : "s"}` : undefined,
    },
    {
      key: "rounds",
      label: "1,008 Rounds",
      earned: totalRounds >= TARGETS.rounds,
      progressLabel: roundsLeft > 0 ? `${roundsLeft} rounds to go` : undefined,
    },
    {
      key: "reading",
      label: "10 Hrs Read",
      earned: totalReadingMinutes >= TARGETS.readingMinutes,
      progressLabel: readingLeft > 0 ? `${readingLeft} min to go` : undefined,
    },
    {
      key: "earlyRiser",
      label: "Early Riser ×5",
      earned: earlyRiseDays >= TARGETS.earlyRiserDays,
      progressLabel:
        earlyRiserLeft > 0 ? `${earlyRiserLeft} more morning${earlyRiserLeft === 1 ? "" : "s"}` : undefined,
    },
  ];
}