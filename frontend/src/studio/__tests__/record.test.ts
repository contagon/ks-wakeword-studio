import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import StudioShell from "../components/StudioShell.vue";
import { fakeMedia, fakeStudio, json, press, wav } from "./fakeStudio";

let ui: VueWrapper | undefined;
let server: ReturnType<typeof fakeStudio>;
let tracks: { stop: ReturnType<typeof vi.fn> }[];
let getUserMedia: ReturnType<typeof vi.fn>;
let recorders: FakeRecorder[];
let empty = false;
let decodedPcm: Float32Array;
class FakeRecorder {
  static isTypeSupported = (mime: string) => mime === "audio/webm;codecs=opus";
  state = "inactive";
  mimeType = "audio/webm;codecs=opus";
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public stream: MediaStream) {
    recorders.push(this);
  }
  start() {
    this.state = "recording";
  }
  stop() {
    this.state = "inactive";
    this.ondataavailable?.({ data: new Blob(empty ? [] : [wav(3).buffer as ArrayBuffer], { type: this.mimeType }) });
    this.onstop?.();
  }
}
const settle = async () => {
  for (let i = 0; i < 5; i++) await flushPromises();
};
beforeEach(() => {
  localStorage.clear();
  history.replaceState(null, "", "/#/manual?word=a");
  server = fakeStudio();
  fakeMedia();
  tracks = [{ stop: vi.fn() }];
  recorders = [];
  empty = false;
  decodedPcm = new Float32Array(48000).fill(0.2);
  getUserMedia = vi.fn(async () => ({ getTracks: () => tracks }));
  Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia } });
  vi.stubGlobal("isSecureContext", true);
  vi.stubGlobal("MediaRecorder", FakeRecorder);
  vi.stubGlobal(
    "AudioContext",
    class {
      destination = {};
      close = vi.fn(async () => {});
      resume = vi.fn(async () => {});
      async decodeAudioData() {
        return { duration: 3, sampleRate: 16000, length: 48000, getChannelData: () => decodedPcm };
      }
      createBufferSource() {
        return { buffer: null, connect() {}, start() {}, stop() {}, disconnect() {}, onended: null };
      }
    },
  );
});
afterEach(() => {
  ui?.unmount();
  ui = undefined;
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
async function open() {
  ui = mount(StudioShell, { attachTo: document.body });
  await settle();
  return ui;
}
async function record() {
  await ui!.get("[data-action=record-toggle]").trigger("click");
  await settle();
  await ui!.get("[data-action=record-toggle]").trigger("click");
  await settle();
}
const captures = () => server.mutations().filter((r) => r.url.pathname.endsWith("/samples/capture"));

describe("browser recording", () => {
  it("captures until explicit Stop, reviews and saves original plus chosen label and trim", async () => {
    const app = await open();
    expect(app.get("h1").text()).toBe("Manual");
    await app.get("[data-label=negative]").trigger("click");
    await app.get("[data-action=record-toggle]").trigger("click");
    await settle();
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(app.get("[data-action=record-toggle]").text()).toContain("Stop");
    expect(captures()).toHaveLength(0);
    await app.get("[data-action=record-toggle]").trigger("click");
    await settle();
    expect(tracks[0].stop).toHaveBeenCalled();
    expect(app.text()).toContain("Review your sample");
    expect(captures()).toHaveLength(0);
    await app.get("[data-action=save-capture]").trigger("click");
    await settle();
    const form = captures()[0].body as FormData;
    expect(form.get("label")).toBe("negative");
    expect(form.get("start_s")).toBe("0.2");
    expect(form.get("end_s")).toBe("2.8");
    expect((form.get("audio") as File).size).toBe(96044);
    expect(server.db.samples[0]).toMatchObject({ word_id: "a", label: "negative", source: "microphone" });
    expect(app.text()).toContain("Sample saved");
  });

  it("adjusts bounds beyond one second and retakes without saving", async () => {
    const app = await open();
    await record();
    await app.get("[data-action=adjust-trim]").trigger("click");
    await app.get("[name=trim-start]").setValue("1.2");
    await app.get("[name=trim-end]").setValue("2.4");
    await app.get("[data-action=save-capture]").trigger("click");
    await settle();
    const form = captures()[0].body as FormData;
    expect([form.get("start_s"), form.get("end_s"), form.get("trim_method")]).toEqual(["1.2", "2.4", "manual"]);
    await record();
    await app.get("[data-action=retake]").trigger("click");
    await settle();
    expect(captures()).toHaveLength(1);
    expect(app.text()).not.toContain("Review your sample");
  });

  it("moves upload to Record with a separate label and preserves the import endpoint", async () => {
    const app = await open();
    await app.get("[data-label=negative]").trigger("click");
    const input = app.get("input[name=import-file]");
    Object.defineProperty(input.element, "files", {
      value: [new File([wav(1).buffer as ArrayBuffer], "upload.wav", { type: "audio/wav" })],
    });
    await input.trigger("change");
    await app.get("[data-form=import]").trigger("submit");
    await settle();
    const form = server.mutations().at(-1)!.body as FormData;
    expect(server.mutations().at(-1)!.url.pathname).toBe("/api/studio/wakewords/a/samples/import");
    expect(form.get("label")).toBe("positive");
    await app.get("[data-page=samples]").trigger("click");
    await settle();
    expect(app.find("[data-form=import]").exists()).toBe(false);
  });

  it("Space toggles exactly once and ignores repeats, controls, modifiers and the job drawer", async () => {
    const app = await open();
    press(" ");
    await settle();
    expect(recorders).toHaveLength(1);
    press(" ", { repeat: true });
    press(" ", { ctrlKey: true });
    press(" ", {}, app.get("input[name=import-file]").element);
    await settle();
    expect(recorders[0].state).toBe("recording");
    await app.get("[data-action=open-job-queue]").trigger("click");
    await settle();
    press(" ");
    await settle();
    expect(recorders[0].state).toBe("recording");
    await app.get("[data-action=close-job-queue]").trigger("click");
    await settle();
    press(" ");
    await settle();
    expect(recorders[0].state).toBe("inactive");
    expect(app.text()).toContain("Review your sample");
  });

  it("reviews with keyboard shortcuts: Space plays, D discards, K keeps", async () => {
    let started = 0;
    vi.stubGlobal(
      "AudioContext",
      class {
        destination = {};
        close = vi.fn(async () => {});
        resume = vi.fn(async () => {});
        async decodeAudioData() {
          return { duration: 3, sampleRate: 16000, length: 48000, getChannelData: () => decodedPcm };
        }
        createBufferSource() {
          return {
            buffer: null,
            connect() {},
            start() {
              started++;
            },
            stop() {},
            disconnect() {},
            onended: null,
          };
        }
      },
    );
    const app = await open();
    await record();
    press(" ");
    await settle();
    expect(started).toBe(1);
    expect(app.get("[data-action=play-capture]").text()).toContain("Stop preview");
    expect(recorders).toHaveLength(1);
    press("d");
    await settle();
    expect(app.text()).not.toContain("Review your sample");
    expect(captures()).toHaveLength(0);
    await record();
    press("k");
    await settle();
    expect(captures()).toHaveLength(1);
    expect(app.text()).toContain("Sample saved");
    await record();
    press("k", {}, app.get("[name=import-file]").element);
    await settle();
    expect(captures()).toHaveLength(1);
  });

  it("opens legacy #/record links on Manual", async () => {
    history.replaceState(null, "", "/#/record?word=a");
    const app = await open();
    expect(app.get("h1").text()).toBe("Manual");
  });

  it("keeps full-length noise clips saveable with a warning", async () => {
    const held = server.hold(
      (r) => r.path.endsWith("/capture/preview"),
      () => json({ duration_s: 3, start_s: 0, end_s: 3, trim_method: "none", warning: "no_speech" }),
    );
    const app = await open();
    await record();
    held.release();
    await settle();
    expect(app.text()).toContain("No speech");
    await app.get("[data-action=save-capture]").trigger("click");
    await settle();
    const form = captures()[0].body as FormData;
    expect([form.get("start_s"), form.get("end_s")]).toEqual(["0", "3"]);
  });

  it("retains the original on analysis failure and allows retry", async () => {
    server.failNext((r) => r.path.endsWith("/capture/preview"), 503);
    const app = await open();
    await record();
    expect(app.find("[data-action=retry-analysis]").exists()).toBe(true);
    await app.get("[data-action=retry-analysis]").trigger("click");
    await settle();
    expect(app.text()).toContain("Review your sample");
    expect(recorders).toHaveLength(1);
  });

  it("explains the bounded recovery for a recording reaching the safety limit", async () => {
    const held = server.hold(
      (r) => r.path.endsWith("/capture/preview"),
      () =>
        json({ duration_s: 600, start_s: 0, end_s: 600, trim_method: "none", warning: null, duration_limited: true }),
    );
    const app = await open();
    await record();
    held.release();
    await settle();
    expect(app.text()).toContain("Training audio is limited to 10 minutes");
    expect(app.get("[data-action=save-capture]").attributes("disabled")).toBeUndefined();
  });

  it("draws only the bounded training preview when the original includes overshoot", async () => {
    decodedPcm.fill(0.9, 32000); // Loud original tail outside the two-second training preview.
    const held = server.hold(
      (r) => r.path.endsWith("/capture/preview"),
      () => json({ duration_s: 2, start_s: 0, end_s: 2, trim_method: "none", warning: null, duration_limited: true }),
    );
    const app = await open();
    await record();
    held.release();
    await settle();
    expect(Number(app.findAll(".studio-capture-wave line").at(-1)!.attributes("y1"))).toBeGreaterThan(30);
  });

  it("retains review and bounds on save failure and blocks duplicate saves", async () => {
    const app = await open();
    await record();
    server.failNext((r) => r.path.endsWith("/samples/capture"), 503);
    await app.get("[data-action=save-capture]").trigger("click");
    await settle();
    expect(app.text()).toContain("Review your sample");
    const held = server.hold((r) => r.path.endsWith("/samples/capture"));
    await app.get("[data-action=save-capture]").trigger("click");
    await app.get("[data-action=save-capture]").trigger("click");
    expect(captures()).toHaveLength(2);
    held.release();
    await settle();
    expect(app.text()).toContain("Sample saved");
  });

  it("handles permission denial, insecure contexts and empty recordings", async () => {
    getUserMedia.mockRejectedValueOnce(new DOMException("secret", "NotAllowedError"));
    const app = await open();
    await app.get("[data-action=record-toggle]").trigger("click");
    await settle();
    expect(app.text()).toContain("Microphone permission");
    expect(app.text()).not.toContain("secret");
    empty = true;
    await record();
    expect(app.text()).toContain("empty");
    expect(captures()).toHaveLength(0);
    vi.stubGlobal("isSecureContext", false);
    await app.get("[data-action=record-toggle]").trigger("click");
    await settle();
    expect(app.text()).toContain("HTTPS");
  });

  it("stops a late permission grant after switching workspace", async () => {
    let grant!: (value: unknown) => void;
    getUserMedia.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          grant = resolve;
        }),
    );
    const app = await open();
    await app.get("[data-action=record-toggle]").trigger("click");
    await settle();
    await app.get("#studio-word").setValue("b");
    await settle();
    grant({ getTracks: () => tracks });
    await settle();
    expect(tracks[0].stop).toHaveBeenCalled();
    expect(recorders).toHaveLength(0);
    expect(captures()).toHaveLength(0);
  });

  it("ignores stale analysis and stops media when navigating away", async () => {
    const held = server.hold((r) => r.path.endsWith("/capture/preview"));
    const app = await open();
    await record();
    await app.get("#studio-word").setValue("b");
    await settle();
    held.release();
    await settle();
    expect(app.text()).not.toContain("Review your sample");
    await app.get("[data-action=record-toggle]").trigger("click");
    await settle();
    await app.get("[data-page=samples]").trigger("click");
    await settle();
    expect(tracks[0].stop).toHaveBeenCalled();
    expect(recorders.at(-1)!.state).toBe("inactive");
  });
});
