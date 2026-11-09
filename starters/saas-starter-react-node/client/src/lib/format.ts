/** "Reviewer One" → "RO", "ada" → "A", "" → "?" (first letter of the first and last word). */
export function initials(name: string | null | undefined): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0]!.charAt(0);
  const last = words.length > 1 ? words[words.length - 1]!.charAt(0) : "";
  return (first + last).toUpperCase();
}

// Muted, accessible avatar colours (white text reads on all of them).
const AVATAR_COLOURS = ["#4f46e5", "#0e7490", "#047857", "#b45309", "#be123c", "#7c3aed", "#475569", "#1d4ed8"];

/** A stable colour for a person or workspace, picked by hashing its id or name. */
export function avatarColour(seed: string): string {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0;
  return AVATAR_COLOURS[Math.abs(h) % AVATAR_COLOURS.length]!;
}

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** "9 Nov 2026" */
export function formatDate(value: string | number | Date): string {
  return dateFormat.format(new Date(value));
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const steps: [Intl.RelativeTimeFormatUnit, number][] = [["year", 31_536_000], ["month", 2_592_000], ["week", 604_800], ["day", 86_400], ["hour", 3_600], ["minute", 60]];

/** "2 hours ago", "in 6 days", "just now" */
export function timeAgo(value: string | number | Date, now = Date.now()): string {
  const seconds = Math.round((new Date(value).getTime() - now) / 1000);
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) return relative.format(Math.trunc(seconds / size), unit);
  }
  return "just now";
}
