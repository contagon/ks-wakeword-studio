import { afterEach, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import AutomatePage from "../pages/AutomatePage.vue";
import { workspaceHost } from "./fakeStudio";
import type { Workspace } from "../workspace";

const off = { scrape: false, classify: false, train: false, deploy: false };
afterEach(() => vi.unstubAllGlobals());

function transport() {
  const calls: { path: string; method: string; body: any }[] = [];
  let configured = true;
  let download = false;
  const words: Record<string, typeof off> = {};
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string, init?: RequestInit) => {
      const method = init?.method ?? "GET";
      const body = init?.body ? JSON.parse(String(init.body)) : null;
      calls.push({ path, method, body });
      let response: unknown = {};
      if (path.endsWith("/notifications/test")) response = { sent: true };
      else if (path === "/api/studio/notifications") {
        if (body) {
          download = body.download;
          if (body.apprise_url !== undefined) configured = Boolean(body.apprise_url);
        }
        response = { configured, download };
      } else if (path.endsWith("/notifications")) {
        const word = path.split("/")[4]!;
        if (body) words[word] = body;
        response = words[word] ?? off;
      } else if (path.endsWith("/automation")) {
        const schedule = { enabled: false, cron: "0 * * * *", timezone: "UTC" };
        response = {
          settings: {
            collection: schedule,
            classification: { enabled: false, trigger: "after_collection" },
            classification_schedule: schedule,
            trimming: { enabled: false },
            training: schedule,
            deployment: schedule,
            deployment_policy: { after_training: false },
          },
          schedules: [],
          last_jobs: {},
        };
      }
      return new Response(JSON.stringify(response));
    }),
  );
  return calls;
}

it("combines scoped settings in one card and saves them with one button", async () => {
  const calls = transport();
  let workspace!: Workspace;
  const ui = mount(
    workspaceHost(AutomatePage, (w) => {
      workspace = w;
      w.selectedId.value = "a";
    }),
  );
  await flushPromises();
  const card = ui.get("[data-notifications]");
  expect(card.get("h2").text()).toBe("Wakeword notifications");
  expect(card.findAll("form")).toHaveLength(1);
  expect(card.findAll('button[type="submit"]')).toHaveLength(1);
  expect(card.findAll('[data-action="test-notification"]')).toHaveLength(1);
  expect(card.text()).toContain("Apprise URL (global)");
  expect(card.text()).toContain("Dataset downloads (global)");
  const url = card.get('[name="apprise-url"]');
  expect(url.attributes("type")).toBe("text");
  expect((url.element as HTMLInputElement).value).toBe("");
  expect(card.find('[name="notify-generation"]').exists()).toBe(false);
  expect(card.find('[name="notify-preview"]').exists()).toBe(false);
  await card.get('[name="notify-train"]').setValue(true);
  await card.get('[name="notify-download"]').setValue(true);
  await card.get("form").trigger("submit");
  await flushPromises();
  expect(calls.find((c) => c.method === "PUT" && c.path.endsWith("/a/notifications"))?.body).toEqual({
    ...off,
    train: true,
  });
  expect(calls.some((c) => c.method === "PUT" && c.path.endsWith("/automation"))).toBe(false);
  expect(calls.find((c) => c.method === "PUT" && c.path === "/api/studio/notifications")?.body).toEqual({
    download: true,
  });
  workspace.selectedId.value = "b";
  await flushPromises();
  expect((ui.get('[name="notify-train"]').element as HTMLInputElement).checked).toBe(false);
  expect((card.get('[name="notify-download"]').element as HTMLInputElement).checked).toBe(true);
  await url.setValue("discord://new-secret");
  await card.get("form").trigger("submit");
  await flushPromises();
  expect((url.element as HTMLInputElement).value).toBe("");
  expect(ui.html()).not.toContain("new-secret");
  ui.unmount();
});

it("keeps global controls available without a wakeword and tests the saved destination", async () => {
  const calls = transport();
  const ui = mount(
    workspaceHost(AutomatePage, (w) => {
      w.selectedId.value = "";
    }),
  );
  await flushPromises();
  const card = ui.get("[data-notifications]");
  expect(card.find('[name="notify-train"]').exists()).toBe(false);
  await card.get('[data-action="test-notification"]').trigger("click");
  await flushPromises();
  expect(calls.some((c) => c.method === "POST" && c.path === "/api/studio/notifications/test")).toBe(true);
  expect(card.text()).toContain("Test notification sent");
  await card.get('[name="clear-apprise-url"]').setValue(true);
  await card.get("form").trigger("submit");
  await flushPromises();
  expect(calls.find((c) => c.method === "PUT")?.body).toEqual({ download: false, apprise_url: "" });
  expect(card.get('[data-action="test-notification"]').attributes("disabled")).toBeDefined();
  ui.unmount();
});

it("ignores stale notification loads after switching wakewords", async () => {
  transport();
  const original = fetch;
  let release!: (value: Response) => void;
  vi.stubGlobal(
    "fetch",
    vi.fn((path: string, init?: RequestInit) => {
      if (path.endsWith("/a/notifications"))
        return new Promise<Response>((resolve) => {
          release = resolve;
        });
      return original(path, init);
    }),
  );
  let workspace!: Workspace;
  const ui = mount(
    workspaceHost(AutomatePage, (w) => {
      workspace = w;
      w.selectedId.value = "a";
    }),
  );
  await flushPromises();
  workspace.selectedId.value = "b";
  await flushPromises();
  release(new Response(JSON.stringify({ ...off, train: true })));
  await flushPromises();
  expect((ui.get('[name="notify-train"]').element as HTMLInputElement).checked).toBe(false);
  ui.unmount();
});

it("does not report success if the wakeword part of a combined save fails", async () => {
  transport();
  const original = fetch;
  vi.stubGlobal(
    "fetch",
    vi.fn((path: string, init?: RequestInit) => {
      if (path.endsWith("/a/notifications") && init?.method === "PUT")
        return Promise.resolve(new Response('{"detail":"secret-error"}', { status: 500 }));
      return original(path, init);
    }),
  );
  const ui = mount(
    workspaceHost(AutomatePage, (w) => {
      w.selectedId.value = "a";
    }),
  );
  await flushPromises();
  const card = ui.get("[data-notifications]");
  await card.get("form").trigger("submit");
  await flushPromises();
  expect(card.get('[role="alert"]').text()).toContain(
    "Global settings saved, but wakeword notifications were not saved",
  );
  expect(card.text()).not.toContain("secret-error");
  expect(card.find('[role="status"]').exists()).toBe(false);
  ui.unmount();
});

it("keeps wakeword preferences unsaved when the global URL is rejected", async () => {
  const calls = transport();
  const original = fetch;
  vi.stubGlobal(
    "fetch",
    vi.fn((path: string, init?: RequestInit) => {
      if (path === "/api/studio/notifications" && init?.method === "PUT")
        return Promise.resolve(new Response("{}", { status: 422 }));
      return original(path, init);
    }),
  );
  const ui = mount(
    workspaceHost(AutomatePage, (w) => {
      w.selectedId.value = "a";
    }),
  );
  await flushPromises();
  const card = ui.get("[data-notifications]");
  await card.get('[name="notify-train"]').setValue(true);
  await card.get('[name="apprise-url"]').setValue("invalid-url");
  await card.get("form").trigger("submit");
  await flushPromises();
  expect(card.get('[role="alert"]').text()).toContain("Settings were not saved");
  expect(calls.some((c) => c.method === "PUT" && c.path.endsWith("/a/notifications"))).toBe(false);
  expect((card.get('[name="notify-train"]').element as HTMLInputElement).checked).toBe(true);
  ui.unmount();
});

it("does not apply a pending combined save to a newly selected wakeword", async () => {
  const calls = transport();
  const original = fetch;
  let release!: (value: Response) => void;
  vi.stubGlobal(
    "fetch",
    vi.fn((path: string, init?: RequestInit) => {
      if (path === "/api/studio/notifications" && init?.method === "PUT")
        return new Promise<Response>((resolve) => {
          release = resolve;
        });
      return original(path, init);
    }),
  );
  let workspace!: Workspace;
  const ui = mount(
    workspaceHost(AutomatePage, (w) => {
      workspace = w;
      w.selectedId.value = "a";
    }),
  );
  await flushPromises();
  const card = ui.get("[data-notifications]");
  await card.get('[name="notify-train"]').setValue(true);
  await card.get("form").trigger("submit");
  workspace.selectedId.value = "b";
  await flushPromises();
  release(new Response(JSON.stringify({ configured: true, download: false })));
  await flushPromises();
  expect(calls.some((c) => c.method === "PUT")).toBe(false);
  expect((card.get('[name="notify-train"]').element as HTMLInputElement).checked).toBe(false);
  expect(card.find('[role="status"]').exists()).toBe(false);
  ui.unmount();
});
