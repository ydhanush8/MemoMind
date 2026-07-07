/** Start of the current UTC day — matches the original `setUTCHours(0,0,0,0)`. */
export function utcMidnight(from: Date = new Date()): Date {
  const d = new Date(from);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/** YYYY-MM-DD (UTC) — used as the UsageLog rate-limit bucket key. */
export function isoDateKey(from: Date = new Date()): string {
  return from.toISOString().split('T')[0];
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function addYears(date: Date, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}
