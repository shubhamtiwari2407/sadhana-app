const ALTERNATE_GREETINGS = ["Hare Krishna", "Radhe Radhe", "Jai Sri Krishna"];

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Deterministic per-day, not random-per-request, so it doesn't flicker between
// reloads. Roughly one day in three shows a devotional greeting instead of
// the plain time-of-day one, so repeat visits don't feel robotic.
export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const doy = dayOfYear(date);
  if (doy % 3 === 0) {
    return ALTERNATE_GREETINGS[Math.floor(doy / 3) % ALTERNATE_GREETINGS.length];
  }
  return timeGreeting;
}