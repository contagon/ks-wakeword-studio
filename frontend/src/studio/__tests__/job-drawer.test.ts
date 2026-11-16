import { expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import JobQueueDrawer from "../components/JobQueueDrawer.vue";
import { createJobQueue, jobQueueKey } from "../jobs";
import { flushPromises } from "@vue/test-utils";
import { fakeStudio, workspaceHost } from "./fakeStudio";

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

it("identifies trimming jobs separately from classification in the queue", async () => {
  const server = fakeStudio();
  server.db.jobs.push({
    id: "trim",
    kind: "classify",
    resource: "gpu",
    word_id: "a",
    payload: { trim_only: true },
    status: "queued",
    created_at: "2026-03-01T10:00:00Z",
    started_at: null,
    finished_at: null,
    result: {},
  });
  const ui = mount(
    workspaceHost(JobQueueDrawer, (workspace, queue) => {
      workspace.selectedId.value = "a";
      queue.open.value = true;
    }),
  );
  await flushPromises();
  expect(ui.get('[data-job-id="trim"] h3').text()).toBe("Trim recordings");
  expect(ui.find('[aria-label="Cancel Trim recordings"]').exists()).toBe(true);
  ui.unmount();
});
