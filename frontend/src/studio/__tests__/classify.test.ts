import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import StudioShell from '../components/StudioShell.vue';
import { fakeMedia, fakeStudio, press, recording, sample, json, type Req } from "./fakeStudio";

let wrapper: VueWrapper | undefined;
let server: ReturnType<typeof fakeStudio>;
let media: ReturnType<typeof fakeMedia>;

beforeEach(() => {
  localStorage.clear();
  history.replaceState(null, "", "/#/classify?word=a");
  server = fakeStudio();
  media = fakeMedia();
  server.db.samples.push(sample("s1", "a"), sample("s2", "a"), sample("s3", "a", "pending", { recording: recording("r-s3", { word_id: "a", near_miss: true }) }), sample("b1", "b"));
});
afterEach(() => { wrapper?.unmount(); wrapper = undefined; document.body.innerHTML = ""; });

async function open() { wrapper = mount(StudioShell, { attachTo: document.body }); await flushPromises(); await flushPromises(); return wrapper; }
const current = (ui: VueWrapper) => ui.find("[data-classify-current]").attributes("data-sample-id");
const audioFetches = () => server.requests.filter(r => r.url.pathname.endsWith("/audio")).map(r => r.url.pathname.split("/")[6]);
const labels = () => server.requests.filter(r => r.method === "POST" && r.url.pathname.endsWith("/label"));
const isLabel = (id: string) => (r: Req) => r.method === "POST" && r.url.pathname === `/api/studio/wakewords/a/samples/${id}/label`;
async function settle() { for (let i = 0; i < 4; i++) await flushPromises(); }
async function contentOf(src: string | undefined) { return (await media.contents()).find(([url]) => url === src)?.[1]; }
const playerSrc = (ui: VueWrapper) => ui.find("audio[data-audio-player]").attributes("src");
async function completedCollection(ui: VueWrapper, result: object) {
  const job = { id: 'collect-test', kind: 'scrape', word_id: 'a', resource: 'collection', payload: {}, created_at: '', started_at: null, finished_at: '', result };
  server.hold(r => r.url.pathname.endsWith('/jobs/collect-test'), () => json({ ...job, status: 'complete' })).release();
  server.hold(r => r.url.pathname.endsWith('/jobs/collect-test/logs'), () => json({ text: '' })).release();
  server.hold(r => r.url.pathname.endsWith('/a/collection/jobs'), () => json({ ...job, status: 'queued', result: {} })).release();
  await ui.get('[data-action="collect-now"]').trigger('click'); await settle();
  await vi.waitFor(() => expect(ui.find('[data-collection-outcome]').exists()).toBe(true), { timeout: 3500 });
}

describe("keyboard-first classification", () => {
  it('refreshes satellite labels learned during collection without a page reload', async () => {
    const ui = await open();
    server.db.devices = [{ id: 'kiosk-1', name: 'Kitchen satellite', url: 'http://kiosk', role: 'standalone', active: true, leader_id: null, credentials_status: 'ready', profile_id: null, model_eligible: true }];
    await completedCollection(ui, { run_id: 'name-refresh', status: 'complete', new: 0, failed: 0 });
    expect(ui.get('[data-classify-current]').text()).toContain('Kitchen satellite');
  });
  it('tracks manual collection without adding a local queue button and refreshes on completion', async () => {
    const ui = await open();
    server.db.samples.push(sample('collected', 'a'));
    await completedCollection(ui, { run_id: 'new-run', status: 'complete', new: 1, new_mapped: 1, failed: 0 });
    expect(ui.findAll('button').some(button => /^View collection .* in queue$/.test(button.text()))).toBe(false);
    expect(ui.get('[data-collection-outcome]').text()).toContain('1 imported');
    expect(ui.get('[data-progress]').text()).toContain('4 pending');
    expect(ui.find('[data-action="open-job-queue"]').exists()).toBe(true);
  });

  it('does not enqueue a second manual collection while the tracked job is active', async () => {
    const ui = await open();
    const job = { id: 'collect-active', kind: 'scrape', word_id: 'a', resource: 'collection', payload: {}, created_at: '', started_at: null, finished_at: null, result: {}, status: 'queued' };
    server.hold(r => r.url.pathname.endsWith('/a/collection/jobs'), () => json(job)).release();
    server.hold(r => r.url.pathname.endsWith('/jobs/collect-active'), () => json(job)).release();
    await ui.get('[data-action="collect-now"]').trigger('click'); await settle();
    expect(ui.get('[data-action="collect-now"]').attributes('disabled')).toBeDefined();
    expect(ui.get('[data-action="collect-now"]').attributes('aria-busy')).toBe('true');
    expect(ui.find('[data-action="close-job-queue"]').exists()).toBe(false);
    await ui.get('[data-action="collect-now"]').trigger('click'); await settle();
    expect(server.requests.filter(r => r.method === 'POST' && r.url.pathname.endsWith('/collection/jobs'))).toHaveLength(1);
    expect(ui.findAll('button').some(button => /^View collection .* in queue$/.test(button.text()))).toBe(false);
  });
  it('suppresses classification shortcuts while a job log summary has modal focus', async () => {
    server.db.jobs.push({ id: 'modal-job', kind: 'train', word_id: 'a', resource: 'gpu', payload: {}, status: 'running', created_at: '', started_at: null, finished_at: null, result: {} });
    const ui = await open();
    await ui.get('[data-action="open-job-queue"]').trigger('click'); await settle();
    const summary = ui.get('[data-job-id="modal-job"] summary'); (summary.element as HTMLElement).focus();
    const before = current(ui);
    for (const key of ['p', 'n', 's', 'z', 'd']) { press(key, {}, summary.element); await settle(); }
    expect(current(ui)).toBe(before); expect(labels()).toHaveLength(0);
    expect(ui.find('[data-classify-discard]').exists()).toBe(false);
    await ui.get('[data-action="close-job-queue"]').trigger('click'); await settle();
    press('p'); await settle(); expect(labels()).toHaveLength(1);
  });
  it('shows failed collection outcomes instead of reporting only completed queue work', async () => {
    const ui = await open();
    await completedCollection(ui, { run_id: 'failed-run', status: 'partial', new: 0, failed: 2, unmapped: 0, evicted: 0 });
    const outcome = ui.get('[data-collection-outcome]');
    expect(outcome.attributes('role')).toBe('alert');
    expect(outcome.text()).toContain('Collection needs attention');
    expect(outcome.text()).toContain('0 imported');
    expect(outcome.text()).toContain('2 failed');
    expect(outcome.get('a').attributes('href')).toContain('tab=collect');
  });
  it('refreshes newly collected unknown sources without leaving Unmapped', async () => {
    const ui = await open();
    await ui.get('#classify-tab-unmapped').trigger('click');
    expect(ui.text()).toContain('No unmapped recordings.');
    server.db.unmapped.push(recording('new-source', { phrase: 'New unknown phrase' }));
    await completedCollection(ui, { run_id: 'new-run', status: 'complete', new: 1, new_mapped: 0, failed: 0 });
    expect(ui.get('#classify-panel-unmapped').text()).toContain('New unknown phrase');
    server.db.unmapped.push(recording('another-source', { phrase: 'Another unknown phrase' }));
    await ui.get('[data-action="refresh-unmapped"]').trigger('click'); await settle();
    expect(ui.get('#classify-panel-unmapped').text()).toContain('Another unknown phrase');
  });
  it('ignores an old label conflict after switching workspaces', async () => {
    const ui = await open();
    const delayed = server.hold(isLabel('s1'), () => new Response('{}', { status: 409 }));
    press('p'); await settle();
    await ui.get('#studio-word').setValue('b'); await settle();
    Object.assign(server.db.samples.find(s => s.id === 's1')!, { revision: 2, label: 'negative' });
    delayed.release(); await settle();
    expect(current(ui)).toBe('b1');
    expect(ui.find('[data-classify-error]').exists()).toBe(false);
    expect(audioFetches().filter(id => id === 'b1')).toHaveLength(1);
  });

  it('does not announce an old undo result in the replacement workspace', async () => {
    const ui = await open();
    press('p'); await settle();
    const delayed = server.hold(r => r.url.pathname.endsWith('/a/samples/s1/undo'));
    press('z'); await settle();
    await ui.get('#studio-word').setValue('b'); await settle();
    delayed.release(); await settle();
    expect(current(ui)).toBe('b1');
    expect(ui.text()).not.toContain('Last label restored');
    expect(ui.get('[data-progress]').text()).toContain('0 reviewed');
  });
  it("shows playback guidance only after the current audio is ready", async () => {
    const audio = server.hold(r => r.url.pathname.endsWith('/s1/audio'));
    const ui = await open();
    expect(ui.text()).not.toContain('Press Space once');
    audio.release(); await settle();
    expect(ui.text()).toContain('Press Space once');
    server.db.samples = [];
    await ui.get('select[name=kind]').setValue('true'); await settle();
    expect(ui.text()).not.toContain('Press Space once');
  });
  it("refills beyond 100 acknowledged labels without false queue completion", async () => {
    server.db.samples = Array.from({ length: 125 }, (_, index) => sample(`many-${index}`, "a"));
    const ui = await open();
    for (let index = 0; index < 101; index++) { expect(current(ui)).toBe(`many-${index}`); press("p"); await settle(); }
    expect(current(ui)).toBe("many-101");
    expect(ui.get("[data-progress]").text()).toContain("24 pending");
  });

  it("advances past a fully skipped window, keeps pending labels, and scopes session skips by word", async () => {
    server.db.samples = [...Array.from({ length: 125 }, (_, index) => sample(`skip-${index}`, "a")), sample("skip-0", "b")];
    const ui = await open();
    for (let index = 0; index < 125; index++) { expect(current(ui)).toBe(`skip-${index}`); press("s"); await settle(); }
    expect(ui.text()).toContain("skipped for this session");
    expect(ui.text()).not.toContain("No pending recordings");
    expect(server.db.samples.every(item => item.label === "pending")).toBe(true);
    expect(labels()).toHaveLength(0);
    await ui.get("#studio-word").setValue("b"); await settle();
    expect(current(ui)).toBe("skip-0");
    await ui.get("#studio-word").setValue("a"); await settle();
    expect(ui.find("[data-classify-current]").exists()).toBe(false);
  });
  it('rejects a stale refill response after switching words', async () => {
    server.db.samples = [...Array.from({ length: 125 }, (_, index) => sample(`window-${index}`, 'a')), sample('other-window', 'b')];
    const ui = await open();
    const stale = server.hold(r => r.url.pathname.endsWith('/a/queue') && r.url.searchParams.get('offset') === '100');
    for (let index = 0; index < 100; index++) { press('s'); await settle(); }
    expect(stale.request()).toBeDefined();
    await ui.get('#studio-word').setValue('b'); await settle();
    stale.release(); await settle();
    expect(current(ui)).toBe('other-window');
    expect(ui.get('[data-progress]').text()).toContain('1 pending');
    expect(ui.get('[data-progress]').text()).toContain('0 skipped');
  });
  it("retires the legacy mapping and shows a real workspace queue with a visible shortcut legend", async () => {
    const ui = await open();
    expect(ui.get("h1").text()).toBe("Classify");
    expect(ui.find("[data-legacy-trainer]").exists()).toBe(false);
    expect(ui.find("[data-studio-placeholder]").exists()).toBe(false);
    expect(current(ui)).toBe("s1");
    const legend = ui.get("[data-shortcuts]").text();
    for (const key of ["P", "N", "Space", "R", "S", "Z"]) expect(legend).toContain(key);
    expect(ui.get("[data-progress]").text()).toContain("3 pending");
    expect(server.requests.some(r => r.url.pathname === "/api/studio/wakewords/b/queue")).toBe(false);
  });

  it("gates autoplay on the first user gesture", async () => {
    const ui = await open();
    expect(audioFetches()).toEqual(["s1"]);
    expect(media.plays).toEqual([]);
    expect(ui.text()).toContain("Press Space");
    press(" "); await settle();
    expect(media.plays).toHaveLength(1);
    expect(await contentOf(media.plays[0])).toBe("audio:s1");
  });

  it("labels with P/N and plays the next clip only after the server acknowledges the label", async () => {
    const ui = await open();
    press(" "); await settle();
    const ack = server.hold(isLabel("s1"));
    press("p"); await settle();
    expect(labels().map(r => r.body)).toEqual([{ label: "positive", expected_revision: 0 }]);
    expect(current(ui)).toBe("s1");
    expect(audioFetches()).toEqual(["s1"]);
    expect(media.plays).toHaveLength(1);
    ack.release(); await settle();
    expect(current(ui)).toBe("s2");
    expect(audioFetches()).toEqual(["s1", "s2"]);
    expect(media.plays).toHaveLength(2);
    expect(await contentOf(media.plays[1])).toBe("audio:s2");
    press("n"); await settle();
    expect(labels().map(r => r.body)).toContainEqual({ label: "negative", expected_revision: 0 });
    expect(server.db.samples.find(s => s.id === "s2")?.label).toBe("negative");
    expect(ui.get("[data-progress]").text()).toContain("2 reviewed");
  });

  it("prevents double submission from repeated or rapid keys while a label is in flight", async () => {
    await open();
    const ack = server.hold(isLabel("s1"));
    press("p"); press("p"); press("n"); press("p", { repeat: true }); await settle();
    expect(labels()).toHaveLength(1);
    ack.release(); await settle();
    press("p", { repeat: true }); await settle();
    expect(labels()).toHaveLength(1);
  });

  it("announces a failed save, keeps the clip, and retries with the same server revision", async () => {
    const ui = await open();
    server.failNext(isLabel("s1"), 503);
    press("p"); await settle();
    expect(current(ui)).toBe("s1");
    expect(ui.get("[data-classify-error]").attributes("role")).toBe("alert");
    expect(ui.get("[data-classify-error]").text()).toContain("not saved");
    expect(ui.text()).not.toContain("secret upstream body");
    press("p"); await settle();
    expect(labels().map(r => r.body)).toEqual([{ label: "positive", expected_revision: 0 }, { label: "positive", expected_revision: 0 }]);
    expect(current(ui)).toBe("s2");
  });

  it("refreshes the revision after a conflict instead of overwriting a concurrent change", async () => {
    const ui = await open();
    server.db.samples.find(s => s.id === "s1")!.revision = 4;
    press("n"); await settle();
    expect(current(ui)).toBe("s1");
    expect(ui.get("[data-classify-error]").text()).toContain("changed elsewhere");
    press("n"); await settle();
    expect(labels().map(r => r.body)).toEqual([{ label: "negative", expected_revision: 0 }, { label: "negative", expected_revision: 4 }]);
    expect(current(ui)).toBe("s2");
  });

  it("drops a clip that was labeled elsewhere when its revision conflicts", async () => {
    const ui = await open();
    Object.assign(server.db.samples.find(s => s.id === "s1")!, { revision: 2, label: "negative" });
    press("p"); await settle();
    expect(current(ui)).toBe("s2");
    expect(labels()).toHaveLength(1);
  });

  it("keeps letter shortcuts working while a clicked button has focus", async () => {
    const ui = await open();
    const button = ui.get("[data-action=replay]").element as HTMLButtonElement;
    button.focus();
    press("p", {}, button); await settle();
    expect(labels()).toHaveLength(1);
  });

  it("suppresses shortcuts in form controls, Space on buttons, with modifiers, and behind an open modal", async () => {
    const ui = await open();
    const kind = ui.get("select[name=kind]").element as HTMLSelectElement;
    kind.focus();
    press("p", {}, kind); press(" ", {}, kind);
    const button = ui.get("[data-action=replay]").element as HTMLButtonElement;
    press(" ", {}, button);
    press("p", { ctrlKey: true }); press("n", { metaKey: true }); press("p", { altKey: true }); press("P", { shiftKey: true });
    await settle();
    expect(labels()).toHaveLength(0);
    expect(media.plays).toHaveLength(0);
    press("d"); await settle();
    const dialog = ui.get("[data-dialog=discard]");
    expect(dialog.attributes("aria-modal")).toBe("true");
    press("p"); press("n"); press("s"); press("z"); press(" "); await settle();
    expect(labels()).toHaveLength(0);
    expect(current(ui)).toBe("s1");
    press("Escape"); await settle();
    expect(ui.find("[data-dialog=discard]").exists()).toBe(false);
    expect(server.mutations()).toHaveLength(0);
    press("d"); await settle();
    await ui.get("[data-action=confirm-discard]").trigger("click"); await settle();
    expect(labels().map(r => r.body)).toEqual([{ label: "discarded", expected_revision: 0 }]);
    expect(current(ui)).toBe("s2");
  });

  it("announces a rejected play() promise and keeps classification usable", async () => {
    const ui = await open();
    media.rejectPlay();
    press(" "); await settle();
    expect(ui.get("[data-classify-error]").text()).toContain("Playback was blocked");
    media.resolvePlay();
    press("p"); await settle();
    expect(current(ui)).toBe("s2");
    expect(media.plays).toHaveLength(2);
  });

  it("supports Space pause, R replay and S skip-for-session without a server mutation", async () => {
    const ui = await open();
    press(" "); await settle();
    press(" "); await settle();
    expect(media.pauses.length).toBeGreaterThan(0);
    const audio = ui.get("audio[data-audio-player]").element as HTMLAudioElement;
    audio.currentTime = 0.5;
    press("r"); await settle();
    expect(audio.currentTime).toBe(0);
    expect(media.plays).toHaveLength(2);
    press("s"); await settle();
    expect(current(ui)).toBe("s2");
    expect(server.mutations()).toHaveLength(0);
    expect(server.db.samples.find(s => s.id === "s1")?.label).toBe("pending");
    expect(ui.get("[data-progress]").text()).toContain("1 skipped");
  });

  it("undoes the last acknowledged label through the server after navigating away and back", async () => {
    let ui = await open();
    press("p"); await settle();
    press("n"); await settle();
    expect(current(ui)).toBe("s3");
    await ui.get('[data-page="samples"]').trigger("click"); await settle();
    await ui.get('[data-page="classify"]').trigger("click"); await settle();
    ui = wrapper!;
    expect(current(ui)).toBe("s3");
    press("z"); await settle();
    const undo = server.requests.filter(r => r.url.pathname.endsWith("/undo"));
    expect(undo.map(r => [r.url.pathname, r.body])).toEqual([["/api/studio/wakewords/a/samples/s2/undo", { expected_revision: 1 }]]);
    expect(current(ui)).toBe("s2");
    press("z"); await settle();
    expect(current(ui)).toBe("s1");
    expect(server.db.samples.filter(s => s.word_id === "a").map(s => s.label)).toEqual(["pending", "pending", "pending"]);
  });

  it("never lets a late audio fetch for a previous clip replace the current one", async () => {
    const late = server.hold(r => r.url.pathname.endsWith("/s1/audio"));
    const fresh = await open();
    press(" "); press("p"); await settle();
    expect(current(fresh)).toBe("s2");
    const src = playerSrc(fresh);
    expect(await contentOf(src)).toBe("audio:s2");
    expect(media.plays).toEqual([src]);
    late.release(); await settle();
    expect(playerSrc(fresh)).toBe(src);
    const texts = (await media.contents()).map(([, text]) => text);
    expect(texts.filter(t => t === "audio:s1")).toHaveLength(0);
    expect(late.request()?.signal?.aborted).toBe(true);
  });

  it("ignores out-of-order queue responses after the filter changes", async () => {
    const stale = server.hold(r => r.url.pathname === "/api/studio/wakewords/a/queue" && r.url.searchParams.get("limit") === "100" && !r.url.searchParams.has("near_miss"));
    const ui = await open();
    await ui.get("select[name=kind]").setValue("true"); await settle();
    expect(current(ui)).toBe("s3");
    stale.release(); await settle();
    expect(current(ui)).toBe("s3");
    expect(ui.get("[data-progress]").text()).toContain("1 pending");
  });

  it("stops old audio, revokes blob URLs and scopes labels when switching words", async () => {
    const ui = await open();
    press(" "); await settle();
    const oldSrc = playerSrc(ui)!;
    await ui.get("#studio-word").setValue("b"); await settle();
    expect(media.pauses).toContain(oldSrc);
    expect(media.revoked).toContain(oldSrc);
    expect(current(wrapper!)).toBe("b1");
    press("p"); await settle();
    expect(labels().map(r => r.url.pathname)).toEqual(["/api/studio/wakewords/b/samples/b1/label"]);
    press("z"); await settle();
    expect(server.requests.filter(r => r.url.pathname.endsWith("/undo")).map(r => r.url.pathname)).toEqual(["/api/studio/wakewords/b/samples/b1/undo"]);
  });

  it("keeps unmapped recordings accessible and assigns them only explicitly to the active word", async () => {
    server.db.unmapped.push(recording("r9", { phrase: "hey seeder" }));
    const ui = await open();
    const row = ui.get("[data-unmapped-id=r9]");
    expect(row.text()).toContain("hey seeder");
    expect(server.mutations()).toHaveLength(0);
    await row.get("[data-action=assign]").trigger("click"); await settle();
    expect(server.mutations().map(r => [r.url.pathname, r.body])).toEqual([["/api/studio/recordings/r9/assign", { word_id: "a" }]]);
    expect(ui.find("[data-unmapped-id=r9]").exists()).toBe(false);
    expect(ui.get("[data-progress]").text()).toContain("4 pending");
  });

  it("does not add an assignment from the previous workspace after switching workspaces", async () => {
    server.db.unmapped.push(recording("r-late", { phrase: "assigned only to A" }));
    const ui = await open();
    const assignment = server.hold(r => r.method === "POST" && r.url.pathname === "/api/studio/recordings/r-late/assign");
    await ui.get("[data-unmapped-id=r-late] [data-action=assign]").trigger("click");
    await settle();
    expect(assignment.request()?.body).toEqual({ word_id: "a" });
    await ui.get("#studio-word").setValue("b"); await settle();
    expect(current(wrapper!)).toBe("b1");
    assignment.release(); await settle();
    expect(current(wrapper!)).toBe("b1");
    expect(wrapper!.get("[data-progress]").text()).toContain("1 pending");
    expect(wrapper!.find("[data-classify-current]").attributes("data-sample-id")).not.toBe("from-r-late");
  });
});
