/** A ?next= target, accepted only as a same-site path so it cannot redirect elsewhere. */
export function safeNext(value: string | null, fallback: string): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}
