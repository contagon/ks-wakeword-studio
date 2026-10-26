import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import PaginatedTable from "../components/PaginatedTable.vue";

describe("pagination visibility", () => {
  it.each([0, 1, 25])("hides controls for %i items on one page", (total) => {
    const ui = mount(PaginatedTable, { props: { total, offset: 0, limit: 25 } });
    expect(ui.find(".studio-pagination").exists()).toBe(false);
  });
  it("keeps navigation for multiple pages", async () => {
    const ui = mount(PaginatedTable, { props: { total: 26, offset: 0, limit: 25 } });
    await ui.get("[data-action=next-page]").trigger("click");
    expect(ui.emitted("page")).toEqual([[25]]);
  });
  it("keeps Previous available when deletion empties the last page", async () => {
    const ui = mount(PaginatedTable, { props: { total: 25, offset: 25, limit: 25 } });
    await ui.get("[data-action=previous-page]").trigger("click");
    expect(ui.emitted("page")).toEqual([[0]]);
  });
});
