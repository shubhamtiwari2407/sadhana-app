// Computes the current consecutive-day streak from a list of entry_date
// strings ("YYYY-MM-DD"). If today isn't logged yet, counts back from
// yesterday so the streak doesn't drop to 0 before the day is over.
export function calcStreak(dates: string[]): number {
  const set = new Set(dates);
  let streak = 0;
  const cursor = new Date();
  const todayStr = cursor.toISOString().slice(0, 10);
  if (!set.has(todayStr)) cursor.setDate(cursor.getDate() - 1);

  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
