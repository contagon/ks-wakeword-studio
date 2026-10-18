import { onScopeDispose, ref, watch } from "vue";

export const pages = [
  { id: "wakewords", name: "Wakewords", group: "Workspace" },
  { id: "negative-datasets", name: "Negative Datasets", group: "Data" },
  { id: "artificial", name: "Artificial", group: "Data" },
  { id: "scrape", name: "Scrape", group: "Data" },
  { id: "classify", name: "Classify", group: "Data" },
  { id: "samples", name: "Samples", group: "Data" },
  { id: "train", name: "Train", group: "Models" },
  { id: "deploy", name: "Deploy", group: "Models" },
] as const;
export type PageId = typeof pages[number]["id"];
const selectionKey = "studio.selectedWordId";
function storedSelection(): string {
  try { return localStorage.getItem(selectionKey) ?? ""; } catch { return ""; }
}
export function useStudioRoutes() {
  const page = ref<PageId>("wakewords");
  const selectedId = ref("");
  function read() {
    const [path, search = ""] = location.hash.replace(/^#\/?/, "").split("?");
    page.value = pages.find(p => p.id === path)?.id ?? "wakewords";
    selectedId.value = new URLSearchParams(search).get("word") ?? storedSelection();
  }
  read();
  function href(id: PageId) { return `#/${id}${selectedId.value ? `?${new URLSearchParams({ word: selectedId.value })}` : ""}`; }
  function persist() {
    try {
      if (selectedId.value) localStorage.setItem(selectionKey, selectedId.value);
      else localStorage.removeItem(selectionKey);
    } catch { /* Storage may be blocked; direct links still work. */ }
    history.replaceState(null, "", href(page.value));
  }
  const stop = watch(selectedId, persist, { flush: "sync" });
  function navigate(id: PageId) {
    page.value = id;
    if (location.hash !== href(id)) history.pushState(null, "", href(id));
  }
  window.addEventListener("hashchange", read);
  window.addEventListener("popstate", read);
  onScopeDispose(() => { stop(); window.removeEventListener("hashchange", read); window.removeEventListener("popstate", read); });
  return { page, selectedId, href, navigate };
}
export type StudioRoutes = ReturnType<typeof useStudioRoutes>;
