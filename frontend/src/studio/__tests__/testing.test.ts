import { describe, expect, it } from "vitest";
import { parseTestingConfig, sensitivityThreshold } from "../testing/config";
import { StreamingResampler, ProbabilityWindow } from "../testing/signal";
import { createTestingEngine } from "../testing/engine";

describe("testing configuration", () => {
  it("matches Voice Satellite margin factors and clamps", () => {
    expect(sensitivityThreshold(0.9, "slight")).toBeCloseTo(0.95);
    expect(sensitivityThreshold(0.9, "moderate")).toBeCloseTo(0.9);
    expect(sensitivityThreshold(0.9, "very")).toBeCloseTo(0.8);
    expect(sensitivityThreshold(1, "slight")).toBe(0.99);
    expect(sensitivityThreshold(0.1, "very")).toBe(0.1);
  });
  it("uses archived micro settings and defaults for missing metadata", () => {
    expect(
      parseTestingConfig({ micro: { probability_cutoff: 0.97, sliding_window_size: 5, feature_step_size: 10 } }),
    ).toEqual({ cutoff: 0.97, slidingWindow: 5, stepSize: 10 });
    expect(parseTestingConfig({})).toEqual({ cutoff: 0.9, slidingWindow: 3, stepSize: 10 });
  });
  it.each([
    null,
    { micro: null },
    { micro: { probability_cutoff: "0.9" } },
    { micro: { probability_cutoff: 2 } },
    { micro: { sliding_window_size: 0 } },
    { micro: { sliding_window_size: 100000 } },
  ])("rejects malformed metadata %j", (manifest) => {
    expect(() => parseTestingConfig(manifest)).toThrow("Invalid model");
  });
  it("rejects feature timing unsupported by the browser frontend", () => {
    expect(() => parseTestingConfig({ micro: { feature_step_size: 20 } })).toThrow("10 ms");
  });
});

describe("browser model engine", () => {
  it("rejects non-TFLite bytes with a helpful error", async () => {
    await expect(
      createTestingEngine(new ArrayBuffer(20), { cutoff: 0.9, slidingWindow: 3, stepSize: 10 }),
    ).rejects.toThrow("microWakeWord");
  });
});

describe("streaming signals", () => {
  it.each([16000, 44100, 48000])("preserves continuity across irregular %i Hz chunks", (rate) => {
    const input = Float32Array.from({ length: rate }, (_, i) => Math.sin(i / 80));
    const whole = new StreamingResampler(rate).push(input);
    const stream = new StreamingResampler(rate);
    const chunks: number[] = [];
    for (let i = 0; i < input.length; i += 127) chunks.push(...stream.push(input.subarray(i, i + 127)));
    expect(chunks.length).toBeGreaterThanOrEqual(15999);
    expect(chunks).toEqual(Array.from(whole));
  });
  it("averages a bounded rolling probability window", () => {
    const window = new ProbabilityWindow(3);
    expect(window.push(0.3)).toBeCloseTo(0.3);
    window.push(0.6);
    expect(window.push(0.9)).toBeCloseTo(0.6);
    expect(window.push(0)).toBeCloseTo(0.5);
  });
});
