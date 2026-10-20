import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { onMounted, provide } from "vue";
import ArtificialPage from "../pages/ArtificialPage.vue";
import { createWorkspace, workspaceKey, type Workspace } from "../workspace";
import { useStudioRoutes } from "../routes";
import { createJobQueue, jobQueueKey, type JobQueue } from '../jobs';

const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
const words = [{ id: "a", phrase: "Hey Cedar", language: "en", model_id: "cedar", created_at: "", updated_at: "" }, { id: "b", phrase: "Okay Maple", language: "fr", model_id: "maple", created_at: "", updated_at: "" }];
const recipe = { language: "en", english_accent: "us", tts_mode: "hybrid" as const, samples: 20, batch_size: 5 };
const job = (id: string, status: "queued" | "failed" | "cancelled") => ({ id, kind: "generation", word_id: "a", resource: "gpu", payload: { phrase: "Hey Cedar", recipe }, status, created_at: "", started_at: null, finished_at: status === "queued" ? null : "", result: {} });
let workspace: Workspace;
let queue: JobQueue;
let delayRecipeSave = false;
let resolveRecipeSave: ((response: Response) => void) | undefined;
let manyBatches = false;
let delayPage = false;
let resolvePage: ((response: Response) => void) | undefined;
let newWorkspace = false;
let deleted = false;
let manySources = false;
let delaySources = false;
let resolveSources: ((response: Response) => void) | undefined;
function host() { return { components: { ArtificialPage }, setup() { workspace = createWorkspace(useStudioRoutes()); provide(workspaceKey, workspace); queue = createJobQueue(); provide(jobQueueKey, queue); onMounted(() => { void workspace.load(); }); }, template: "<ArtificialPage />" }; }

beforeEach(() => {
  delayRecipeSave = false; resolveRecipeSave = undefined; manyBatches = false; delayPage = false; resolvePage = undefined; newWorkspace = false; deleted = false;
  manySources = false; delaySources = false; resolveSources = undefined;
  history.replaceState(null, "", "#/artificial?word=a");
  vi.stubGlobal("fetch", vi.fn(async (input: string, init?: RequestInit) => {
    const url = new URL(input, "http://localhost"); const path = url.pathname;
    if (init?.method === 'DELETE' && path.endsWith('/generation/batches/ready')) { deleted = true; return new Response(null, { status: 204 }); }
    if (deleted && path.endsWith('/generation/batches')) return json({ items: [], total: 0, offset: 0, limit: 50 });
    if (path === '/api/studio/jobs') return json({ items: [], total: 0, offset: 0, limit: 100 });
    if (path === "/api/studio/wakewords") return json({ items: words, total: 2, offset: 0, limit: 100 });
    if (path === '/api/studio/generation/defaults') return json({ samples: 50000, batch_size: 100 });
    if (path.match(/\/wakewords\/[ab]$/)) return json(words.find(word => path.endsWith(word.id)));
    if (path.endsWith("/queue")) return newWorkspace ? new Promise<Response>(() => {}) : json({ items: [], total: 0, offset: 0, limit: 1 }); if (path.endsWith("/models")) return json({ items: [], total: 0, offset: 0, limit: 1 }); if (path === "/api/studio/schedules") return json([]);
    if (path === "/api/studio/generation/catalog") return json([{ language: "en", name: "English", accent_applies: true, english_accents: [{ code: "us", label: "US" }], engines: { hybrid: ["omnivoice", "qwen3", "moss", "piper"], modern: ["omnivoice", "qwen3", "moss"], piper: ["piper"] } }, { language: "fr", name: "French", accent_applies: false, english_accents: [], engines: { hybrid: ["omnivoice", "qwen3", "moss"], modern: ["omnivoice", "qwen3", "moss"], piper: [] } }]);
    if (path.endsWith('/generation/sources')) {
      if (delaySources && path.includes('/a/')) return new Promise<Response>(resolve => { resolveSources = resolve; });
      const offset = Number(url.searchParams.get('offset') ?? 0);
      const sources = manySources ? Array.from({ length: 60 }, (_, i) => ({ id: `source-${i}`, phrase: 'Hey Cedar', language: 'en', providers: ['qwen3'], sample_count: 20, created_at: '' }))
        : [{ id: 'ready', phrase: 'Hey Cedar', language: 'en', providers: ['qwen3'], sample_count: 20, created_at: '' }, { id: 'source-omni', phrase: 'Hey Cedar', language: 'en', providers: ['omnivoice'], sample_count: 20, created_at: '' }];
      return json({ items: path.includes('/a/') ? sources.slice(offset, offset + 50) : [], total: path.includes('/a/') ? sources.length : 0, offset, limit: 50 });
    }
    if (path.endsWith('/generation/submissions')) {
      const body = JSON.parse(String(init?.body));
      const jobs = body.engines.map((engine: string, i: number) => ({ ...job(i ? `generation-${engine}` : 'generation-queued', 'queued'),
        payload: { phrase: 'Hey Cedar', recipe: { ...body, engines: [engine], samples: engine === 'moss' ? body.moss_samples : body.samples } } }));
      const response = json({ id: 'submission', jobs, batch_ids: jobs.map((item: { id: string }) => item.id) }, 201);
      return delayRecipeSave ? new Promise<Response>(resolve => { resolveRecipeSave = resolve; }) : response;
    }
    if (path.endsWith('/generation/previews')) return json({ ...job('preview-ready', 'queued'), kind: 'preview' }, 201);
    if (path.endsWith('/jobs/preview-ready')) return json({ ...job('preview-ready', 'queued'), kind: 'preview', status: 'complete', result: { preview: true } });
    if (path.endsWith('/jobs/preview-ready/logs')) return json({ text: '' });
    const word = path.match(/^\/api\/studio\/wakewords\/([ab])\/generation\/(recipe|batches|jobs)$/);
    if (delayPage && word?.[1] === 'a' && word[2] === 'batches' && url.searchParams.get('offset') === '50') return new Promise<Response>(resolve => { resolvePage = resolve; });
    if (path.endsWith('/generation/selection')) return json(manyBatches && path.includes('/a/') ? ['batch-0', 'batch-55'] : path.includes('/a/') ? ['ready'] : []);
    if (manyBatches && word?.[2] === 'batches' && init?.method !== 'PUT') { const offset = Number(url.searchParams.get('offset') ?? 0); return json({ items: word[1] === 'a' ? Array.from({ length: Math.min(50, 60 - offset) }, (_, i) => ({ id: `batch-${offset + i}`, word_id: 'a', phrase: 'Hey Cedar', recipe, status: 'complete', created_at: '', finished_at: '', audio: [], selected: [0, 55].includes(offset + i) })) : [], total: word[1] === 'a' ? 60 : 0, offset, limit: 50 }); }
    if (word?.[2] === "recipe") { if (init?.method === "PUT") { const response = json(JSON.parse(String(init.body))); return delayRecipeSave ? new Promise<Response>(resolve => { resolveRecipeSave = resolve; }) : response; } if (newWorkspace) return json({}, 404); return word[1] === "a" ? json(recipe) : json({ ...recipe, language: "fr", english_accent: "mixed", tts_mode: "modern" }); }
    if (word?.[2] === "batches") { if (init?.method === "PUT") return json({ items: [], total: 0, offset: 0, limit: 50 }); return json({ items: word[1] === "a" ? [{ id: "ready", word_id: "a", phrase: "Hey Cedar", recipe, status: "complete", created_at: "", finished_at: "", audio: [{ audio_id: "x", original_hash: "o", normalized_hash: "n", family_id: "f" }], selected: true }, { id: "partial", word_id: "a", phrase: "Hey Cedar", recipe, status: "failed", created_at: "", finished_at: "", audio: [], selected: false }] : [], total: word[1] === "a" ? 2 : 0, offset: 0, limit: 50 }); }
    if (word?.[2] === "jobs") { const response = json(job("generation-queued", "queued"), 201); return delayRecipeSave ? new Promise<Response>(resolve => { resolveRecipeSave = resolve; }) : response; }
    if (path.match(/\/jobs\/generation-(queued|failed|cancelled)$/)) return json(job(`generation-${path.split("-").at(-1)}`, path.split("-").at(-1) as "queued" | "failed" | "cancelled"));
    if (path.match(/\/jobs\/generation-.*\/logs$/)) return json({ text: "bounded trusted log" });
    if (path.endsWith("/cancel")) return json(job("generation-queued", "cancelled"));
    return json({ detail: `Unhandled ${path}` }, 500);
  }));
});
afterEach(() => vi.unstubAllGlobals());

describe("ArtificialPage", () => {
  it('hides batch size while preserving the saved internal value when generating', async () => {
    const ui = mount(host()); await flushPromises(); await flushPromises();
    expect(ui.find('input[name="batch-size"]').exists()).toBe(false);
    expect(ui.text()).not.toContain('Higher batch sizes');
    await ui.get('form').trigger('submit'); await flushPromises();
    const submitted = vi.mocked(fetch).mock.calls.find(([input, init]) => String(input).endsWith('/generation/submissions') && init?.method === 'POST');
    expect(JSON.parse(String(submitted?.[1]?.body))).toMatchObject({ samples: 20, batch_size: 5 });
    ui.unmount();
  });

  it('confirms deletion, removes the dataset, and drops its training selection', async () => {
    const ui = mount(host()); await flushPromises(); await flushPromises();
    await ui.get('[data-delete-batch="ready"]').trigger('click');
    expect(ui.get('[role="alertdialog"]').text()).toContain('permanently');
    await ui.get('[data-action="cancel-batch-delete"]').trigger('click');
    expect(ui.find('[role="alertdialog"]').exists()).toBe(false);
    expect(ui.find('[data-batch-id="ready"]').exists()).toBe(true);
    await ui.get('[data-delete-batch="ready"]').trigger('click');
    await ui.get('[data-action="confirm-batch-delete"]').trigger('click'); await flushPromises();
    expect(ui.find('[data-batch-id="ready"]').exists()).toBe(false);
    await ui.get('[data-action="save-batches"]').trigger('click'); await flushPromises();
    const save = vi.mocked(fetch).mock.calls.find(([input, init]) => String(input).endsWith('/generation/batches') && init?.method === 'PUT');
    expect(JSON.parse(String(save?.[1]?.body)).batch_ids).toEqual([]);
    ui.unmount();
  });

  it('ignores an old delete response after switching workspace', async () => {
    const ui = mount(host()); await flushPromises(); await flushPromises();
    await ui.get('[data-delete-batch="ready"]').trigger('click');
    let finish!: (response: Response) => void;
    vi.mocked(fetch).mockImplementationOnce(() => new Promise<Response>(resolve => { finish = resolve; }));
    await ui.get('[data-action="confirm-batch-delete"]').trigger('click');
    workspace.selectedId.value = 'b'; await flushPromises(); await flushPromises();
    finish(new Response(null, { status: 204 })); await flushPromises();
    expect(ui.find('[role="alertdialog"]').exists()).toBe(false);
    expect(ui.text()).not.toContain('Hey Cedar');
    expect(ui.text()).not.toContain('Deleting');
    ui.unmount();
  });
  it('refreshes batches on completion while closed, but never refreshes the replacement workspace from an old job', async () => {
    const ui = mount(host()); await flushPromises(); await flushPromises();
    await ui.get('form').trigger('submit'); await flushPromises(); queue.open.value = false;
    const before = vi.mocked(fetch).mock.calls.filter(([input]) => String(input).includes('/a/generation/batches')).length;
    queue.track({ ...job('generation-queued', 'queued'), kind: 'generation', resource: 'gpu', status: 'complete', result: { batch_id: 'ready' } }); await flushPromises();
    expect(vi.mocked(fetch).mock.calls.filter(([input]) => String(input).includes('/a/generation/batches')).length).toBeGreaterThan(before);
    workspace.selectedId.value = 'b'; await flushPromises();
    const next = vi.mocked(fetch).mock.calls.length;
    queue.track({ ...job('generation-queued', 'queued'), kind: 'generation', resource: 'gpu', status: 'complete', result: { batch_id: 'ready' } }); await flushPromises();
    expect(vi.mocked(fetch).mock.calls).toHaveLength(next);
    ui.unmount();
  });
  it('uses upstream counts for an unsaved recipe without changing preview counts', async () => {
    newWorkspace = true;
    const ui = mount(host()); await flushPromises(); await flushPromises();
    expect((ui.get('[name="samples"]').element as HTMLInputElement).value).toBe('50000');
    expect(ui.find('[name="batch-size"]').exists()).toBe(false);
    await ui.get('[data-preview="qwen3"]').trigger('click'); await flushPromises();
    const preview = vi.mocked(fetch).mock.calls.find(([input]) => String(input).endsWith('/generation/previews'));
    expect(JSON.parse(String(preview?.[1]?.body))).toMatchObject({ samples: 1, batch_size: 1 });
    await ui.get('form').trigger('submit'); await flushPromises();
    const submitted = vi.mocked(fetch).mock.calls.find(([input, init]) => String(input).endsWith('/generation/submissions') && init?.method === 'POST');
    expect(JSON.parse(String(submitted?.[1]?.body))).toMatchObject({ samples: 50000, batch_size: 100 });
    ui.unmount();
  });
  it('submits full per-provider counts and tracks all children with after-current MOSS', async () => {
    const ui = mount(host()); await flushPromises(); await flushPromises();
    await ui.get('[name="samples"]').setValue(20);
    await ui.get('[name="moss-samples"]').setValue(10);
    await ui.get('[name="moss-after-current"]').setValue(true);
    expect(ui.text()).toContain('per provider');
    expect((ui.get('[data-preview="moss"]').element as HTMLButtonElement).disabled).toBe(true);
    await ui.get('form').trigger('submit'); await flushPromises();
    const call = vi.mocked(fetch).mock.calls.find(([input]) => String(input).endsWith('/generation/submissions'));
    expect(JSON.parse(String(call?.[1]?.body))).toMatchObject({ samples: 20, moss_samples: 10, moss_after_current: true, moss_source_batch_ids: [] });
    expect(queue.jobs.value['generation-qwen3']).toBeDefined();
    expect(queue.jobs.value['generation-moss']).toBeDefined();
    const before = vi.mocked(fetch).mock.calls.filter(([input]) => String(input).includes('/a/generation/batches')).length;
    queue.track({ ...job('generation-qwen3', 'queued'), kind: 'generation', resource: 'gpu', status: 'complete' }); await flushPromises();
    expect(vi.mocked(fetch).mock.calls.filter(([input]) => String(input).includes('/a/generation/batches')).length).toBeGreaterThan(before);
    ui.unmount();
  });
  it('selects multiple existing MOSS sources independently of training selection', async () => {
    const ui = mount(host()); await flushPromises(); await flushPromises();
    await ui.get('[name="moss-after-current"]').setValue(false); await flushPromises();
    await ui.get('[data-source="ready"]').setValue(true);
    await ui.get('[data-source="source-omni"]').setValue(true);
    await ui.get('[name="moss-samples"]').setValue(2);
    await ui.get('[data-preview="moss"]').trigger('click'); await flushPromises();
    const call = vi.mocked(fetch).mock.calls.find(([input]) => String(input).endsWith('/generation/previews'));
    expect(JSON.parse(String(call?.[1]?.body))).toMatchObject({ engines: ['moss'], samples: 1, moss_source_batch_ids: ['ready', 'source-omni'] });
    expect((ui.get('[data-batch-id="ready"]').element as HTMLInputElement).checked).toBe(true);
    ui.unmount();
  });
  it('preserves MOSS source selections across pages and ignores stale workspace loads', async () => {
    manySources = true;
    const ui = mount(host()); await flushPromises(); await flushPromises();
    await ui.get('[name="moss-after-current"]').setValue(false); await flushPromises();
    await ui.get('[data-source="source-0"]').setValue(true);
    await ui.get('[data-source-picker] [data-action="next-page"]').trigger('click'); await flushPromises();
    await ui.get('[data-source="source-55"]').setValue(true);
    await ui.get('[data-source-picker] [data-action="previous-page"]').trigger('click'); await flushPromises();
    expect((ui.get('[data-source="source-0"]').element as HTMLInputElement).checked).toBe(true);
    delaySources = true;
    await ui.get('[data-source-picker] [data-action="next-page"]').trigger('click'); await flushPromises();
    workspace.selectedId.value = 'b'; await flushPromises();
    resolveSources?.(json({ items: [{ id: 'stale', providers: ['qwen3'], sample_count: 20 }], total: 1, offset: 0, limit: 50 })); await flushPromises();
    expect(ui.find('[data-source="stale"]').exists()).toBe(false);
    ui.unmount();
  });
  it('uses the workspace language before overview requests finish for a new workspace', async () => {
    newWorkspace = true; history.replaceState(null, '', '#/artificial?word=b');
    const ui = mount(host()); await flushPromises(); await flushPromises();
    expect((ui.get('[name="language"]').element as HTMLSelectElement).value).toBe('fr');
    ui.unmount();
  });
  it('preserves full selections and unsaved changes across pages, and resets pagination on word change', async () => {
    manyBatches = true;
    const ui = mount(host()); await flushPromises(); await flushPromises();
    await ui.get('input[data-batch-id="batch-1"]').setValue(true);
    const next = () => ui.findAll('button').find(button => button.text() === 'Next')!;
    const previous = () => ui.findAll('button').find(button => button.text() === 'Previous')!;
    await next().trigger('click'); await flushPromises(); await flushPromises();
    expect((ui.get('input[data-batch-id="batch-55"]').element as HTMLInputElement).checked).toBe(true);
    await ui.get('input[data-batch-id="batch-56"]').setValue(true);
    await previous().trigger('click'); await flushPromises(); await flushPromises();
    expect((ui.get('input[data-batch-id="batch-1"]').element as HTMLInputElement).checked).toBe(true);
    await ui.get('[data-action="save-batches"]').trigger('click'); await flushPromises();
    const saves = vi.mocked(fetch).mock.calls.filter(([input, init]) => String(input).includes('/generation/batches') && init?.method === 'PUT');
    expect(JSON.parse(String(saves.at(-1)?.[1]?.body)).batch_ids.sort()).toEqual(['batch-0', 'batch-1', 'batch-55', 'batch-56']);
    await next().trigger('click'); await flushPromises();
    await ui.get('[data-action="save-batches"]').trigger('click'); await flushPromises();
    const secondSave = vi.mocked(fetch).mock.calls.filter(([input, init]) => String(input).includes('/generation/batches') && init?.method === 'PUT').at(-1);
    expect(JSON.parse(String(secondSave?.[1]?.body)).batch_ids.sort()).toEqual(['batch-0', 'batch-1', 'batch-55', 'batch-56']);
    workspace.selectedId.value = 'b'; await flushPromises(); await flushPromises();
    const loads = vi.mocked(fetch).mock.calls.filter(([input]) => String(input).includes('/b/generation/batches'));
    expect(String(loads.at(-1)?.[0])).toContain('offset=0');
    ui.unmount();
  });
  it('ignores a stale later-page response after switching words', async () => {
    manyBatches = true;
    const ui = mount(host()); await flushPromises(); await flushPromises();
    delayPage = true;
    await ui.get('[data-action="next-page"]').trigger('click'); await flushPromises();
    workspace.selectedId.value = 'b'; await flushPromises(); await flushPromises();
    resolvePage?.(json({ items: [{ id: 'stale', word_id: 'a', phrase: 'Old word', status: 'complete', audio: [], selected: true }], total: 60, offset: 50, limit: 50 }));
    await flushPromises(); await flushPromises();
    expect(ui.find('[data-batch-id="stale"]').exists()).toBe(false);
    expect(ui.text()).not.toContain('Old word');
    await ui.get('[data-action="save-batches"]').trigger('click'); await flushPromises();
    const save = vi.mocked(fetch).mock.calls.find(([input, init]) => String(input).includes('/b/generation/batches') && init?.method === 'PUT');
    expect(JSON.parse(String(save?.[1]?.body)).batch_ids).toEqual([]);
    ui.unmount();
  });
  it("uses individual engines, gates accent for Piper and non-English, and validates sample counts", async () => {
    const ui = mount(host()); await flushPromises(); await flushPromises();
    expect(ui.get('[data-generation-phrase]').text()).toContain("Hey Cedar"); expect(ui.find('input[name="phrase"]').exists()).toBe(false);
    expect(ui.find('select[name="tts-mode"]').exists()).toBe(false);
    expect(ui.text()).not.toContain('Save recipe');
    for (const engine of ['omnivoice', 'qwen3', 'moss']) await ui.get(`[data-engine="${engine}"]`).setValue(false);
    expect((ui.get('select[name="english-accent"]').element as HTMLSelectElement).disabled).toBe(true);
    await ui.get('input[name="samples"]').setValue("0"); await ui.get("form").trigger("submit");
    expect(ui.get('[role="alert"]').text()).toContain("positive");
    expect(ui.get('[role="alert"]').text()).not.toContain('batch size');
    await ui.get('input[name="samples"]').setValue("20"); await ui.get("form").trigger("submit"); await flushPromises();
    expect(ui.find('[role="alert"]').exists()).toBe(false);
    workspace.selectedId.value = "b"; await flushPromises(); await flushPromises();
    expect(ui.get('[data-generation-phrase]').text()).toContain("Okay Maple"); expect((ui.get('select[name="english-accent"]').element as HTMLSelectElement).disabled).toBe(true);
    expect(ui.find('[data-engine="piper"]').exists()).toBe(false);
    ui.unmount();
  });

  it('previews exactly one model without saving a recipe and plays its returned audio', async () => {
    const ui = mount(host()); await flushPromises(); await flushPromises();
    await ui.get('[data-preview="qwen3"]').trigger('click'); await flushPromises(); await flushPromises();
    queue.open.value = false; await queue.refresh(); await flushPromises();
    expect(ui.find('[data-job-id]').exists()).toBe(false);
    const preview = vi.mocked(fetch).mock.calls.find(([input]) => String(input).endsWith('/generation/previews'));
    expect(JSON.parse(String(preview?.[1]?.body))).toMatchObject({ engines: ['qwen3'], samples: 1, batch_size: 1, language: 'en', english_accent: 'us' });
    expect(vi.mocked(fetch).mock.calls.some(([, init]) => init?.method === 'PUT')).toBe(false);
    expect(ui.get('audio[data-preview-audio="qwen3"]').attributes('src')).toBe('/api/studio/wakewords/a/generation/previews/preview-ready/audio');
    workspace.selectedId.value = 'b'; await flushPromises(); await flushPromises();
    expect(ui.find('[data-preview-audio]').exists()).toBe(false);
    ui.unmount();
  });

  it('submits exactly the checked engines and rejects an empty engine selection', async () => {
    const ui = mount(host()); await flushPromises(); await flushPromises();
    for (const engine of ['omnivoice', 'moss', 'piper']) await ui.get(`[data-engine="${engine}"]`).setValue(false);
    await ui.get('form').trigger('submit'); await flushPromises();
    const save = vi.mocked(fetch).mock.calls.find(([input, init]) => String(input).endsWith('/generation/submissions') && init?.method === 'POST');
    expect(JSON.parse(String(save?.[1]?.body)).engines).toEqual(['qwen3']);
    expect(vi.mocked(fetch).mock.calls.some(([, init]) => init?.method === 'PUT')).toBe(false);
    await ui.get('[data-engine="qwen3"]').setValue(false);
    await ui.get('form').trigger('submit');
    expect(ui.get('[role="alert"]').text()).toContain('at least one');
    ui.unmount();
  });

  it("selects only completed batches, clears old recipe state on word changes, and reports real queued/cancelled/failed job states", async () => {
    const ui = mount(host()); await flushPromises(); await flushPromises();
    expect((ui.get('input[data-batch-id="ready"]').element as HTMLInputElement).checked).toBe(true);
    expect((ui.get('input[data-batch-id="partial"]').element as HTMLInputElement).disabled).toBe(true);
    await ui.get('form').trigger('submit'); await flushPromises();
    expect(queue.jobs.value['generation-queued']?.status).toBe('queued');
    expect(queue.open.value).toBe(true); expect(ui.find('[data-job-id]').exists()).toBe(false);
    await queue.cancel('generation-queued'); await flushPromises();
    expect(queue.jobs.value['generation-queued']?.status).toBe('cancelled');
    workspace.selectedId.value = "b"; await flushPromises(); await flushPromises();
    expect(ui.find('input[data-batch-id="ready"]').exists()).toBe(false); expect(ui.text()).not.toContain("Hey Cedar");
    ui.unmount();
  });
});

  it("binds Generate to the word captured at click time and clears stale save busy state on a switch", async () => {
    const ui = mount(host()); await flushPromises(); await flushPromises();
    delayRecipeSave = true;
    await ui.get('form').trigger('submit'); await flushPromises();
    workspace.selectedId.value = "b"; await flushPromises();
    expect(resolveRecipeSave).toBeTypeOf("function"); resolveRecipeSave?.(json(recipe)); await flushPromises(); await flushPromises();
    const generatedForB = vi.mocked(fetch).mock.calls.some(([input, init]) => String(input).endsWith("/wakewords/b/generation/submissions") && init?.method === "POST");
    expect(generatedForB).toBe(false);
    expect((ui.get('[data-action="generate"]').element as HTMLButtonElement).disabled).toBe(false);
    ui.unmount();
  });
