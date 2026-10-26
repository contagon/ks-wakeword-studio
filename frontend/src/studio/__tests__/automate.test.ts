import { expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import AutomatePage from "../pages/AutomatePage.vue";
import type { Workspace } from "../workspace";
import { workspaceHost } from "./fakeStudio";

const schedule = () => ({ enabled: false, cron: "*/30 * * * *", timezone: "UTC" });
const settings = () => ({
  collection: schedule(),
  classification: {
    enabled: false,
    trigger: "after_collection",
    confirm_activations: false,
    auto_negatives: true,
    promote_close_misses: false,
    near_miss_negatives: false,
  },
  classification_schedule: schedule(),
  training: schedule(),
  skip_unchanged: true,
  deployment: schedule(),
  deployment_policy: { after_training: false },
});

it("edits separate workspace collection, classification, training and deployment controls", async () => {
  const pages = import.meta.glob("../pages/*.vue");
  expect(pages["../pages/AutomatePage.vue"], "Automate page is missing").toBeDefined();
  const Page = (await pages["../pages/AutomatePage.vue"]!()) as { default: object };
  const requests: { path: string; body: unknown }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string, init?: RequestInit) => {
      requests.push({ path, body: init?.body ? JSON.parse(String(init.body)) : null });
      return new Response(
        JSON.stringify({
          settings: init?.body ? JSON.parse(String(init.body)) : settings(),
          schedules: [],
          last_jobs: {},
        }),
        { status: 200 },
      );
    }),
  );
  history.replaceState(null, "", "#/automate?word=a");
  const ui = mount(
    workspaceHost(Page.default, (workspace) => {
      workspace.selectedId.value = "a";
    }),
  );
  await flushPromises();
  for (const text of ["Automatic collection", "Automatic classification", "Automatic training", "Automatic deployment"])
    expect(ui.text()).toContain(text);
  expect(ui.text()).not.toContain("Wakewords to collect");
  await ui.get('[name="collection-enabled"]').setValue(true);
  await ui.get('[name="after-training"]').setValue(true);
  await ui.get('[name="near_miss_negatives"]').setValue(true);
  await ui.get("form").trigger("submit");
  await flushPromises();
  const saved = requests.find((r) => r.body)!.body as ReturnType<typeof settings>;
  expect(saved.collection.enabled).toBe(true);
  expect(saved.classification).toMatchObject({ near_miss_negatives: true, confirm_activations: false });
  expect(saved.training.enabled).toBe(false);
  expect(saved.deployment.enabled).toBe(false);
  expect(saved.deployment_policy.after_training).toBe(true);
  expect(
    requests.filter((r) => r.path.endsWith("/automation")).every((r) => r.path.includes("/wakewords/a/automation")),
  ).toBe(true);
  ui.unmount();
});

it("runs classification on demand with the saved rules only", async () => {
  const requests: { path: string; method?: string }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string, init?: RequestInit) => {
      requests.push({ path, method: init?.method });
      if (path.endsWith("/classification/jobs"))
        return new Response(JSON.stringify({ id: "c1", kind: "classify", word_id: "a", status: "queued" }), {
          status: 201,
        });
      return new Response(JSON.stringify({ settings: settings(), schedules: [], last_jobs: {} }), { status: 200 });
    }),
  );
  history.replaceState(null, "", "#/automate?word=a");
  const ui = mount(
    workspaceHost(AutomatePage, (workspace) => {
      workspace.selectedId.value = "a";
    }),
  );
  await flushPromises();
  const run = ui.get("[data-action=classify-now]");
  await ui.get('[name="near_miss_negatives"]').setValue(true);
  expect(run.attributes("disabled")).toBeDefined();
  await ui.get('[name="near_miss_negatives"]').setValue(false);
  await run.trigger("click");
  await flushPromises();
  expect(requests.some((r) => r.method === "POST" && r.path.endsWith("/wakewords/a/classification/jobs"))).toBe(true);
  expect(ui.text()).toContain("Classification queued");
  ui.unmount();
});

it("ignores an old workspace load even when the transport ignores abort", async () => {
  let release!: (value: Response) => void;
  let workspace!: Workspace;
  const response = (enabled: boolean) =>
    new Response(
      JSON.stringify({
        settings: { ...settings(), collection: { ...schedule(), enabled } },
        schedules: [],
        last_jobs: {},
      }),
    );
  vi.stubGlobal(
    "fetch",
    vi.fn((path: string) =>
      path.includes("/wakewords/a/")
        ? new Promise<Response>((resolve) => {
            release = resolve;
          })
        : Promise.resolve(response(false)),
    ),
  );
  history.replaceState(null, "", "#/automate?word=a");
  const ui = mount(
    workspaceHost(AutomatePage, (w) => {
      workspace = w;
      w.selectedId.value = "a";
    }),
  );
  workspace.selectedId.value = "b";
  await flushPromises();
  release(response(true));
  await flushPromises();
  expect((ui.get('[name="collection-enabled"]').element as HTMLInputElement).checked).toBe(false);
  expect(ui.text()).not.toContain("settings saved");
  ui.unmount();
});
