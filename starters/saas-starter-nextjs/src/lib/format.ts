// Dates as "9 Nov 2026" and "2 hours ago"; roles as "Owner". One place to change the locale.
const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const relativeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export const formatDate = (date: Date) => dateFormat.format(date);

const steps: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

export function timeAgo(date: Date, now = Date.now()) {
  const seconds = Math.round((date.getTime() - now) / 1000);
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) return relativeFormat.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

export const formatRole = (role: string | null | undefined) =>
  (role ?? "member")
    .split(",")
    .map((r) => r.trim().replace(/^./, (c) => c.toUpperCase()))
    .join(", ");

/** "Ada Lovelace" -> "AL", "ada" -> "A"; first letters of the first and last word. */
export function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}
