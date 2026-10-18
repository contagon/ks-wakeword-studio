import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { onMounted, provide } from "vue";
import ArtificialPage from "../pages/ArtificialPage.vue";
import { createWorkspace, workspaceKey, type Workspace } from "../workspace";
import { useStudioRoutes } from "../routes";

const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
const words = [{ id: "a", phrase: "Hey Cedar", language: "en", model_id: "cedar", created_at: "", updated_at: "" }, { id: "b", phrase: "Okay Maple", language: "fr", model_id: "maple", created_at: "", updated_at: "" }];
const recipe = { language: "en", english_accent: "us", tts_mode: "hybrid", samples: 20, batch_size: 5 };
const job = (id: string, status: "queued" | "failed" | "cancelled") => ({ id, kind: "generation", word_id: "a", resource: "gpu", payload: { phrase: "Hey Cedar", recipe }, status, created_at: "", started_at: null, finished_at: status === "queued" ? null : "", result: {} });
let workspace: Workspace;
let delayRecipeSave = false;
let resolveRecipeSave: ((response: Response) => void) | undefined;
let manyBatches = false;
let delayPage = false;
let resolvePage: ((response: Response) => void) | undefined;
function host() { return { components: { ArtificialPage }, setup() { workspace = createWorkspace(useStudioRoutes()); provide(workspaceKey, workspace); onMounted(() => { void workspace.load(); }); }, template: "<ArtificialPage />" }; }

beforeEach(() => {
  delayRecipeSave = false; resolveRecipeSave = undefined; manyBatches = false; delayPage = false; resolvePage = undefined;
  history.replaceState(null, "", "#/artificial?word=a");
  vi.stubGlobal("fetch", vi.fn(async (input: string, init?: RequestInit) => {
    const url = new URL(input, "http://localhost"); const path = url.pathname;
    if (path === "/api/studio/wakewords") return json({ items: words, total: 2, offset: 0, limit: 100 });
    if (path.match(/\/wakewords\/[ab]$/)) return json(words.find(word => path.endsWith(word.id)));
    if (path.endsWith("/queue")) return json({ items: [], total: 0, offset: 0, limit: 1 }); if (path.endsWith("/models")) return json({ items: [], total: 0, offset: 0, limit: 1 }); if (path === "/api/studio/schedules") return json([]);
    if (path === "/api/studio/generation/catalog") return json([{ language: "en", name: "English", accent_applies: true, english_accents: [{ code: "us", label: "US" }], engines: { hybrid: ["modern", "piper"], modern: ["modern"], piper: ["piper"] } }, { language: "fr", name: "French", accent_applies: false, english_accents: [], engines: { hybrid: ["modern"], modern: ["modern"], piper: [] } }]);
    const word = path.match(/^\/api\/studio\/wakewords\/([ab])\/generation\/(recipe|batches|jobs)$/);
    if (delayPage && word?.[1] === 'a' && word[2] === 'batches' && url.searchParams.get('offset') === '50') return new Promise<Response>(resolve => { resolvePage = resolve; });
    if (path.endsWith('/generation/selection')) return json(manyBatches && path.includes('/a/') ? ['batch-0', 'batch-55'] : path.includes('/a/') ? ['ready'] : []);
    if (manyBatches && word?.[2] === 'batches' && init?.method !== 'PUT') { const offset = Number(url.searchParams.get('offset') ?? 0); return json({ items: word[1] === 'a' ? Array.from({ length: Math.min(50, 60 - offset) }, (_, i) => ({ id: `batch-${offset + i}`, word_id: 'a', phrase: 'Hey Cedar', recipe, status: 'complete', created_at: '', finished_at: '', audio: [], selected: [0, 55].includes(offset + i) })) : [], total: word[1] === 'a' ? 60 : 0, offset, limit: 50 }); }
    if (word?.[2] === "recipe") { if (init?.method === "PUT") { const response = json(JSON.parse(String(init.body))); return delayRecipeSave ? new Promise<Response>(resolve => { resolveRecipeSave = resolve; }) : response; } return word[1] === "a" ? json(recipe) : json({ ...recipe, language: "fr", english_accent: "mixed", tts_mode: "modern" }); }
    if (word?.[2] === "batches") { if (init?.method === "PUT") return json({ items: [], total: 0, offset: 0, limit: 50 }); return json({ items: word[1] === "a" ? [{ id: "ready", word_id: "a", phrase: "Hey Cedar", recipe, status: "complete", created_at: "", finished_at: "", audio: [{ audio_id: "x", original_hash: "o", normalized_hash: "n", family_id: "f" }], selected: true }, { id: "partial", word_id: "a", phrase: "Hey Cedar", recipe, status: "failed", created_at: "", finished_at: "", audio: [], selected: false }] : [], total: word[1] === "a" ? 2 : 0, offset: 0, limit: 50 }); }
    if (word?.[2] === "jobs") return json(job("generation-queued", "queued"), 201);
    if (path.match(/\/jobs\/generation-(queued|failed|cancelled)$/)) return json(job(`generation-${path.split("-").at(-1)}`, path.split("-").at(-1) as "queued" | "failed" | "cancelled"));
    if (path.match(/\/jobs\/generation-.*\/logs$/)) return json({ text: "bounded trusted log" });
    if (path.endsWith("/cancel")) return json(job("generation-queued", "cancelled"));
    return json({ detail: `Unhandled ${path}` }, 500);
  }));
});
afterEach(() => vi.unstubAllGlobals());

describe("ArtificialPage", () => {
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
    await ui.findAll('button').find(button => button.text() === 'Save batch selection')!.trigger('click'); await flushPromises();
    const saves = vi.mocked(fetch).mock.calls.filter(([input, init]) => String(input).includes('/generation/batches') && init?.method === 'PUT');
    expect(JSON.parse(String(saves.at(-1)?.[1]?.body)).batch_ids.sort()).toEqual(['batch-0', 'batch-1', 'batch-55', 'batch-56']);
    await next().trigger('click'); await flushPromises();
    await ui.findAll('button').find(button => button.text() === 'Save batch selection')!.trigger('click'); await flushPromises();
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
    await ui.findAll('button').find(button => button.text() === 'Save batch selection')!.trigger('click'); await flushPromises();
    const save = vi.mocked(fetch).mock.calls.find(([input, init]) => String(input).includes('/b/generation/batches') && init?.method === 'PUT');
    expect(JSON.parse(String(save?.[1]?.body)).batch_ids).toEqual([]);
    ui.unmount();
  });
  it("uses server language/mode capabilities, gates accent for Piper and non-English, keeps the workspace phrase immutable, and validates counts", async () => {
    const ui = mount(host()); await flushPromises(); await flushPromises();
    expect(ui.get('[data-generation-phrase]').text()).toContain("Hey Cedar"); expect(ui.find('input[name="phrase"]').exists()).toBe(false);
    await ui.get('select[name="tts-mode"]').setValue("piper"); await flushPromises();
    expect((ui.get('select[name="english-accent"]').element as HTMLSelectElement).disabled).toBe(true);
    await ui.get('input[name="samples"]').setValue("0"); await ui.get("form").trigger("submit");
    expect(ui.get('[role="alert"]').text()).toContain("positive");
    await ui.get('input[name="samples"]').setValue("20"); await ui.get('input[name="batch-size"]').setValue("0"); await ui.get("form").trigger("submit");
    expect(ui.get('[role="alert"]').text()).toContain("positive");
    workspace.selectedId.value = "b"; await flushPromises(); await flushPromises();
    expect(ui.get('[data-generation-phrase]').text()).toContain("Okay Maple"); expect((ui.get('select[name="english-accent"]').element as HTMLSelectElement).disabled).toBe(true);
    expect((ui.get('select[name="tts-mode"]').element as HTMLSelectElement).value).toBe("modern");
    ui.unmount();
  });

  it("selects only completed batches, clears old recipe state on word changes, and reports real queued/cancelled/failed job states", async () => {
    const ui = mount(host()); await flushPromises(); await flushPromises();
    expect((ui.get('input[data-batch-id="ready"]').element as HTMLInputElement).checked).toBe(true);
    expect((ui.get('input[data-batch-id="partial"]').element as HTMLInputElement).disabled).toBe(true);
    await ui.get('[data-action="generate"]').trigger("click"); await flushPromises();
    expect(ui.get('[data-job-id="generation-queued"]').text()).toContain("queued");
    await ui.get('[data-action="cancel-job"]').trigger("click"); await flushPromises();
    expect(ui.get('[data-job-id="generation-queued"]').text()).toContain("cancelled");
    workspace.selectedId.value = "b"; await flushPromises(); await flushPromises();
    expect(ui.find('input[data-batch-id="ready"]').exists()).toBe(false); expect(ui.text()).not.toContain("Hey Cedar");
    ui.unmount();
  });
});

  it("binds Generate to the word captured at click time and clears stale save busy state on a switch", async () => {
    const ui = mount(host()); await flushPromises(); await flushPromises();
    delayRecipeSave = true;
    await ui.get('[data-action="generate"]').trigger("click"); await flushPromises();
    workspace.selectedId.value = "b"; await flushPromises();
    expect(resolveRecipeSave).toBeTypeOf("function"); resolveRecipeSave?.(json(recipe)); await flushPromises(); await flushPromises();
    const generatedForB = vi.mocked(fetch).mock.calls.some(([input, init]) => String(input).endsWith("/wakewords/b/generation/jobs") && init?.method === "POST");
    expect(generatedForB).toBe(false);
    expect((ui.get('[data-action="generate"]').element as HTMLButtonElement).disabled).toBe(false);
    ui.unmount();
  });
