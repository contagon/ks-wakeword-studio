const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
  ["second", 1],
];

/** Browser-local absolute time, e.g. "Oct 21, 2026, 8:12 PM". */
export function absoluteTime(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

/** Relative to the browser clock, e.g. "3 hours ago" or "in 5 minutes". */
export function relativeTime(value: string | Date, now: number = Date.now()): string {
  const time = (value instanceof Date ? value : new Date(value)).getTime();
  if (Number.isNaN(time)) return "";
  const seconds = Math.round((time - now) / 1000);
  const format = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (Math.abs(seconds) < 45) return format.format(0, "second");
  const [unit, size] = UNITS.find(([, size]) => Math.abs(seconds) >= size)!;
  return format.format(Math.round(seconds / size), unit);
}

/** "Oct 21, 2026, 8:12 PM · 3 hours ago" */
export function prettyTime(value: string | Date, now: number = Date.now()): string {
  const absolute = absoluteTime(value);
  return absolute ? `${absolute} · ${relativeTime(value, now)}` : "";
}
