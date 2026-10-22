import captureUrl from "./capture.worklet.js?url";
import type { TestingConfig } from "./config";
import type { Score } from "./engine";

export type TestingState = "idle" | "starting" | "listening" | "error";
interface Events {
  state(value: TestingState): void;
  score(value: Score): void;
  error(message: string): void;
}

/** Owns all resources, including permission grants that arrive after cancellation. */
export class TestingSession {
  state: TestingState = "idle";
  private generation = 0;
  private stream?: MediaStream;
  private context?: AudioContext;
  private source?: MediaStreamAudioSourceNode;
  private capture?: AudioWorkletNode;
  private worker?: Worker;
  private abort?: AbortController;
  private timer?: ReturnType<typeof setTimeout>;
  private cancelReady?: () => void;
  private pending = 0;
  constructor(private readonly events: Events) {}

  private setState(state: TestingState) {
    this.state = state;
    this.events.state(state);
  }
  private fail(message: string) {
    this.stop();
    this.setState("error");
    this.events.error(message);
  }
  stop() {
    this.generation++;
    clearTimeout(this.timer);
    this.abort?.abort();
    this.abort = undefined;
    this.cancelReady?.();
    this.cancelReady = undefined;
    this.worker?.terminate();
    this.worker = undefined;
    if (this.capture) {
      this.capture.port.onmessage = null;
      this.capture.disconnect();
      this.capture = undefined;
    }
    this.source?.disconnect();
    this.source = undefined;
    this.stream?.getTracks().forEach((track) => {
      track.onended = null;
      track.stop();
    });
    this.stream = undefined;
    if (this.context) {
      void this.context.close().catch(() => {});
      this.context = undefined;
    }
    this.pending = 0;
    this.setState("idle");
  }

  async start(modelUrl: string, config: TestingConfig): Promise<void> {
    this.stop();
    const current = this.generation;
    const active = () => current === this.generation;
    if (!window.isSecureContext) {
      this.fail("Microphone testing requires HTTPS or localhost.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      this.fail("This browser does not support microphone capture.");
      return;
    }
    this.setState("starting");
    this.timer = setTimeout(() => {
      if (active()) this.fail("Tester startup timed out. Check microphone permission and retry.");
    }, 60000);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      if (!active()) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      this.stream = stream;
      for (const track of stream.getTracks())
        track.onended = () => {
          if (active()) this.fail("The microphone disconnected. Reconnect it and retry.");
        };
      if (typeof AudioContext === "undefined" || typeof AudioWorkletNode === "undefined")
        throw new Error("Live testing requires a browser with AudioWorklet support.");
      const context = new AudioContext({ sampleRate: 16000 });
      this.context = context;
      await context.resume();
      if (!active()) return;
      if (!context.audioWorklet) throw new Error("This browser does not support live audio processing.");
      const controller = new AbortController();
      this.abort = controller;
      const [response] = await Promise.all([
        fetch(modelUrl, { signal: controller.signal, credentials: "same-origin" }),
        context.audioWorklet.addModule(captureUrl),
      ]);
      if (!active()) return;
      if (!response.ok) throw new Error("Unable to load the archived model. Refresh the version list and retry.");
      const model = await response.arrayBuffer();
      if (!active()) return;
      const worker = new Worker(new URL("./inference.worker.ts", import.meta.url), {
        type: "module",
        name: "studio-wakeword-test",
      });
      this.worker = worker;
      await new Promise<void>((resolve, reject) => {
        this.cancelReady = () => reject(new Error("Testing cancelled."));
        worker.onerror = () => {
          if (active()) reject(new Error("Browser inference could not start."));
        };
        worker.onmessage = (event) => {
          if (!active()) return;
          if (event.data.type === "ready") resolve();
          else if (event.data.type === "error") reject(new Error(event.data.message));
        };
        // Vue may own the caller's settings; send a plain, cloneable snapshot.
        worker.postMessage({ type: "init", model, config: { ...config }, rate: context.sampleRate }, [model]);
      });
      this.cancelReady = undefined;
      if (!active()) return;
      const watchdog = () => {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          if (active()) this.fail("Live audio processing stopped responding. Stop and retry.");
        }, 5000);
      };
      worker.onerror = () => {
        if (active()) this.fail("Browser inference failed. Stop and retry.");
      };
      worker.onmessage = (event) => {
        if (!active()) return;
        if (event.data.type === "error") {
          this.fail(event.data.message);
          return;
        }
        if (event.data.type !== "score") return;
        this.pending = Math.max(0, this.pending - 1);
        watchdog();
        this.events.score(event.data as Score);
      };
      this.source = context.createMediaStreamSource(stream);
      this.capture = new AudioWorkletNode(context, "studio-testing-capture", {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [1],
      });
      this.capture.onprocessorerror = () => {
        if (active()) this.fail("Microphone audio processing failed. Stop and retry.");
      };
      this.capture.port.onmessage = (event) => {
        if (!active()) return;
        if (++this.pending > 16) {
          this.fail("This device cannot process the model in real time. Try a faster browser or device.");
          return;
        }
        const samples = event.data as Float32Array;
        worker.postMessage({ type: "audio", samples }, [samples.buffer]);
      };
      this.source.connect(this.capture);
      this.capture.connect(context.destination);
      watchdog();
      this.setState("listening");
    } catch (error) {
      if (!active()) return;
      this.fail(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Microphone permission was denied. Allow microphone access and retry."
          : error instanceof Error
            ? error.message
            : "Unable to start microphone testing.",
      );
    }
  }
}
