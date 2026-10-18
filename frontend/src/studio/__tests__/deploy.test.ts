import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { provide } from "vue";
import DeployPage from "../pages/DeployPage.vue";
import { createWorkspace, workspaceKey, type Workspace } from "../workspace";
import { useStudioRoutes } from "../routes";

const json = (data: unknown) => new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
let workspace: Workspace;
function host() { return { components: { DeployPage }, setup() { workspace = createWorkspace(useStudioRoutes()); provide(workspaceKey, workspace); }, template: "<DeployPage />" }; }
const version = (id: string, word = "a") => ({ id, word_id: word, model_id: "cedar", run_id: "run", trained_at: "2026-10-18T17:00:00Z", path: "/archive", fingerprint: id, checksums: { "cedar.tflite": "abc" }, metrics: { recall: 0.91 } });
const publication = (word: string, state = "published") => ({ word_id: word, device_id: "leader", desired_version: "new", revision: 2, state, attempts: 1, next_retry: null, manifest_state: "verified", refresh_state: "acknowledged", runtime_state: "unverified", error_code: null, updated_at: "", cache_effect: "" });
let actionSignal: AbortSignal | undefined;
let resolveAction: ((response: Response) => void) | undefined;
let deviceRequests: number;

beforeEach(() => {
  history.replaceState(null, "", "#/deploy?word=a");
  actionSignal = undefined;
  resolveAction = undefined;
  deviceRequests = 0;
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    const path = new URL(url, "http://localhost").pathname;
    if (path === "/api/studio/wakewords") return json({ items: [{ id: "a", phrase: "Cedar", language: "en", model_id: "cedar", created_at: "", updated_at: "" }, { id: "b", phrase: "Birch", language: "en", model_id: "birch", created_at: "", updated_at: "" }], total: 2, offset: 0, limit: 100 });
    if (path.endsWith("/wakewords/a") || path.endsWith("/wakewords/b")) return json({ id: path.endsWith("/a") ? "a" : "b", phrase: "Cedar", language: "en", model_id: "cedar", created_at: "", updated_at: "" });
    if (path.endsWith("/queue")) return json({ items: [], total: 0, offset: 0, limit: 1 });
    if (path === "/api/studio/schedules") return json([]);
    if (path.endsWith("/models")) return json({ items: [version("new", path.includes("/b/") ? "b" : "a"), version("old", path.includes("/b/") ? "b" : "a")], total: 2, offset: 0, limit: 50 });
    if (path.endsWith("/deployment/status")) return json([publication(path.includes("/b/") ? "b" : "a")]);
    if (path === "/api/studio/devices") { deviceRequests += 1; return json([{ id: "leader", url: "http://leader", role: "leader", active: true, leader_id: null, credentials_status: "ready", profile_id: null, model_eligible: true }, { id: "follower", url: "http://follower", role: "follower", active: true, leader_id: "leader", credentials_status: "ready", profile_id: "voice", model_eligible: true }]); }
    if (path === "/api/studio/deployment/capabilities") return json({ requires_initially_clean_staging: true, requires_exclusive_staging: true, automatic_clean_check: false, remote_staging_inspection: false, remote_staging_discard: false, remote_staging_lock: false, notice: "clean staging required", quarantine_notice: "Unexpected accepted models quarantine this target until an operator resolves staging.", operator_action: "stop uploads" });
    if (path.endsWith("/deployment/publish") || path.endsWith("/deployment/rollback")) {
      actionSignal = init?.signal ?? undefined;
      return new Promise<Response>(resolve => { resolveAction = resolve; });
    }
    return json({ items: [], total: 0, offset: 0, limit: 50 });
  }));
});
afterEach(() => vi.unstubAllGlobals());

describe("Deploy page", () => {
  it("uses the shared registry once, retains dated archives, shows quarantine guidance, and does not mark runtime-unverified delivery successful", async () => {
    const ui = mount(host());
    await flushPromises(); await flushPromises();

    expect(deviceRequests).toBe(1);
    expect(ui.text()).toContain("2026-10-18T17:00:00Z");
    expect(ui.text()).toContain("Desired new");
    expect(ui.text()).toContain("Observed unverified");
    expect(ui.text()).toContain("Follower");
    expect(ui.text()).toContain("Unexpected accepted models quarantine this target");
    const leader = ui.get('[data-device-status="leader"]');
    expect(leader.get(".studio-status").classes()).not.toContain("studio-status-success");
    await ui.get('[data-action="rollback-old"]').trigger("click");
    expect(ui.get('[role="dialog"]').text()).toContain("Rollback");
    expect(ui.text()).toContain("new");
    await ui.get('[data-action="cancel-rollback"]').trigger("click");
    expect(ui.find('[role="dialog"]').exists()).toBe(false);
    ui.unmount();
  });

  it.each(["publish", "rollback"] as const)("aborts and ignores a pending %s action after a workspace switch", async action => {
    const ui = mount(host());
    await flushPromises(); await flushPromises();
    if (action === "publish") await ui.get('[data-version-id="new"] button').trigger("click");
    else {
      await ui.get('[data-action="rollback-old"]').trigger("click");
      await ui.get('[role="dialog"] button').trigger("click");
    }
    await flushPromises();
    expect(actionSignal).toBeDefined();

    workspace.selectedId.value = "b";
    await flushPromises(); await flushPromises();
    expect(actionSignal?.aborted).toBe(true);
    resolveAction?.(json([publication("a")]));
    await flushPromises();
    expect(ui.text()).not.toContain("Publication requested for registered leader");
    expect(ui.text()).not.toContain("Rollback to archive old requested");
    expect(ui.text()).toContain("Desired new");
    ui.unmount();
  });

  it("aborts a pending publication when unmounted", async () => {
    const ui = mount(host());
    await flushPromises(); await flushPromises();
    await ui.get('[data-version-id="new"] button').trigger("click");
    await flushPromises();
    ui.unmount();
    expect(actionSignal?.aborted).toBe(true);
    resolveAction?.(json([publication("a")]));
  });
});
