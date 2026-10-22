import { afterEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import AudioPlayer from "../components/AudioPlayer.vue";
import { fakeMedia } from "./fakeStudio";

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
}
function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  return {
    promise: new Promise<T>((done) => {
      resolve = done;
    }),
    resolve,
  };
}
function audioBuffer(values: number[]): AudioBuffer {
  return { duration: 1, getChannelData: () => new Float32Array(values) } as unknown as AudioBuffer;
}
class DecodeContext {
  static decodes: Deferred<AudioBuffer>[] = [];
  static closed: DecodeContext[] = [];
  decodeAudioData(): Promise<AudioBuffer> {
    const pending = deferred<AudioBuffer>();
    DecodeContext.decodes.push(pending);
    return pending.promise;
  }
  close(): Promise<void> {
    DecodeContext.closed.push(this);
    return Promise.resolve();
  }
}
const paint = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  set fillStyle(_: string) {},
  set strokeStyle(_: string) {},
  set lineWidth(_: number) {},
} as unknown as CanvasRenderingContext2D;
let wrapper: VueWrapper | undefined;

async function settle(): Promise<void> {
  for (let attempt = 0; attempt < 4; attempt += 1) await flushPromises();
}

function mountPlayer(sampleId = "a", src = "/api/studio/wakewords/a/samples/a/audio") {
  fakeMedia(); // jsdom cannot implement play/pause or browser blob URLs.
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve(new Response(new Blob(["authorized sample audio"], { type: "audio/wav" })))),
  );
  vi.stubGlobal("AudioContext", DecodeContext);
  vi.stubGlobal("webkitAudioContext", undefined);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(paint);
  wrapper = mount(AudioPlayer, { props: { sampleId, src, autoplayRequested: false }, attachTo: document.body });
  return wrapper;
}

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  DecodeContext.decodes = [];
  DecodeContext.closed = [];
  document.body.innerHTML = "";
});

describe("Studio review waveform", () => {
  it("decodes authorized sample audio and renders compact waveform peaks", async () => {
    const ui = mountPlayer();
    await settle();
    expect(DecodeContext.decodes).toHaveLength(1);
    DecodeContext.decodes[0].resolve(audioBuffer([-1, -0.5, 0, 0.75, 1]));
    await settle();
    expect(ui.get("[data-waveform]").attributes("data-ready")).toBe("true");
    expect(ui.get("[data-waveform-status]").text()).toContain("Waveform preview ready");
    expect(paint.fillRect).toHaveBeenCalled();
    expect(DecodeContext.closed).toHaveLength(1);
  });

  it("does not render a waveform decoded for a stale sample", async () => {
    const ui = mountPlayer("a", "/api/studio/wakewords/a/samples/a/audio");
    await settle();
    expect(DecodeContext.decodes).toHaveLength(1);
    await ui.setProps({ sampleId: "b", src: "/api/studio/wakewords/b/samples/b/audio" });
    await settle();
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    expect(DecodeContext.decodes).toHaveLength(2);
    DecodeContext.decodes[1].resolve(audioBuffer([0.2, 0.8]));
    await settle();
    const drawsAfterCurrent = (paint.fillRect as unknown as { mock: { calls: unknown[][] } }).mock.calls.length;
    DecodeContext.decodes[0].resolve(audioBuffer([-1, 1]));
    await settle();
    expect((paint.fillRect as unknown as { mock: { calls: unknown[][] } }).mock.calls).toHaveLength(drawsAfterCurrent);
    expect(ui.get("[data-waveform]").attributes("data-ready")).toBe("true");
    expect(DecodeContext.closed).toHaveLength(2);
  });
});
