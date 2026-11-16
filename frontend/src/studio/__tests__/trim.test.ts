import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import StudioShell from "../components/StudioShell.vue";
import { fakeMedia, fakeStudio, press, sample, wav } from "./fakeStudio";

let ui: VueWrapper | undefined;
let server: ReturnType<typeof fakeStudio>;
let starts: ReturnType<typeof vi.fn>[];
const settle = async () => {
  for (let i = 0; i < 6; i++) await flushPromises();
};
const current = () => ui!.get("[data-trim-current]").attributes("data-sample-id");
const saves = () => server.mutations().filter((r) => r.url.pathname.endsWith("/trim"));
const lists = () => server.requests.filter((r) => /\/samples$/.test(r.url.pathname) && r.method === "GET");

beforeEach(() => {
  localStorage.clear();
  history.replaceState(null, "", "/#/trim?word=a");
  server = fakeStudio();
  fakeMedia();
  starts = [];
  vi.stubGlobal(
    "AudioContext",
    class {
      destination = {};
      currentTime = 0;
      close = vi.fn(async () => {});
      resume = vi.fn(async () => {});
      async decodeAudioData() {
        return { duration: 5, sampleRate: 16000, getChannelData: () => new Float32Array(80000) };
      }
      createBufferSource() {
        const start = vi.fn();
        starts.push(start);
        return { start, stop() {}, disconnect() {}, connect() {}, buffer: null, onended: null };
      }
    },
  );
  server.db.audio = () => new Response(wav(5).buffer as ArrayBuffer);
  server.db.samples.push(
    sample("first", "a", "positive", { trim_status: "needs_review", trim_start_s: 1, trim_end_s: 2 }),
    sample("second", "a", "positive", { trim_status: "needs_review", trim_start_s: 0.5, trim_end_s: 1.5 }),
    sample("automatic", "a", "positive", { trim_status: "auto" }),
    sample("manual", "a", "positive", { trim_status: "manual" }),
    sample("pending", "a", "pending"),
    sample("other-word", "b", "positive", { trim_status: "needs_review", trim_start_s: 0, trim_end_s: 1 }),
  );
});
afterEach(() => {
  ui?.unmount();
  ui = undefined;
  document.body.innerHTML = "";
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function open() {
  ui = mount(StudioShell, { attachTo: document.body });
  await settle();
  return ui;
}
async function click(action: string) {
  await ui!.get(`[data-action=${action}]`).trigger("click");
  await settle();
}

describe("trim review queue", () => {
  it("opens a workspace-scoped trim queue directly and from the sidebar", async () => {
    const app = await open();
    expect(app.get("h1").text()).toBe("Trim");
    expect(current()).toBe("first");
    expect(lists().at(-1)!.url.searchParams.get("trim_status")).toBe("needs_review");
    expect(app.get("[data-progress]").text()).toContain("2 remaining");
    expect(starts).toHaveLength(0);
    const nav = app.findAll("nav [data-page]").map((a) => a.attributes("data-page"));
    expect(nav.indexOf("trim")).toBe(nav.indexOf("classify") + 1);
    await app.get('[data-page="samples"]').trigger("click");
    await app.get('[data-page="trim"]').trigger("click");
    await settle();
    expect(current()).toBe("first");
  });

  it("saves from the original using the current revision, advances, and autoplays the next original", async () => {
    const app = await open();
    await app.get("[name=trim-start]").setValue("0.75");
    press("Enter");
    await settle();
    expect(saves()).toHaveLength(1);
    expect(saves()[0]!.body).toEqual({ start_s: 0.75, end_s: 2, expected_revision: 0, from_original: true });
    expect(server.db.samples[0]!.trim_status).toBe("manual");
    expect(current()).toBe("second");
    expect(starts.at(-1)).toHaveBeenCalledWith(0, 0, 5);
    expect(app.get("[data-progress]").text()).toContain("1 remaining");
  });

  it("skips without saving or autoplay and undoes the last trim back into the queue silently", async () => {
    const app = await open();
    await click("skip-trim");
    expect(current()).toBe("second");
    expect(starts).toHaveLength(0);
    expect(saves()).toHaveLength(0);
    expect(app.get("[data-progress]").text()).toContain("1 skipped");
    await click("save-trim");
    expect(app.text()).toContain("skipped for this session");
    const before = starts.length;
    await click("undo-trim");
    expect(current()).toBe("second");
    expect(starts).toHaveLength(before);
    expect(server.db.samples[1]!.trim_status).toBe("needs_review");
  });

  it("retains the selection on a failed save and prevents duplicate submissions", async () => {
    const app = await open();
    await app.get("[name=trim-start]").setValue("0.6");
    server.failNext((r) => r.url.pathname.endsWith("/trim"), 500);
    await click("save-trim");
    expect(current()).toBe("first");
    expect(app.get<HTMLInputElement>("[name=trim-start]").element.value).toBe("0.6");
    expect(app.get("[data-trim-error]").text()).toContain("not saved");
    const held = server.hold((r) => r.url.pathname.endsWith("/trim"));
    press("Enter");
    press("Enter");
    await settle();
    expect(saves()).toHaveLength(2);
    held.release();
    await settle();
    expect(current()).toBe("second");
  });

  it("requires explicit review after a revision conflict without discarding the working bounds", async () => {
    const app = await open();
    await app.get("[name=trim-start]").setValue("0.6");
    server.db.samples[0]!.revision = 1;
    await click("save-trim");
    expect(current()).toBe("first");
    expect(app.get<HTMLInputElement>("[name=trim-start]").element.value).toBe("0.6");
    expect(app.get("[data-action=save-trim]").attributes("disabled")).toBeDefined();
    press("Enter");
    await settle();
    expect(saves()).toHaveLength(1);
    await click("review-latest");
    expect(app.get<HTMLInputElement>("[name=trim-start]").element.value).toBe("1");
    await click("save-trim");
    expect(saves().at(-1)!.body).toMatchObject({ expected_revision: 1 });
  });

  it("does not undo a later edit made elsewhere", async () => {
    const app = await open();
    await click("save-trim");
    server.db.samples[0]!.revision += 1;
    await click("undo-trim");
    expect(current()).toBe("second");
    expect(app.get("[data-trim-error]").text()).toContain("changed elsewhere");
    expect(server.db.samples[0]!.trim_status).toBe("manual");
  });

  it("preserves undo when refreshing an empty queue", async () => {
    const app = await open();
    await click("save-trim");
    await click("save-trim");
    await click("refresh-trim");
    expect(app.get("[data-action=undo-trim]").attributes("disabled")).toBeUndefined();
    await click("undo-trim");
    expect(current()).toBe("second");
  });

  it("does not intercept ordinary typing, modifier shortcuts, or native button Enter activation", async () => {
    const app = await open();
    const input = app.get("[name=trim-start]").element;
    expect(press("s", {}, input).defaultPrevented).toBe(false);
    expect(press("Enter", { ctrlKey: true }).defaultPrevented).toBe(false);
    expect(press("Enter", { isComposing: true }, input).defaultPrevented).toBe(false);
    expect(press("Enter", {}, app.get("[data-action=skip-trim]").element).defaultPrevented).toBe(false);
    expect(press(" ", {}, app.get("[data-action=open-job-queue]").element).defaultPrevented).toBe(false);
    await settle();
    expect(current()).toBe("first");
    expect(saves()).toHaveLength(0);
  });

  it.each(["trim-start", "trim-end"])("saves with Enter while editing %s", async (field) => {
    const app = await open();
    const input = app.get(`[name=${field}]`);
    await input.setValue(field === "trim-start" ? "0.75" : "2.25");
    expect(press("Enter", {}, input.element).defaultPrevented).toBe(true);
    await settle();
    expect(current()).toBe("second");
    expect(saves()).toHaveLength(1);
    expect(saves()[0]!.body).toMatchObject(field === "trim-start" ? { start_s: 0.75 } : { end_s: 2.25 });
  });

  it.each(["[name=trim-start]", "[data-action=play-original]", "[data-action=skip-trim]"])(
    "Space previews the trimmed selection when %s has focus",
    async (selector) => {
      const app = await open();
      expect(press(" ", {}, app.get(selector).element).defaultPrevented).toBe(true);
      await settle();
      expect(current()).toBe("first");
      expect(starts.at(-1)).toHaveBeenCalledWith(0, 1, 1);
      expect(saves()).toHaveLength(0);
    },
  );

  it("rejects oversized and out-of-range selections before sending a save", async () => {
    const app = await open();
    await app.get("[name=trim-end]").setValue("4");
    press("Enter");
    await settle();
    expect(saves()).toHaveLength(0);
    expect(app.get("[data-action=save-trim]").attributes("disabled")).toBeDefined();
    await app.get("[name=trim-end]").setValue("2");
    await app.get("[name=trim-start]").setValue("-1");
    press("Enter");
    await settle();
    expect(saves()).toHaveLength(0);
  });

  it("ignores a late save response after switching workspaces", async () => {
    const app = await open();
    const held = server.hold((r) => r.url.pathname.endsWith("/trim"));
    press("Enter");
    await settle();
    await app.get("#studio-word").setValue("b");
    await settle();
    expect(current()).toBe("other-word");
    held.release();
    await settle();
    expect(current()).toBe("other-word");
    expect(starts).toHaveLength(0);
    expect(app.get("[data-action=undo-trim]").attributes("disabled")).toBeDefined();
  });

  it("ignores a late queue response after switching workspaces", async () => {
    const held = server.hold((r) => /\/a\/samples$/.test(r.url.pathname));
    const app = await open();
    await app.get("#studio-word").setValue("b");
    await settle();
    expect(current()).toBe("other-word");
    held.release();
    await settle();
    expect(current()).toBe("other-word");
  });

  it("ignores late original audio after switching workspaces", async () => {
    const held = server.hold((r) => r.url.pathname.endsWith("/first/audio"));
    const app = await open();
    await app.get("#studio-word").setValue("b");
    await settle();
    held.release();
    await settle();
    expect(current()).toBe("other-word");
    expect(app.get<HTMLInputElement>("[name=trim-start]").element.value).toBe("0");
    expect(app.get<HTMLInputElement>("[name=trim-end]").element.value).toBe("1");
  });

  it("refills from the beginning after 100 saves so a shrinking queue does not lose samples", async () => {
    server.db.samples = Array.from({ length: 101 }, (_, i) =>
      sample(`s${i}`, "a", "positive", { trim_status: "needs_review", trim_start_s: 0, trim_end_s: 1 }),
    );
    await open();
    for (let i = 0; i < 100; i++) {
      expect(current()).toBe(`s${i}`);
      await click("save-trim");
    }
    expect(current()).toBe("s100");
    expect(lists().at(-1)!.url.searchParams.get("offset")).toBe("0");
  });

  it("can skip a complete page and still reach the next eligible sample", async () => {
    server.db.samples = Array.from({ length: 101 }, (_, i) =>
      sample(`s${i}`, "a", "positive", { trim_status: "needs_review", trim_start_s: 0, trim_end_s: 1 }),
    );
    const app = await open();
    for (let i = 0; i < 100; i++) await click("skip-trim");
    expect(current()).toBe("s100");
    expect(app.get("[data-progress]").text()).toContain("100 skipped");
    await click("skip-trim");
    expect(app.text()).toContain("skipped for this session");
    await click("review-skipped");
    expect(current()).toBe("s0");
  });

  it("can retry a failed refill without clearing session skips", async () => {
    const app = await open();
    await click("skip-trim");
    server.failNext((r) => /\/samples$/.test(r.url.pathname), 500);
    await click("skip-trim");
    expect(app.get("[data-trim-error]").text()).toContain("could not be loaded");
    expect(app.find("[data-action=refresh-trim]").exists()).toBe(true);
    await click("refresh-trim");
    expect(app.find("[data-trim-error]").exists()).toBe(false);
    expect(app.get("[data-progress]").text()).toContain("2 skipped");
    expect(app.find("[data-trim-current]").exists()).toBe(false);
    expect(app.text()).toContain("skipped for this session");
  });

  it("keeps an active edit untouched when a background trimming job finishes", async () => {
    vi.useFakeTimers();
    server.db.jobs.push({
      id: "background",
      word_id: "a",
      kind: "classify",
      resource: "gpu",
      payload: { trim_only: true },
      status: "queued",
      created_at: "2026-03-01T10:00:00Z",
      started_at: null,
      finished_at: null,
      result: {},
    });
    const app = await open();
    await app.get("[name=trim-start]").setValue("0.4");
    const before = lists().length;
    server.db.jobs[0]!.status = "complete";
    server.db.samples[0]!.revision++;
    await vi.advanceTimersByTimeAsync(2000);
    await settle();
    expect(current()).toBe("first");
    expect(app.get<HTMLInputElement>("[name=trim-start]").element.value).toBe("0.4");
    expect(lists()).toHaveLength(before);
    await click("save-trim");
    expect(app.get("[data-trim-error]").text()).toContain("changed elsewhere");
  });
});
