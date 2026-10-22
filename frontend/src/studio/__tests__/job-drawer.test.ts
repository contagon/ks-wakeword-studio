import { expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import JobQueueDrawer from "../components/JobQueueDrawer.vue";
import { createJobQueue, jobQueueKey } from "../jobs";

it("does not flash a refresh message during background job updates", () => {
  const queue = createJobQueue();
  queue.open.value = true;
  queue.loading.value = true;
  const ui = mount(JobQueueDrawer, { global: { provide: { [jobQueueKey as symbol]: queue } } });
  expect(ui.get('[role="dialog"]').text()).toContain("Job queue");
  expect(ui.text()).not.toContain("Refreshing jobs");
  ui.unmount();
  queue.stop();
});
