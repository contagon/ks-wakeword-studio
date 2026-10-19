import { afterEach, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import TrainerApp from '../../TrainerApp.vue';
import { fakeStudio, press } from './fakeStudio';
import type { Job } from '../types';

const job = (id: string, status: Job['status'], extra = {}): Job => ({ id, kind: 'train', resource: 'gpu', word_id: 'a', status, payload: {}, result: {}, created_at: '2026-10-19T12:00:00Z', started_at: null, finished_at: null, ...extra } as Job);
let ui: ReturnType<typeof mount> | undefined;
afterEach(() => { ui?.unmount(); ui = undefined; vi.unstubAllGlobals(); vi.useRealTimers(); document.body.innerHTML = ''; });

it('shows global compact job groups and loads logs only on expansion', async () => {
  const s = fakeStudio(); s.db.jobs = [job('run', 'running'), job('follower', 'cancelling', { kind: 'scrape', resource: 'collection', word_id: 'b', payload: { device_ids: ['kitchen', 'office'] } }), job('shared', 'queued', { kind: 'download', resource: 'download', word_id: null }), job('old', 'failed', { word_id: 'deleted-word' })];
  s.db.devices = ['kitchen', 'office'].map(id => ({ id, name: id === 'kitchen' ? 'Kitchen satellite' : 'Office satellite', url: `http://${id}`, role: 'standalone', active: true, leader_id: null, credentials_status: 'ready', profile_id: null, model_eligible: true }));
  history.replaceState(null, '', '/#/wakewords?word=a');
  ui = mount(TrainerApp, { attachTo: document.body }); await flushPromises();
  expect(ui.get('[data-action="open-job-queue"]').text()).toContain('3');
  expect(s.requests.some(r => r.path.includes('/logs'))).toBe(false);
  await ui.get('[data-action="open-job-queue"]').trigger('click'); await flushPromises();
  const drawer = ui.get('[role="dialog"][aria-label="Global job queue"]');
  expect(drawer.text()).toContain('Hey Cedar'); expect(drawer.text()).toContain('Okay Maple');
  expect(drawer.text()).toContain('Shared dataset'); expect(drawer.text()).toContain('Kitchen satellite, Office satellite');
  expect(drawer.text()).toContain('deleted-word'); expect(drawer.text()).toContain('cancelling');
  expect(drawer.findAll('[data-job-id]')).toHaveLength(4);
  const details = drawer.get('[data-job-id="run"] details');
  (details.element as HTMLDetailsElement).open = true; await details.trigger('toggle'); await flushPromises();
  expect(drawer.get('[data-job-id="run"] pre').text()).toBe('Training in progress');
  s.failNext(r => r.path.endsWith('/run/cancel'), 503);
  await drawer.get('[data-job-id="run"] [data-action="cancel-job"]').trigger('click'); await flushPromises();
  expect(drawer.get('[data-job-id="run"] [role="alert"]').text()).toContain('unavailable');
});

it('contains focus, makes the background inert, and restores focus on Escape and backdrop close', async () => {
  fakeStudio(); history.replaceState(null, '', '/#/wakewords');
  ui = mount(TrainerApp, { attachTo: document.body }); await flushPromises();
  const trigger = ui.get('[data-action="open-job-queue"]'); (trigger.element as HTMLButtonElement).focus();
  await trigger.trigger('click'); await flushPromises();
  expect(ui.get('[data-studio-background]').attributes('inert')).toBeDefined();
  const close = ui.get('[data-action="close-job-queue"]');
  expect(document.activeElement).toBe(close.element);
  const buttons = ui.get('[role="dialog"]').findAll('button'); const last = buttons.at(-1)!;
  (last.element as HTMLButtonElement).focus(); await last.trigger('keydown', { key: 'Tab' });
  expect(document.activeElement).toBe(close.element);
  press('Escape'); await flushPromises();
  expect(ui.find('[role="dialog"]').exists()).toBe(false); expect(document.activeElement).toBe(trigger.element);
  expect(ui.get('[data-studio-background]').attributes('inert')).toBeUndefined();
  await trigger.trigger('click'); await flushPromises(); await ui.get('[data-job-queue-backdrop]').trigger('click');
  expect(ui.find('[role="dialog"]').exists()).toBe(false);
});
