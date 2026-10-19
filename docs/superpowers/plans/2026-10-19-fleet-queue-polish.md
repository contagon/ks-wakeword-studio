# Fleet and Global Queue Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Deliver the approved kiosk address/removal controls, compact global job drawer, and simplified Train page.

**Architecture:** Extend the existing SQLite device registry and job-list API. A shell-owned reactive job store monitors all active jobs, and pages subscribe to its updates rather than relying on inline consoles. Separate registry work from queue work, then integrate the page flows.

**Tech Stack:** Python/FastAPI/SQLite, Vue 3/TypeScript, existing Vitest and Playwright suites.

**Spec:** `docs/superpowers/specs/2026-10-19-fleet-queue-polish-design.md`

## Global Constraints

- No new dependencies or remote kiosk membership/selection changes.
- Retain historical data and server-only credentials.
- Follow the compact approved mockup and existing light/dark themes.
- Keep existing automation functional; remove only Train's automatic-training presentation.
- Preserve unrelated user changes and preview artifacts.

## Review Focus

- Historical foreign keys: removal must preserve recordings/publications and reject stale device access (Task 1).
- Long histories: active jobs and badge totals remain complete beyond 100 jobs (Task 2).
- Network failures: polling recovers without overlapping requests or overwriting fresh state (Task 2).
- Workspace switches: old completions never mutate the newly selected page's state (Task 4).
- Drawer closed: preview audio, collection results, batches, and training history still update (Task 4).

---

### Task 1: Safe kiosk address editing and local removal

**Files:** Modify `studio/db.py`, `studio/devices.py`, `studio/api.py`, `frontend/src/studio/api.ts`, `frontend/src/studio/devices.ts`, `frontend/src/studio/components/DeviceRegistry.vue`; create `studio/schema_device_management.sql`; extend `tests/test_studio_devices.py`, `frontend/src/studio/__tests__/devices.test.ts`, `frontend/src/studio/__tests__/kiosks.test.ts`, and their existing API fixtures.

**Interfaces:** Add `DeviceService.update_address(device_id: str, url: str) -> Device` and `DeviceService.remove(device_id: str) -> None`; expose `PATCH /devices/{id}` with `{url: string}` and `DELETE /devices/{id}` returning 204. Frontend `studioApi.updateDevice(id, url, signal?) -> Promise<Device>` and `deleteDevice(id, signal?) -> Promise<void>`; registry `update(id, url)` and `remove(id)` reload the shared visible registry.

- [ ] Add failing backend tests for normalized edits on all roles; invalid URLs; unknown IDs; an offline device; follower override survival after repeated refresh; preserving credentials and immutable roles; and local leader removal with retained historical recordings/publications.
- [ ] Run `python -m pytest tests/test_studio_devices.py -q`; confirm the new cases fail for missing functionality.
- [ ] Add schema version 14 with `url_override TEXT` and `removed INTEGER NOT NULL DEFAULT 0 CHECK (removed IN (0,1))`. Keep `url` as the effective address and retain the override when upserting roster URLs. Mark removed records inactive; hide them in list, reject normal `get`/token access, and restore only on explicit registration or inclusion in an explicit roster refresh. Cascade leader removal only to its followers. Review all device lookups in collection/deployment for removal-marker enforcement.
- [ ] Implement the service and strict sanitized API endpoints above without remote probes when saving addresses or removing devices. Do not physically delete records referenced by history.
- [ ] Add frontend failing tests for Edit/Save/Cancel, follower-specific override text, delete confirmation/cancel, leader/follower confirmation copy, rejected mutations, and shared-cache refresh after deletion. Update fake API support.
- [ ] Run `npm test -- --run src/studio/__tests__/devices.test.ts src/studio/__tests__/kiosks.test.ts` in `frontend`; confirm new cases fail.
- [ ] Implement controls matching the approved mockup; use the existing modal/focus patterns and show mutation errors without hiding the edit form.
- [ ] Re-run the targeted Python and frontend tests; verify migration from version 13 with historical device references.
- [ ] Commit only Task 1 files with `feat: support kiosk address edits and local removal`.

### Task 2: Complete global job listing and reactive monitoring

**Files:** Modify `studio/jobs.py`, `studio/api.py`, `frontend/src/studio/api.ts`; create `frontend/src/studio/jobs.ts` and `frontend/src/studio/__tests__/jobs.test.ts`; extend `tests/test_studio_jobs.py` and `frontend/src/studio/__tests__/fakeStudio.ts`.

**Interfaces:** Extend `JobQueue.list(offset=0, limit=50, *, state=None)` with optional state `active` or `history`; preserve unfiltered behavior for existing callers. `GET /jobs?state=active|history` returns `Page[Job]` with filtered totals, active ordered oldest-first and history newest-first, both with stable rowid tie-breaking. Add `JobQuery = Pagination & {state?: 'active' | 'history'}` to the frontend API. Export `createJobQueue()` and `useJobQueue()` via an injection key; expose reactive `activeJobs`, `history`, `activeCount`, `error`, `open`, `selectedJobId`, and methods `start()`, `stop()`, `refresh()`, `track(job: Job)`, `show(id?: string)`, `loadMore()`, `cancel(id: string)`.

- [ ] Add backend failing tests proving mixed-workspace/shared/follower-payload jobs are unfiltered, active totals exceed 100 correctly, history is newest-first, and invalid state/pagination is rejected.
- [ ] Run `python -m pytest tests/test_studio_jobs.py -q` and confirm failures in the added cases.
- [ ] Implement the optional state filter and ordering without changing unfiltered call semantics. Never serialize credentials or add per-follower duplicate jobs.
- [ ] Add store tests using fake timers: paginate all active jobs, poll while closed every 2000ms, load more history without duplicates, track newly enqueued jobs immediately, cancel once, recover on transient error, discard stale aborted responses, and stop all timers/requests on shell teardown.
- [ ] Run `npm test -- --run src/studio/__tests__/jobs.test.ts` in `frontend`; confirm failures before implementation.
- [ ] Implement shell-scoped monitoring (not a leaking module singleton). Keep active/history keyed by job ID and permit page watchers to observe tracked job transitions; retain tracked terminal jobs long enough for page callbacks. Fetch history on drawer open and active jobs continuously; serialize refresh cycles and paginate active results fully.
- [ ] Run targeted Python/frontend tests and commit with `feat: add global job monitoring`.

### Task 3: Compact accessible queue drawer

**Files:** Create `frontend/src/studio/components/JobQueueDrawer.vue`, `frontend/src/studio/components/JobQueueCard.vue`, `frontend/src/studio/__tests__/jobQueue.test.ts`; modify `frontend/src/studio/components/StudioShell.vue` and `frontend/src/studio/studio.css`.

**Interfaces:** Shell provides and owns Task 2's queue lifecycle. `JobQueueDrawer` consumes `useJobQueue()` and the existing workspace/device registries. `JobQueueCard` takes `{job: Job}` and renders compact title/status/cancel, concise scope/device metadata, and lazy log disclosure. Logs use `studioApi.jobLogs(id, 8192, signal?)`; poll only expanded active cards and stop on collapse, terminal state, or unmount.

- [ ] Add failing tests for all-workspace groups, cancelling status, shared dataset labels, follower IDs, missing-name fallback, badge count, lazy logs, and cancel errors. Include Escape/backdrop close, restored focus, trapped keyboard focus, and no navigation/workspace filtering.
- [ ] Run `npm test -- --run src/studio/__tests__/jobQueue.test.ts` in `frontend`; confirm the tests fail.
- [ ] Implement the top-right queue icon after the theme control, total active badge, modal right overlay, and full-width narrow layout. Match mockup card padding of 10px vertically, 12px horizontally, and 7px inter-card spacing. Keep logs collapsed; use existing semantic colors and theme variables.
- [ ] Include loading, empty, error/retry, and Load older jobs states; hide inaccessible background content while the modal is open and restore it on teardown.
- [ ] Run drawer tests plus `npm run typecheck` in `frontend`; commit with `feat: add compact global job queue drawer`.

### Task 4: Route page jobs into the global queue and simplify Train

**Files:** Modify `frontend/src/studio/pages/ClassifyPage.vue`, `ArtificialPage.vue`, `NegativeDatasetsPage.vue`, `TrainPage.vue`; adapt relevant existing page tests and `frontend/e2e/studio.spec.ts`. Keep `JobConsole.vue` if other tests/callers still use it; do not delete unrelated code merely because the pages stop importing it.

**Interfaces:** Pages call Task 2's `track(job)` and `show(job.id)` after successful manual enqueue. They observe store jobs by ID and invoke their existing workspace-guarded completion handlers. Existing Train history entries use `show(run.id)` instead of embedded consoles.

- [ ] Add failing page tests asserting no inline job consoles, manual jobs open the global queue, audio previews become playable after completion while the drawer is closed, generation completion refreshes batches, collection completion retains warnings and refreshes review data, and downloads/training history update. Include navigation during an outstanding enqueue and during job completion.
- [ ] Add a Train test asserting Automatic training and its Automate link are absent and schedules are not requested; existing Automate schedule tests must remain passing.
- [ ] Run the affected frontend page tests to confirm expected failures.
- [ ] Replace inline consoles with queue actions and store watchers. Preserve current abort/generation/workspace guards, and do not tie monitoring to drawer visibility. Remove unused Train schedule state/imports/fetch and update its introductory copy. Retain history/result summaries and completed preview audio.
- [ ] Add an end-to-end flow covering edit follower address, fleet refresh preserving it, local delete confirmation, enqueue from one wakeword then switch to another with the same queue/badge, open logs/cancel, and mobile Escape/backdrop behavior.
- [ ] Run `python -m pytest tests/test_studio*.py -q`, `npm test -- --run`, and `npm run build` (npm commands in `frontend`). Run `npm run test:e2e` in the configured integration environment; report explicitly if its server prerequisites are unavailable.
- [ ] Review the diff for secret exposure, lost completion callbacks, polling leaks, migration regressions, and unrelated file changes; commit with `feat: centralize page job progress and simplify training`.

## Handoff

Recommended execution: Native, since these four tasks share the queue store and page lifecycle interfaces. Review the design/plan before starting implementation; isolate the implementation in a worktree and preserve all existing user changes.
