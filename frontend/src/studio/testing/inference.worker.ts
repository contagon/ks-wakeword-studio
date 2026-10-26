import { createTestingEngine } from "./engine";
import { StreamingResampler } from "./signal";
import type { TestingConfig } from "./config";

let engine: Awaited<ReturnType<typeof createTestingEngine>> | undefined;
let resampler: StreamingResampler | undefined;
// Initialization completes before the session sends any audio.
self.onmessage = async (
  event: MessageEvent<
    { type: "init"; model: ArrayBuffer; config: TestingConfig; rate: number } | { type: "audio"; samples: Float32Array }
  >,
) => {
  try {
    if (event.data.type === "init") {
      engine = await createTestingEngine(event.data.model, event.data.config);
      resampler = new StreamingResampler(event.data.rate);
      self.postMessage({ type: "ready" });
    } else {
      if (!engine || !resampler) throw new Error("Tester not initialized.");
      self.postMessage({ type: "score", ...engine.process(resampler.push(event.data.samples)) });
    }
  } catch (error) {
    self.postMessage({ type: "error", message: error instanceof Error ? error.message : "Browser inference failed." });
  }
};
