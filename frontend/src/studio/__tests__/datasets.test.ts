import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { provide } from "vue";
import NegativeDatasetsPage from "../pages/NegativeDatasetsPage.vue";
import { createWorkspace, workspaceKey, type Workspace } from "../workspace";
import { useStudioRoutes } from "../routes";
import { createJobQueue, jobQueueKey, type JobQueue } from '../jobs';
import { augmentationCatalog } from './augmentationFixture';

const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
const words = [{ id: "a", phrase: "Hey Cedar", language: "en", model_id: "cedar", created_at: "", updated_at: "" }, { id: "b", phrase: "Okay Maple", language: "en", model_id: "maple", created_at: "", updated_at: "" }];
const dataset = (index: number, selected = false) => ({ id: `set-${index}`, name: `Corpus ${index}`, description: index === 150 ? "speech collection" : "negative classifier corpus", source: "Example source", license: "CC-BY", representation: "features", split: index === 151 ? "evaluation" : "train", adapter: "mww_mmap", purpose: "classifier_negative", download_bytes: 1000, installed_bytes: index === 0 ? 1000 : null, fingerprint: null, selected, status: index === 0 ? "installed" : index === 2 ? "running" : "available", job_id: index === 2 ? "download-2" : null, error_code: null });
const catalog = Array.from({ length: 200 }, (_, index) => dataset(index));
let workspace: Workspace;
let queue: JobQueue;
let selectedByWord: Record<string, Set<string>>;
let delayDatasetSave = false;
let resolveDatasetSave: ((response: Response) => void) | undefined;
let delayDownload = false;
let resolveDownload: ((response: Response) => void) | undefined;
function resolveDeferred(resolver: ((response: Response) => void) | undefined, response: Response): void { expect(resolver).toBeTypeOf("function"); if (resolver) resolver(response); }
function host() { return { components: { NegativeDatasetsPage }, setup() { workspace = createWorkspace(useStudioRoutes()); provide(workspaceKey, workspace); queue = createJobQueue(); provide(jobQueueKey, queue); }, template: "<NegativeDatasetsPage />" }; }

beforeEach(() => {
  selectedByWord = { a: new Set(["set-0"]), b: new Set(["set-1"]) };
  delayDatasetSave = false; resolveDatasetSave = undefined; delayDownload = false; resolveDownload = undefined;
  history.replaceState(null, "", "#/negative-datasets?word=a");
  vi.stubGlobal("fetch", vi.fn(async (input: string, init?: RequestInit) => {
    const url = new URL(input, "http://localhost"); const path = url.pathname;
    if (path === '/api/studio/jobs') return json({ items: [], total: 0, offset: 0, limit: 100 });
    if (path === '/api/studio/augmentation/datasets') return json(augmentationCatalog(false));
    if (path === '/api/studio/augmentation/datasets/mit_rirs_16k/download') return json({ id: 'aug-1', kind: 'download', word_id: null, resource: 'download', payload: { augmentation_id: 'mit_rirs_16k' }, status: 'queued', created_at: '', started_at: null, finished_at: null, result: {} }, 201);
    if (path === "/api/studio/wakewords") return json({ items: words, total: 2, offset: 0, limit: 100 });
    if (path.match(/\/wakewords\/[ab]$/)) return json(words.find(word => path.endsWith(word.id)));
    if (path.endsWith("/queue")) return json({ items: [], total: 0, offset: 0, limit: 1 });
    if (path.endsWith("/models")) return json({ items: [], total: 0, offset: 0, limit: 1 });
    if (path === "/api/studio/schedules") return json([]);
    const match = path.match(/^\/api\/studio\/wakewords\/([ab])\/datasets$/);
    if (match && init?.method === "PUT") { const body = JSON.parse(String(init.body)) as { dataset_ids: string[] }; selectedByWord[match[1]] = new Set(body.dataset_ids); const response = json({ items: [], total: 0, offset: 0, limit: 50 }); return delayDatasetSave ? new Promise<Response>(resolve => { resolveDatasetSave = resolve; }) : response; }
    if (match) {
      const search = url.searchParams.get("search") ?? ""; const status = url.searchParams.get("status"); const offset = Number(url.searchParams.get("offset") ?? 0); const limit = Number(url.searchParams.get("limit") ?? 50);
      const selected = selectedByWord[match[1]];
      const filtered = catalog.map(row => ({ ...row, selected: selected.has(row.id) })).filter(row => (!search || `${row.name} ${row.description}`.toLowerCase().includes(search.toLowerCase())) && (!status || (status === "selected" ? row.selected : row.status === status)));
      return json({ items: filtered.slice(offset, offset + limit), total: filtered.length, offset, limit });
    }
    if (path === "/api/studio/datasets/set-3/download") { const response = json({ id: "download-3", kind: "download", word_id: null, resource: "download", payload: { dataset_id: "set-3" }, status: "running", created_at: "", started_at: "", finished_at: null, result: {} }, 201); return delayDownload ? new Promise<Response>(resolve => { resolveDownload = resolve; }) : response; }
    if (path === "/api/studio/jobs/download-2") return json({ id: "download-2", kind: "download", word_id: null, resource: "download", payload: { dataset_id: "set-2" }, status: "running", created_at: "", started_at: "", finished_at: null, result: {} });
    if (path === "/api/studio/jobs/download-2/logs") return json({ text: "Downloading classifier dataset" });
    return json({ detail: `Unhandled ${path}` }, 500);
  }));
});
afterEach(() => vi.unstubAllGlobals());

describe("NegativeDatasetsPage", () => {
  it('does not let an older local failure override the catalog current attempt', async () => {
    const transport = vi.mocked(fetch).getMockImplementation()!;
    vi.mocked(fetch).mockImplementation((input, init) => {
      if (String(input).endsWith('/augmentation/datasets')) {
        const catalog = augmentationCatalog(false);
        return Promise.resolve(json({ ...catalog, items: catalog.items.map(row => row.id === 'mit_rirs_16k' ? { ...row, status: 'running', job_id: 'current' } : row) }));
      }
      return transport(input, init);
    });
    const ui = mount(host()); await flushPromises();
    queue.track({ id: 'older', kind: 'download', resource: 'download', word_id: null, payload: { augmentation_id: 'mit_rirs_16k' }, created_at: '2026-10-20T00:00:00Z', started_at: null, finished_at: '', status: 'failed', result: { error: 'handler_failed', error_code: 'disk_full' } });
    await flushPromises();
    const row = ui.get('[data-augmentation-id="mit_rirs_16k"]');
    expect(row.get('.studio-status').text()).toBe('running');
    expect(row.text()).not.toContain('disk space');
    ui.unmount();
  });
  it('uses the newest augmentation attempt even when older history arrives later', async () => {
    const ui = mount(host()); await flushPromises();
    const base = { kind: 'download' as const, resource: 'download' as const, word_id: null, payload: { augmentation_id: 'mit_rirs_16k' }, started_at: null, finished_at: null };
    queue.track({ ...base, id: 'new', status: 'running', created_at: '2026-10-21T10:00:00Z', result: {} });
    queue.track({ ...base, id: 'old', status: 'failed', created_at: '2026-10-20T10:00:00Z', result: { error: 'handler_failed', error_code: 'disk_full' } });
    await flushPromises();
    const row = ui.get('[data-augmentation-id="mit_rirs_16k"]');
    expect(row.get('.studio-status').text()).toBe('running');
    expect(row.text()).not.toContain('disk space');
    ui.unmount();
  });
  it('offers shared augmentation downloads separately from per-word classifier selection', async () => {
    const ui = mount(host()); await flushPromises();
    expect(ui.get('h1').text()).toBe('Online Datasets');
    const augmentation = ui.get('[data-augmentation-datasets]');
    expect(augmentation.text()).toContain('automatically');
    expect(augmentation.text()).toContain('100 GiB');
    expect(augmentation.find('input[type="checkbox"]').exists()).toBe(false);
    await augmentation.get('[data-augmentation-id="mit_rirs_16k"] button').trigger('click'); await flushPromises();
    expect(queue.jobs.value['aug-1']?.word_id).toBeNull();
    expect(augmentation.get('[data-augmentation-id="mit_rirs_16k"]').text()).toContain('queued');
    expect((ui.get('[data-dataset-id="set-0"]').element as HTMLInputElement).checked).toBe(true);
    queue.track({ id: 'aug-1', kind: 'download', word_id: null, resource: 'download', payload: { augmentation_id: 'mit_rirs_16k' }, status: 'failed', created_at: '', started_at: null, finished_at: '', result: { error: 'handler_failed', error_code: 'disk_full' } });
    await flushPromises();
    expect(augmentation.text()).toContain('disk space');
    ui.unmount();
  });
  it('refreshes completed downloads while closed without discarding unsaved dataset selections', async () => {
    const ui = mount(host()); await flushPromises();
    await ui.get('[data-dataset-id="set-4"]').setValue(true);
    const download = ui.findAll('article').find(row => row.find('[data-dataset-id="set-3"]').exists())!.get('button');
    await download.trigger('click'); await flushPromises(); queue.open.value = false;
    const before = vi.mocked(fetch).mock.calls.filter(([input]) => String(input).includes('/a/datasets')).length;
    queue.track({ id: 'download-3', kind: 'download', word_id: null, resource: 'download', payload: { dataset_id: 'set-3' }, status: 'complete', created_at: '', started_at: null, finished_at: '', result: { dataset_id: 'set-3', fingerprint: 'verified' } }); await flushPromises();
    expect(vi.mocked(fetch).mock.calls.filter(([input]) => String(input).includes('/a/datasets')).length).toBeGreaterThan(before);
    expect((ui.get('[data-dataset-id="set-4"]').element as HTMLInputElement).checked).toBe(true);
    ui.unmount();
  });
  it("searches, filters, paginates a 200-entry real catalog, and exposes install state/progress and provenance", async () => {
    const ui = mount(host()); await flushPromises(); await flushPromises();
    expect(ui.text()).toContain("1–50 of 200"); expect(ui.text()).toContain("Corpus 0"); expect(ui.text()).toContain("Example source"); expect(ui.text()).toContain("CC-BY");
    expect(ui.find('[data-oww-compatibility]').exists()).toBe(false);
    expect(ui.get('input[data-dataset-id="set-0"]').element.closest('label')?.classList.contains('studio-checkbox-label')).toBe(true);
    await ui.get('[data-action="next-page"]').trigger("click"); await flushPromises();
    expect(ui.text()).toContain("51–100 of 200"); expect(ui.text()).toContain("Corpus 50");
    await ui.get("input[name=dataset-search]").setValue("speech"); await flushPromises();
    expect(ui.text()).toContain("Corpus 150"); expect(ui.find('.studio-pagination').exists()).toBe(false);
    await ui.get("input[name=dataset-search]").setValue(""); await flushPromises();
    await ui.get("select[name=dataset-status]").setValue("running"); await flushPromises();
    expect(ui.text()).not.toContain("Corpus 150"); expect(ui.text()).toContain("Corpus 2"); expect(ui.find('[data-job-id]').exists()).toBe(false);
    expect(ui.get('[data-action="view-dataset-job"]').text()).toContain('View in queue');
    ui.unmount();
  });

  it("keeps selection per word and sends only the active workspace selection", async () => {
    const ui = mount(host()); await flushPromises(); await flushPromises();
    expect((ui.get('input[data-dataset-id="set-0"]').element as HTMLInputElement).checked).toBe(true);
    expect((ui.get('input[data-dataset-id="set-1"]').element as HTMLInputElement).checked).toBe(false);
    await ui.get('input[data-dataset-id="set-1"]').setValue(true); await ui.get('[data-action="save-datasets"]').trigger("click"); await flushPromises();
    const call = (vi.mocked(fetch).mock.calls.find(([input, init]) => String(input).endsWith("/wakewords/a/datasets") && init?.method === "PUT"));
    expect(call).toBeTruthy(); expect(JSON.parse(String(call?.[1]?.body))).toEqual({ dataset_ids: ["set-0", "set-1"] });
    workspace.selectedId.value = "b"; await flushPromises(); await flushPromises();
    expect((ui.get('input[data-dataset-id="set-1"]').element as HTMLInputElement).checked).toBe(true);
    expect((ui.get('input[data-dataset-id="set-0"]').element as HTMLInputElement).checked).toBe(false);
    ui.unmount();
  });
});

  it("preserves selected IDs beyond the first 100 selected rows when saving a visible toggle", async () => {
    selectedByWord.a = new Set([...Array.from({ length: 101 }, (_, index) => `set-${index}`), "set-150"]);
    const ui = mount(host()); await flushPromises(); await flushPromises();
    await ui.get('input[data-dataset-id="set-2"]').setValue(false); await ui.get('[data-action="save-datasets"]').trigger("click"); await flushPromises();
    const call = vi.mocked(fetch).mock.calls.find(([input, init]) => String(input).endsWith("/wakewords/a/datasets") && init?.method === "PUT");
    const ids = JSON.parse(String(call?.[1]?.body)) as { dataset_ids: string[] };
    expect(ids.dataset_ids).toContain("set-100"); expect(ids.dataset_ids).toContain("set-150"); expect(ids.dataset_ids).not.toContain("set-2");
    ui.unmount();
  });

  it("drops delayed prior-workspace save and download results and resets mutation busy state", async () => {
    const ui = mount(host()); await flushPromises(); await flushPromises();
    delayDatasetSave = true;
    await ui.get('[data-action="save-datasets"]').trigger("click"); await flushPromises();
    workspace.selectedId.value = "b"; await flushPromises();
    expect(resolveDatasetSave).toBeTypeOf("function"); resolveDatasetSave?.(json({ items: [], total: 0, offset: 0, limit: 50 })); await flushPromises();
    expect((ui.get('[data-action="save-datasets"]').element as HTMLButtonElement).disabled).toBe(false);
    workspace.selectedId.value = "a"; await flushPromises(); await flushPromises();
    delayDownload = true;
    const download = ui.findAll("article").find(article => article.find('input[data-dataset-id="set-3"]').exists())?.find("button"); expect(download?.exists()).toBe(true);
    await download?.trigger("click"); await flushPromises(); workspace.selectedId.value = "b"; await flushPromises();
    expect(resolveDownload).toBeTypeOf("function"); resolveDownload?.(json({ id: "download-3", kind: "download", word_id: null, resource: "download", payload: { dataset_id: "set-3" }, status: "running", created_at: "", started_at: "", finished_at: null, result: {} }, 201)); await flushPromises();
    expect(ui.find('[data-job-id="download-3"]').exists()).toBe(false);
    ui.unmount();
  });

  it("settles independently launched save and download mutations in either completion order", async () => {
    async function startBoth(ui: ReturnType<typeof mount>): Promise<void> {
      delayDatasetSave = true; delayDownload = true;
      await ui.get('[data-action="save-datasets"]').trigger("click"); await flushPromises();
      const download = ui.findAll("article").find(article => article.find('input[data-dataset-id="set-3"]').exists())?.find("button");
      expect(download?.exists()).toBe(true); await download?.trigger("click"); await flushPromises();
      expect(resolveDatasetSave).toBeTypeOf("function"); expect(resolveDownload).toBeTypeOf("function");
    }
    function expectSettled(ui: ReturnType<typeof mount>): void {
      expect((ui.get('[data-action="save-datasets"]').element as HTMLButtonElement).disabled).toBe(false);
      const download = ui.findAll("article").find(article => article.find('input[data-dataset-id="set-3"]').exists())?.find("button");
      expect((download?.element as HTMLButtonElement).disabled).toBe(false);
      expect(queue.jobs.value['download-3']?.status).toBe('running');
      expect(queue.open.value).toBe(true); expect(ui.find('[data-job-id]').exists()).toBe(false);
    }

    let ui = mount(host()); await flushPromises(); await flushPromises(); await startBoth(ui);
    resolveDeferred(resolveDatasetSave, json({ items: [], total: 0, offset: 0, limit: 50 })); await flushPromises();
    resolveDeferred(resolveDownload, json({ id: "download-3", kind: "download", word_id: null, resource: "download", payload: { dataset_id: "set-3" }, status: "running", created_at: "", started_at: "", finished_at: null, result: {} }, 201)); await flushPromises();
    expectSettled(ui); ui.unmount();

    delayDatasetSave = false; resolveDatasetSave = undefined; delayDownload = false; resolveDownload = undefined;
    ui = mount(host()); await flushPromises(); await flushPromises(); await startBoth(ui);
    resolveDeferred(resolveDownload, json({ id: "download-3", kind: "download", word_id: null, resource: "download", payload: { dataset_id: "set-3" }, status: "running", created_at: "", started_at: "", finished_at: null, result: {} }, 201)); await flushPromises();
    resolveDeferred(resolveDatasetSave, json({ items: [], total: 0, offset: 0, limit: 50 })); await flushPromises();
    expectSettled(ui); ui.unmount();
  });
