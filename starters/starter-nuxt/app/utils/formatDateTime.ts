/** Formats a date as "2026-01-31 14:05 UTC", the same on server and client. */
export function formatDateTime(date: Date): string {
  return `${date.toISOString().slice(0, 16).replace('T', ' ')} UTC`
}
