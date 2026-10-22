import { expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import KiosksPage from "../pages/KiosksPage.vue";

it("offers one flat kiosk registry with password login and no setup tabs", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("[]", { status: 200 })),
  );
  const ui = mount(KiosksPage);
  await flushPromises();
  expect(ui.get("h1").text()).toBe("Kiosks");
  expect(ui.findAll("[data-device-registry]")).toHaveLength(1);
  expect(ui.find('[role="tablist"]').exists()).toBe(false);
  expect(ui.get('input[name="password"]').attributes("type")).toBe("password");
  ui.unmount();
});
