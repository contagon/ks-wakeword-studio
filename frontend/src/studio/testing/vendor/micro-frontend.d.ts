export function createJsMicroFrontend(): Promise<{
  feed(samples: Float32Array): Float32Array[];
  recycleFeature(frame: Float32Array): void;
}>;
export function roundBankers(value: number): number;
