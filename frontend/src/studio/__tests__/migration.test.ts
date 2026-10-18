import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import TrainerApp from "../../TrainerApp.vue";

const word = { id: "legacy", phrase: "Hello legacy", language: "en", model_id: "hello_legacy", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" };
const page = (items: unknown[]) => ({ items, total: items.length, offset: 0, limit: 100 });
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
let wrapper: VueWrapper | undefined;
let requests: { method: string; path: string; body?: unknown }[];

beforeEach(() => {
  requests = [];
  history.replaceState(null, "", "/#/wakewords");
  vi.stubGlobal("fetch", vi.fn(async (input: string, init?: RequestInit) => {
    const url = new URL(input, "http://localhost");
    const method = init?.method ?? "GET";
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    requests.push({ method, path: url.pathname, body });
    if (url.pathname === "/api/studio/wakewords") return json(page([word]));
    if (url.pathname === "/api/studio/migration") return json({ fingerprint: "legacy-fingerprint", counts: { personal: 1, negative: 1, captured: 1, models: 1 }, phrases: ["unknown phrase"], models: ["unknown"], requires_phrase_assignment: true, requires_model_assignment: true });
    if (url.pathname === "/api/studio/migration/import") return json({ fingerprint: "legacy-fingerprint", word_id: word.id, imported_samples: 3, imported_models: 1, skipped_samples: 0, skipped_models: 0 });
    if (url.pathname === "/api/studio/schedules") return json([]);
    if (url.pathname.endsWith("/queue")) return json(page([]));
    if (url.pathname.endsWith("/models")) return json(page([]));
    return json(word);
  }));
});
afterEach(() => { wrapper?.unmount(); vi.unstubAllGlobals(); });

describe("legacy migration first-run flow", () => {
  it("inspects inventory, requires explicit unknown assignments, and reports import", async () => {
    wrapper = mount(TrainerApp, { attachTo: document.body });
    await flushPromises();
    expect(wrapper.text()).toContain("Legacy import");
    expect(wrapper.text()).toContain("3 audio files");
    const importButton = wrapper.get('[data-action="legacy-import"]');
    expect(importButton.attributes("disabled")).toBeDefined();
    await wrapper.get('input[name="legacy-phrase-unknown phrase"]').setValue("legacy");
    await wrapper.get('input[name="legacy-model-unknown"]').setValue("legacy");
    expect(importButton.attributes("disabled")).toBeUndefined();
    await importButton.trigger("click");
    await flushPromises();
    expect(requests.find(request => request.path === "/api/studio/migration/import")?.body).toEqual({ word_id: "legacy", phrase_assignments: { "unknown phrase": "legacy" }, model_assignments: { unknown: "legacy" } });
    expect(wrapper.text()).toContain("Imported 3 samples and 1 archived model");
  });
});
