import { compileModel, CustomWakeWordModelRunner } from './vendor/custom-model-runner.js';
import { createJsMicroFrontend, roundBankers } from './vendor/micro-frontend.js';
import { readInputQuantization } from './vendor/tflite-quant-reader.js';
import { ProbabilityWindow } from './signal';
import type { TestingConfig } from './config';

export interface Score { probability: number; rms: number; seconds: number; warming: boolean }

/** Same frontend, banker's quantization, warmup and sliding mean as Voice Satellite. */
export async function createTestingEngine(buffer: ArrayBuffer, config: TestingConfig) {
  try {
    if (buffer.byteLength < 8 || new TextDecoder().decode(new Uint8Array(buffer, 4, 4)) !== 'TFL3') throw new Error();
    const quant = readInputQuantization(buffer);
    if (!quant || !Number.isFinite(quant.scale) || quant.scale <= 0) throw new Error();
    const runner = new CustomWakeWordModelRunner(compileModel(buffer));
    const input = runner.getInputs()[0]!.data();
    if (!input.length || input.length % 40) throw new Error();
    const frontend = await createJsMicroFrontend();
    const smoothing = new ProbabilityWindow(config.slidingWindow);
    let offset = 0;
    let frames = 0;
    let samplesSeen = 0;
    let probability = 0;
    return {
      process(samples: Float32Array): Score {
        samplesSeen += samples.length;
        let power = 0;
        for (const sample of samples) power += sample * sample;
        for (const frame of frontend.feed(samples)) {
          frames++;
          for (const feature of frame) {
            const value = Math.fround(Math.fround(feature / Math.fround(quant.scale)) + Math.fround(quant.zeroPoint));
            input[offset++] = Math.max(-128, Math.min(127, roundBankers(value)));
          }
          frontend.recycleFeature(frame);
          if (offset !== input.length) continue;
          offset = 0;
          if (!runner.infer()) throw new Error('Model inference failed.');
          if (frames >= 100) probability = smoothing.push(runner.getOutputs()[0]!.data()[0]! / 255);
        }
        return { probability, rms: Math.sqrt(power / Math.max(1, samples.length)), seconds: samplesSeen / 16000, warming: frames < 100 };
      },
      dispose() { runner.cleanUp(); },
    };
  } catch {
    throw new Error('This model cannot run in the browser. Select an int8 streaming microWakeWord version.');
  }
}
