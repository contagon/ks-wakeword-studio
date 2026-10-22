import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { provide } from "vue";
import NegativeDatasetsPage from "../pages/NegativeDatasetsPage.vue";
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
const dataset = (index: number, selected = false) => ({
  id: `set-${index}`,
  name: `Corpus ${index}`,
  description: index === 150 ? "speech collection" : "negative classifier corpus",
  source: "Example source",
  license: "CC-BY",
  representation: "features",
  split: index === 151 ? "evaluation" : "train",
  adapter: "mww_mmap",
  purpose: "classifier_negative",
  download_bytes: 1000,
  installed_bytes: index === 0 ? 1000 : null,
  fingerprint: null,
  selected,
  status: index === 0 ? "installed" : index === 2 ? "running" : "available",
  job_id: index === 2 ? "download-2" : null,
  error_code: null,
});
const catalog = Array.from({ length: 200 }, (_, index) => dataset(index));
let workspace: Workspace;
let queue: JobQueue;
let selectedByWord: Record<string, Set<string>>;
let augmentationByWord: Record<string, string[]>;
let delayDatasetSave = false;
let resolveDatasetSave: ((response: Response) => void) | undefined;
let delayDownload = false;
let resolveDownload: ((response: Response) => void) | undefined;
function resolveDeferred(resolver: ((response: Response) => void) | undefined, response: Response): void {
  expect(resolver).toBeTypeOf("function");
  if (resolver) resolver(response);
}
function host() {
  return {
    components: { NegativeDatasetsPage },
    setup() {
      workspace = createWorkspace(useStudioRoutes());
      provide(workspaceKey, workspace);
      queue = createJobQueue();
      provide(jobQueueKey, queue);
    },
    template: "<NegativeDatasetsPage />",
  };
}

beforeEach(() => {
  selectedByWord = { a: new Set(["set-0"]), b: new Set(["set-1"]) };
  augmentationByWord = {
    a: ["mit_rirs_16k", "audioset_16k", "fma_16k", "chime_16k"],
    b: ["mit_rirs_16k", "audioset_16k", "fma_16k", "chime_16k"],
  };
  delayDatasetSave = false;
  resolveDatasetSave = undefined;
  delayDownload = false;
  resolveDownload = undefined;
  history.replaceState(null, "", "#/negative-datasets?word=a");
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string, init?: RequestInit) => {
      const url = new URL(input, "http://localhost");
      const path = url.pathname;
      if (path === "/api/studio/jobs") return json({ items: [], total: 0, offset: 0, limit: 100 });
      if (path === "/api/studio/augmentation/datasets") return json(augmentationCatalog(false));
      const augmentationMatch = path.match(/^\/api\/studio\/wakewords\/([ab])\/augmentation\/datasets$/);
      if (augmentationMatch) {
        const id = augmentationMatch[1];
        if (init?.method === "PUT") augmentationByWord[id] = JSON.parse(String(init.body)).dataset_ids;
        const catalog = augmentationCatalog(false);
        return json({
          ...catalog,
          items: catalog.items.map((row) => ({ ...row, selected: augmentationByWord[id].includes(row.id) })),
        });
      }
      if (path === "/api/studio/augmentation/datasets/mit_rirs_16k/download")
        return json(
          {
            id: "aug-1",
            kind: "download",
            word_id: null,
            resource: "download",
            payload: { augmentation_id: "mit_rirs_16k" },
            status: "queued",
            created_at: "",
            started_at: null,
            finished_at: null,
            result: {},
          },
          201,
        );
      if (path === "/api/studio/wakewords") return json({ items: words, total: 2, offset: 0, limit: 100 });
      if (path.match(/\/wakewords\/[ab]$/)) return json(words.find((word) => path.endsWith(word.id)));
      if (path.endsWith("/queue")) return json({ items: [], total: 0, offset: 0, limit: 1 });
      if (path.endsWith("/models")) return json({ items: [], total: 0, offset: 0, limit: 1 });
      if (path === "/api/studio/schedules") return json([]);
      const match = path.match(/^\/api\/studio\/wakewords\/([ab])\/datasets$/);
      if (match && init?.method === "PUT") {
        const body = JSON.parse(String(init.body)) as { dataset_ids: string[] };
        selectedByWord[match[1]] = new Set(body.dataset_ids);
        const response = json({ items: [], total: 0, offset: 0, limit: 50 });
        return delayDatasetSave
          ? new Promise<Response>((resolve) => {
              resolveDatasetSave = resolve;
            })
          : response;
      }
      if (match) {
        const search = url.searchParams.get("search") ?? "";
        const status = url.searchParams.get("status");
        const offset = Number(url.searchParams.get("offset") ?? 0);
        const limit = Number(url.searchParams.get("limit") ?? 50);
        const selected = selectedByWord[match[1]];
        const filtered = catalog
          .map((row) => ({ ...row, selected: selected.has(row.id) }))
          .filter(
            (row) =>
              (!search || `${row.name} ${row.description}`.toLowerCase().includes(search.toLowerCase())) &&
              (!status || (status === "selected" ? row.selected : row.status === status)),
          );
        return json({ items: filtered.slice(offset, offset + limit), total: filtered.length, offset, limit });
      }
      if (path === "/api/studio/datasets/set-3/download") {
        const response = json(
          {
            id: "download-3",
            kind: "download",
            word_id: null,
            resource: "download",
            payload: { dataset_id: "set-3" },
            status: "running",
            created_at: "",
            started_at: "",
            finished_at: null,
            result: {},
          },
          201,
        );
        return delayDownload
          ? new Promise<Response>((resolve) => {
              resolveDownload = resolve;
            })
          : response;
      }
      if (path === "/api/studio/jobs/download-2")
        return json({
          id: "download-2",
          kind: "download",
          word_id: null,
          resource: "download",
          payload: { dataset_id: "set-2" },
          status: "running",
          created_at: "",
          started_at: "",
          finished_at: null,
          result: {},
        });
      if (path === "/api/studio/jobs/download-2/logs") return json({ text: "Downloading classifier dataset" });
      return json({ detail: `Unhandled ${path}` }, 500);
    }),
  );
});
afterEach(() => vi.unstubAllGlobals());

describe("NegativeDatasetsPage", () => {
  it("follows a newly discovered active retry instead of an old failed catalog attempt", async () => {
    const transport = vi.mocked(fetch).getMockImplementation()!;
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const response = await transport(input, init);
      if (new URL(String(input), "http://localhost").pathname.match(/\/wakewords\/a\/datasets$/)) {
        const page = await response.json();
        return json({
          ...page,
          items: page.items.map((row: ReturnType<typeof dataset>) =>
            row.id === "set-3" ? { ...row, status: "failed", job_id: "old-attempt" } : row,
          ),
        });
      }
      return response;
    });
    const ui = mount(host());
    await flushPromises();
    const base = {
      kind: "download" as const,
      resource: "download" as const,
      word_id: null,
      payload: { dataset_id: "set-3" },
      started_at: null,
      finished_at: null,
      result: {},
    };
    queue.track({ ...base, id: "old-attempt", status: "failed", created_at: "2026-10-20T10:00:00Z" });
    queue.track({ ...base, id: "new-attempt", status: "running", created_at: "2026-10-21T10:00:00Z" });
    await flushPromises();
    const row = ui.findAll("article").find((row) => row.find('[data-dataset-id="set-3"]').exists())!;
    expect(row.get(".studio-status").text()).toBe("running");
    expect(row.get("button").attributes("aria-busy")).toBe("true");
    expect(row.get("button").element).toHaveProperty("disabled", true);
    await row.get('[data-action="view-dataset-job"]').trigger("click");
    await flushPromises();
    expect(queue.selectedJobId.value).toBe("new-attempt");
    ui.unmount();
  });
  it("keeps only the matching download busy without opening the queue", async () => {
    const ui = mount(host());
    await flushPromises();
    const row = (id: string) => ui.findAll("article").find((row) => row.find(`[data-dataset-id="${id}"]`).exists())!;
    delayDownload = true;
    await row("set-3").get("button").trigger("click");
    await flushPromises();
    expect(row("set-3").get("button").attributes("aria-busy")).toBe("true");
    expect(row("set-4").get("button").element).toHaveProperty("disabled", false);
    resolveDeferred(
      resolveDownload,
      json({
        id: "download-3",
        kind: "download",
        word_id: null,
        resource: "download",
        payload: { dataset_id: "set-3" },
        status: "queued",
        created_at: "",
        started_at: null,
        finished_at: null,
        result: {},
      }),
    );
    await flushPromises();
    expect(queue.open.value).toBe(false);
    expect(row("set-3").get("button").element).toHaveProperty("disabled", true);
    expect(row("set-2").get("button").attributes("aria-busy")).toBe("true");
    queue.track({
      id: "download-3",
      kind: "download",
      word_id: null,
      resource: "download",
      payload: { dataset_id: "set-3" },
      status: "failed",
      created_at: "",
      started_at: null,
      finished_at: "",
      result: {},
    });
    await flushPromises();
    expect(row("set-3").get("button").element).toHaveProperty("disabled", false);
    ui.unmount();
  });
  it("shows augmentation activity on its button until cancellation without opening the queue", async () => {
    const ui = mount(host());
    await flushPromises();
    const row = ui.get('[data-augmentation-id="mit_rirs_16k"]');
    await row.get("button").trigger("click");
    await flushPromises();
    expect(queue.open.value).toBe(false);
    expect(row.get("button").attributes("aria-busy")).toBe("true");
    expect(row.get("button").element).toHaveProperty("disabled", true);
    queue.track({
      id: "aug-1",
      kind: "download",
      word_id: null,
      resource: "download",
      payload: { augmentation_id: "mit_rirs_16k" },
      status: "cancelled",
      created_at: "",
      started_at: null,
      finished_at: "",
      result: {},
    });
    await flushPromises();
    expect(row.get("button").element).toHaveProperty("disabled", false);
    ui.unmount();
  });
  it("does not let an older local failure override the catalog current attempt", async () => {
    const transport = vi.mocked(fetch).getMockImplementation()!;
    vi.mocked(fetch).mockImplementation((input, init) => {
      if (String(input).endsWith("/augmentation/datasets")) {
        const catalog = augmentationCatalog(false);
        return Promise.resolve(
          json({
            ...catalog,
            items: catalog.items.map((row) =>
              row.id === "mit_rirs_16k" ? { ...row, status: "running", job_id: "current" } : row,
            ),
          }),
        );
      }
      return transport(input, init);
    });
    const ui = mount(host());
    await flushPromises();
    queue.track({
      id: "older",
      kind: "download",
      resource: "download",
      word_id: null,
      payload: { augmentation_id: "mit_rirs_16k" },
      created_at: "2026-10-20T00:00:00Z",
      started_at: null,
      finished_at: "",
      status: "failed",
      result: { error: "handler_failed", error_code: "disk_full" },
    });
    await flushPromises();
    const row = ui.get('[data-augmentation-id="mit_rirs_16k"]');
    expect(row.get(".studio-status").text()).toBe("running");
    expect(row.text()).not.toContain("disk space");
    ui.unmount();
  });
  it("uses the newest augmentation attempt even when older history arrives later", async () => {
    const ui = mount(host());
    await flushPromises();
    const base = {
      kind: "download" as const,
      resource: "download" as const,
      word_id: null,
      payload: { augmentation_id: "mit_rirs_16k" },
      started_at: null,
      finished_at: null,
    };
    queue.track({ ...base, id: "new", status: "running", created_at: "2026-10-21T10:00:00Z", result: {} });
    queue.track({
      ...base,
      id: "old",
      status: "failed",
      created_at: "2026-10-20T10:00:00Z",
      result: { error: "handler_failed", error_code: "disk_full" },
    });
    await flushPromises();
    const row = ui.get('[data-augmentation-id="mit_rirs_16k"]');
    expect(row.get(".studio-status").text()).toBe("running");
    expect(row.text()).not.toContain("disk space");
    ui.unmount();
  });
  it("offers shared augmentation downloads separately from per-word classifier selection", async () => {
    const ui = mount(host());
    await flushPromises();
    expect(ui.get("h1").text()).toBe("Downloaded");
    const augmentation = ui.get("[data-augmentation-datasets]");
    expect(augmentation.text()).toContain("per wakeword");
    expect(augmentation.text()).not.toContain("free of");
    expect(augmentation.text()).not.toContain("See source terms");
    expect(augmentation.findAll('input[type="checkbox"]')).toHaveLength(4);
    expect(
      augmentation.findAll('input[type="checkbox"]').every((input) => (input.element as HTMLInputElement).checked),
    ).toBe(true);
    await augmentation.get('[data-augmentation-id="mit_rirs_16k"] button').trigger("click");
    await flushPromises();
    expect(queue.jobs.value["aug-1"]?.word_id).toBeNull();
    expect(augmentation.get('[data-augmentation-id="mit_rirs_16k"]').text()).toContain("queued");
    expect((ui.get('[data-dataset-id="set-0"]').element as HTMLInputElement).checked).toBe(true);
    queue.track({
      id: "aug-1",
      kind: "download",
      word_id: null,
      resource: "download",
      payload: { augmentation_id: "mit_rirs_16k" },
      status: "failed",
      created_at: "",
      started_at: null,
      finished_at: "",
      result: { error: "handler_failed", error_code: "disk_full" },
    });
    await flushPromises();
    expect(augmentation.text()).toContain("disk space");
    ui.unmount();
  });
  it("refreshes completed downloads while closed without discarding unsaved dataset selections", async () => {
    const ui = mount(host());
    await flushPromises();
    await ui.get('[data-dataset-id="set-4"]').setValue(true);
    const download = ui
      .findAll("article")
      .find((row) => row.find('[data-dataset-id="set-3"]').exists())!
      .get("button");
    await download.trigger("click");
    await flushPromises();
    queue.open.value = false;
    const before = vi.mocked(fetch).mock.calls.filter(([input]) => String(input).includes("/a/datasets")).length;
    queue.track({
      id: "download-3",
      kind: "download",
      word_id: null,
      resource: "download",
      payload: { dataset_id: "set-3" },
      status: "complete",
      created_at: "",
      started_at: null,
      finished_at: "",
      result: { dataset_id: "set-3", fingerprint: "verified" },
    });
    await flushPromises();
    expect(
      vi.mocked(fetch).mock.calls.filter(([input]) => String(input).includes("/a/datasets")).length,
    ).toBeGreaterThan(before);
    expect((ui.get('[data-dataset-id="set-4"]').element as HTMLInputElement).checked).toBe(true);
    ui.unmount();
  });
  it("paginates all datasets without search, state filter, or license lines", async () => {
    const ui = mount(host());
    await flushPromises();
    await flushPromises();
    expect(ui.text()).toContain("1–50 of 200");
    expect(ui.text()).toContain("Corpus 0");
    expect(ui.text()).toContain("Example source");
    expect(ui.text()).not.toContain("CC-BY");
    expect(ui.find("[data-oww-compatibility]").exists()).toBe(false);
    expect(
      ui.get('input[data-dataset-id="set-0"]').element.closest("label")?.classList.contains("studio-checkbox-label"),
    ).toBe(true);
    expect(ui.find("select[name=dataset-status]").exists()).toBe(false);
    expect(ui.get('[data-action="view-dataset-job"]').text()).toContain("View in queue");
    await ui.get('[data-action="next-page"]').trigger("click");
    await flushPromises();
    expect(ui.text()).toContain("51–100 of 200");
    expect(ui.text()).toContain("Corpus 50");
    expect(ui.find('input[type="search"]').exists()).toBe(false);
    expect(
      vi
        .mocked(fetch)
        .mock.calls.some(([input]) => /\/a\/datasets\?(?!.*status=selected).*status=/.test(String(input))),
    ).toBe(false);
    ui.unmount();
  });

  it("saves augmentation selections per wakeword, including an explicit empty selection", async () => {
    const ui = mount(host());
    await flushPromises();
    const inputs = () => ui.get("[data-augmentation-datasets]").findAll('input[type="checkbox"]');
    for (const input of inputs()) await input.setValue(false);
    await ui.get('[data-action="save-augmentation"]').trigger("click");
    await flushPromises();
    expect(inputs().every((input) => !(input.element as HTMLInputElement).checked)).toBe(true);
    workspace.selectedId.value = "b";
    await flushPromises();
    expect(inputs().every((input) => (input.element as HTMLInputElement).checked)).toBe(true);
    workspace.selectedId.value = "a";
    await flushPromises();
    expect(inputs().every((input) => !(input.element as HTMLInputElement).checked)).toBe(true);
    ui.unmount();
  });

  it("ignores delayed augmentation load and save responses from the previous wakeword", async () => {
    const transport = vi.mocked(fetch).getMockImplementation()!;
    let finishLoad!: (response: Response) => void;
    let finishSave!: (response: Response) => void;
    vi.mocked(fetch).mockImplementation((input, init) => {
      if (String(input).endsWith("/a/augmentation/datasets"))
        return new Promise<Response>((resolve) => {
          if (init?.method === "PUT") finishSave = resolve;
          else finishLoad = resolve;
        });
      return transport(input, init);
    });
    const ui = mount(host());
    await flushPromises();
    workspace.selectedId.value = "b";
    await flushPromises();
    const empty = {
      ...augmentationCatalog(false),
      items: augmentationCatalog(false).items.map((row) => ({ ...row, selected: false })),
    };
    finishLoad(json(empty));
    await flushPromises();
    expect(ui.get("[data-augmentation-datasets] input").element).toHaveProperty("checked", true);
    workspace.selectedId.value = "a";
    await flushPromises();
    finishLoad(json(augmentationCatalog(false)));
    await flushPromises();
    await ui.get("[data-augmentation-datasets] input").setValue(false);
    await ui.get('[data-action="save-augmentation"]').trigger("click");
    await flushPromises();
    workspace.selectedId.value = "b";
    await flushPromises();
    finishSave(json(empty));
    await flushPromises();
    expect(ui.get("[data-augmentation-datasets] input").element).toHaveProperty("checked", true);
    expect(ui.get('[data-action="save-augmentation"]').element).toHaveProperty("disabled", false);
    ui.unmount();
  });

  it("places low disk space directly below the heading, before either catalog", async () => {
    const transport = vi.mocked(fetch).getMockImplementation()!;
    vi.mocked(fetch).mockImplementation((input, init) =>
      String(input).endsWith("/augmentation/datasets")
        ? Promise.resolve(json({ ...augmentationCatalog(false), storage_free_bytes: 12_345_678_901 }))
        : transport(input, init),
    );
    const ui = mount(host());
    await flushPromises();
    const warning = ui.get("[data-disk-warning]");
    expect(visibleText(warning.text())).toContain("Disk space is low: 12.35 GB free of 536.9 GB");
    expect(ui.get("h1").element.parentElement?.nextElementSibling).toBe(warning.element);
    expect(warning.element.nextElementSibling?.querySelector("h2")?.textContent).toContain("Negative");
    ui.unmount();
  });

  it("shows negative dataset details as description, then GB and sample count", async () => {
    const transport = vi.mocked(fetch).getMockImplementation()!;
    vi.mocked(fetch).mockImplementation((input, init) =>
      String(input).includes("/a/datasets")
        ? Promise.resolve(
            json({
              items: [{ ...dataset(0, true), installed_bytes: 2_000_000_000, sample_count: 1234 }],
              total: 1,
              offset: 0,
              limit: 50,
            }),
          )
        : transport(input, init),
    );
    const ui = mount(host());
    await flushPromises();
    const row = ui.get('[data-dataset-id="set-0"]').element.closest("article")!;
    expect([...row.querySelectorAll(".studio-dataset-copy p")].map((p) => visibleText(p.textContent))).toEqual([
      "negative classifier corpus · Example source",
      "2 GB installed · 1,234 samples",
    ]);
    ui.unmount();
  });

  it("keeps selection per word and sends only the active workspace selection", async () => {
    const ui = mount(host());
    await flushPromises();
    await flushPromises();
    expect((ui.get('input[data-dataset-id="set-0"]').element as HTMLInputElement).checked).toBe(true);
    expect((ui.get('input[data-dataset-id="set-1"]').element as HTMLInputElement).checked).toBe(false);
    await ui.get('input[data-dataset-id="set-1"]').setValue(true);
    await ui.get('[data-action="save-datasets"]').trigger("click");
    await flushPromises();
    const call = vi
      .mocked(fetch)
      .mock.calls.find(([input, init]) => String(input).endsWith("/wakewords/a/datasets") && init?.method === "PUT");
    expect(call).toBeTruthy();
    expect(JSON.parse(String(call?.[1]?.body))).toEqual({ dataset_ids: ["set-0", "set-1"] });
    workspace.selectedId.value = "b";
    await flushPromises();
    await flushPromises();
    expect((ui.get('input[data-dataset-id="set-1"]').element as HTMLInputElement).checked).toBe(true);
    expect((ui.get('input[data-dataset-id="set-0"]').element as HTMLInputElement).checked).toBe(false);
    ui.unmount();
  });
});

it("preserves selected IDs beyond the first 100 selected rows when saving a visible toggle", async () => {
  selectedByWord.a = new Set([...Array.from({ length: 101 }, (_, index) => `set-${index}`), "set-150"]);
  const ui = mount(host());
  await flushPromises();
  await flushPromises();
  await ui.get('input[data-dataset-id="set-2"]').setValue(false);
  await ui.get('[data-action="save-datasets"]').trigger("click");
  await flushPromises();
  const call = vi
    .mocked(fetch)
    .mock.calls.find(([input, init]) => String(input).endsWith("/wakewords/a/datasets") && init?.method === "PUT");
  const ids = JSON.parse(String(call?.[1]?.body)) as { dataset_ids: string[] };
  expect(ids.dataset_ids).toContain("set-100");
  expect(ids.dataset_ids).toContain("set-150");
  expect(ids.dataset_ids).not.toContain("set-2");
  ui.unmount();
});

it("drops delayed prior-workspace save and download results and resets mutation busy state", async () => {
  const ui = mount(host());
  await flushPromises();
  await flushPromises();
  delayDatasetSave = true;
  await ui.get('[data-action="save-datasets"]').trigger("click");
  await flushPromises();
  workspace.selectedId.value = "b";
  await flushPromises();
  expect(resolveDatasetSave).toBeTypeOf("function");
  resolveDatasetSave?.(json({ items: [], total: 0, offset: 0, limit: 50 }));
  await flushPromises();
  expect((ui.get('[data-action="save-datasets"]').element as HTMLButtonElement).disabled).toBe(false);
  workspace.selectedId.value = "a";
  await flushPromises();
  await flushPromises();
  delayDownload = true;
  const download = ui
    .findAll("article")
    .find((article) => article.find('input[data-dataset-id="set-3"]').exists())
    ?.find("button");
  expect(download?.exists()).toBe(true);
  await download?.trigger("click");
  await flushPromises();
  workspace.selectedId.value = "b";
  await flushPromises();
  expect(resolveDownload).toBeTypeOf("function");
  resolveDownload?.(
    json(
      {
        id: "download-3",
        kind: "download",
        word_id: null,
        resource: "download",
        payload: { dataset_id: "set-3" },
        status: "running",
        created_at: "",
        started_at: "",
        finished_at: null,
        result: {},
      },
      201,
    ),
  );
  await flushPromises();
  expect(ui.find('[data-job-id="download-3"]').exists()).toBe(false);
  ui.unmount();
});

it("settles independently launched save and download mutations in either completion order", async () => {
  async function startBoth(ui: ReturnType<typeof mount>): Promise<void> {
    delayDatasetSave = true;
    delayDownload = true;
    await ui.get('[data-action="save-datasets"]').trigger("click");
    await flushPromises();
    const download = ui
      .findAll("article")
      .find((article) => article.find('input[data-dataset-id="set-3"]').exists())
      ?.find("button");
    expect(download?.exists()).toBe(true);
    await download?.trigger("click");
    await flushPromises();
    expect(resolveDatasetSave).toBeTypeOf("function");
    expect(resolveDownload).toBeTypeOf("function");
  }
  function expectSettled(ui: ReturnType<typeof mount>): void {
    expect((ui.get('[data-action="save-datasets"]').element as HTMLButtonElement).disabled).toBe(false);
    const download = ui
      .findAll("article")
      .find((article) => article.find('input[data-dataset-id="set-3"]').exists())
      ?.find("button");
    expect((download?.element as HTMLButtonElement).disabled).toBe(true);
    expect(queue.jobs.value["download-3"]?.status).toBe("running");
    expect(queue.open.value).toBe(false);
    expect(ui.find("[data-job-id]").exists()).toBe(false);
  }

  let ui = mount(host());
  await flushPromises();
  await flushPromises();
  await startBoth(ui);
  resolveDeferred(resolveDatasetSave, json({ items: [], total: 0, offset: 0, limit: 50 }));
  await flushPromises();
  resolveDeferred(
    resolveDownload,
    json(
      {
        id: "download-3",
        kind: "download",
        word_id: null,
        resource: "download",
        payload: { dataset_id: "set-3" },
        status: "running",
        created_at: "",
        started_at: "",
        finished_at: null,
        result: {},
      },
      201,
    ),
  );
  await flushPromises();
  expectSettled(ui);
  ui.unmount();

  delayDatasetSave = false;
  resolveDatasetSave = undefined;
  delayDownload = false;
  resolveDownload = undefined;
  ui = mount(host());
  await flushPromises();
  await flushPromises();
  await startBoth(ui);
  resolveDeferred(
    resolveDownload,
    json(
      {
        id: "download-3",
        kind: "download",
        word_id: null,
        resource: "download",
        payload: { dataset_id: "set-3" },
        status: "running",
        created_at: "",
        started_at: "",
        finished_at: null,
        result: {},
      },
      201,
    ),
  );
  await flushPromises();
  resolveDeferred(resolveDatasetSave, json({ items: [], total: 0, offset: 0, limit: 50 }));
  await flushPromises();
  expectSettled(ui);
  ui.unmount();
});
