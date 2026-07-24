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

// Longest consecutive-day run across the entire history, not just the
// current one. Doesn't care whether the streak is still active today.
export function calcLongestStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = Array.from(new Set(dates)).sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T00:00:00");
    const curr = new Date(sorted[i] + "T00:00:00");
    const dayDiff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    if (dayDiff === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}