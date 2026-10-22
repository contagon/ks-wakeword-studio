import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { reactive } from "vue";
import { TestingSession } from "../testing/session";

let stopped: boolean;
let grant: (stream: MediaStream) => void;
const stream = () =>
  ({
    getTracks: () => [
      {
        stop: () => {
          stopped = true;
        },
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    ],
  }) as unknown as MediaStream;
beforeEach(() => {
  stopped = false;
  vi.stubGlobal("isSecureContext", true);
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: {
      getUserMedia: () =>
        new Promise<MediaStream>((resolve) => {
          grant = resolve;
        }),
    },
  });
});

describe("live tester resource ownership", () => {
  it("releases permission arriving after Stop without starting audio", async () => {
    const states: string[] = [];
    const session = new TestingSession({ state: (state) => states.push(state), score: vi.fn(), error: vi.fn() });
    const start = session.start("/model", { cutoff: 0.9, slidingWindow: 3, stepSize: 10 });
    session.stop();
    grant(stream());
    await start;
    expect(stopped).toBe(true);
    expect(states.at(-1)).toBe("idle");
  });
  it("reports denied microphone permission and allows retry", async () => {
    navigator.mediaDevices.getUserMedia = vi.fn().mockRejectedValue(new DOMException("denied", "NotAllowedError"));
    const errors: string[] = [];
    const session = new TestingSession({ state: vi.fn(), score: vi.fn(), error: (message) => errors.push(message) });
    await session.start("/model", { cutoff: 0.9, slidingWindow: 3, stepSize: 10 });
    expect(errors[0]).toContain("permission");
    expect(session.state).toBe("error");
    session.stop();
  });
  it("requires a secure connection before requesting the microphone", async () => {
    vi.stubGlobal("isSecureContext", false);
    const errors: string[] = [];
    const session = new TestingSession({ state: vi.fn(), score: vi.fn(), error: (message) => errors.push(message) });
    await session.start("/model", { cutoff: 0.9, slidingWindow: 3, stepSize: 10 });
    expect(errors[0]).toContain("HTTPS");
    await flushPromises();
    session.stop();
  });

  it("forwards PCM, emits actual worker scores, and releases every resource on Stop", async () => {
    const tracks = [
      {
        onended: null as (() => void) | null,
        stop: () => {
          stopped = true;
        },
      },
    ];
    navigator.mediaDevices.getUserMedia = vi.fn().mockResolvedValue({ getTracks: () => tracks });
    let terminated = false;
    let closed = false;
    let disconnected = 0;
    let pcm: Float32Array | undefined;
    let capture: { port: { onmessage: ((event: { data: Float32Array }) => void) | null } };
    class FakeWorker {
      onmessage: ((event: { data: unknown }) => void) | null = null;
      postMessage(message: any) {
        // Real workers structured-clone their message; Vue proxies cannot cross.
        structuredClone(message);
        if (message.type === "init") queueMicrotask(() => this.onmessage?.({ data: { type: "ready" } }));
        else {
          pcm = message.samples;
          this.onmessage?.({ data: { type: "score", probability: 0.95, rms: 0.1, seconds: 2, warming: false } });
        }
      }
      terminate() {
        terminated = true;
      }
    }
    class FakeContext {
      sampleRate = 48000;
      destination = {};
      audioWorklet = { addModule: async () => {} };
      resume = async () => {};
      close = async () => {
        closed = true;
      };
      createMediaStreamSource() {
        return {
          connect() {},
          disconnect() {
            disconnected++;
          },
        };
      }
    }
    class FakeCapture {
      port = { onmessage: null as ((event: { data: Float32Array }) => void) | null };
      constructor() {
        capture = this;
      }
      connect() {}
      disconnect() {
        disconnected++;
      }
    }
    vi.stubGlobal("AudioContext", FakeContext);
    vi.stubGlobal("AudioWorkletNode", FakeCapture);
    vi.stubGlobal("Worker", FakeWorker);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new ArrayBuffer(20))));
    const scores: number[] = [];
    const session = new TestingSession({
      state: vi.fn(),
      error: vi.fn(),
      score: (value) => scores.push(value.probability),
    });
    await session.start("/model", reactive({ cutoff: 0.9, slidingWindow: 3, stepSize: 10 }));
    expect(session.state).toBe("listening");
    const input = new Float32Array([0.1, 0.2]);
    capture!.port.onmessage!({ data: input });
    expect(pcm).toBe(input);
    expect(scores).toEqual([0.95]);
    session.stop();
    expect([terminated, closed, stopped]).toEqual([true, true, true]);
    expect(disconnected).toBe(2);
    expect(capture!.port.onmessage).toBeNull();
  });
});
