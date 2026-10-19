# Studio Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve job visibility, satellite labels, artificial dataset management, automatic collection routing, training counts, and the manual collection interface.

## Execution status

- [x] More detailed job logs and safe incremental generation progress.
- [x] Satellite names across the interface, including migration and routine rename refresh.
- [x] Confirmed generated-dataset deletion with snapshot/shared-audio preservation and crash recovery.
- [x] Unique phrase/model matching with explicit override priority and transactional revalidation.
- [x] Selected negative dataset count, excluding evaluation-only inputs.
- [x] Remove manual Collect's extra local queue button while retaining tracking and refresh.
- [x] Independent review and four regression-tested fixes.
- [x] Final verification: Studio Python 337 passed / 1 skipped; frontend 130 passed; Playwright 10 passed; build and diff checks passed.
- Full Python run: 448 passed, 1 skipped, 1 failure in `test_compose.py::ComposeTests::test_resolved_service_keeps_loopback_gpu_and_existing_data_volume` from existing local Compose/environment configuration; preserved unchanged.
- Implementation was completed on the existing branch. The user subsequently authorized committing all changes, including local Compose configuration; transient brainstorming-server state and tokens are excluded. The unchecked detailed steps below are the original execution template, not outstanding implementation work; per-task commit checkpoints were deliberately not executed.

**Architecture:** Extend the existing Python Studio services and Vue interfaces without changing stable device identities or immutable training snapshots. Keep logs bounded and credential-safe; infer collection ownership only for unique matches after explicit mappings.

**Tech Stack:** Python, FastAPI, SQLite, Vue 3, TypeScript, pytest, Vitest.

**Spec:** The user's six requested improvements in this conversation, captured in the task headings below.

## Global Constraints

- Skip brainstorming as requested.
- Preserve existing changes in `compose.yaml`, `.env`, and `.superpowers/brainstorm/`.
- Use satellite names for display, never for identifiers, API addressing, or SQL keys.
- Keep unknown and ambiguous source matches in the Unmapped tab.
- Never publish credentials, arbitrary subprocess output, or raw exception text in job logs.
- Preserve existing training manifests and any shared audio they reference when deleting generated datasets.
- Do not commit changes without user authorization; commit checkpoints below are optional.

## Review Focus

- Duplicate normalized wake phrases must remain unmapped rather than selecting an arbitrary workspace (Task 4).
- Missing or changed satellite names must not break identity checks or fleet refreshes (Task 2).
- Deleting a dataset referenced by historical training must not destroy reproducible inputs (Task 3).
- A child producing large or malformed output must not deadlock cancellation or leak secrets (Task 1).
- Switching workspaces during requests must not render counts or mutation results in the wrong workspace (Tasks 3 and 5).

---

### Task 1: More useful logs for every job, especially artificial generation

**Files:** Modify `studio/jobs.py`, `studio/generation.py`, `cli/tts_generate_samples.py`, `studio/runtime.py`, `studio/collection.py`, `studio/classification.py`, `studio/automation.py`, `studio/datasets.py`, `studio/training.py`; test `tests/test_studio_jobs.py`, `tests/test_studio_generation.py`, `tests/test_studio_collection.py` and the corresponding service tests.

**Interfaces:** Preserve `JobContext.log(text)` and `JobContext.run(argv, *, cwd=None)`. Add a dedicated inherited progress pipe for child commands with a strict structured-event allowlist; it must not expose stdout/stderr. Events describe stage, supported engine, completed count, and total count, never arbitrary text. Existing commands that do not emit events remain supported.

- [ ] Write regression tests `test_generation_reports_incremental_progress`, `test_worker_logs_terminal_status`, and `test_child_progress_is_bounded_and_credential_safe`: assert logs arrive before child exit; generation reports engine initialization, generation counts, validation and completion; every registered job kind reports meaningful stages and a terminal outcome. Assert malformed/oversized events and arbitrary child stdout/stderr are absent from logs, and cancellation still terminates children.
- [ ] Run `python -m pytest tests/test_studio_jobs.py tests/test_studio_generation.py -q`; confirm the new tests fail for missing progress and terminal logs.
- [ ] Implement structured progress transport in `ProcessRunner.run`, preserving the ownership gate and process-group cleanup. Emit allowlisted events from TTS model-loading and batch loops, with throttled periodic counts and a final count. Add trusted service-stage logs for scrape, classify, download, training, deployment and previews; include elapsed-time heartbeat messages while waiting for long child operations. Avoid SQL log writes from inside an existing service transaction.
- [ ] Run the targeted pytest tests plus collection, classification, dataset, training and deployment tests; require all to pass.
- [ ] Optional authorized commit: `feat: add safe incremental Studio job progress`.

### Task 2: Show kiosk satellite names throughout the interface

**Files:** Create `studio/schema_device_names.sql`; modify `studio/db.py`, `studio/models.py`, `studio/kiosk.py`, `studio/devices.py`, `frontend/src/studio/types.ts`, `frontend/src/studio/devices.ts`, `frontend/src/studio/components/DeviceRegistry.vue`, `frontend/src/studio/components/CollectionHistory.vue`, `frontend/src/studio/components/SourceInbox.vue`, `frontend/src/studio/components/JobQueueCard.vue`, `frontend/src/studio/pages/ClassifyPage.vue`, `frontend/src/studio/pages/SamplesPage.vue`, `frontend/src/studio/pages/DeployPage.vue`; test existing kiosk, device and relevant frontend test files.

**Interfaces:** Add optional `name: str | None = None` to `Device` and `KioskIdentity`, preserving positional compatibility. Migrate the database from schema 14 to 15 with nullable `devices.name`. Expose `deviceLabel(id: string): string` from `useDeviceRegistry()`; prefer the saved satellite name, then a known address, then `Unknown kiosk` for unavailable historical devices.

- [ ] Write `test_satellite_names_survive_discovery_and_rename` and frontend tests asserting that `Kitchen satellite` appears instead of its opaque ID in registry, review, samples, inbox, collection history, deployment targets/leader attribution, and collection job targets. Test missing names, duplicate display names, an old schema migration, and an unchanged stable ID after a rename.
- [ ] Run `python -m pytest tests/test_studio_kiosk.py tests/test_studio_devices.py -q` and `npm test -- --run src/studio/__tests__/devices.test.ts src/studio/__tests__/kiosks.test.ts` from `frontend`; confirm new assertions fail.
- [ ] Verify the actual kiosk identity/fleet response name fields against fixtures or available protocol references before implementing extraction. Persist validated optional names on registration, credential refresh and fleet refresh, without overwriting known names when a response omits them. Use the shared reactive label helper in every visible device reference; retain opaque IDs only in keys, request parameters and diagnostic attributes.
- [ ] Run Python kiosk/device tests and frontend device, kiosk, classify, samples, scrape, deploy and job queue tests; require all to pass.
- [ ] Optional authorized commit: `feat: display satellite names across Studio`.

### Task 3: Delete generated artificial datasets safely

**Files:** Modify `studio/generation.py`, `studio/api.py`, `studio/workspace_deletion.py`, `frontend/src/studio/api.ts`, `frontend/src/studio/pages/ArtificialPage.vue`; create focused cleanup helpers only if needed; test `tests/test_studio_generation.py`, `frontend/src/studio/__tests__/artificial.test.ts`.

**Interfaces:** Add `GenerationService.delete_batch(word_id: str, batch_id: str) -> None`, `DELETE /wakewords/{word_id}/generation/batches/{batch_id}` returning 204, and `studioApi.deleteBatch(wordId, batchId, signal?)`. Preserve the completed job's history/logs. Reject deletion while the batch job or any workspace job is queued/running/cancelling to avoid changing inputs under an active operation.

- [ ] Write `test_delete_batch_removes_selection_but_preserves_snapshot_audio`, `test_delete_batch_checks_workspace_and_active_jobs`, and frontend confirmation tests. Assert removed batches disappear and stop contributing to counts; other workspaces, shared blobs and historical manifest audio survive; wrong workspace gives 404; active work gives 409; switching workspace ignores stale responses.
- [ ] Run `python -m pytest tests/test_studio_generation.py -q` and `npm test -- --run src/studio/__tests__/artificial.test.ts` from `frontend`; confirm the new tests fail.
- [ ] Implement transactional selection/audio-link/batch removal with reference-aware cleanup based on existing workspace deletion logic. Remove only unreferenced blobs and generated staging output, using guarded paths and durable retryable cleanup if filesystem deletion follows the SQL commit. Add an inline accessible confirmation with Cancel/Delete actions, per-mutation busy/error state, and selection/pagination refresh after success.
- [ ] Rerun those tests plus `tests/test_studio_workspace_deletion.py` and training tests; require all to pass.
- [ ] Optional authorized commit: `feat: support deleting artificial datasets`.

### Task 4: Infer wakeword ownership when collecting recordings

**Files:** Modify `studio/workspaces.py`, `studio/collection.py`, `studio/samples.py` if its mapping revalidation requires it, and `frontend/src/studio/components/SourceInbox.vue`; test `tests/test_studio_workspaces.py`, `tests/test_studio_collection.py`, `tests/test_studio_scoped_collection.py`, `tests/test_studio_samples.py`.

**Interfaces:** Preserve `WorkspaceService.resolve_source(device_id: str, engine: str, source_phrase: str) -> str | None`. Exact explicit device/engine/phrase mapping takes precedence. Otherwise normalize source phrase and workspace phrases with Unicode NFKC, casefold and whitespace collapsing, then accept exactly one distinct workspace match. Also accept an exact stable `model_id` match, but return None if independent inferred matches disagree. Do not use fuzzy substring matching or the selected workspace as evidence.

- [ ] Write `test_resolve_source_infers_unique_phrase`, `test_explicit_mapping_overrides_inference`, `test_ambiguous_and_unknown_sources_stay_unmapped`, and `test_scoped_collection_does_not_steal_inferred_matches`. Assert case/whitespace variants match, duplicate normalized phrases do not, exact model identifiers resolve, conflicting inferred candidates do not, and collected recordings actually enter the correct workspace.
- [ ] Run `python -m pytest tests/test_studio_workspaces.py tests/test_studio_collection.py tests/test_studio_scoped_collection.py tests/test_studio_samples.py -q`; confirm inference tests fail.
- [ ] Implement deterministic fallback in the shared resolver, used consistently during collection filtering and final ingest validation. Do not manufacture explicit mappings or relabel old reviewed samples. Update Unmapped explanatory copy to distinguish failed inference from manually saved overrides.
- [ ] Rerun the four test files; require all to pass.
- [ ] Optional authorized commit: `feat: infer collected recording wakewords`.

### Task 5: Include negative dataset count on Train

**Files:** Modify `frontend/src/studio/pages/TrainPage.vue`; test `frontend/src/studio/__tests__/train.test.ts`.

**Interfaces:** Consume the existing paginated selected `Dataset[]` already loaded by Train. Display `N selected negative datasets` separately from reviewed negative recordings; count only selected datasets whose split is not `evaluation`. Show evaluation-only selection separately if present; do not imply a dataset count is an audio sample count.

- [ ] Add tests asserting that two selected training datasets plus one evaluation dataset render `2 selected negative datasets`, zero renders explicitly, selection across more than 100 entries counts correctly, and stale workspace responses do not alter the current count.
- [ ] Run `npm test -- --run src/studio/__tests__/train.test.ts` from `frontend`; confirm new count assertions fail.
- [ ] Add a computed selected training dataset count and a fourth effective-input tile, preserving reviewed-negative and artificial sample counts. Update explanatory copy to include selected external datasets and distinguish evaluation-only inputs.
- [ ] Rerun the Train tests and `npm run typecheck` from `frontend`; require both to pass.
- [ ] Optional authorized commit: `feat: show selected negative dataset count in Train`.

### Task 6: Remove the extra queue button after manual Collect

**Files:** Modify `frontend/src/studio/pages/ClassifyPage.vue`; test `frontend/src/studio/__tests__/scrape.test.ts`, `frontend/src/studio/__tests__/classify.test.ts`.

**Interfaces:** Keep existing collection enqueue, queue tracking, duplicate-click protection, completion refresh and outcome summary. Remove only the dynamically inserted `View collection … in queue` button; retain global queue access and existing drawer behavior.

- [ ] Add a manual Collect test asserting the job is tracked, a second click cannot enqueue duplicate active work, completion refreshes recordings, and no extra local queue button appears before or after completion.
- [ ] Run `npm test -- --run src/studio/__tests__/scrape.test.ts src/studio/__tests__/classify.test.ts` from `frontend`; confirm the absence assertion fails.
- [ ] Remove the extra button without changing collection state management.
- [ ] Rerun those tests; require all to pass.
- [ ] Optional authorized commit: `fix: keep manual collection controls uncluttered`.

## Final verification

- [ ] Run `python -m pytest tests/test_studio_*.py -q`.
- [ ] Run `npm test -- --run` and `npm run build` from `frontend`.
- [ ] Review all six requirements against the diff, inspect credential-safety and deletion/reference boundaries, and record any untested GPU or live-kiosk behavior explicitly.
- [ ] Confirm unrelated user changes remain intact with `git status --short`.
