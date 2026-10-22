import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { provide } from "vue";
import TrainPage from "../pages/TrainPage.vue";
import { createWorkspace, workspaceKey, type Workspace } from "../workspace";
import { useStudioRoutes } from "../routes";
import { createJobQueue, jobQueueKey, type JobQueue } from "../jobs";
import { augmentationCatalog } from "./augmentationFixture";
import { visibleText } from "./fakeStudio";

const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
const words = [
  { id: "a", phrase: "Hey Cedar", language: "en", model_id: "cedar", created_at: "", updated_at: "" },
  { id: "b", phrase: "Okay Maple", language: "en", model_id: "maple", created_at: "", updated_at: "" },
];
const train = (
  status: "queued" | "complete" | "failed" | "cancelled",
  result: { run_id: string; skipped: true } | { run_id: string; version_id: string } | Record<string, never> = {},
) => ({
  id: "train-1",
  kind: "train",
  word_id: "a",
  resource: "gpu",
  payload: { trigger: "scheduled" },
  status,
  created_at: "",
  started_at: null,
  finished_at: status === "queued" ? null : "",
  result,
});
let workspace: Workspace;
let queue: JobQueue;
let delayTrainStart = false;
let resolveTrainStart: ((response: Response) => void) | undefined;
let delayTrainingSave = false;
let resolveTrainingSave: ((response: Response) => void) | undefined;
function resolveDeferred(resolver: ((response: Response) => void) | undefined, response: Response): void {
  expect(resolver).toBeTypeOf("function");
  if (resolver) resolver(response);
}
function host() {
  return {
    components: { TrainPage },
    setup() {
      workspace = createWorkspace(useStudioRoutes());
      provide(workspaceKey, workspace);
      queue = createJobQueue();
      provide(jobQueueKey, queue);
    },
    template: "<TrainPage />",
  };
}

beforeEach(() => {
  delayTrainStart = false;
  resolveTrainStart = undefined;
  delayTrainingSave = false;
  resolveTrainingSave = undefined;
  history.replaceState(null, "", "#/train?word=a");
  vi.useFakeTimers();
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string, init?: RequestInit) => {
      const url = new URL(input, "http://localhost");
      const path = url.pathname;
      if (path === "/api/studio/jobs") return json({ items: [], total: 0, offset: 0, limit: 100 });
      if (path.endsWith("/augmentation/datasets")) return json(augmentationCatalog());
      if (path === "/api/studio/wakewords") return json({ items: words, total: 2, offset: 0, limit: 100 });
      if (path.match(/\/wakewords\/[ab]$/)) return json(words.find((word) => path.endsWith(word.id)));
      if (path.endsWith("/queue")) return json({ items: [], total: 0, offset: 0, limit: 1 });
      if (path.endsWith("/models") && !path.includes("training"))
        return json({ items: [], total: 0, offset: 0, limit: 50 });
      if (path === "/api/studio/schedules")
        return json([
          { scope: "train:a", cron: "0 2 * * *", timezone: "UTC", enabled: true, next_run_at: "2026-11-01T02:00:00Z" },
        ]);
      if (path.match(/^\/api\/studio\/wakewords\/[ab]\/datasets$/))
        return json({
          items: [
            {
              id: "mww-features",
              name: "MWW features",
              description: "MWW tensors",
              source: "catalog",
              license: "CC-BY",
              representation: "features",
              adapter: "mww_mmap",
              purpose: "classifier_negative",
              split: "train",
              download_bytes: 1,
              installed_bytes: 1,
              fingerprint: null,
              selected: true,
              status: "installed",
              job_id: null,
              error_code: null,
            },
            {
              id: "dinner-party",
              name: "dinner_party_eval",
              description: "Evaluation features",
              source: "catalog",
              license: "CC-BY",
              representation: "features",
              adapter: "mww_mmap",
              purpose: "classifier_negative",
              split: "evaluation",
              download_bytes: 1,
              installed_bytes: 1,
              fingerprint: null,
              selected: true,
              status: "installed",
              job_id: null,
              error_code: null,
            },
          ],
          total: 2,
          offset: 0,
          limit: 100,
        });
      const match = path.match(/^\/api\/studio\/wakewords\/([ab])\/training\/(counts|settings|jobs|runs)$/);
      if (match?.[2] === "counts")
        return json(
          match[1] === "a" ? { positive: 3, negative: 4, artificial: 5 } : { positive: 1, negative: 2, artificial: 0 },
        );
      if (match?.[2] === "settings") {
        const response = init?.method === "PUT" ? json(JSON.parse(String(init.body))) : json({ training_steps: 40000 });
        return init?.method === "PUT" && delayTrainingSave
          ? new Promise<Response>((resolve) => {
              resolveTrainingSave = resolve;
            })
          : response;
      }
      if (match?.[2] === "jobs") {
        const response = json(train("queued"));
        return delayTrainStart
          ? new Promise<Response>((resolve) => {
              resolveTrainStart = resolve;
            })
          : response;
      }
      if (match?.[2] === "runs")
        return json({
          items:
            match[1] === "a"
              ? [
                  { ...train("complete", { run_id: "train-skipped", skipped: true }), id: "train-skipped" },
                  { ...train("failed"), id: "train-failed" },
                ]
              : [],
          total: match[1] === "a" ? 2 : 0,
          offset: 0,
          limit: 50,
        });
      if (path === "/api/studio/jobs/train-1") return json(train("queued"));
      if (path === "/api/studio/jobs/train-1/logs") return json({ text: "0123456789".repeat(1000) });
      if (path === "/api/studio/jobs/train-1/cancel") return json(train("cancelled"));
      return json({ detail: `Unhandled ${path}` }, 500);
    }),
  );
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("TrainPage", () => {
  it("keeps training busy through submission and queued work, then releases on failure", async () => {
    const ui = mount(host());
    await flushPromises();
    delayTrainStart = true;
    const button = ui.get('[data-action="start-training"]');
    await button.trigger("click");
    await flushPromises();
    expect(button.attributes("aria-busy")).toBe("true");
    resolveDeferred(resolveTrainStart, json(train("queued")));
    await flushPromises();
    expect(queue.open.value).toBe(false);
    expect(button.element).toHaveProperty("disabled", true);
    expect(button.attributes("aria-busy")).toBe("true");
    await ui
      .findAll("button")
      .find((button) => button.text() === "View training in queue")!
      .trigger("click");
    await flushPromises();
    expect(queue.open.value).toBe(true);
    queue.track({ ...train("failed"), kind: "train", resource: "gpu", payload: {} });
    await flushPromises();
    expect(button.element).toHaveProperty("disabled", false);
    expect(button.attributes("aria-busy")).toBe("false");
    ui.unmount();
  });
  it("reflects restored active training only in its matching workspace", async () => {
    const ui = mount(host());
    await flushPromises();
    queue.track({ ...train("queued"), kind: "train", resource: "gpu", payload: {} });
    await flushPromises();
    expect(ui.get('[data-action="start-training"]').attributes("aria-busy")).toBe("true");
    workspace.selectedId.value = "b";
    await flushPromises();
    expect(ui.get('[data-action="start-training"]').element).toHaveProperty("disabled", false);
    ui.unmount();
  });
  it("blocks training until augmentation datasets are installed and links to Downloaded", async () => {
    const transport = vi.mocked(fetch).getMockImplementation()!;
    vi.mocked(fetch).mockImplementation((input, init) =>
      String(input).includes("/augmentation/datasets")
        ? Promise.resolve(json(augmentationCatalog(false)))
        : transport(input, init),
    );
    const ui = mount(host());
    await flushPromises();
    expect(ui.find("[data-training-prerequisites]").exists()).toBe(false);
    expect(ui.text()).not.toContain("Training prerequisites");
    expect((ui.get('[data-action="start-training"]').element as HTMLButtonElement).disabled).toBe(true);
    expect(ui.get("[data-training-blocked]").text()).toContain("MIT room impulse responses");
    expect(ui.get("[data-training-blocked] a").attributes("href")).toBe("#/online-datasets?word=a");
    ui.unmount();
  });
  it("hides the blocked note when every selected dataset is installed", async () => {
    const ui = mount(host());
    await flushPromises();
    await flushPromises();
    expect(ui.find("[data-training-blocked]").exists()).toBe(false);
    ui.unmount();
  });
  it("lists runs by run number and a readable local timestamp instead of job ids", async () => {
    vi.setSystemTime(new Date("2026-10-21T12:00:00Z"));
    const transport = vi.mocked(fetch).getMockImplementation()!;
    vi.mocked(fetch).mockImplementation((input, init) =>
      String(input).includes("/a/training/runs")
        ? Promise.resolve(
            json({
              items: [
                {
                  ...train("complete"),
                  id: "b".repeat(32),
                  run_number: 7,
                  created_at: "2026-10-21T09:00:00Z",
                  started_at: "2026-10-21T10:00:00Z",
                },
              ],
              total: 1,
              offset: 0,
              limit: 50,
            }),
          )
        : transport(input, init),
    );
    const ui = mount(host());
    await flushPromises();
    await flushPromises();
    const run = ui.get(".studio-history");
    expect(run.get("[data-run-number]").text()).toBe("Run #7");
    expect(run.get("[data-run-time]").text()).toBe(
      new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
        new Date("2026-10-21T10:00:00Z"),
      ),
    );
    expect(run.get("[data-run-time]").text()).toContain("2026");
    expect(run.text()).not.toContain("b".repeat(32));
    ui.unmount();
  });
  it.each([0, 2, 101])(
    "counts %s selected training datasets across pages without counting evaluation inputs",
    async (count) => {
      const transport = vi.mocked(fetch).getMockImplementation()!;
      vi.mocked(fetch).mockImplementation((input, init) => {
        const url = new URL(String(input), "http://localhost");
        if (url.pathname.endsWith("/datasets") && !url.pathname.includes("/augmentation/")) {
          const items = Array.from({ length: count + 1 }, (_, i) => ({
            id: `negative-${i}`,
            name: `Negative ${i}`,
            selected: true,
            purpose: "classifier_negative",
            split: i === count ? "evaluation" : "train",
            representation: "features",
            adapter: "mww_mmap",
          }));
          const offset = Number(url.searchParams.get("offset") ?? 0);
          return Promise.resolve(
            json({ items: items.slice(offset, offset + 100), total: items.length, offset, limit: 100 }),
          );
        }
        return transport(input, init);
      });
      const ui = mount(host());
      await flushPromises();
      await flushPromises();
      expect(ui.get("[data-negative-datasets-count]").text()).toBe(`${count} selected negative datasets`);
      expect(visibleText(ui.text())).toContain("1 evaluation-only dataset");
      expect(visibleText(ui.text())).toContain("4 reviewed negatives");
      ui.unmount();
    },
  );

  it("does not render stale dataset counts after changing workspaces", async () => {
    const transport = vi.mocked(fetch).getMockImplementation()!;
    let finish!: (response: Response) => void;
    vi.mocked(fetch).mockImplementation((input, init) =>
      String(input).includes("/a/datasets")
        ? new Promise<Response>((resolve) => {
            finish = resolve;
          })
        : transport(input, init),
    );
    const ui = mount(host());
    await flushPromises();
    workspace.selectedId.value = "b";
    await flushPromises();
    finish(json({ items: [], total: 0, offset: 0, limit: 100 }));
    await flushPromises();
    expect(ui.get("[data-negative-datasets-count]").text()).toBe("1 selected negative datasets");
    ui.unmount();
  });
  it("reconciles stale initial history when the queue completes a run before counts load", async () => {
    const transport = vi.mocked(fetch).getMockImplementation()!;
    let finish!: (response: Response) => void;
    vi.mocked(fetch).mockImplementation((input, init) => {
      if (String(input).endsWith("/a/training/counts"))
        return new Promise<Response>((resolve) => {
          finish = resolve;
        });
      if (String(input).includes("/a/training/runs"))
        return Promise.resolve(json({ items: [train("queued")], total: 1, offset: 0, limit: 50 }));
      return transport(input, init);
    });
    const ui = mount(host());
    await flushPromises();
    queue.track({
      ...train("complete", { run_id: "train-1", version_id: "version-1" }),
      kind: "train",
      resource: "gpu",
      payload: {},
    });
    await flushPromises();
    finish(json({ positive: 3, negative: 4, artificial: 5 }));
    await flushPromises();
    expect(ui.get(".studio-history .studio-status").text()).toBe("complete");
    ui.unmount();
  });
  it("updates run history after completion with the drawer closed without losing unsaved parameters", async () => {
    const ui = mount(host());
    await flushPromises();
    await ui.get('input[name="training-steps"]').setValue("50001");
    await ui.get('[data-action="start-training"]').trigger("click");
    await flushPromises();
    queue.open.value = false;
    queue.track({
      ...train("complete", { run_id: "train-1", version_id: "version-1" }),
      kind: "train",
      resource: "gpu",
      payload: { trigger: "manual" },
    });
    await flushPromises();
    expect(ui.text()).toContain("complete");
    expect(ui.find("[data-job-id]").exists()).toBe(false);
    expect((ui.get('input[name="training-steps"]').element as HTMLInputElement).value).toBe("50001");
    ui.unmount();
  });
  it("shows effective inputs, MWW-only settings, queued state, cancellation and scheduled skips", async () => {
    const ui = mount(host());
    await flushPromises();
    await flushPromises();
    expect(ui.text()).toContain("3 reviewed positives");
    expect(ui.text()).toContain("4 reviewed negatives");
    expect(ui.text()).toContain("5 selected artificial");
    expect(ui.text()).not.toContain("unreviewed");
    expect(
      ui
        .get("[data-effective-counts]")
        .findAll("p")
        .map((item) => item.text()),
    ).toEqual([
      "3 reviewed positives",
      "4 reviewed negatives",
      "5 selected artificial",
      "1 selected negative datasets",
    ]);
    expect(ui.find("[data-dataset-compatibility]").exists()).toBe(false);
    expect(ui.text()).not.toContain("classifier representations");
    expect(ui.find("[data-cron-editor]").exists()).toBe(false);
    expect(ui.find('a[href*="automate"]').exists()).toBe(false);
    expect(ui.text()).not.toContain("Automatic training");
    expect(vi.mocked(fetch).mock.calls.some(([input]) => String(input).endsWith("/schedules"))).toBe(false);
    expect(ui.find('input[name="train-openwakeword"]').exists()).toBe(false);
    expect(ui.text()).not.toContain("openWakeWord");
    await ui.get('input[name="training-steps"]').setValue("0");
    await ui.get('[data-action="save-training-settings"]').trigger("click");
    expect(ui.get('[role="alert"]').text()).toContain("between");
    await ui.get('input[name="training-steps"]').setValue("50000");
    await ui.get('[data-action="save-training-settings"]').trigger("click");
    await flushPromises();
    const saveCall = vi
      .mocked(fetch)
      .mock.calls.find(([, init]) => init?.method === "PUT" && String(init.body).includes("50000"));
    expect(JSON.parse(String(saveCall?.[1]?.body))).toEqual({ training_steps: 50000 });
    await ui.get('[data-action="start-training"]').trigger("click");
    await flushPromises();
    expect(queue.jobs.value["train-1"]?.status).toBe("queued");
    expect(queue.open.value).toBe(false);
    expect(ui.find("[data-job-id]").exists()).toBe(false);
    await queue.cancel("train-1");
    await flushPromises();
    expect(queue.jobs.value["train-1"]?.status).toBe("cancelled");
    expect(ui.text()).toContain("Skipped because inputs and configuration were unchanged");
    expect(ui.text()).toContain("failed");
    ui.unmount();
  });

  it("drops old counts/runs on workspace changes without showing automatic training", async () => {
    const ui = mount(host());
    await flushPromises();
    await flushPromises();
    expect(ui.find('a[href*="automate"]').exists()).toBe(false);
    workspace.selectedId.value = "b";
    await flushPromises();
    await flushPromises();
    expect(ui.find('a[href*="automate"]').exists()).toBe(false);
    expect(ui.text()).toContain("1 reviewed positives");
    expect(ui.text()).not.toContain("5 selected artificial");
    ui.unmount();
  });
});

it("does not attach a delayed training start to a replacement workspace", async () => {
  const ui = mount(host());
  await flushPromises();
  await flushPromises();
  delayTrainStart = true;
  await ui.get('[data-action="start-training"]').trigger("click");
  await flushPromises();
  workspace.selectedId.value = "b";
  await flushPromises();
  expect(resolveTrainStart).toBeTypeOf("function");
  resolveTrainStart?.(json(train("queued")));
  await flushPromises();
  await flushPromises();
  expect(ui.find('[data-job-id="train-1"]').exists()).toBe(false);
  ui.unmount();
});

it("clears a delayed prior-workspace settings save without leaving the replacement busy", async () => {
  const ui = mount(host());
  await flushPromises();
  await flushPromises();
  delayTrainingSave = true;
  await ui.get('[data-action="save-training-settings"]').trigger("click");
  await flushPromises();
  workspace.selectedId.value = "b";
  await flushPromises();
  expect(resolveTrainingSave).toBeTypeOf("function");
  resolveTrainingSave?.(json({ training_steps: 40000 }));
  await flushPromises();
  expect((ui.get('[data-action="save-training-settings"]').element as HTMLButtonElement).disabled).toBe(false);
  ui.unmount();
});

it("settles independently launched save and start mutations in either completion order", async () => {
  async function startBoth(ui: ReturnType<typeof mount>): Promise<void> {
    delayTrainingSave = true;
    delayTrainStart = true;
    await ui.get('[data-action="save-training-settings"]').trigger("click");
    await flushPromises();
    await ui.get('[data-action="start-training"]').trigger("click");
    await flushPromises();
    expect(resolveTrainingSave).toBeTypeOf("function");
    expect(resolveTrainStart).toBeTypeOf("function");
  }
  function expectSettled(ui: ReturnType<typeof mount>): void {
    expect((ui.get('[data-action="save-training-settings"]').element as HTMLButtonElement).disabled).toBe(false);
    expect((ui.get('[data-action="start-training"]').element as HTMLButtonElement).disabled).toBe(true);
    expect(queue.jobs.value["train-1"]?.status).toBe("queued");
    expect(ui.find("[data-job-id]").exists()).toBe(false);
  }

  let ui = mount(host());
  await flushPromises();
  await flushPromises();
  await startBoth(ui);
  resolveDeferred(resolveTrainingSave, json({ training_steps: 40000 }));
  await flushPromises();
  resolveDeferred(resolveTrainStart, json(train("queued")));
  await flushPromises();
  expectSettled(ui);
  ui.unmount();

  delayTrainingSave = false;
  resolveTrainingSave = undefined;
  delayTrainStart = false;
  resolveTrainStart = undefined;
  ui = mount(host());
  await flushPromises();
  await flushPromises();
  await startBoth(ui);
  resolveDeferred(resolveTrainStart, json(train("queued")));
  await flushPromises();
  resolveDeferred(resolveTrainingSave, json({ training_steps: 40000 }));
  await flushPromises();
  expectSettled(ui);
  ui.unmount();
});
