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

describe("wakewords does not expose legacy migration", () => {
  it("does not inspect or offer to import singleton legacy files", async () => {
    wrapper = mount(TrainerApp, { attachTo: document.body });
    await flushPromises();
    expect(wrapper.text()).not.toContain("Legacy import");
    expect(wrapper.find('[data-action="legacy-import"]').exists()).toBe(false);
    expect(requests.some(request => request.path.startsWith('/api/studio/migration'))).toBe(false);
  });
});
