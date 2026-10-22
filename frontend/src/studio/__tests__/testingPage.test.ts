import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { provide } from "vue";
import TestingPage from "../pages/TestingPage.vue";
import ProbabilityGraph from "../components/ProbabilityGraph.vue";
import { createWorkspace, workspaceKey, type Workspace } from "../workspace";
import { pages, useStudioRoutes } from "../routes";

const live = vi.hoisted(() => ({ start: vi.fn(), stop: vi.fn(), events: null as any }));
vi.mock("../testing/session", () => ({
  TestingSession: class {
    constructor(events: any) {
      live.events = events;
    }
    start = live.start;
    stop = live.stop;
  },
}));
let workspace: Workspace;
let empty = false;
let manifestStatus = 200;
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });
function host() {
  return {
    components: { TestingPage },
    setup() {
      workspace = createWorkspace(useStudioRoutes());
      provide(workspaceKey, workspace);
    },
    template: "<TestingPage />",
  };
}
beforeEach(() => {
  history.replaceState(null, "", "#/testing?word=a");
  empty = false;
  manifestStatus = 200;
  live.start.mockReset();
  live.stop.mockReset();
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const path = new URL(url, "http://localhost").pathname;
      if (path.endsWith("/archive/cedar.json"))
        return json({ micro: { probability_cutoff: 0.9, sliding_window_size: 5 } }, manifestStatus);
      if (path.endsWith("/models"))
        return json({
          items: empty
            ? []
            : ["new", "old"].map((id) => ({
                id,
                word_id: "a",
                model_id: "cedar",
                trained_at: "2026-10-20T10:00:00Z",
                checksums: {},
                metrics: {},
              })),
          total: empty ? 0 : 2,
        });
      if (path.endsWith("/wakewords/a") || path.endsWith("/wakewords/b"))
        return json({ id: path.endsWith("/a") ? "a" : "b", phrase: "Cedar", model_id: "cedar" });
      if (path.endsWith("/schedules")) return json([]);
      return json({ items: [], total: 0 });
    }),
  );
});
afterEach(() => vi.unstubAllGlobals());

describe("Testing page", () => {
  it("is last in navigation and selects real archived versions and saved thresholds", async () => {
    expect(pages.at(-1)?.id).toBe("testing");
    const ui = mount(host());
    await flushPromises();
    await flushPromises();
    expect(ui.get("select").findAll("option")).toHaveLength(2);
    expect(ui.get('[data-action="start-testing"]').attributes("disabled")).toBeUndefined();
    await ui.get('[data-action="sensitivity"]').trigger("click");
    expect(ui.get("dialog").attributes("open")).toBeDefined();
    expect(ui.get("dialog").text()).toContain("0.95");
    expect(ui.get("dialog").text()).toContain("0.80");
    await ui.get('[data-sensitivity="very"]').trigger("click");
    expect(ui.get("[data-threshold]").text()).toContain("0.80");
    await ui.get('[data-action="start-testing"]').trigger("click");
    expect(live.start.mock.calls[0]?.[0]).toBe("/api/studio/wakewords/a/models/new/archive/cedar.tflite");
    live.events.state("listening");
    live.events.score({ probability: 0.94, rms: 0.1, seconds: 2, warming: false });
    await flushPromises();
    expect(ui.text()).toContain("Above threshold");
    expect(ui.getComponent(ProbabilityGraph).props("samples")).toHaveLength(1);
    await ui.get("select").setValue("old");
    await flushPromises();
    expect(ui.getComponent(ProbabilityGraph).props("samples")).toHaveLength(0);
    const stops = live.stop.mock.calls.length;
    ui.unmount();
    expect(live.stop.mock.calls.length).toBeGreaterThan(stops);
  });
  it("disables Start when there are no models", async () => {
    empty = true;
    const ui = mount(host());
    await flushPromises();
    expect(ui.text()).toContain("Train a model");
    expect(ui.get('[data-action="start-testing"]').attributes("disabled")).toBeDefined();
    ui.unmount();
  });
  it("does not start with an unreadable manifest", async () => {
    manifestStatus = 422;
    const ui = mount(host());
    await flushPromises();
    await flushPromises();
    expect(ui.find('[role="alert"]').exists()).toBe(true);
    expect(ui.get('[data-action="start-testing"]').attributes("disabled")).toBeDefined();
    ui.unmount();
  });
  it("stops and clears the previous workspace immediately", async () => {
    const ui = mount(host());
    await flushPromises();
    await flushPromises();
    live.events.score({ probability: 0.95, rms: 0.1, seconds: 1, warming: false });
    await flushPromises();
    const stops = live.stop.mock.calls.length;
    workspace.selectedId.value = "b";
    await flushPromises();
    expect(live.stop.mock.calls.length).toBeGreaterThan(stops);
    expect(ui.getComponent(ProbabilityGraph).props("samples")).toHaveLength(0);
    ui.unmount();
  });
  it("loads all archived version pages, not just the first page", async () => {
    const original = vi.mocked(fetch).getMockImplementation()!;
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = new URL(String(input), "http://localhost");
      if (url.pathname.endsWith("/models") && url.searchParams.get("limit") === "100") {
        const offset = Number(url.searchParams.get("offset"));
        return json({
          items: [0, 1]
            .slice(0, offset ? 1 : 2)
            .map((_, index) => ({ id: `version-${offset + index}`, model_id: "cedar", trained_at: "", word_id: "a" })),
          total: 3,
        });
      }
      return original(input, init);
    });
    const ui = mount(host());
    await flushPromises();
    await flushPromises();
    expect(ui.get("select").findAll("option")).toHaveLength(3);
    expect(ui.get("select").findAll("option").at(-1)?.attributes("value")).toBe("version-2");
    ui.unmount();
  });
  it("ignores a late manifest from the previously selected version", async () => {
    let release: ((response: Response) => void) | undefined;
    const original = vi.mocked(fetch).getMockImplementation()!;
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      if (String(input).includes("/new/archive/"))
        return new Promise((resolve) => {
          release = resolve;
        });
      if (String(input).includes("/old/archive/")) return json({ micro: { probability_cutoff: 0.7 } });
      return original(input, init);
    });
    const ui = mount(host());
    await flushPromises();
    await flushPromises();
    expect(ui.get('[data-action="start-testing"]').attributes("disabled")).toBeDefined();
    await ui.get("select").setValue("old");
    await flushPromises();
    expect(ui.get("[data-threshold]").text()).toContain("0.70");
    release!(json({ micro: { probability_cutoff: 0.99 } }));
    await flushPromises();
    expect(ui.get("[data-threshold]").text()).toContain("0.70");
    ui.unmount();
  });
});

describe("probability plot", () => {
  it("plots the threshold and clips red trace strictly to the area above it", () => {
    const ui = mount(ProbabilityGraph, {
      props: {
        threshold: 0.8,
        samples: [
          { seconds: 1, probability: 0.2 },
          { seconds: 2, probability: 0.95 },
        ],
      },
    });
    expect(ui.get("[data-threshold-line]").attributes("y1")).toBe("60");
    expect(ui.get("clipPath rect").attributes("height")).toBe("36");
    expect(ui.get("[data-red-trace]").attributes("clip-path")).toContain("url(#");
    expect(ui.get("[data-red-trace]").attributes("points")?.split(" ").at(-1)).toBe("748,33");
    expect(ui.get("svg").attributes("aria-label")).toContain("probability");
    ui.unmount();
  });
});
