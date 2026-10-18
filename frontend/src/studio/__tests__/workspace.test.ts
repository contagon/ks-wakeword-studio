import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import TrainerApp from "../../TrainerApp.vue";

const words = [
  { id: "a", phrase: "Hey Cedar", language: "en", model_id: "cedar", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "b", phrase: "Okay Maple", language: "en", model_id: "maple", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
];
const page = (items: unknown[], total = items.length) => ({ items, total, offset: 0, limit: 100 });
let wrapper: VueWrapper | undefined;
let records = structuredClone(words);
let requests: { path: string; init?: RequestInit }[];
let intercept: ((path: string, init?: RequestInit) => Promise<Response> | undefined) | undefined;
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

beforeEach(() => {
  records = structuredClone(words);
  requests = [];
  intercept = undefined;
  localStorage.clear();
  history.replaceState(null, "", "/#/wakewords");
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    const path = String(url);
    requests.push({ path, init });
    const delayed = intercept?.(path, init);
    if (delayed) return delayed;
    const u = new URL(path, "http://localhost");
    if (u.pathname === "/api/studio/wakewords") {
      if (init?.method === "POST") {
        const word = { ...words[0], ...JSON.parse(String(init.body)), id: "c" };
        records.push(word);
        return json(word, 201);
      }
      return json(page(records));
    }
    if (u.pathname === "/api/studio/schedules") return json([{ scope: "train:a", cron: "0 2 * * *", timezone: "UTC", enabled: true, next_run_at: "2026-01-02T02:00:00Z" }]);
    const id = u.pathname.split("/")[4];
    if (u.pathname.endsWith("/queue")) return json(page([], id === "a" ? 7 : 2));
    if (u.pathname.endsWith("/models")) return json(page([]));
    const word = records.find(w => w.id === id);
    if (init?.method === "PATCH" && word) Object.assign(word, JSON.parse(String(init.body)));
    return word ? json(word) : json({ detail: "Studio record not found" }, 404);
  }));
});
afterEach(() => { wrapper?.unmount(); wrapper = undefined; vi.unstubAllGlobals(); document.body.innerHTML = ""; });
async function open() { wrapper = mount(TrainerApp, { attachTo: document.body }); await flushPromises(); return wrapper; }

describe("compact studio workspace", () => {
  it("groups exactly eight real navigation pages and labels unfinished modules honestly", async () => {
    const ui = await open();
    expect(ui.get('nav').findAll('a').map(a => a.text())).toEqual(["Wakewords", "Negative Datasets", "Artificial", "Scrape", "Classify", "Samples", "Train", "Deploy"]);
    expect(ui.get('nav').text()).toContain("Data");
    await ui.get('[data-page="train"]').trigger('click');
    expect(ui.get('h1').text()).toBe("Train");
    expect(ui.text()).toContain("Not implemented yet");
    expect(ui.text()).not.toContain("Start training");
  });
  it("preserves selection across navigation, reload, and direct links", async () => {
    let ui = await open();
    await ui.get('#studio-word').setValue('b'); await flushPromises();
    await ui.get('[data-page="samples"]').trigger('click'); await flushPromises();
    expect(location.hash).toBe('#/samples?word=b');
    ui.unmount(); wrapper = undefined;
    ui = await open();
    expect((ui.get('#studio-word').element as HTMLSelectElement).value).toBe('b');
    expect(ui.get('h1').text()).toBe('Samples');
    ui.unmount(); wrapper = undefined;
    history.replaceState(null, '', '/#/deploy?word=a');
    ui = await open();
    expect((ui.get('#studio-word').element as HTMLSelectElement).value).toBe('a');
    expect(ui.get('h1').text()).toBe('Deploy');
  });
  it("falls back from unknown/deleted IDs without leaving stale selection in links", async () => {
    history.replaceState(null, '', '/#/wakewords?word=deleted');
    const ui = await open();
    expect((ui.get('#studio-word').element as HTMLSelectElement).value).toBe('a');
    expect(ui.text()).toContain('no longer available');
    expect(location.hash).toBe('#/wakewords?word=a');
    records = records.filter(w => w.id !== 'a');
    await ui.get('[data-action="refresh"]').trigger('click'); await flushPromises();
    expect((ui.get('#studio-word').element as HTMLSelectElement).value).toBe('b');
    expect(ui.text()).not.toContain('7 pending');
  });
  it("aborts old word requests and ignores completions even when transport ignores abort", async () => {
    let finish!: (value: Response) => void;
    let signal: AbortSignal | null | undefined;
    intercept = (path, init) => {
      if (path.includes('/wakewords/a/queue')) { signal = init?.signal; return new Promise(resolve => { finish = resolve; }); }
    };
    const ui = await open();
    await ui.get('#studio-word').setValue('b'); await flushPromises();
    expect(signal?.aborted).toBe(true);
    expect(ui.text()).toContain('2 pending');
    finish(json(page([], 999))); await flushPromises();
    expect(ui.text()).not.toContain('999');
    expect(ui.text()).toContain('Okay Maple');
  });
  it("edits phrase/language without sending or changing stable model identity", async () => {
    const ui = await open();
    expect(ui.get('[data-form="edit"] input[name="model_id"]').attributes('readonly')).toBeDefined();
    await ui.get('[data-form="edit"] input[name="phrase"]').setValue('Hello Cedar');
    await ui.get('[data-form="edit"]').trigger('submit'); await flushPromises();
    const patch = requests.find(r => r.init?.method === 'PATCH');
    expect(JSON.parse(String(patch?.init?.body))).toEqual({ phrase: 'Hello Cedar', language: 'en' });
    expect(ui.text()).toContain('Hello Cedar');
    expect((ui.get('[data-form="edit"] input[name="model_id"]').element as HTMLInputElement).value).toBe('cedar');
  });
  it("creates a real workspace and selects the server's immutable identity", async () => {
    const ui = await open();
    await ui.get('[data-form="create"] input[name="phrase"]').setValue('Hi Birch');
    await ui.get('[data-form="create"] input[name="model_id"]').setValue('birch');
    await ui.get('[data-form="create"]').trigger('submit'); await flushPromises();
    expect(records[2].model_id).toBe('birch');
    expect((ui.get('#studio-word').element as HTMLSelectElement).value).toBe('c');
    expect(location.hash).toBe('#/wakewords?word=c');
  });
  it("offers keyboard-focusable collapsing navigation and returns focus after Escape", async () => {
    const ui = await open();
    const toggle = ui.get('[aria-controls="studio-navigation"]');
    expect(toggle.attributes('aria-expanded')).toBe('false');
    (toggle.element as HTMLButtonElement).focus();
    await toggle.trigger('click');
    expect(toggle.attributes('aria-expanded')).toBe('true');
    await ui.get('nav').trigger('keydown', { key: 'Escape' });
    expect(toggle.attributes('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(toggle.element);
    expect(ui.get('a[href="#studio-content"]').text()).toBe('Skip to content');
  });
  it("shows real empty/loading/error states with retry instead of invented counts", async () => {
    records = [];
    const ui = await open();
    expect(ui.text()).toContain('No wakewords yet');
    expect(ui.text()).not.toContain('pending');
    ui.unmount(); wrapper = undefined;
    intercept = () => Promise.reject(new TypeError('offline'));
    const failed = await open();
    expect(failed.get('[role="alert"]').text()).toContain('Unable to reach');
    expect(failed.text()).not.toContain('No wakewords yet');
    intercept = undefined;
    await failed.get('[data-action="refresh"]').trigger('click'); await flushPromises();
    expect(failed.text()).toContain('No wakewords yet');
  });
});
