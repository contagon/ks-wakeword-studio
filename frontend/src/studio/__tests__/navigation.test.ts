import { expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { useStudioRoutes } from "../routes";

it.each(["#/collect", "#/scrape", "#/classify?tab=collect", "#/classify?tab=unmapped"])(
  "opens %s as Collect without losing workspace identity",
  (link) => {
    history.replaceState(null, "", `${link}${link.includes("?") ? "&" : "?"}word=opaque-a`);
    let state!: ReturnType<typeof useStudioRoutes>;
    const ui = mount({
      setup() {
        state = useStudioRoutes();
      },
      template: "<div />",
    });
    expect(state.page.value).toBe("collect");
    expect(state.href(state.page.value)).toBe("#/collect?word=opaque-a");
    state.navigate("classify");
    expect(location.hash).toBe("#/classify?word=opaque-a");
    state.selectedId.value = "opaque-b";
    expect(location.hash).toBe("#/classify?word=opaque-b");
    ui.unmount();
  },
);
