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
function audioBuffer(values: number[], duration = 1): AudioBuffer {
  return { duration, getChannelData: () => new Float32Array(values) } as unknown as AudioBuffer;
}
const bars = (ui: VueWrapper) => ui.findAll("[data-waveform] line[stroke=currentColor]").map((l) => l.attributes("y1"));
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
  it("decodes authorized sample audio into the Trim page's waveform and seeks on click", async () => {
    const ui = mountPlayer();
    await settle();
    expect(DecodeContext.decodes).toHaveLength(1);
    DecodeContext.decodes[0].resolve(audioBuffer([-1, -0.5, 0, 0.75, 1], 2));
    await settle();
    expect(ui.get("[data-waveform]").attributes("data-ready")).toBe("true");
    expect(ui.get("[data-waveform-status]").text()).toContain("Waveform preview ready");
    // 160 bars plus the playhead, same geometry as CaptureReview.
    expect(ui.findAll("[data-waveform] line")).toHaveLength(161);
    expect(bars(ui).slice(0, 3)).toEqual(["6", "23", "39"]);
    expect(DecodeContext.closed).toHaveLength(1);
    const svg = ui.get("[data-waveform]").element;
    svg.getBoundingClientRect = () => ({ left: 0, width: 200 }) as DOMRect;
    svg.dispatchEvent(new PointerEvent("pointerdown", { clientX: 50, button: 0 }));
    await settle();
    expect((ui.get("audio").element as HTMLAudioElement).currentTime).toBe(0.5);
    expect(ui.get("[data-playhead]").text()).toBe("Cursor 0.50 s");
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
    const current = bars(ui);
    DecodeContext.decodes[0].resolve(audioBuffer([-1, 1]));
    await settle();
    expect(bars(ui)).toEqual(current);
    expect(ui.get("[data-waveform]").attributes("data-ready")).toBe("true");
    expect(DecodeContext.closed).toHaveLength(2);
  });
});
