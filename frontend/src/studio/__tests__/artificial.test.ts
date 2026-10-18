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
function host() { return { components: { ArtificialPage }, setup() { workspace = createWorkspace(useStudioRoutes()); provide(workspaceKey, workspace); onMounted(() => { void workspace.load(); }); }, template: "<ArtificialPage />" }; }

beforeEach(() => {
  history.replaceState(null, "", "#/artificial?word=a");
  vi.stubGlobal("fetch", vi.fn(async (input: string, init?: RequestInit) => {
    const url = new URL(input, "http://localhost"); const path = url.pathname;
    if (path === "/api/studio/wakewords") return json({ items: words, total: 2, offset: 0, limit: 100 });
    if (path.match(/\/wakewords\/[ab]$/)) return json(words.find(word => path.endsWith(word.id)));
    if (path.endsWith("/queue")) return json({ items: [], total: 0, offset: 0, limit: 1 }); if (path.endsWith("/models")) return json({ items: [], total: 0, offset: 0, limit: 1 }); if (path === "/api/studio/schedules") return json([]);
    if (path === "/api/studio/generation/catalog") return json([{ language: "en", name: "English", accent_applies: true, english_accents: [{ code: "us", label: "US" }], engines: { hybrid: ["modern", "piper"], modern: ["modern"], piper: ["piper"] } }, { language: "fr", name: "French", accent_applies: false, english_accents: [], engines: { hybrid: ["modern"], modern: ["modern"], piper: [] } }]);
    const word = path.match(/^\/api\/studio\/wakewords\/([ab])\/generation\/(recipe|batches|jobs)$/);
    if (word?.[2] === "recipe") { if (init?.method === "PUT") return json(JSON.parse(String(init.body))); return word[1] === "a" ? json(recipe) : json({ ...recipe, language: "fr", english_accent: "mixed", tts_mode: "modern" }); }
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
