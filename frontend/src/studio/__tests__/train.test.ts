import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { provide } from "vue";
import TrainPage from "../pages/TrainPage.vue";
import JobConsole from "../components/JobConsole.vue";
import { createWorkspace, workspaceKey, type Workspace } from "../workspace";
import { useStudioRoutes } from "../routes";

const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
const words = [{ id: "a", phrase: "Hey Cedar", language: "en", model_id: "cedar", created_at: "", updated_at: "" }, { id: "b", phrase: "Okay Maple", language: "en", model_id: "maple", created_at: "", updated_at: "" }];
const train = (status: "queued" | "complete" | "failed" | "cancelled", result: { run_id: string; skipped: true } | { run_id: string; version_id: string } | Record<string, never> = {}) => ({ id: "train-1", kind: "train", word_id: "a", resource: "gpu", payload: { trigger: "scheduled" }, status, created_at: "", started_at: null, finished_at: status === "queued" ? null : "", result });
let workspace: Workspace;
function host() { return { components: { TrainPage }, setup() { workspace = createWorkspace(useStudioRoutes()); provide(workspaceKey, workspace); }, template: "<TrainPage />" }; }

beforeEach(() => {
  history.replaceState(null, "", "#/train?word=a"); vi.useFakeTimers();
  vi.stubGlobal("fetch", vi.fn(async (input: string, init?: RequestInit) => {
    const url = new URL(input, "http://localhost"); const path = url.pathname;
    if (path === "/api/studio/wakewords") return json({ items: words, total: 2, offset: 0, limit: 100 }); if (path.match(/\/wakewords\/[ab]$/)) return json(words.find(word => path.endsWith(word.id)));
    if (path.endsWith("/queue")) return json({ items: [], total: 0, offset: 0, limit: 1 }); if (path.endsWith("/models") && !path.includes("training")) return json({ items: [], total: 0, offset: 0, limit: 50 });
    if (path === "/api/studio/schedules") return json([{ scope: "train:a", cron: "0 2 * * *", timezone: "UTC", enabled: true, next_run_at: "2026-11-01T02:00:00Z" }]);
    const match = path.match(/^\/api\/studio\/wakewords\/([ab])\/training\/(counts|settings|jobs|runs)$/);
    if (match?.[2] === "counts") return json(match[1] === "a" ? { positive: 3, negative: 4, artificial: 5 } : { positive: 1, negative: 2, artificial: 0 });
    if (match?.[2] === "settings") return init?.method === "PUT" ? json(JSON.parse(String(init.body))) : json({ training_steps: 40000, train_openwakeword: false });
    if (match?.[2] === "jobs") return json(train("queued"));
    if (match?.[2] === "runs") return json({ items: [train("complete", { run_id: "train-1", skipped: true }), train("failed")], total: 2, offset: 0, limit: 50 });
    if (path === "/api/studio/jobs/train-1") return json(train("queued")); if (path === "/api/studio/jobs/train-1/logs") return json({ text: "0123456789".repeat(1000) }); if (path === "/api/studio/jobs/train-1/cancel") return json(train("cancelled"));
    return json({ detail: `Unhandled ${path}` }, 500);
  }));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("TrainPage", () => {
  it("shows only effective reviewed/selected inputs, saves valid CLI settings, exposes optional OWW, manual queued state, cancellation and visible scheduled skips", async () => {
    const ui = mount(host()); await flushPromises(); await flushPromises();
    expect(ui.text()).toContain("3 reviewed positives"); expect(ui.text()).toContain("4 reviewed negatives"); expect(ui.text()).toContain("5 selected artificial"); expect(ui.text()).not.toContain("unreviewed");
    expect((ui.get('input[name="train-openwakeword"]').element as HTMLInputElement).checked).toBe(false);
    await ui.get('input[name="training-steps"]').setValue("0"); await ui.get('[data-action="save-training-settings"]').trigger("click"); expect(ui.get('[role="alert"]').text()).toContain("between");
    await ui.get('input[name="training-steps"]').setValue("50000"); await ui.get('input[name="train-openwakeword"]').setValue(true); await ui.get('[data-action="save-training-settings"]').trigger("click"); await flushPromises();
    expect(ui.text()).toContain("openWakeWord companion");
    await ui.get('[data-action="start-training"]').trigger("click"); await flushPromises(); expect(ui.get('[data-job-id="train-1"]').text()).toContain("queued");
    await ui.get('[data-action="cancel-job"]').trigger("click"); await flushPromises(); expect(ui.get('[data-job-id="train-1"]').text()).toContain("cancelled");
    expect(ui.text()).toContain("Skipped because inputs and configuration were unchanged"); expect(ui.text()).toContain("failed");
    ui.unmount();
  });

  it("uses a word-scoped cron editor and drops old counts/runs on workspace changes", async () => {
    const ui = mount(host()); await flushPromises(); await flushPromises();
    expect(ui.get('[data-cron-editor]').attributes("data-scope")).toBe("train:a");
    workspace.selectedId.value = "b"; await flushPromises(); await flushPromises();
    expect(ui.get('[data-cron-editor]').attributes("data-scope")).toBe("train:b"); expect(ui.text()).toContain("1 reviewed positives"); expect(ui.text()).not.toContain("5 selected artificial");
    ui.unmount();
  });
});

describe("JobConsole", () => {
  it("polls bounded real state/log tails and stops on terminal state and unmount", async () => {
    const ui = mount(JobConsole, { props: { jobId: "train-1" } }); await flushPromises();
    expect(ui.text()).toContain("queued"); expect(ui.text()).toContain("…");
    const initial = vi.mocked(fetch).mock.calls.length; await vi.advanceTimersByTimeAsync(2000); await flushPromises(); expect(vi.mocked(fetch).mock.calls.length).toBeGreaterThan(initial);
    await ui.get('[data-action="cancel-job"]').trigger("click"); await flushPromises(); const stopped = vi.mocked(fetch).mock.calls.length;
    await vi.advanceTimersByTimeAsync(4000); expect(vi.mocked(fetch).mock.calls.length).toBe(stopped);
    ui.unmount();
  });
});
