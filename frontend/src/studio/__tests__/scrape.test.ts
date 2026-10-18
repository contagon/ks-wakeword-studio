import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { provide } from "vue";
import ScrapePage from "../pages/ScrapePage.vue";
import { createWorkspace, workspaceKey } from "../workspace";
import { useStudioRoutes } from "../routes";

const json = (data: unknown) => new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
function host() { return { components: { ScrapePage }, setup() { const workspace = createWorkspace(useStudioRoutes()); provide(workspaceKey, workspace); void workspace.load(); }, template: "<ScrapePage />" }; }
beforeEach(() => {
  history.replaceState(null, "", "#/scrape?word=a");
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    const path = new URL(url, "http://localhost").pathname;
    if (path === "/api/studio/wakewords") return json({ items: [{ id: "a", phrase: "Cedar", language: "en", model_id: "cedar", created_at: "", updated_at: "" }], total: 1, offset: 0, limit: 100 });
    if (path.endsWith("/queue") || path.endsWith("/models")) return json({ items: [], total: 0, offset: 0, limit: 1 });
    if (path.endsWith("/wakewords/a")) return json({ id: "a", phrase: "Cedar", language: "en", model_id: "cedar", created_at: "", updated_at: "" });
    if (path === "/api/studio/schedules") return json([{ scope: "scrape", cron: "*/15 * * * *", timezone: "UTC", enabled: true, next_run_at: "2026-10-18T18:15:00Z" }]);
    if (path === "/api/studio/devices") return json([{ id: "ok", url: "http://ok", role: "standalone", active: true, leader_id: null, credentials_status: "ready", profile_id: null, model_eligible: true }, { id: "bad", url: "http://bad", role: "standalone", active: true, leader_id: null, credentials_status: "ready", profile_id: null, model_eligible: true }]);
    if (path === "/api/studio/scrape/runs") return json({ items: [{ id: "run", started_at: "2026-10-18T17:00:00Z", finished_at: "2026-10-18T17:01:00Z", status: "partial", listed: 3, new: 2, already_seen: 0, unmapped: 1, evicted: 0, failed: 1, devices: [{ device_id: "ok", status: "complete", listed: 2, new: 2, already_seen: 0, unmapped: 1, evicted: 0, failed: 0, errors: [] }, { device_id: "bad", status: "offline", listed: 1, new: 0, already_seen: 0, unmapped: 0, evicted: 0, failed: 1, errors: ["unavailable"] }] }], total: 1, offset: 0, limit: 50 });
    if (path === "/api/studio/recordings/unmapped") return json({ items: [{ id: "recording", device_id: "ok", clip_id: "c", timestamp: null, phrase: "unknown", engine: "mww", near_miss: false, scores: {}, metadata: {}, audio_id: "a", original_hash: "o", normalized_hash: "n", family_id: "f", word_id: null, quarantined: false, created_at: "" }], total: 1, offset: 0, limit: 50 });
    if (path.endsWith("/source-mappings")) return init?.method === "PUT" ? json({}) : json([]);
    if (path === "/api/studio/scrape" && init?.method === "POST") return json({ id: "manual", started_at: "", finished_at: "", status: "complete", listed: 0, new: 0, already_seen: 0, unmapped: 0, evicted: 0, failed: 0, devices: [] });
    return json({});
  }));
});
afterEach(() => vi.unstubAllGlobals());

describe("Scrape page", () => {
  it("uses a global cron, retains successful outcomes beside a failed device, supports manual scrape, and maps sources explicitly", async () => {
    const ui = mount(host()); await flushPromises(); await flushPromises();
    expect(ui.text()).toContain("Global scrape schedule");
    expect(ui.text()).toContain("UTC");
    expect(ui.text()).toContain("2026-10-18T18:15:00Z");
    expect(ui.text()).toContain("ok"); expect(ui.text()).toContain("offline");
    await ui.get('[data-action="scrape-now"]').trigger("click"); await flushPromises();
    expect(ui.text()).toContain("manual");
    await ui.get('select[name="mapping-word"]').setValue("a");
    await ui.get('[data-action="save-mapping"]').trigger("click"); await flushPromises();
    expect(vi.mocked(fetch).mock.calls.some(call => String(call[0]).includes("source-mappings") && call[1]?.method === "PUT")).toBe(true);
  });
});
