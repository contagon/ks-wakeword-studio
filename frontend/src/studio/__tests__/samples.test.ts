import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import StudioShell from "../components/StudioShell.vue";
import { fakeMedia, fakeStudio, recording, sample, wav } from "./fakeStudio";

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
  it("shows all filters inline without a disclosure", async () => {
    const ui = await open();
    expect(ui.find("details").exists()).toBe(false);
    const filters = ui.get("[data-sample-filters]");
    for (const name of ["search", "label", "labelled-by", "source", "kind", "after", "before"])
      expect(filters.find(`[name=${name}]`).exists()).toBe(true);
    expect(filters.findAll("select[name=source] option").map((o) => o.text())).toEqual([
      "All sources",
      "Kiosk",
      "Recorded",
      "Import",
    ]);
    expect(ui.get("#studio-content").find('a[href="#/manual?word=a"]').exists()).toBe(false);
  });
  it("replaces the legacy samples mapping with a paginated, source-labelled table", async () => {
    const ui = await open();
    expect(ui.get("h1").text()).toBe("Samples");
    expect(ui.find("[data-legacy-trainer]").exists()).toBe(false);
    expect(ui.findAll("thead th").map((th) => th.text())).toEqual(["Sample", "Label", "Source", "Actions"]);
    expect(lists().at(-1)?.url.searchParams.get("offset")).toBe("0");
    expect(ui.findAll("[data-row-id]")).toHaveLength(25);
    const first = row(ui, "s0").text();
    for (const text of ["positive", "Kitchen satellite", "phrase 0", "mww"]) expect(first).toContain(text);
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

  it("searches by sample or clip ID", async () => {
    const ui = await open();
    await ui.get("input[name=search]").setValue(" imp ");
    await settle();
    expect(lists().at(-1)!.url.searchParams.get("search")).toBe("imp");
    expect(ui.findAll("[data-row-id]").map((r) => r.attributes("data-row-id"))).toEqual(["imp"]);
  });

  it("relabels with the row's server revision and applies the acknowledged record", async () => {
    const ui = await open();
    expect(row(ui, "s2").get("select[data-action=relabel]").element.closest(".sr-only")).toBeNull();
    await row(ui, "s2").get("select[data-action=relabel]").setValue("discarded");
    await settle();
    const request = server.mutations().at(-1)!;
    expect([request.url.pathname, request.body]).toEqual([
      "/api/studio/wakewords/a/samples/s2/label",
      { label: "discarded", expected_revision: 2 },
    ]);
    expect(row(ui, "s2").get("td[data-caption=Label]").text()).toBe("discarded");
    expect(ui.get("[data-samples-status]").text()).toContain("saved");
  });

  it("announces a revision conflict and reloads the current page instead of overwriting", async () => {
    const ui = await open();
    server.db.samples.find((s) => s.id === "s4")!.revision = 9;
    const before = lists().length;
    await row(ui, "s4").get("select[data-action=relabel]").setValue("negative");
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
    expect(request.body).toEqual({ start_s: 0.2, end_s: 1, expected_revision: 2 });
    expect(server.requests.some((r) => r.method === "DELETE")).toBe(false);
    expect(ui.find("[aria-label='Trim audio']").exists()).toBe(false);
  });

  it("deletes only after confirmation and with the server revision", async () => {
    const ui = await open();
    await row(ui, "s7").get("[data-action=delete]").trigger("click");
    await ui.get("[data-action=cancel-delete]").trigger("click");
    await settle();
    expect(server.mutations()).toHaveLength(0);
    await row(ui, "s7").get("[data-action=delete]").trigger("click");
    await ui.get("[data-action=confirm-delete]").trigger("click");
    await settle();
    expect(server.mutations().map((r) => r.path)).toEqual(["/api/studio/wakewords/a/samples/s7?expected_revision=1"]);
    expect(ui.find('[data-row-id="s7"]').exists()).toBe(false);
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
    await row(wrapper!, "b1").get("select[data-action=relabel]").setValue("positive");
    await settle();
    expect(server.mutations().map((r) => r.url.pathname)).toEqual(["/api/studio/wakewords/b/samples/b1/label"]);
    void ui;
  });
});
