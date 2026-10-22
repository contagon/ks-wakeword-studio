import { ref } from "vue";

export function createThemeController() {
  const media = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  let preference: "light" | "dark" | null = null;
  try {
    const saved = localStorage.getItem("studio.theme");
    if (saved === "light" || saved === "dark") preference = saved;
  } catch {
    /* Storage may be denied. */
  }
  const dark = ref(preference ? preference === "dark" : Boolean(media?.matches));
  function apply() {
    document.documentElement.dataset.studioTheme = dark.value ? "dark" : "light";
  }
  function onSystemChange() {
    if (!preference) {
      dark.value = Boolean(media?.matches);
      apply();
    }
  }
  function toggle() {
    dark.value = !dark.value;
    preference = dark.value ? "dark" : "light";
    apply();
    try {
      localStorage.setItem("studio.theme", preference);
    } catch {
      /* In-memory override still works. */
    }
  }
  apply();
  if (media?.addEventListener) media.addEventListener("change", onSystemChange);
  else media?.addListener?.(onSystemChange);
  return {
    dark,
    toggle,
    dispose() {
      if (media?.removeEventListener) media.removeEventListener("change", onSystemChange);
      else media?.removeListener?.(onSystemChange);
    },
  };
}
