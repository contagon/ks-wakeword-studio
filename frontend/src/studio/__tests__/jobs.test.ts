import { afterEach, expect, it, vi } from "vitest";
import { createJobQueue } from "../jobs";
import type { Job } from "../types";

export function job(id: string, status: Job["status"] = "queued", extra: object = {}): Job {
  return {
    id,
    kind: "train",
    word_id: "a",
    resource: "gpu",
    payload: {},
    status,
    created_at: "2026-10-19T12:00:00Z",
    started_at: null,
    finished_at: null,
    result: {},
    ...extra,
  } as Job;
}
function server(active: Job[] = [], history: Job[] = []) {
  const requests: URL[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string) => {
      const url = new URL(input, "http://localhost");
      requests.push(url);
      if (url.pathname.endsWith("/cancel")) {
        const id = url.pathname.split("/").at(-2)!;
        return Response.json(job(id, "cancelled"));
      }
      if (!url.pathname.endsWith("/jobs")) {
        const id = url.pathname.split("/").at(-1)!;
        return Response.json([...active, ...history].find((j) => j.id === id) ?? job(id, "complete"));
      }
      const items = url.searchParams.get("state") === "active" ? active : history;
      const offset = Number(url.searchParams.get("offset") ?? 0),
        limit = Number(url.searchParams.get("limit") ?? 50);
      return Response.json({ items: items.slice(offset, offset + limit), offset, limit, total: items.length });
    }),
  );
  return { requests, active, history };
}
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("keeps every active job across pages and polls while closed, then stops", async () => {
  vi.useFakeTimers();
  const s = server(Array.from({ length: 105 }, (_, i) => job(String(i))));
  const queue = createJobQueue();
  queue.start();
  await vi.waitFor(() => expect(queue.activeCount.value).toBe(105));
  expect(queue.activeJobs.value).toHaveLength(105);
  expect(queue.open.value).toBe(false);
  s.active[0] = job("0", "complete");
  await vi.advanceTimersByTimeAsync(2000);
  expect(queue.jobs.value["0"]?.status).toBe("complete");
  queue.stop();
  const count = s.requests.length;
  await vi.advanceTimersByTimeAsync(6000);
  expect(s.requests).toHaveLength(count);
});

it("tracks enqueue immediately, loads older history without duplicates and cancels once", async () => {
  const s = server(
    [],
    Array.from({ length: 55 }, (_, i) => job("h" + i, "complete")),
  );
  const queue = createJobQueue();
  queue.track(job("new"));
  expect(queue.activeCount.value).toBe(1);
  await queue.show("new");
  expect(queue.selectedJobId.value).toBe("new");
  expect(queue.open.value).toBe(true);
  await queue.loadMore();
  expect(new Set(queue.history.value.map((j) => j.id)).size).toBe(55);
  queue.track(job("cancel"));
  await Promise.all([queue.cancel("cancel"), queue.cancel("cancel")]);
  expect(s.requests.filter((u) => u.pathname.endsWith("/cancel"))).toHaveLength(1);
  expect(queue.jobs.value.cancel?.status).toBe("cancelled");
  queue.stop();
});

it("recovers from polling failures without losing known state", async () => {
  vi.useFakeTimers();
  server([job("one")]);
  vi.mocked(fetch).mockRejectedValueOnce(new Error("offline"));
  const queue = createJobQueue();
  queue.start();
  await vi.waitFor(() => expect(queue.error.value).not.toBe(""));
  await vi.advanceTimersByTimeAsync(2000);
  expect(queue.activeCount.value).toBe(1);
  expect(queue.error.value).toBe("");
  queue.stop();
});

it("ignores a late response after teardown", async () => {
  let finish!: (value: Response) => void;
  vi.stubGlobal(
    "fetch",
    vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    ),
  );
  const queue = createJobQueue();
  queue.start();
  queue.stop();
  finish(Response.json({ items: [job("late")], total: 1, offset: 0, limit: 100 }));
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(queue.activeJobs.value).toHaveLength(0);
});

it("preserves a just-enqueued job when an older list request finishes", async () => {
  let finish!: (value: Response) => void;
  vi.stubGlobal(
    "fetch",
    vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    ),
  );
  const queue = createJobQueue();
  const refresh = queue.refresh();
  queue.track(job("new"));
  finish(Response.json({ items: [], total: 0, offset: 0, limit: 100 }));
  await refresh;
  expect(queue.activeCount.value).toBe(1);
  expect(queue.jobs.value.new?.status).toBe("queued");
  queue.stop();
});

it("never regresses a terminal job when a delayed cancel response arrives after polling", async () => {
  const s = server();
  const transport = vi.mocked(fetch).getMockImplementation()!;
  let finish!: (response: Response) => void;
  vi.mocked(fetch).mockImplementation((input, init) =>
    String(input).endsWith("/cancel")
      ? new Promise<Response>((resolve) => {
          finish = resolve;
        })
      : transport(input, init),
  );
  const queue = createJobQueue();
  queue.track(job("late-cancel", "running"));
  const cancellation = queue.cancel("late-cancel");
  s.history.push(job("late-cancel", "cancelled"));
  await queue.refresh();
  expect(queue.jobs.value["late-cancel"]?.status).toBe("cancelled");
  finish(Response.json(job("late-cancel", "cancelling")));
  await cancellation;
  expect(queue.jobs.value["late-cancel"]?.status).toBe("cancelled");
  expect(queue.activeCount.value).toBe(0);
  queue.stop();
});

it("aborts drawer lookup and does not issue more requests or insert state after teardown", async () => {
  let finish!: (response: Response) => void;
  const fetcher = vi
    .fn(async () => Response.json({ items: [], total: 0, offset: 0, limit: 100 }))
    .mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    );
  vi.stubGlobal("fetch", fetcher);
  const queue = createJobQueue();
  const shown = queue.show("late-lookup");
  queue.stop();
  finish(Response.json(job("late-lookup", "complete")));
  await shown;
  expect(queue.jobs.value["late-lookup"]).toBeUndefined();
  expect(fetcher).toHaveBeenCalledTimes(1);
});

it("does not resume a drawer action after its awaited refresh is stopped", async () => {
  let finish!: (response: Response) => void;
  const fetcher = vi
    .fn(async () => Response.json({ items: [], total: 0, offset: 0, limit: 100 }))
    .mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    );
  vi.stubGlobal("fetch", fetcher);
  const queue = createJobQueue();
  const refreshing = queue.refresh();
  const shown = queue.show();
  queue.stop();
  finish(Response.json({ items: [], total: 0, offset: 0, limit: 100 }));
  await refreshing;
  await shown;
  expect(fetcher).toHaveBeenCalledTimes(1);
});
