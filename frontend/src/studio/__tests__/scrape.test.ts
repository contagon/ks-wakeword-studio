import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import ClassifyPage from "../pages/ClassifyPage.vue";
import { json, workspaceHost } from "./fakeStudio";

function host() {
  return workspaceHost(ClassifyPage, (w) => {
    void w.load();
  });
}
beforeEach(() => {
  history.replaceState(null, "", "#/scrape?word=a");
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      const path = new URL(url, "http://localhost").pathname;
      if (path === "/api/studio/jobs") return json({ items: [], total: 0, offset: 0, limit: 100 });
      if (path === "/api/studio/wakewords")
        return json({
          items: [{ id: "a", phrase: "Cedar", language: "en", model_id: "cedar", created_at: "", updated_at: "" }],
          total: 1,
          offset: 0,
          limit: 100,
        });
      if (path.endsWith("/queue") || path.endsWith("/models"))
        return json({ items: [], total: 0, offset: 0, limit: 1 });
      if (path.endsWith("/wakewords/a"))
        return json({ id: "a", phrase: "Cedar", language: "en", model_id: "cedar", created_at: "", updated_at: "" });
      if (path === "/api/studio/schedules")
        return json([
          {
            scope: "scrape",
            cron: "*/15 * * * *",
            timezone: "UTC",
            enabled: true,
            next_run_at: "2026-10-18T18:15:00Z",
          },
        ]);
      if (path === "/api/studio/devices")
        return json([
          {
            id: "ok",
            url: "http://ok",
            role: "standalone",
            active: true,
            leader_id: null,
            credentials_status: "ready",
            profile_id: null,
            model_eligible: true,
          },
          {
            id: "bad",
            url: "http://bad",
            role: "standalone",
            active: true,
            leader_id: null,
            credentials_status: "ready",
            profile_id: null,
            model_eligible: true,
          },
        ]);
      if (path === "/api/studio/scrape/runs")
        return json({
          items: [
            {
              id: "run",
              started_at: "2026-10-18T17:00:00Z",
              finished_at: "2026-10-18T17:01:00Z",
              status: "partial",
              listed: 3,
              new: 2,
              already_seen: 0,
              unmapped: 1,
              evicted: 0,
              failed: 1,
              devices: [
                {
                  device_id: "ok",
                  status: "complete",
                  listed: 2,
                  new: 2,
                  already_seen: 0,
                  unmapped: 1,
                  evicted: 0,
                  failed: 0,
                  errors: [],
                },
                {
                  device_id: "bad",
                  status: "offline",
                  listed: 1,
                  new: 0,
                  already_seen: 0,
                  unmapped: 0,
                  evicted: 0,
                  failed: 1,
                  errors: ["unavailable"],
                },
              ],
            },
          ],
          total: 1,
          offset: 0,
          limit: 50,
        });
      if (path === "/api/studio/recordings/unmapped")
        return json({
          items: [
            {
              id: "recording",
              device_id: "ok",
              clip_id: "c",
              timestamp: null,
              phrase: "unknown",
              engine: "mww",
              near_miss: false,
              scores: {},
              metadata: {},
              audio_id: "a",
              original_hash: "o",
              normalized_hash: "n",
              family_id: "f",
              word_id: null,
              quarantined: false,
              created_at: "",
            },
          ],
          total: 1,
          offset: 0,
          limit: 50,
        });
      if (path.endsWith("/source-mappings")) return init?.method === "PUT" ? json({}) : json([]);
      if (path.endsWith("/collection/jobs"))
        return json({
          id: "manual",
          kind: "scrape",
          word_id: "a",
          resource: "collection",
          payload: {},
          status: "queued",
          result: {},
          created_at: "",
          started_at: null,
          finished_at: null,
        });
      if (path.endsWith("/jobs/manual"))
        return json({
          id: "manual",
          kind: "scrape",
          word_id: "a",
          resource: "collection",
          payload: {},
          status: "complete",
          result: { run_id: "manual", status: "complete" },
          created_at: "",
          started_at: null,
          finished_at: "",
        });
      if (path.endsWith("/jobs/manual/logs")) return json({ text: "" });
      return json({});
    }),
  );
});

describe("Classify collection", () => {
  it("retains fleet outcomes, queues a workspace collection and maps sources explicitly", async () => {
    const ui = mount(host());
    await flushPromises();
    await flushPromises();
    expect(ui.text()).toContain("Collection history · Fleet-wide");
    expect(ui.find("[data-cron-editor]").exists()).toBe(false);
    expect(ui.text()).toContain("ok");
    expect(ui.text()).toContain("offline");
    await ui.get('[data-action="collect-now"]').trigger("click");
    await flushPromises();
    await vi.waitFor(() => expect(ui.find("[data-collection-outcome]").exists()).toBe(true), { timeout: 3500 });
    expect(ui.get("[data-collection-outcome]").text()).toContain("Collection finished");
    await ui.get("#classify-tab-unmapped").trigger("click");
    await ui.get('select[name="mapping-word"]').setValue("a");
    await ui.get('[data-action="save-mapping"]').trigger("click");
    await flushPromises();
    expect(
      vi
        .mocked(fetch)
        .mock.calls.some((call) => String(call[0]).includes("source-mappings") && call[1]?.method === "PUT"),
    ).toBe(true);
    ui.unmount();
  });
});
