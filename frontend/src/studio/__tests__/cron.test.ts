import { afterEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import CronEditor from "../components/CronEditor.vue";
const schedule = { scope: "scrape", cron: "0 2 * * *", timezone: "UTC", enabled: true, next_run_at: "2026-10-19T02:00:00Z" };

afterEach(() => vi.unstubAllGlobals());
describe("CronEditor", () => {
  it("makes global scrape versus per-word training scope explicit and renders only the server computed next run", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ ...schedule, cron: "*/5 * * * *", timezone: "America/New_York", next_run_at: "2026-10-18T17:25:00Z" }), { headers: { "Content-Type": "application/json" } })));
    const global = mount(CronEditor, { props: { scope: "scrape", schedule } });
    const localTime = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
    expect(global.text()).toContain("Global scrape schedule"); expect(global.text()).toContain("UTC"); expect(global.text()).toContain(localTime("2026-10-19T02:00:00Z"));
    await global.get('input[name="cron"]').setValue("*/5 * * * *"); await global.get('input[name="timezone"]').setValue("America/New_York"); await global.get("form").trigger("submit"); await flushPromises();
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain("/schedules/scrape"); expect(global.text()).toContain(localTime("2026-10-18T17:25:00Z"));
    const train = mount(CronEditor, { props: { scope: "train:word-1", schedule: { ...schedule, scope: "train:word-1" } } });
    expect(train.text()).toContain("Training schedule for this wakeword"); expect(train.text()).not.toContain("Global scrape schedule");
  });
});
