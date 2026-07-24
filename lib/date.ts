// Formats a Date as "YYYY-MM-DD" using its LOCAL calendar date, not UTC.
//
// Date.prototype.toISOString() always converts to UTC first. For anyone in
// a timezone ahead of UTC (e.g. IST, UTC+5:30), local midnight is still the
// previous day in UTC — so `date.toISOString().slice(0, 10)` silently
// returns yesterday's date for a chunk of the early morning, and shifts
// every date computed this way by one day. Use this helper everywhere a
// Date needs to become a "YYYY-MM-DD" string instead.
export function toLocalISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}