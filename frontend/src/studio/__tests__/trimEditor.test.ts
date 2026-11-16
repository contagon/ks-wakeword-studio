import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import CaptureReview from "../components/CaptureReview.vue";
import SampleTrimDialog from "../components/SampleTrimDialog.vue";
import { wav } from "./fakeStudio";

let ui: VueWrapper | undefined;
let clock = 0;
let playback: { start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> }[];
const settle = async () => {
  for (let i = 0; i < 5; i++) await flushPromises();
};
beforeEach(() => {
  playback = [];
  clock = 0;
  vi.stubGlobal(
    "AudioContext",
    class {
      destination = {};
      get currentTime() {
        return clock;
      }
      close = vi.fn(async () => {});
      resume = vi.fn(async () => {});
      async decodeAudioData() {
        return { duration: 5, sampleRate: 16000, getChannelData: () => new Float32Array(80000) };
      }
      createBufferSource() {
        const node = { buffer: null, connect() {}, disconnect() {}, start: vi.fn(), stop: vi.fn(), onended: null };
        playback.push(node);
        return node;
      }
    },
  );
});
afterEach(() => {
  ui?.unmount();
  ui = undefined;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function open(extra: Record<string, unknown> = {}) {
  ui = mount(CaptureReview, {
    props: {
      audio: new File([wav(5).buffer as ArrayBuffer], "sample.wav"),
      preview: { duration_s: 5, start_s: 1, end_s: 2, trim_method: "none", warning: null },
      interactive: true,
      maxDuration: 2.9,
      ...extra,
    },
    attachTo: document.body,
  });
  await settle();
  return ui;
}
const startValue = () => Number(ui!.get<HTMLInputElement>("[name=trim-start]").element.value);
const endValue = () => Number(ui!.get<HTMLInputElement>("[name=trim-end]").element.value);
function pointer(element: Element, type: string, clientX: number, pointerId = 1) {
  const event = new MouseEvent(type, { clientX, button: 0, bubbles: true });
  Object.defineProperty(event, "pointerId", { value: pointerId });
  element.dispatchEvent(event);
}

it("shows editable bounds immediately and nudges the focused edge with both step sizes", async () => {
  const app = await open();
  expect(app.find("[name=trim-start]").exists()).toBe(true);
  const start = app.get('[role=slider][aria-label="Trim start"]');
  await start.trigger("keydown", { key: "ArrowRight" });
  expect(startValue()).toBe(1.01);
  await start.trigger("keydown", { key: "ArrowLeft", shiftKey: true });
  expect(startValue()).toBe(0.91);
  const end = app.get('[role=slider][aria-label="Trim end"]');
  await end.trigger("keydown", { key: "ArrowRight", shiftKey: true });
  expect(endValue()).toBe(2.1);
  await start.trigger("keydown", { key: "End" });
  expect(startValue()).toBeLessThan(endValue());
});

it("seeks on the waveform, marks at the cursor, and clamps dragged edges within the clip", async () => {
  const app = await open();
  const wave = app.get("svg");
  vi.spyOn(wave.element, "getBoundingClientRect").mockReturnValue({ left: 0, width: 500 } as DOMRect);
  pointer(wave.element, "pointerdown", 50);
  (app.vm as unknown as { markStart(): void }).markStart();
  await settle();
  expect(startValue()).toBe(0.5);
  const end = app.get('[role=slider][aria-label="Trim end"]');
  pointer(end.element, "pointerdown", 200, 2);
  pointer(wave.element, "pointermove", 600, 2);
  pointer(wave.element, "pointerup", 600, 2);
  await settle();
  expect(endValue()).toBe(5);
  expect(app.emitted("selection")!.at(-1)).toEqual([null]);
  expect(app.text()).toContain("2.90");
});

it("moves only the start edge on a waveform double-click and keeps it before the end", async () => {
  const app = await open();
  const wave = app.get("svg");
  vi.spyOn(wave.element, "getBoundingClientRect").mockReturnValue({ left: 0, width: 500 } as DOMRect);
  await wave.trigger("dblclick", { clientX: 53.3, button: 0 });
  expect(startValue()).toBe(0.53);
  expect(endValue()).toBe(2);
  await wave.trigger("dblclick", { clientX: 400, button: 0 });
  expect(startValue()).toBeLessThan(2);
  expect(endValue()).toBe(2);
  await app.setProps({ disabled: true });
  const before = startValue();
  await wave.trigger("dblclick", { clientX: 20, button: 0 });
  expect(startValue()).toBe(before);
});

it("always toggles the trimmed selection after initial load, seeking, and original playback", async () => {
  const app = await open();
  const toggle = () => (app.vm as unknown as { toggle(): void }).toggle();
  toggle();
  await settle();
  expect(playback.at(-1)!.start).toHaveBeenCalledWith(0, 1, 1);
  toggle();
  await settle();
  const wave = app.get("svg");
  vi.spyOn(wave.element, "getBoundingClientRect").mockReturnValue({ left: 0, width: 500 } as DOMRect);
  pointer(wave.element, "pointerdown", 400);
  toggle();
  await settle();
  expect(playback.at(-1)!.start).toHaveBeenCalledWith(0, 1, 1);
  await app.get("[data-action=play-original]").trigger("click");
  await settle();
  expect(playback.at(-1)!.start).toHaveBeenCalledWith(0, 0, 5);
  toggle();
  await settle();
  toggle();
  await settle();
  expect(playback.at(-1)!.start).toHaveBeenCalledWith(0, 1, 1);
});

it("previews the original even with an oversized selection, then precisely previews selected bounds", async () => {
  const app = await open();
  await app.get("[name=trim-end]").setValue("5");
  await app.get("[data-action=play-original]").trigger("click");
  await settle();
  expect(playback.at(-1)!.start).toHaveBeenCalledWith(0, 0, 5);
  await app.get("[name=trim-end]").setValue("2");
  await app.get("[data-action=play-capture]").trigger("click");
  await settle();
  expect(playback.at(-1)!.start).toHaveBeenCalledWith(0, 1, 1);
  clock = 0.4;
  (app.vm as unknown as { toggle(): void }).toggle();
  await settle();
  expect(playback.at(-1)!.stop).toHaveBeenCalled();
  (app.vm as unknown as { toggle(): void }).toggle();
  await settle();
  expect(playback.at(-1)!.start).toHaveBeenCalledWith(0, 1.4, 0.6000000000000001);
});

it("marks waveform positions at the same hundredth-second precision as the numeric controls", async () => {
  const app = await open();
  const wave = app.get("svg");
  vi.spyOn(wave.element, "getBoundingClientRect").mockReturnValue({ left: 0, width: 500 } as DOMRect);
  pointer(wave.element, "pointerdown", 53.3);
  (app.vm as unknown as { markStart(): void }).markStart();
  await settle();
  expect(startValue()).toBe(0.53);
});

it("allows clearing and retyping numeric bounds without breaking the editor", async () => {
  const app = await open();
  await app.get("[name=trim-start]").setValue("");
  expect(app.emitted("selection")!.at(-1)).toEqual([null]);
  await app.get("[name=trim-start]").setValue("0.7");
  await app.get("[name=trim-end]").setValue("");
  expect(app.emitted("selection")!.at(-1)).toEqual([null]);
  await app.get("[name=trim-end]").setValue("1.7");
  expect(app.emitted("selection")!.at(-1)).toEqual([{ start_s: 0.7, end_s: 1.7, trim_method: "manual" }]);
});

it("accepts exactly 2.90 seconds at decimal offsets but rejects one extra PCM frame", async () => {
  const app = await open();
  await app.get("[name=trim-start]").setValue("0.3");
  await app.get("[name=trim-end]").setValue("3.2");
  expect(app.emitted("selection")!.at(-1)).toEqual([{ start_s: 0.3, end_s: 3.2, trim_method: "manual" }]);
  expect(app.find('[role="alert"]').exists()).toBe(false);
  await app.get("[name=trim-end]").setValue("3.2000625");
  expect(app.emitted("selection")!.at(-1)).toEqual([null]);
  expect(app.find('[role="alert"]').exists()).toBe(true);
});

it("keeps the existing recording editor collapsed unless interactive mode is enabled", async () => {
  const app = await open({ interactive: false });
  expect(app.find("[name=trim-start]").exists()).toBe(false);
  expect(app.find("[role=slider]").exists()).toBe(false);
  await app.get("[data-action=adjust-trim]").trigger("click");
  expect(app.find("[name=trim-start]").exists()).toBe(true);
});

it("lets sample audio loading recover without closing the editor", async () => {
  const fetchAudio = vi
    .fn()
    .mockResolvedValueOnce(new Response(null, { status: 500 }))
    .mockResolvedValueOnce(new Response(wav(5).buffer as ArrayBuffer));
  vi.stubGlobal("fetch", fetchAudio);
  ui = mount(SampleTrimDialog, { props: { src: "/sample.wav" } });
  await settle();
  expect(ui.text()).toContain("could not be loaded");
  await ui.get("[data-action=retry-audio]").trigger("click");
  await settle();
  expect(ui.find("[data-action=save-trim]").attributes("disabled")).toBeUndefined();
  expect(ui.text()).toContain("Full clip: 5.00 s");
});
