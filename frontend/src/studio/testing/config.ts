export type Sensitivity = "slight" | "moderate" | "very";
export interface TestingConfig {
  cutoff: number;
  slidingWindow: number;
  stepSize: number;
}
export const sensitivities = [
  { id: "slight", label: "Slightly sensitive" },
  { id: "moderate", label: "Moderately sensitive" },
  { id: "very", label: "Very sensitive" },
] as const;

export function sensitivityThreshold(base: number, sensitivity: Sensitivity): number {
  return Math.max(0.1, Math.min(0.99, 1 - (1 - base) * { slight: 0.5, moderate: 1, very: 2 }[sensitivity]));
}

export function parseTestingConfig(manifest: unknown): TestingConfig {
  const record = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
  if (!record(manifest) || ("micro" in manifest && !record(manifest.micro))) throw new Error("Invalid model manifest.");
  const micro = record(manifest.micro) ? manifest.micro : {};
  const cutoff = micro.probability_cutoff ?? 0.9;
  const slidingWindow = micro.sliding_window_size ?? 3;
  const stepSize = micro.feature_step_size ?? 10;
  if (
    typeof cutoff !== "number" ||
    !Number.isFinite(cutoff) ||
    cutoff < 0 ||
    cutoff > 1 ||
    typeof slidingWindow !== "number" ||
    !Number.isInteger(slidingWindow) ||
    slidingWindow < 1 ||
    slidingWindow > 100 ||
    typeof stepSize !== "number" ||
    !Number.isInteger(stepSize) ||
    stepSize < 1 ||
    stepSize > 100
  )
    throw new Error("Invalid model detection settings.");
  if (stepSize !== 10) throw new Error("This browser tester supports 10 ms microWakeWord feature steps only.");
  return { cutoff, slidingWindow, stepSize };
}
