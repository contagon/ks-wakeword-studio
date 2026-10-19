import { computed, inject, onBeforeUnmount, onMounted, ref, type InjectionKey } from 'vue';
import { studioApi } from './api';
import type { Job, Page } from './types';

export const isActiveJob = (job: Job): boolean => ['queued', 'running', 'cancelling'].includes(job.status);
export type JobQueue = ReturnType<typeof createJobQueue>;
export const jobQueueKey: InjectionKey<JobQueue> = Symbol('studio-job-queue');

/** One monitor owned by the shell; opening the drawer never controls execution or polling. */
export function createJobQueue() {
  const jobs = ref<Record<string, Job>>({});
  const historyIds = ref<string[]>([]), historyTotal = ref(0);
  const open = ref(false), selectedJobId = ref(''), error = ref(''), loading = ref(false);
  const cancelErrors = ref<Record<string, string>>({});
  const cancelling = ref<Set<string>>(new Set());
  const activeJobs = computed(() => Object.values(jobs.value).filter(isActiveJob).sort((a, b) => a.created_at.localeCompare(b.created_at)));
  const activeCount = computed(() => activeJobs.value.length);
  const history = computed(() => historyIds.value.map(id => jobs.value[id]).filter((job): job is Job => !!job && !isActiveJob(job)));
  const hasMore = computed(() => historyIds.value.length < historyTotal.value);
  let running = false, timer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false, lifecycle = 0;
  let request: AbortController | undefined, pending: Promise<void> | undefined;
  let historyDepth = 50, revision = 0;
  const revisions = new Map<string, number>();
  const cancelRequests = new Map<string, AbortController>();
  const actionRequests = new Set<AbortController>();

  function track(job: Job): void {
    if (jobs.value[job.id] && !isActiveJob(jobs.value[job.id]) && isActiveJob(job)) return;
    jobs.value = { ...jobs.value, [job.id]: job }; revisions.set(job.id, ++revision);
  }
  function accept(job: Job, snapshot: number): void {
    if (jobs.value[job.id] && !isActiveJob(jobs.value[job.id]) && isActiveJob(job)) return;
    if ((revisions.get(job.id) ?? 0) <= snapshot) jobs.value[job.id] = job;
  }
  async function pages(state: 'active' | 'history', controller: AbortController, depth = Infinity): Promise<Page<Job>> {
    const items: Job[] = []; let total = 0;
    do {
      const page = await studioApi.jobs({ state, offset: items.length, limit: Math.min(100, depth - items.length) }, controller.signal);
      if (controller.signal.aborted) break;
      total = page.total; items.push(...page.items);
      if (!page.items.length) break;
    } while (items.length < total && items.length < depth);
    return { items, total, offset: 0, limit: items.length };
  }
  async function cycle(): Promise<void> {
    const controller = new AbortController(); request = controller; const snapshot = revision;
    loading.value = true;
    try {
      const active = await pages('active', controller);
      if (controller.signal.aborted) return;
      const seen = new Set(active.items.map(job => job.id));
      // Jobs that just left the active list still need their final result for page subscribers.
      const missing = activeJobs.value.filter(job => !seen.has(job.id) && (revisions.get(job.id) ?? 0) <= snapshot);
      const finished = await Promise.all(missing.map(job => studioApi.job(job.id, controller.signal).catch(cause => {
        if (cause instanceof Error && 'status' in cause && cause.status === 404) return null;
        throw cause;
      })));
      const recent = open.value ? await pages('history', controller, historyDepth) : null;
      if (controller.signal.aborted) return;
      active.items.forEach(job => accept(job, snapshot));
      finished.forEach((job, index) => {
        if (job) accept(job, snapshot);
        else if ((revisions.get(missing[index]!.id) ?? 0) <= snapshot) delete jobs.value[missing[index]!.id];
      });
      if (recent) { recent.items.forEach(job => accept(job, snapshot)); historyIds.value = [...new Set(recent.items.map(job => job.id))]; historyTotal.value = recent.total; }
      error.value = '';
    } catch (cause) {
      if (!controller.signal.aborted) error.value = cause instanceof Error ? cause.message : 'Unable to load job queue.';
    } finally { if (request === controller) { request = undefined; loading.value = false; } }
  }
  function schedule(): void {
    if (timer) clearTimeout(timer);
    if (running) timer = setTimeout(() => { timer = undefined; void refresh(); }, 2000);
  }
  function refresh(): Promise<void> {
    if (stopped) return Promise.resolve();
    if (pending) return pending;
    if (timer) clearTimeout(timer); timer = undefined;
    const next = cycle().finally(() => { if (pending === next) { pending = undefined; schedule(); } });
    pending = next; return next;
  }
  function start(): void { if (!running) { stopped = false; running = true; void refresh(); } }
  function stop(): void {
    stopped = true; lifecycle += 1;
    running = false; if (timer) clearTimeout(timer); timer = undefined;
    request?.abort(); cancelRequests.forEach(controller => controller.abort()); cancelRequests.clear();
    actionRequests.forEach(controller => controller.abort()); actionRequests.clear();
  }
  async function show(id?: string): Promise<void> {
    if (stopped) return;
    const controller = new AbortController(), current = lifecycle; actionRequests.add(controller);
    const alive = () => !controller.signal.aborted && lifecycle === current && !stopped;
    selectedJobId.value = id ?? ''; open.value = true;
    try {
      // A refresh already underway may have read the closed state. Follow it with a drawer refresh.
      if (pending) await pending;
      if (!alive()) return;
      if (id && !jobs.value[id]) {
        const job = await studioApi.job(id, controller.signal);
        if (!alive()) return;
        track(job);
      }
      if (alive()) await refresh();
    } catch (cause) { if (alive()) error.value = cause instanceof Error ? cause.message : 'Unable to load job.'; }
    finally { actionRequests.delete(controller); }
  }
  async function loadMore(): Promise<void> {
    if (stopped) return;
    const current = lifecycle; historyDepth += 50; if (pending) await pending;
    if (!stopped && lifecycle === current) await refresh();
  }
  async function cancel(id: string): Promise<void> {
    if (cancelling.value.has(id) || !jobs.value[id] || !isActiveJob(jobs.value[id])) return;
    const controller = new AbortController(); cancelRequests.set(id, controller);
    cancelling.value = new Set([...cancelling.value, id]); delete cancelErrors.value[id];
    // Prevent a refresh started before this mutation from overwriting its result.
    revisions.set(id, ++revision);
    try { const next = await studioApi.cancelJob(id, controller.signal); if (!controller.signal.aborted) track(next); }
    catch (cause) { if (!controller.signal.aborted) cancelErrors.value[id] = cause instanceof Error ? cause.message : 'Unable to cancel job.'; }
    finally {
      cancelRequests.delete(id); cancelling.value = new Set([...cancelling.value].filter(value => value !== id));
      if (!controller.signal.aborted) await refresh();
    }
  }
  return { jobs, activeJobs, history, activeCount, historyTotal, hasMore, error, loading, open, selectedJobId, cancelling, cancelErrors, start, stop, refresh, track, show, loadMore, cancel };
}

export function useJobQueue(): JobQueue {
  const queue = inject(jobQueueKey, null);
  if (queue) return queue;
  // Standalone page mounts (previews/tests) get the same lifecycle without a module singleton.
  const local = createJobQueue(); onMounted(local.start); onBeforeUnmount(local.stop); return local;
}
