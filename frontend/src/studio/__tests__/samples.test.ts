import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import StudioShell from "../components/StudioShell.vue";
import { fakeMedia, fakeStudio, recording, sample, wav } from "./fakeStudio";
import { absoluteTime } from "../time";

let wrapper: VueWrapper | undefined;
let server: ReturnType<typeof fakeStudio>;
let media: ReturnType<typeof fakeMedia>;

beforeEach(() => {
  localStorage.clear();
  history.replaceState(null, "", "/#/samples?word=a");
  server = fakeStudio();
  server.db.devices = [0, 1].map((i) => ({
    id: `kiosk-${i}`,
    name: i === 0 ? "Kitchen satellite" : "Hall satellite",
    url: `http://kiosk-${i}`,
    role: "standalone",
    active: true,
    leader_id: null,
    credentials_status: "ready",
    profile_id: null,
    model_eligible: true,
  }));
  media = fakeMedia();
  server.db.audio = () => new Response(wav(1).buffer as ArrayBuffer, { headers: { "Content-Type": "audio/wav" } });
  for (let i = 0; i < 30; i++)
    server.db.samples.push(
      sample(`s${i}`, "a", i % 2 ? "negative" : "positive", {
        revision: i % 3,
        recording: recording(`r${i}`, {
          word_id: "a",
          device_id: `kiosk-${i % 2}`,
          near_miss: i === 1,
          phrase: `phrase ${i}`,
        }),
      }),
    );
  server.db.samples.push(sample("imp", "a", "positive", { source: "import", recording_id: null, recording: null }));
  server.db.samples.push(sample("b1", "b", "negative"));
});
afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  document.body.innerHTML = "";
  vi.useRealTimers();
});

async function open() {
  wrapper = mount(StudioShell, { attachTo: document.body });
  await settle();
  return wrapper;
}
async function settle() {
  for (let i = 0; i < 5; i++) await flushPromises();
}
const lists = () =>
  server.requests.filter((r) => r.method === "GET" && /\/wakewords\/[^/]+\/samples$/.test(r.url.pathname));
const row = (ui: VueWrapper, id: string) => ui.get(`[data-row-id="${id}"]`);

describe("provenance-aware sample library", () => {
  it.each(["save", "cancel"])(
    "preserves an open trim selection until %s when a background job finishes",
    async (action) => {
      vi.useFakeTimers();
      server.db.jobs.push({
        id: "background-trim",
        kind: "classify",
        word_id: "a",
        resource: "gpu",
        payload: { trim_only: true },
        status: "queued",
        created_at: "2026-03-01T10:00:00Z",
        started_at: null,
        finished_at: null,
        result: {},
      });
      const ui = await open();
      await row(ui, "s2").get("[data-action=trim]").trigger("click");
      await settle();
      const dialog = ui.get("[role=dialog][aria-label='Trim audio']");
      await dialog.get("[data-action=adjust-trim]").trigger("click");
      await dialog.get("[name=trim-start]").setValue("0.2");
      const before = lists().length;
      server.db.jobs[0]!.status = "complete";
      await vi.advanceTimersByTimeAsync(2000);
      await settle();
      expect(ui.find("[aria-label='Trim audio']").exists()).toBe(true);
      expect(dialog.get<HTMLInputElement>("[name=trim-start]").element.value).toBe("0.2");
      expect(lists()).toHaveLength(before);
      if (action === "save") await dialog.get("[data-action=save-trim]").trigger("click");
      else
        await dialog
          .findAll("button")
          .find((button) => button.text() === "Cancel")!
          .trigger("click");
      await settle();
      expect(ui.find("[aria-label='Trim audio']").exists()).toBe(false);
      expect(lists().length).toBeGreaterThan(before);
    },
  );

  it("shows trim review status and filters unresolved positives", async () => {
    Object.assign(server.db.samples[0]!, { trim_status: "needs_review" });
    Object.assign(server.db.samples[2]!, { trim_status: "auto", trim_start_s: 0.25, trim_end_s: 1.15 });
    const ui = await open();
    expect(row(ui, "s0").text()).toContain("Needs trim review");
    expect(row(ui, "s2").text()).toContain("Auto-trimmed");
    expect(ui.text()).toContain("excluded from training");
    await ui.get("select[name=trim-status]").setValue("needs_review");
    await settle();
    expect(lists().at(-1)!.url.searchParams.get("trim_status")).toBe("needs_review");
    expect(ui.findAll("[data-row-id]").map((r) => r.attributes("data-row-id"))).toEqual(["s0"]);
  });

  it("queues an explicit backfill for only the active workspace", async () => {
    const ui = await open();
    expect(ui.get("[data-action=auto-trim]").text()).toBe("Re-trim all scraped positives");
    expect(ui.text()).toContain("Manual trims are protected");
    await ui.get("[data-action=auto-trim]").trigger("click");
    await settle();
    expect(server.mutations().at(-1)!.url.pathname).toBe("/api/studio/wakewords/a/samples/trim/jobs");
    expect(ui.get("[data-samples-status]").text()).toContain("queued");
    expect(ui.get("[data-action=auto-trim]").attributes("disabled")).toBeDefined();
  });

  it("plays the full original and can undo a saved automatic trim", async () => {
    Object.assign(server.db.samples[2]!, { trim_status: "auto", trim_start_s: 0.25, trim_end_s: 1.15 });
    server.db.history.set("s2", [{ label: "positive", audio_id: "full-s2" }]);
    const ui = await open();
    await row(ui, "s2").get("[data-action=play-original]").trigger("click");
    await settle();
    expect(server.requests.some((r) => r.path === "/api/studio/wakewords/a/samples/s2/audio?original=true")).toBe(true);
    await row(ui, "s2").get("[data-action=undo]").trigger("click");
    await settle();
    expect(server.mutations().at(-1)!.body).toEqual({ expected_revision: 2 });
    expect(server.mutations().at(-1)!.url.pathname).toBe("/api/studio/wakewords/a/samples/s2/undo");
  });

  it("shows the full original with the current trim selected and lets either edge expand", async () => {
    Object.assign(server.db.samples[2]!, { trim_status: "auto", trim_start_s: 0.25, trim_end_s: 1.15 });
    server.db.audio = () => new Response(wav(3).buffer as ArrayBuffer, { headers: { "Content-Type": "audio/wav" } });
    const ui = await open();
    expect(row(ui, "s2").text()).toContain("0.25–1.15 s");
    await row(ui, "s2").get("[data-action=trim]").trigger("click");
    await settle();
    const dialog = ui.get("[role=dialog][aria-label='Trim audio']");
    expect(server.requests.some((r) => r.path === "/api/studio/wakewords/a/samples/s2/audio?full=true")).toBe(true);
    expect(dialog.text()).toContain("Full clip: 3.00 s");
    expect(dialog.text()).toContain("Current trim");
    expect(dialog.text()).toContain("0.90 s retained");
    expect(dialog.text()).toContain("0.25–1.15 s");
    await dialog.get("[data-action=adjust-trim]").trigger("click");
    expect(dialog.get<HTMLInputElement>("[name=trim-start]").element.value).toBe("0.25");
    expect(dialog.get<HTMLInputElement>("[name=trim-end]").element.value).toBe("1.15");
    expect(dialog.get("[name=trim-end]").attributes("max")).toBe("3");
    await dialog.get("[name=trim-start]").setValue("0.1");
    await dialog.get("[name=trim-end]").setValue("2.5");
    await settle();
    expect(dialog.text()).toContain("2.40 s retained");
    await dialog.get("[data-action=save-trim]").trigger("click");
    await settle();
    expect(server.mutations().at(-1)!.body).toEqual({
      start_s: 0.1,
      end_s: 2.5,
      expected_revision: 2,
      from_original: true,
    });
    expect(ui.find("[aria-label='Trim audio']").exists()).toBe(false);
  });

  it("shows all filters inline without a disclosure", async () => {
    const ui = await open();
    expect(ui.find("details").exists()).toBe(false);
    const filters = ui.get("[data-sample-filters]");
    for (const name of ["search", "label", "labelled-by", "source", "kind", "after", "before"])
      expect(filters.find(`[name=${name}]`).exists()).toBe(true);
    expect(filters.findAll("select[name=source] option").map((o) => o.text())).toEqual([
      "All sources",
      "All kiosks",
      "Kitchen satellite",
      "Hall satellite",
      "Recorded",
      "Import",
    ]);
    expect(ui.get("#studio-content").find('a[href="#/manual?word=a"]').exists()).toBe(false);
  });
  it("replaces the legacy samples mapping with a paginated, source-labelled table", async () => {
    server.db.samples[1].labelled_by = "auto";
    const ui = await open();
    expect(ui.get("h1").text()).toBe("Samples");
    expect(ui.find("[data-legacy-trainer]").exists()).toBe(false);
    expect(ui.findAll("thead th").map((th) => th.text())).toEqual([
      "Sample",
      "Date",
      "Label",
      "Label source",
      "Source",
      "Actions",
    ]);
    expect(row(ui, "s0").get("td[data-caption=Label] .studio-status").classes()).toContain("studio-status-success");
    expect(row(ui, "s1").get("td[data-caption=Label] .studio-status").classes()).toContain("studio-status-failed");
    expect(row(ui, "s1").get("td[data-caption='Label source']").text()).toBe("Automatic");
    expect(lists().at(-1)?.url.searchParams.get("offset")).toBe("0");
    expect(ui.findAll("[data-row-id]")).toHaveLength(25);
    const first = row(ui, "s0").text();
    for (const text of ["Positive", "Kitchen satellite", "phrase 0", "mww"]) expect(first).toContain(text);
    expect(first).not.toContain("diagnostic");
    expect(row(ui, "s1").text()).toContain("Hall satellite");
    expect(row(ui, "s1").text()).toContain("close miss");
    expect(ui.text()).toContain("1–25 of 31");
    await ui.get("[data-action=next-page]").trigger("click");
    await settle();
    expect(lists().at(-1)?.url.searchParams.get("offset")).toBe("25");
    expect(row(ui, "imp").text()).toContain("Import");
    expect(ui.get("[data-action=next-page]").attributes("disabled")).toBeDefined();
  });

  it("filters by label, source, kind and date and resets to the first page", async () => {
    const ui = await open();
    await ui.get("[data-action=next-page]").trigger("click");
    await settle();
    await ui.get("select[name=label]").setValue("negative");
    await ui.get("select[name=source]").setValue("diagnostic");
    await ui.get("select[name=kind]").setValue("true");
    await ui.get("input[name=after]").setValue("2026-02-01");
    await ui.get("input[name=before]").setValue("2026-04-01");
    await settle();
    const q = lists().at(-1)!.url.searchParams;
    expect(Object.fromEntries(q)).toMatchObject({
      label: "negative",
      source: "diagnostic",
      near_miss: "true",
      offset: "0",
    });
    expect(q.has("search")).toBe(false);
    expect(q.get("after")).toBe(new Date("2026-02-01T00:00:00").toISOString());
    expect(q.get("before")).toBe(new Date("2026-04-01T23:59:59.999").toISOString());
    expect(ui.findAll("[data-row-id]").map((r) => r.attributes("data-row-id"))).toEqual(["s1"]);
  });

  it("filters by a single kiosk and dates each row by its recording time", async () => {
    const ui = await open();
    await ui.get("select[name=source]").setValue("device:kiosk-1");
    await settle();
    expect(Object.fromEntries(lists().at(-1)!.url.searchParams)).toMatchObject({
      source: "diagnostic",
      device_id: "kiosk-1",
    });
    const rows = ui.findAll("[data-row-id]");
    expect(rows.length).toBe(15);
    expect(rows.every((r) => r.text().includes("Hall satellite"))).toBe(true);
    const timestamp = server.db.samples.find((s) => s.id === "s1")!.recording!.timestamp!;
    expect(row(ui, "s1").get("td[data-caption=Date]").text()).toBe(absoluteTime(timestamp));
  });

  it("searches by sample or clip ID", async () => {
    const ui = await open();
    await ui.get("input[name=search]").setValue(" imp ");
    await settle();
    expect(lists().at(-1)!.url.searchParams.get("search")).toBe("imp");
    expect(ui.findAll("[data-row-id]").map((r) => r.attributes("data-row-id"))).toEqual(["imp"]);
  });

  it("relabels with the row's server revision and applies the acknowledged record", async () => {
    const ui = await open();
    expect(row(ui, "s2").get("[data-relabel=positive]").attributes("aria-pressed")).toBe("true");
    await row(ui, "s2").get("[data-relabel=discarded]").trigger("click");
    await settle();
    const request = server.mutations().at(-1)!;
    expect([request.url.pathname, request.body]).toEqual([
      "/api/studio/wakewords/a/samples/s2/label",
      { label: "discarded", expected_revision: 2 },
    ]);
    expect(row(ui, "s2").get("td[data-caption=Label]").text()).toBe("Discarded");
    expect(ui.get("[data-samples-status]").text()).toContain("saved");
  });

  it("announces a revision conflict and reloads the current page instead of overwriting", async () => {
    const ui = await open();
    server.db.samples.find((s) => s.id === "s4")!.revision = 9;
    const before = lists().length;
    await row(ui, "s4").get("[data-relabel=negative]").trigger("click");
    await settle();
    expect(ui.get("[data-samples-error]").attributes("role")).toBe("alert");
    expect(ui.get("[data-samples-error]").text()).toContain("changed elsewhere");
    expect(lists().length).toBe(before + 1);
  });

  it("trims non-destructively through the server with the current revision", async () => {
    const ui = await open();
    const audio = server.hold(
      (r) => r.url.pathname === "/api/studio/wakewords/a/samples/s5/audio",
      () => new Response(wav(1).buffer as ArrayBuffer, { headers: { "Content-Type": "audio/wav" } }),
    );
    await row(ui, "s5").get("[data-action=trim]").trigger("click");
    audio.release();
    await settle();
    const dialog = ui.get("[role=dialog][aria-label='Trim audio']");
    expect(dialog.text()).toContain("1.00 s retained");
    expect(server.requests.some((r) => r.url.pathname.startsWith("/api/samples"))).toBe(false);
    await dialog.get("[data-action=adjust-trim]").trigger("click");
    await dialog.get("[name=trim-start]").setValue("0.2");
    await settle();
    await dialog.get("[data-action=save-trim]").trigger("click");
    await settle();
    const request = server.mutations().at(-1)!;
    expect(request.url.pathname).toBe("/api/studio/wakewords/a/samples/s5/trim");
    expect(request.body).toEqual({ start_s: 0.2, end_s: 1, expected_revision: 2, from_original: true });
    expect(server.requests.some((r) => r.method === "DELETE")).toBe(false);
    expect(ui.find("[aria-label='Trim audio']").exists()).toBe(false);
  });

  it("offers no delete; discard is the way to drop a sample", async () => {
    const ui = await open();
    expect(row(ui, "s7").find("[data-action=delete]").exists()).toBe(false);
  });

  it("plays inline, one row at a time, through the authorized studio audio URL", async () => {
    const ui = await open();
    await row(ui, "s3").get("[data-action=play]").trigger("click");
    await settle();
    expect(document.querySelector("[role=dialog]")).toBeNull();
    expect(server.requests.some((r) => r.path === "/api/studio/wakewords/a/samples/s3/audio?original=false")).toBe(
      true,
    );
    expect(media.plays).toHaveLength(1);
    expect(row(ui, "s3").get("[data-action=play]").text()).toBe("Stop");
    const first = media.plays[0];
    await row(ui, "s4").get("[data-action=play]").trigger("click");
    await settle();
    expect(media.revoked).toContain(first);
    expect(media.plays).toHaveLength(2);
    expect(row(ui, "s3").get("[data-action=play]").text()).toBe("Play");
    await row(ui, "s4").get("[data-action=play]").trigger("click");
    await settle();
    expect(media.plays).toHaveLength(2);
    expect(row(ui, "s4").get("[data-action=play]").text()).toBe("Play");
  });

  it("scopes library requests to the active word and ignores a stale list for the old word", async () => {
    const stale = server.hold((r) => r.url.pathname === "/api/studio/wakewords/a/samples");
    const ui = await open();
    await ui.get("#studio-word").setValue("b");
    await settle();
    expect(stale.request()?.signal?.aborted).toBe(true);
    stale.release();
    await settle();
    expect(wrapper!.findAll("[data-row-id]").map((r) => r.attributes("data-row-id"))).toEqual(["b1"]);
    await row(wrapper!, "b1").get("[data-relabel=positive]").trigger("click");
    await settle();
    expect(server.mutations().map((r) => r.url.pathname)).toEqual(["/api/studio/wakewords/b/samples/b1/label"]);
    void ui;
  });
});
