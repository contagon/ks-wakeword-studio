import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { provide } from "vue";
import DeployPage from "../pages/DeployPage.vue";
import { createWorkspace, workspaceKey } from "../workspace";
import { useStudioRoutes } from "../routes";
const json = (data: unknown) => new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
function host() { return { components: { DeployPage }, setup() { provide(workspaceKey, createWorkspace(useStudioRoutes())); }, template: "<DeployPage />" }; }
const version = (id: string) => ({ id, word_id: "a", model_id: "cedar", run_id: "run", trained_at: "2026-10-18T17:00:00Z", path: "/archive", fingerprint: id, checksums: { "cedar.tflite": "abc" }, metrics: { recall: 0.91 } });
beforeEach(() => { history.replaceState(null, "", "#/deploy?word=a"); vi.stubGlobal("fetch", vi.fn(async (url: string) => { const path = new URL(url, "http://localhost").pathname;
  if (path === "/api/studio/wakewords") return json({ items: [{ id: "a", phrase: "Cedar", language: "en", model_id: "cedar", created_at: "", updated_at: "" }], total: 1, offset: 0, limit: 100 });
  if (path.endsWith("/wakewords/a")) return json({ id: "a", phrase: "Cedar", language: "en", model_id: "cedar", created_at: "", updated_at: "" });
  if (path.endsWith("/queue")) return json({ items: [], total: 0, offset: 0, limit: 1 }); if (path === "/api/studio/schedules") return json([]);
  if (path.endsWith("/models")) return json({ items: [version("new"), version("old")], total: 2, offset: 0, limit: 50 });
  if (path.endsWith("/deployment/status")) return json([{ word_id: "a", device_id: "leader", desired_version: "new", revision: 2, state: "published", attempts: 1, next_retry: null, manifest_state: "verified", refresh_state: "acknowledged", runtime_state: "unverified", error_code: null, updated_at: "", cache_effect: "" }, { word_id: "a", device_id: "follower", desired_version: "new", revision: 2, state: "offline", attempts: 1, next_retry: null, manifest_state: "unverified", refresh_state: "pending", runtime_state: "unverified", error_code: "offline", updated_at: "", cache_effect: "" }]);
  if (path === "/api/studio/devices") return json([{ id: "leader", url: "http://leader", role: "leader", active: true, leader_id: null, credentials_status: "ready", profile_id: null, model_eligible: true }, { id: "follower", url: "http://follower", role: "follower", active: true, leader_id: "leader", credentials_status: "ready", profile_id: "voice", model_eligible: true }]);
  if (path === "/api/studio/deployment/capabilities") return json({ requires_initially_clean_staging: true, requires_exclusive_staging: true, automatic_clean_check: false, remote_staging_inspection: false, remote_staging_discard: false, remote_staging_lock: false, notice: "clean staging required", quarantine_notice: "quarantine", operator_action: "stop uploads" }); return json({ items: [], total: 0, offset: 0, limit: 50 }); })); });
afterEach(() => vi.unstubAllGlobals());

describe("Deploy page", () => {
  it("keeps dated archives, shows desired versus observed status, never colors offline follower success, and confirms rollback", async () => { const ui = mount(host()); await flushPromises(); await flushPromises();
    expect(ui.text()).toContain("2026-10-18T17:00:00Z"); expect(ui.text()).toContain("Desired new"); expect(ui.text()).toContain("Observed unverified"); expect(ui.text()).toContain("Follower");
    const offline = ui.get('[data-device-status="follower"]'); expect(offline.classes()).not.toContain("studio-status-success");
    await ui.get('[data-action="rollback-old"]').trigger("click"); expect(ui.get('[role="dialog"]').text()).toContain("Rollback"); expect(ui.text()).toContain("new");
    await ui.get('[data-action="cancel-rollback"]').trigger("click"); expect(ui.find('[role="dialog"]').exists()).toBe(false);
  });
});
