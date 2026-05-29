const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Format a Date as "20 May 2026" (locale-independent, build-safe). */
export function formatDate(date: Date): string {
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** ISO date (YYYY-MM-DD) for datetime attributes / schema. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
