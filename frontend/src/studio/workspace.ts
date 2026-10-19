import { inject, onScopeDispose, ref, shallowRef, watch, type InjectionKey } from "vue";
import { studioApi, StudioApiError } from "./api";
import type { StudioRoutes } from "./routes";
import type { Wakeword, WorkspaceSummary } from "./types";

export function createWorkspace(routes: StudioRoutes) {
  const wakewords = ref<Wakeword[]>([]);
  const selectedId = routes.selectedId;
  const selected = shallowRef<Wakeword | null>(null);
  const summary = shallowRef<WorkspaceSummary | null>(null);
  const loading = ref(false);
  const selectedLoading = ref(false);
  const error = ref("");
  const selectedError = ref("");
  const notice = ref("");
  let listRequest: AbortController | undefined;
  let wordRequest: AbortController | undefined;
  let disposed = false;

  const unavailable = "That wakeword is no longer available. Select another workspace.";
  function select(id: string) {
    const available = wakewords.value.some(word => word.id === id);
    // A valid choice supersedes any earlier fallback; only a stale non-empty ID warrants a notice.
    notice.value = available || !id ? "" : unavailable;
    selectedId.value = available ? id : wakewords.value[0]?.id ?? "";
  }
  function remove(id: string) {
    // Invalidate any pre-deletion list response so it cannot resurrect the word.
    listRequest?.abort();
    loading.value = false;
    wakewords.value = wakewords.value.filter(word => word.id !== id);
    if (selectedId.value === id) select(wakewords.value[0]?.id ?? "");
  }
  async function refreshSelected() {
    wordRequest?.abort();
    const controller = new AbortController();
    wordRequest = controller;
    const id = selectedId.value;
    selected.value = null;
    summary.value = null;
    selectedError.value = "";
    selectedLoading.value = Boolean(id);
    if (!id || disposed) return;
    const current = () => !disposed && !controller.signal.aborted && selectedId.value === id;
    try {
      const [word, queue, models, schedules] = await Promise.all([
        studioApi.wakeword(id, controller.signal),
        studioApi.queue(id, { limit: 1 }, controller.signal),
        studioApi.models(id, { limit: 1 }, controller.signal),
        studioApi.schedules(controller.signal),
      ]);
      if (!current()) return;
      selected.value = word;
      summary.value = { pending: queue.total, modelCount: models.total, latestModel: models.items[0] ?? null, schedule: schedules.find(s => s.scope === `train:${id}`) ?? null };
      wakewords.value = wakewords.value.map(w => w.id === id ? word : w);
    } catch (cause) {
      if (!current()) return;
      if (cause instanceof StudioApiError && cause.status === 404) {
        // Exclude the missing ID even if a concurrent list response still contains it.
        wakewords.value = wakewords.value.filter(word => word.id !== id);
        select(wakewords.value[0]?.id ?? "");
        notice.value = unavailable;
      } else selectedError.value = cause instanceof Error ? cause.message : "Unable to load this workspace.";
    } finally {
      if (current()) selectedLoading.value = false;
    }
  }
  async function load() {
    listRequest?.abort();
    const controller = new AbortController();
    listRequest = controller;
    loading.value = true;
    error.value = "";
    try {
      const words: Wakeword[] = [];
      let offset = 0;
      while (true) {
        const page = await studioApi.wakewords({ offset, limit: 100 }, controller.signal);
        if (disposed || controller.signal.aborted) return;
        words.push(...page.items);
        offset += page.items.length;
        if (offset >= page.total || page.items.length === 0) break;
      }
      wakewords.value = words;
      const previous = selectedId.value;
      select(previous || words[0]?.id || "");
      if (previous === selectedId.value) await refreshSelected();
    } catch (cause) {
      if (!disposed && !controller.signal.aborted) error.value = cause instanceof Error ? cause.message : "Unable to load workspaces.";
    } finally {
      if (!disposed && !controller.signal.aborted) loading.value = false;
    }
  }
  watch(selectedId, () => { void refreshSelected(); }, { flush: "sync" });
  onScopeDispose(() => { disposed = true; listRequest?.abort(); wordRequest?.abort(); });
  return { wakewords, selectedId, selected, summary, loading, selectedLoading, error, selectedError, notice, load, select, remove, refreshSelected };
}
export type Workspace = ReturnType<typeof createWorkspace>;
export const workspaceKey: InjectionKey<Workspace> = Symbol("studio-workspace");
export function useWorkspace(): Workspace {
  const workspace = inject(workspaceKey);
  if (!workspace) throw new Error("useWorkspace requires StudioShell");
  return workspace;
}
