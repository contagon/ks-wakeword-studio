import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { provide } from "vue";
import DeployPage from "../pages/DeployPage.vue";
import { createWorkspace, workspaceKey, type Workspace } from "../workspace";
import { useStudioRoutes } from "../routes";

const json = (data: unknown) => new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
let workspace: Workspace;
function host() { return { components: { DeployPage }, setup() { workspace = createWorkspace(useStudioRoutes()); provide(workspaceKey, workspace); }, template: "<DeployPage />" }; }
const version = (id: string, word = "a") => ({ id, word_id: word, model_id: "cedar", run_id: "run", run_number: id === 'new' ? 8 : 3, trained_at: "2026-10-18T17:00:00Z", path: "/archive", fingerprint: id, checksums: { "cedar.tflite": "abc" }, metrics: { recall: 0.91 } });
const publication = (word: string, state = "published") => ({ word_id: word, device_id: "leader", desired_version: "new", run_number: 8, revision: 2, state, attempts: 1, next_retry: null, manifest_state: "verified", refresh_state: "acknowledged", runtime_state: "unverified", error_code: null, updated_at: "", cache_effect: "" });
let actionSignal: AbortSignal | undefined;
let resolveAction: ((response: Response) => void) | undefined;
let deviceRequests: number;
let legacy = false;

beforeEach(() => {
  history.replaceState(null, "", "#/deploy?word=a");
  actionSignal = undefined;
  resolveAction = undefined;
  deviceRequests = 0;
  legacy = false;
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    const path = new URL(url, "http://localhost").pathname;
    if (path === "/api/studio/wakewords") return json({ items: [{ id: "a", phrase: "Cedar", language: "en", model_id: "cedar", created_at: "", updated_at: "" }, { id: "b", phrase: "Birch", language: "en", model_id: "birch", created_at: "", updated_at: "" }], total: 2, offset: 0, limit: 100 });
    if (path.endsWith("/wakewords/a") || path.endsWith("/wakewords/b")) return json({ id: path.endsWith("/a") ? "a" : "b", phrase: "Cedar", language: "en", model_id: "cedar", created_at: "", updated_at: "" });
    if (path.endsWith("/queue")) return json({ items: [], total: 0, offset: 0, limit: 1 });
    if (path === "/api/studio/schedules") return json([]);
    if (path.endsWith("/models")) return json({ items: [{ ...version("new", path.includes("/b/") ? "b" : "a"), ...(legacy ? { origin: 'legacy', validation_state: 'unvalidated' } : {}) }, version("old", path.includes("/b/") ? "b" : "a")], total: 2, offset: 0, limit: 50 });
    if (path.endsWith("/deployment/status")) return json([publication(path.includes("/b/") ? "b" : "a")]);
    if (path === "/api/studio/devices") { deviceRequests += 1; return json([{ id: "leader", url: "http://leader", role: "leader", active: true, leader_id: null, credentials_status: "ready", profile_id: null, model_eligible: true }, { id: "follower", url: "http://follower", role: "follower", active: true, leader_id: "leader", credentials_status: "ready", profile_id: "voice", model_eligible: true }]); }
    if (path === "/api/studio/deployment/capabilities") return json({ requires_initially_clean_staging: true, requires_exclusive_staging: true, automatic_clean_check: false, remote_staging_inspection: false, remote_staging_discard: false, remote_staging_lock: false, notice: "clean staging required", quarantine_notice: "Unexpected accepted models quarantine this target until an operator resolves staging.", operator_action: "stop uploads" });
    if (path.endsWith("/deployment/publish")) {
      actionSignal = init?.signal ?? undefined;
      return new Promise<Response>(resolve => { resolveAction = resolve; });
    }
    return json({ items: [], total: 0, offset: 0, limit: 50 });
  }));
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("Deploy page", () => {
  it("uses the shared registry once, retains dated archives, and does not mark runtime-unverified delivery successful", async () => {
    vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-10-21T17:00:00Z'));
    const ui = mount(host());
    await flushPromises(); await flushPromises();

    expect(deviceRequests).toBe(1);
    const archive = ui.get('[data-version-id="new"]');
    expect(archive.get('strong time').attributes('datetime')).toBe('2026-10-18T17:00:00Z');
    expect(archive.get('strong time').text()).toContain('2026');
    expect(archive.get('strong time').text()).toContain('3 days ago');
    expect(archive.get('strong time').attributes('title')).toContain('2026');
    expect(archive.text()).not.toContain('Run run');
    expect(archive.get('strong').text()).not.toContain('new');
    expect(archive.get('a').text()).toBe('Download');
    expect(archive.get('a').attributes('href')).toBe('/api/studio/wakewords/a/models/new/archive');
    expect(archive.get('a').classes()).toContain('studio-button');
    expect(archive.get('[data-run-number]').text()).toBe('Run #8');
    expect(ui.get('[data-version-id="old"] [data-run-number]').text()).toBe('Run #3');
    expect(ui.text()).not.toContain('Desired new');
    expect(ui.text()).not.toContain('Observed unverified');
    const leader = ui.get('[data-device-status="leader"]');
    expect(leader.text()).not.toContain('Direct leader/standalone target');
    expect(leader.text()).not.toContain('Indirect via');
    expect(leader.get('.studio-status').element.nextElementSibling?.textContent).toBe('Run #8');
    expect(leader.text()).toContain('http://leader');
    expect(leader.get(".studio-status").classes()).not.toContain("studio-status-success");
    for (const archive of ui.findAll('[data-version-id]')) {
      expect(archive.findAll('button').map(button => button.text())).toEqual(['Publish']);
    }
    ui.unmount();
  });

  it('keeps unvalidated legacy archives downloadable and explains explicit engine validation before publication', async () => {
    legacy = true;
    const ui = mount(host()); await flushPromises(); await flushPromises();
    const archive = ui.get('[data-version-id="new"]');
    expect(archive.text()).toContain('Legacy import');
    expect(archive.text()).toContain('unvalidated');
    expect(archive.text()).toContain('TensorFlow');
    expect(archive.get('a').text()).toBe('Download');
    expect(archive.get('button').text()).toBe('Validate and publish');
    ui.unmount();
  });

  it("aborts and ignores a pending publication after a workspace switch", async () => {
    const ui = mount(host());
    await flushPromises(); await flushPromises();
    await ui.get('[data-version-id="new"] button').trigger("click");
    await flushPromises();
    expect(actionSignal).toBeDefined();

    workspace.selectedId.value = "b";
    await flushPromises(); await flushPromises();
    expect(actionSignal?.aborted).toBe(true);
    resolveAction?.(json([publication("a")]));
    await flushPromises();
    expect(ui.text()).not.toContain("Publication requested for registered leader");
    expect(ui.get('[data-device-status="leader"] [data-run-number]').text()).toBe('Run #8');
    ui.unmount();
  });

  it('publishes an older archive directly without a rollback dialog', async () => {
    const ui = mount(host()); await flushPromises(); await flushPromises();
    await ui.get('[data-version-id="old"] button').trigger('click');
    expect(ui.find('[role="dialog"]').exists()).toBe(false);
    expect(fetch).toHaveBeenCalledWith('/api/studio/wakewords/a/deployment/publish', expect.objectContaining({ body: JSON.stringify({ version_id: 'old' }) }));
    resolveAction?.(json([publication('a')]));
    await flushPromises();
    expect(ui.get('[role="status"]').text()).toContain('Publication requested');
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
  it("omits the before-publishing section and automation link while retaining kiosk navigation", async () => {
    const ui = mount(host()); await flushPromises(); await flushPromises();
    expect(ui.find('[data-staging-notice]').exists()).toBe(false);
    expect(ui.text()).not.toContain('Before publishing');
    expect(ui.find('a[href*="automate"]').exists()).toBe(false);
    expect(ui.get('a[href*="kiosks"]').text()).toContain('Manage kiosks');
    ui.unmount();
  });
});
