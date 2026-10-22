const BYTE_UNITS: [number, string][] = [
  [1_000_000_000, "GB"],
  [1_000_000, "MB"],
  [1_000, "KB"],
];

/** Decimal size with four significant digits in the largest fitting unit, e.g. "2.35 GB", "6.44 KB". */
export function datasetBytes(value: number | null | undefined): string {
  if (value == null) return "Size unknown";
  const [size, unit] = BYTE_UNITS.find(([size]) => value >= size) ?? [1, "B"];
  return `${Number((value / size).toPrecision(4))} ${unit}`;
}

/** "1 sample", "1,234 samples". */
export function plural(count: number, noun: string): string {
  return `${count.toLocaleString()} ${noun}${count === 1 ? "" : "s"}`;
}

export function datasetSamples(value: number | null | undefined): string {
  return value == null ? "Sample count unknown" : plural(value, "sample");
}

/** A 0–1 fraction as a percentage, e.g. 0.913 -> "91.3%". */
export function formatPercent(fraction: number): string {
  return `${Number((fraction * 100).toFixed(1))}%`;
}
