export type SadhanaEntry = {
  wake_time: string | null; // "HH:MM"
  rounds_chanted: number;
  reading_minutes: number;
  listening_minutes: number;
  service_minutes: number;
  mangal_aarti: boolean;
  srimad_bhagavatam: boolean; // attended SB class, yes/no
};

// All point values live here. Change a number, the whole app (including the
// scoring reference card on the Board tab) updates automatically.
export const POINTS = {
  wakeBefore0430: 10,
  wakeBefore0500: 7,
  wakeAfter0500: 3,
  perRound: 1,
  roundsTarget: 16, // bonus threshold, also used for the mala ring
  roundsTargetBonus: 5,
  per15MinReading: 2,
  per15MinListening: 2,
  per15MinService: 2,
  mangalAarti: 5,
  srimadBhagavatam: 5,
};

function wakeScore(wakeTime: string | null): number {
  if (!wakeTime) return 0;
  const [h, m] = wakeTime.split(":").map(Number);
  const minutes = h * 60 + m;
  if (minutes <= 4 * 60 + 30) return POINTS.wakeBefore0430;
  if (minutes <= 5 * 60) return POINTS.wakeBefore0500;
  return POINTS.wakeAfter0500;
}

export function calculateScore(entry: SadhanaEntry): number {
  let score = 0;
  score += wakeScore(entry.wake_time);
  score += entry.rounds_chanted * POINTS.perRound;
  if (entry.rounds_chanted >= POINTS.roundsTarget) {
    score += POINTS.roundsTargetBonus;
  }
  score += Math.floor(entry.reading_minutes / 15) * POINTS.per15MinReading;
  score += Math.floor(entry.listening_minutes / 15) * POINTS.per15MinListening;
  score += Math.floor(entry.service_minutes / 15) * POINTS.per15MinService;
  if (entry.mangal_aarti) score += POINTS.mangalAarti;
  if (entry.srimad_bhagavatam) score += POINTS.srimadBhagavatam;
  return score;
}

// Human-readable breakdown for the "how scoring works" reference card.
// Generated from POINTS so it can never drift out of sync with calculateScore.
export function scoringBreakdown(): { label: string; value: string }[] {
  return [
    { label: "Wake before 4:30 AM", value: `+${POINTS.wakeBefore0430} pts` },
    { label: "Wake 4:30–5:00 AM", value: `+${POINTS.wakeBefore0500} pts` },
    { label: "Rounds chanted", value: `+${POINTS.perRound} pt/round` },
    { label: `${POINTS.roundsTarget}-round bonus`, value: `+${POINTS.roundsTargetBonus} pts` },
    { label: "Reading", value: `+${POINTS.per15MinReading} pts/15 min` },
    { label: "Listening", value: `+${POINTS.per15MinListening} pts/15 min` },
    { label: "Service", value: `+${POINTS.per15MinService} pts/15 min` },
    { label: "Mangal aarti attended", value: `+${POINTS.mangalAarti} pts` },
    { label: "Srimad Bhagavatam class", value: `+${POINTS.srimadBhagavatam} pts` },
  ];
}
