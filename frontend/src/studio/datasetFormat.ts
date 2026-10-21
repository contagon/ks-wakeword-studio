export function datasetBytes(value: number | null | undefined): string {
  return value == null ? 'Size unknown' : `${Number((value / 1_000_000_000).toPrecision(4))} GB`;
}

export function datasetSamples(value: number | null | undefined): string {
  return value == null ? 'Sample count unknown' : `${value.toLocaleString()} samples`;
}
