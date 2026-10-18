import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { provide } from "vue";
import NegativeDatasetsPage from "../pages/NegativeDatasetsPage.vue";
import { createWorkspace, workspaceKey, type Workspace } from "../workspace";
import { useStudioRoutes } from "../routes";

const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
const words = [{ id: "a", phrase: "Hey Cedar", language: "en", model_id: "cedar", created_at: "", updated_at: "" }, { id: "b", phrase: "Okay Maple", language: "en", model_id: "maple", created_at: "", updated_at: "" }];
const dataset = (index: number, selected = false) => ({ id: `set-${index}`, name: `Corpus ${index}`, description: index === 150 ? "speech collection" : "negative classifier corpus", source: "Example source", license: "CC-BY", representation: "features", split: index === 151 ? "evaluation" : "train", adapter: "mww_mmap", purpose: "classifier_negative", download_bytes: 1000, installed_bytes: index === 0 ? 1000 : null, fingerprint: null, selected, status: index === 0 ? "installed" : index === 2 ? "running" : "available", job_id: index === 2 ? "download-2" : null, error_code: null });
const catalog = Array.from({ length: 200 }, (_, index) => dataset(index));
let workspace: Workspace;
function host() { return { components: { NegativeDatasetsPage }, setup() { workspace = createWorkspace(useStudioRoutes()); provide(workspaceKey, workspace); }, template: "<NegativeDatasetsPage />" }; }

beforeEach(() => {
  history.replaceState(null, "", "#/negative-datasets?word=a");
  vi.stubGlobal("fetch", vi.fn(async (input: string, init?: RequestInit) => {
    const url = new URL(input, "http://localhost"); const path = url.pathname;
    if (path === "/api/studio/wakewords") return json({ items: words, total: 2, offset: 0, limit: 100 });
    if (path.match(/\/wakewords\/[ab]$/)) return json(words.find(word => path.endsWith(word.id)));
    if (path.endsWith("/queue")) return json({ items: [], total: 0, offset: 0, limit: 1 });
    if (path.endsWith("/models")) return json({ items: [], total: 0, offset: 0, limit: 1 });
    if (path === "/api/studio/schedules") return json([]);
    const match = path.match(/^\/api\/studio\/wakewords\/([ab])\/datasets$/);
    if (match && init?.method === "PUT") return json({ items: [], total: 0, offset: 0, limit: 50 });
    if (match) {
      const search = url.searchParams.get("search") ?? ""; const status = url.searchParams.get("status"); const offset = Number(url.searchParams.get("offset") ?? 0); const limit = Number(url.searchParams.get("limit") ?? 50);
      const selected = match[1] === "a" ? new Set(["set-0"]) : new Set(["set-1"]);
      const filtered = catalog.map(row => ({ ...row, selected: selected.has(row.id) })).filter(row => (!search || `${row.name} ${row.description}`.toLowerCase().includes(search.toLowerCase())) && (!status || (status === "selected" ? row.selected : row.status === status)));
      return json({ items: filtered.slice(offset, offset + limit), total: filtered.length, offset, limit });
    }
    if (path === "/api/studio/datasets/set-2/download") return json({ id: "download-2", kind: "download", word_id: null, resource: "download", payload: { dataset_id: "set-2" }, status: "running", created_at: "", started_at: "", finished_at: null, result: {} }, 201);
    if (path === "/api/studio/jobs/download-2") return json({ id: "download-2", kind: "download", word_id: null, resource: "download", payload: { dataset_id: "set-2" }, status: "running", created_at: "", started_at: "", finished_at: null, result: {} });
    if (path === "/api/studio/jobs/download-2/logs") return json({ text: "Downloading classifier dataset" });
    return json({ detail: `Unhandled ${path}` }, 500);
  }));
});
afterEach(() => vi.unstubAllGlobals());

describe("NegativeDatasetsPage", () => {
  it("searches, filters, paginates a 200-entry real catalog, and exposes install state/progress and provenance", async () => {
    const ui = mount(host()); await flushPromises(); await flushPromises();
    expect(ui.text()).toContain("1–50 of 200"); expect(ui.text()).toContain("Corpus 0"); expect(ui.text()).toContain("Example source"); expect(ui.text()).toContain("CC-BY");
    await ui.get('[data-action="next-page"]').trigger("click"); await flushPromises();
    expect(ui.text()).toContain("51–100 of 200"); expect(ui.text()).toContain("Corpus 50");
    await ui.get("input[name=dataset-search]").setValue("speech"); await flushPromises();
    expect(ui.text()).toContain("Corpus 150"); expect(ui.text()).toContain("1–1 of 1");
    await ui.get("input[name=dataset-search]").setValue(""); await flushPromises();
    await ui.get("select[name=dataset-status]").setValue("running"); await flushPromises();
    expect(ui.text()).not.toContain("Corpus 150"); expect(ui.text()).toContain("Corpus 2"); expect(ui.get('[data-job-id="download-2"]').text()).toContain("running");
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
