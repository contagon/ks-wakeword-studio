import { onScopeDispose, ref, watch } from "vue";

export const pages = [
  { id: "wakewords", name: "Wakewords", group: "Workspace" },
  { id: "kiosks", name: "Kiosks", group: "Fleet" },
  { id: "online-datasets", name: "Downloaded", group: "Data" },
  { id: "artificial", name: "Artificial", group: "Data" },
  { id: "manual", name: "Manual", group: "Data" },
  { id: "samples", name: "Samples", group: "Data" },
  { id: "collect", name: "Collect", group: "Data", parent: "samples" },
  { id: "classify", name: "Classify", group: "Data", parent: "samples" },
  { id: "trim", name: "Trim", group: "Data", parent: "samples" },
  { id: "train", name: "Train", group: "Models" },
  { id: "deploy", name: "Deploy", group: "Models" },
  { id: "automate", name: "Automate", group: "Models" },
  { id: "testing", name: "Testing", group: "Models" },
] as const;
export type PageId = (typeof pages)[number]["id"];
const selectionKey = "studio.selectedWordId";
function storedSelection(): string {
  try {
    return localStorage.getItem(selectionKey) ?? "";
  } catch {
    return "";
  }
}
export function useStudioRoutes() {
  const page = ref<PageId>("wakewords");
  const selectedId = ref("");
  function read() {
    const [path, search = ""] = location.hash.replace(/^#\/?/, "").split("?");
    const params = new URLSearchParams(search);
    page.value =
      path === "scrape" || (path === "classify" && ["collect", "unmapped"].includes(params.get("tab") ?? ""))
        ? "collect"
        : path === "negative-datasets"
          ? "online-datasets"
          : path === "record"
            ? "manual"
            : (pages.find((p) => p.id === path)?.id ?? "wakewords");
    selectedId.value = params.get("word") ?? storedSelection();
  }
  read();
  function href(id: PageId) {
    const params = new URLSearchParams();
    if (selectedId.value) params.set("word", selectedId.value);
    return `#/${id}${params.size ? "?" + params : ""}`;
  }
  function persist() {
    try {
      if (selectedId.value) localStorage.setItem(selectionKey, selectedId.value);
      else localStorage.removeItem(selectionKey);
    } catch {
      /* Storage may be blocked; direct links still work. */
    }
    history.replaceState(null, "", href(page.value));
  }
  const stop = watch(selectedId, persist, { flush: "sync" });
  function navigate(id: PageId) {
    page.value = id;
    if (location.hash !== href(id)) history.pushState(null, "", href(id));
  }
  window.addEventListener("hashchange", read);
  window.addEventListener("popstate", read);
  onScopeDispose(() => {
    stop();
    window.removeEventListener("hashchange", read);
    window.removeEventListener("popstate", read);
  });
  return { page, selectedId, href, navigate };
}
export type StudioRoutes = ReturnType<typeof useStudioRoutes>;
