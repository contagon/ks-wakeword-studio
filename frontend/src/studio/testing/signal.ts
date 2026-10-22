/** Keeps fractional source position between calls, including at chunk boundaries. */
export class StreamingResampler {
  private consumed = 0;
  private outputIndex = 0;
  private previous = 0;
  constructor(private readonly rate: number) {
    if (!Number.isFinite(rate) || rate < 16000) throw new Error("Unsupported microphone sample rate.");
  }
  push(input: Float32Array): Float32Array {
    if (!input.length) return new Float32Array();
    if (this.rate === 16000) return input.slice();
    const output: number[] = [];
    const end = this.consumed + input.length - 1;
    while ((this.outputIndex * this.rate) / 16000 < end) {
      const position = (this.outputIndex * this.rate) / 16000;
      const left = Math.floor(position);
      const fraction = position - left;
      const a = left < this.consumed ? this.previous : input[left - this.consumed]!;
      const b = input[left + 1 - this.consumed]!;
      output.push(a + (b - a) * fraction);
      this.outputIndex++;
    }
    this.consumed += input.length;
    this.previous = input[input.length - 1]!;
    return new Float32Array(output);
  }
}

export class ProbabilityWindow {
  private values: number[] = [];
  constructor(private readonly size: number) {}
  push(value: number): number {
    this.values.push(value);
    if (this.values.length > this.size) this.values.shift();
    return this.values.reduce((sum, item) => sum + item, 0) / this.values.length;
  }
}
