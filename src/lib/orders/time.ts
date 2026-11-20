// The bakery runs on India time. Servers (e.g. Vercel) run on UTC, so a
// plain `new Date().setHours(0,0,0,0)` would start "today" at 5:30 AM IST.
const IST_OFFSET = "+05:30";

/** Midnight today in India (IST), as a Date. */
export function startOfTodayIST(now: Date = new Date()): Date {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now); // e.g. "2026-11-20"
  return new Date(`${ymd}T00:00:00${IST_OFFSET}`);
}

/** Today's month (1-12) and day of month in India (IST). */
export function todayMonthDayIST(now: Date = new Date()): { month: number; day: number } {
  const [, month, day] = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .split("-")
    .map(Number);
  return { month, day };
}
