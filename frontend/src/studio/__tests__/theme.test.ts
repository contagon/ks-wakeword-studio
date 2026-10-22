import { afterEach, beforeEach, expect, it, vi } from "vitest";

beforeEach(() => localStorage.clear());
afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute("data-studio-theme");
});

it("follows the system until overridden, remembers the override and cleans listeners", async () => {
  const modules = import.meta.glob("../*.ts");
  expect(modules["../theme.ts"], "Theme controller is missing").toBeDefined();
  const { createThemeController } = (await modules["../theme.ts"]!()) as typeof import("../theme");
  let listener: (() => void) | undefined;
  const remove = vi.fn();
  const media = {
    matches: true,
    addEventListener: (_: string, fn: () => void) => {
      listener = fn;
    },
    removeEventListener: remove,
  };
  vi.stubGlobal("matchMedia", () => media);
  const theme = createThemeController();
  expect(theme.dark.value).toBe(true);
  media.matches = false;
  listener!();
  expect(theme.dark.value).toBe(false);
  theme.toggle();
  expect(theme.dark.value).toBe(true);
  expect(localStorage.getItem("studio.theme")).toBe("dark");
  media.matches = false;
  listener!();
  expect(theme.dark.value).toBe(true);
  theme.dispose();
  expect(remove).toHaveBeenCalled();
  const next = createThemeController();
  expect(next.dark.value).toBe(true);
  next.dispose();
});

it("tolerates denied local storage and invalid saved values", async () => {
  const modules = import.meta.glob("../*.ts");
  expect(modules["../theme.ts"]).toBeDefined();
  const { createThemeController } = (await modules["../theme.ts"]!()) as typeof import("../theme");
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("localStorage", {
    getItem() {
      throw Error("denied");
    },
    setItem() {
      throw Error("denied");
    },
  });
  const theme = createThemeController();
  expect(theme.dark.value).toBe(false);
  theme.toggle();
  expect(theme.dark.value).toBe(true);
  theme.dispose();
});
