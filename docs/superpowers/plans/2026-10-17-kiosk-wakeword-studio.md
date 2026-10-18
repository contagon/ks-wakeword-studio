# Kiosk Wakeword Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a compact multi-wakeword studio that scrapes kiosk diagnostics, supports manual classification, trains on cron schedules, and publishes reversible model updates through a fleet leader or standalone kiosks.

**Architecture:** Add a focused `studio/` backend package beside the existing server, with SQLite metadata, immutable content-addressed audio, durable jobs, and an authenticated kiosk adapter. Refactor existing training entrypoints only where needed to consume explicit run inputs instead of singleton mutable directories. Keep Vue and split its large application into compact page components using TailwindCSS; never use mockup data in production.

**Tech Stack:** Python/FastAPI, SQLite, existing NVIDIA training CLI, Vue 3/TypeScript/Vite, TailwindCSS, croniter + zoneinfo, unittest, Vitest/Vue Test Utils, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-17-kiosk-wakeword-studio-design.md`

## Global Constraints

- “Do not modify Kiosk Satellite in this project without separate authorization.”
- “Use stable model identities and filenames on devices; use versioned immutable directories only in this trainer.”
- “Support one configured leader plus standalone kiosks; multiple-fleet management is out of scope initially.”
- “Auto-discovery never copies or invents follower admin tokens; show "Credentials required" and let users enter each once.”
- “Do not clear kiosk diagnostics.”
- “Publication means model availability, not changing engine, wakeword selection, thresholds, or either enabled slot.” Existing leader-controlled fleet behavior is accepted.
- “Keep admin tokens server-side, protected on disk, excluded from API responses, frontend bundles, exports by default, and logs.”
- “Schedules use standard five-field cron with an explicit IANA timezone, validation, next-run display, and restart-safe run claiming.” Default UTC.
- “Do not begin product implementation before full-design approval.” Approval received; review this plan and choose execution method before coding.
- Do not overwrite staged `outline.md`, `links.txt`, or other user work. Worktree creation and moving approved planning documents into it happen at execution time; do not commit unrelated files.
- Keep both Docker images and the committed offline `static/ui` bundle; no Node requirement in the running container.

## Review Focus

1. An address now belongs to a different kiosk: fail identity verification instead of downloading into the old source or uploading to the wrong device (Tasks 3–4).
2. Concurrent label saves, slow audio responses, or browser autoplay rejection: preserve labels and review position without playing the wrong clip (Tasks 2, 11).
3. SQLite/process crashes after files are written or after GPU jobs start: no duplicate scheduled jobs, partial publishable models, or concurrent orphan GPU processes (Tasks 1, 5, 8).
4. Fleet role changes or delayed version retries during rollback: followers must never become direct upload targets, and stale retries cannot overwrite the current desired version (Tasks 3, 9).
5. Generated variants and re-imported identical audio: stable evaluation families cannot leak into training, and deleting visible samples cannot invalidate historical runs (Tasks 2, 8).

---

## File structure and contracts

Existing anchors: `trainer_server.py` owns FastAPI routes, global sample paths and training runtime; `frontend/src/TrainerApp.vue` and `trainerStore.ts` hold the current UI; `train_wake_word` always generates audio before training; `cli/wake_word_sample_trainer` hardcodes stock negative paths. Tests primarily use `unittest` and temporary directories. Extend, do not replace, the existing CUDA/Blackwell setup machinery.

New backend files and responsibilities:
- `studio/db.py`, `studio/schema.sql`: connection lifecycle, migrations, transactions, durable metadata.
- `studio/models.py`: typed shared records and errors; no network or filesystem side effects.
- `studio/storage.py`: immutable blobs, normalization, scoped access, atomic publication to disk.
- `studio/workspaces.py`, `studio/samples.py`: wakeword settings, source mappings, labeling/history, library queries.
- `studio/kiosk.py`, `studio/devices.py`: HTTP protocol/auth boundaries and shared fleet/device registry.
- `studio/collection.py`: idempotent diagnostic retrieval and routing.
- `studio/schedules.py`, `studio/jobs.py`: cron calculation and durable queue/lifecycle.
- `studio/datasets.py`, `studio/dataset_catalog.json`: expandable dataset catalog/download jobs and per-word selection.
- `studio/generation.py`: saved recipes and synthetic batch jobs.
- `studio/training.py`, `studio/legacy_training.py`: immutable input manifests and adapter to existing feature generation/training.
- `studio/deployment.py`: archives, publication/retry and rollback.
- `studio/migration.py`: explicit non-destructive legacy import.
- `studio/api.py`, `studio/runtime.py`: router/application lifecycle and dependency construction.

New UI files: `frontend/src/studio/{api.ts,types.ts,workspace.ts,routes.ts}`, `frontend/src/studio/components/{StudioShell,DeviceRegistry,CronEditor,AudioPlayer,JobConsole,PaginatedTable}.vue`, and `frontend/src/studio/pages/{Wakewords,NegativeDatasets,Artificial,Scrape,Classify,Samples,Train,Deploy}Page.vue`. Shared visual tokens live in `frontend/src/studio/studio.css`. Page tests sit in `frontend/src/studio/__tests__/`; browser tests in `frontend/e2e/`.

Common backend signatures use dataclasses from `studio/models.py`: `Wakeword`, `Device`, `Recording`, `Sample`, `Schedule`, `Job`, `Batch`, `RunManifest`, `ModelVersion`, `Publication`, `Page[T]`. IDs are opaque strings; dates timezone-aware UTC ISO strings in APIs; stable `model_id` is separate from display phrase. Domain errors: `NotFound`, `Conflict`, `ValidationError`, `CredentialsRequired`, `IdentityMismatch`, `RemoteRejected`, `RemoteUnavailable`. Services use `Store` and constructor-injected clocks, HTTP clients, and command runners so tests never need a GPU or live LAN.

API namespace: `/api/studio`; errors map to 404/409/422/401-or-403/502-or-503 as appropriate without token leakage. Page responses have `{items,total,offset,limit}`, with `limit` 1–100, default 50. Mutation responses contain updated server records. Wakeword-scoped routes are `/wakewords/{word_id}/...`; device registry and scraping schedule are global. Avoid permissive `any` and untyped response dictionaries in new frontend code.

## Stage 1 — Durable workspaces and collection

### Task 1: Metadata, storage, and workspace APIs

**Files:** Create `studio/{__init__.py,models.py,db.py,schema.sql,storage.py,workspaces.py,api.py,runtime.py}`, `tests/test_studio_workspaces.py`, `tests/test_studio_storage.py`; modify `trainer_server.py` startup/router integration only.

**Interfaces:** `Store.open(root: Path) -> Store`, `Store.transaction()`, `BlobStore.put(stream: BinaryIO) -> BlobRef`, `WorkspaceService.create(phrase: str, language: str, model_id: str) -> Wakeword`, `get(word_id: str) -> Wakeword`, `list(offset: int, limit: int) -> Page[Wakeword]`, `update(word_id: str, changes: WakewordUpdate) -> Wakeword`. Register `GET/POST /wakewords` and `GET/PATCH /wakewords/{id}` through `create_router(runtime: StudioRuntime) -> APIRouter`. Runtime startup/shutdown is idempotent and lazy, not import-time `/data` writes.

- [ ] Write failing unittest cases `test_workspaces_survive_restart`, `test_duplicate_model_id_rejected`, `test_phrase_edit_keeps_model_id`, `test_blob_write_crash_not_visible`, `test_path_escape_and_symlink_rejected`, `test_workspace_apis_never_expose_tokens`. Assert two phrases remain separate after reopening SQLite, duplicate stable model IDs raise `Conflict`, partial writes are unreferenced and recoverable, and outside files cannot be read/deleted.
- [ ] Run `python -m unittest discover -s tests -p 'test_studio_workspaces.py' -v` and the storage test file; expect missing-module/interface failures first.
- [ ] Implement migrations with foreign keys, WAL, bounded transaction retries and schema versioning. Store at `DATA_DIR/studio/studio.sqlite3`, blobs at `DATA_DIR/studio/blobs/<sha256>`, job/run paths under opaque IDs. Give immutable source/model IDs unique constraints; atomic filesystem writes precede metadata references. Define all shared records named above with fields required by their owning tasks; never reuse old mutable global paths. Wire router construction without enabling background workers yet.
- [ ] Rerun both files and existing `test_data_management.py`; expect all passing and old sample paths untouched.
- [ ] Commit only task files: `feat: add durable wakeword workspaces and studio storage`.

### Task 2: Source identity, manual labels, and retained sample provenance

**Files:** Create `studio/samples.py`, `tests/test_studio_samples.py`; extend schema, storage, models, API.

**Interfaces:** `SampleService.ingest(device_id: str, clip: DiagnosticClip, audio: BinaryIO, word_id: str | None) -> Recording`, `set_label(sample_id: str, label: Literal['positive','negative','discarded'], expected_revision: int) -> Sample`, `undo(sample_id: str, expected_revision: int) -> Sample`, `assign(recording_id: str, word_id: str) -> Sample`, `list(word_id: str, query: SampleQuery) -> Page[Sample]`, `delete(sample_id: str, expected_revision: int) -> None`, `import_audio(word_id: str, label: str, audio: BinaryIO) -> Sample`. `DiagnosticClip` includes id, timestamp, phrase, engine, near_miss, scores and raw bounded metadata. Define original hash, normalized hash and `family_id` on immutable audio records.

- [ ] Write failing tests: ingesting `(device_id='a',clip_id='1')` twice yields one source; the same clip ID on device b is distinct; discarded/deleted identities are not reimported; a changed hash under the same identity is quarantined; unknown mappings stay unassigned; `set_label(..., expected_revision=0)` twice produces a 409 on the second stale request; undo restores the prior label. Assert identical audio imports share evaluation `family_id`, normalized/trimmed derivatives inherit it, and referenced blobs survive visible deletion.
- [ ] Run `python -m unittest discover -s tests -p 'test_studio_samples.py' -v`; expect failure.
- [ ] Implement service and paginated `/wakewords/{id}/samples`, `/wakewords/{id}/queue`, `/recordings/unmapped`, mapping assignment, label/undo/import/delete/audio/trim routes. Normalize training copies to 16 kHz mono PCM16 using existing validated conversion logic; originals remain immutable. Validate allowed label transitions, revisions, MIME/size, workspace ownership and family lineage. Preserve source tombstones and trim history; protect retained-run blob references from cleanup. Skip is a per-review-session deferral, not a persistent positive/negative label.
- [ ] Rerun sample/storage/workspace tests; expect passing. Include importing malicious filenames and stale undo as explicit cases.
- [ ] Commit: `feat: add provenance-safe samples and manual classification API`.

### Task 3: Authenticated kiosk client and shared fleet registry

**Files:** Create `studio/kiosk.py`, `studio/devices.py`, `tests/test_studio_kiosk.py`, `tests/test_studio_devices.py`, `tests/fixtures/kiosk/` JSON fixtures; extend models/schema/API.

**Interfaces:** `KioskClient.command(device: Device, name: str, params: dict) -> dict`, `identity(device: Device) -> KioskIdentity`, `diagnostics(device: Device) -> DiagnosticListing`, `audio(device: Device, clip_id: str) -> bytes`, `stage_model(device: Device, name: str, content: BinaryIO) -> None`, `commit_models(device: Device) -> CommitResult`, `model_manifest(device: Device) -> dict[str,str]`. `DeviceService.add(url: str, token: str, role: Literal['standalone','leader']) -> Device`, `refresh_fleet(leader_id: str) -> list[Device]`, `set_credentials(device_id: str, token: str) -> Device`, `publication_targets() -> list[Device]`.

- [ ] Write fixture-driven tests from sibling kiosk source: leader `fleetStatus` adds followers by ID/address/port with role `follower`; re-adding a discovered device cannot bypass that role; a second leader is rejected; missing credentials show `credentials_required`; follower removal retains history but disables automatic actions; address identity mismatch raises `IdentityMismatch` before audio/upload. Assert only leader+standalones are returned as upload targets and token-like secrets never appear in payloads/logs/errors.
- [ ] Run both new test files with `python -m unittest discover -s tests -p 'test_studio_kiosk.py' -v` (then devices); expect failure.
- [ ] Implement bounded HTTP transport with admin Bearer auth, explicit timeout/body limits, no unapproved redirects, HTTPS verification, support for private LAN hosts and IPv6/base paths. Pin stable kiosk identities. Follow existing command envelope `{ok,data,error}`; HTTP 200 with `ok:false` is failure. Derive exact identity/fleet command payloads from `../kiosk-satellite/app/lib/managers/{fleet,remote}/` before making fixtures. Store credentials in a separate owner-only server file with opaque refs; responses omit even masked token values. Add `/devices` list/add/refresh/credentials routes shared by both pages. Never request or repurpose hidden fleet tokens.
- [ ] Rerun tests including network timeout, unexpected redirect, self-signed certificate rejection, profile eligibility and follower-to-standalone role drift; expect passing.
- [ ] Commit: `feat: add shared kiosk registry and fleet discovery`.

### Task 4: Idempotent rolling-history collection

**Files:** Create `studio/collection.py`, `tests/test_studio_collection.py`; extend routes/schema and source mappings in workspaces.

**Interfaces:** `CollectionService.run(device_ids: list[str] | None = None) -> CollectionRun`, `collect_device(device_id: str) -> DeviceCollectionResult`, `WorkspaceService.set_source_mapping(device_id: str, engine: str, source_phrase: str, word_id: str) -> None`. Produce counters `listed,new,already_seen,unmapped,evicted,failed` and per-device errors, never an invented total-loss count.

- [ ] Write failing tests for mixed activation/near-miss import, repeated scrape, failed download retry, eviction between list/fetch, disabled diagnostics, unknown phrases, two overlapping calls, and one offline device not blocking others. Assert global collection ignores currently selected UI word; identities are verified before fetching; a discovered follower with no token is skipped with actionable status.
- [ ] Run `python -m unittest discover -s tests -p 'test_studio_collection.py' -v`; expect failure.
- [ ] Implement per-device serialization, fleet refresh before full scrape, download-to-staging → normalize/store → transactional identity claim. Use Task 2 tombstones and Task 3 auth; no remote deletion commands. Add manual `POST /scrape`, `GET /scrape/runs`, and explicit source-mapping endpoints. Persist incomplete attempts and bounded retry state.
- [ ] Rerun collection tests with simulated restart during download and same diagnostic ID returned by another device; expect exactly one success per device/clip identity.
- [ ] Commit: `feat: collect and route rolling kiosk diagnostics without duplicates`.

### Task 5: Cron schedules and restart-safe jobs

**Files:** Create `studio/schedules.py`, `studio/jobs.py`, `tests/test_studio_schedules.py`, `tests/test_studio_jobs.py`; modify runtime, schema, `run.sh`, `tests/test_run_sh.py`.

**Interfaces:** `ScheduleService.save(scope: str, cron: str, timezone: str, enabled: bool) -> Schedule`, `next_run(schedule: Schedule, after: datetime) -> datetime`, `tick(now: datetime) -> list[Job]`; scope is `scrape` or `train:<word_id>`. `JobQueue.enqueue(kind: str, word_id: str | None, payload: dict, dedupe_key: str | None = None) -> Job`, `claim(resource: Literal['gpu','collection','download'], now: datetime) -> Job | None`, `finish(job_id: str, result: dict) -> Job`, `cancel(job_id: str) -> Job`, `recover() -> None`.

- [ ] Write failing fake-clock tests: reject six-field/invalid cron and invalid IANA zone; `*/5 * * * *` advances by 5 minutes in UTC; scrape and per-word `0 2 * * *` schedules are independent; DST transitions follow explicit croniter/zoneinfo behavior with one unique job per scheduled UTC instant; restart coalesces missed ticks to one pending run; duplicate ticks/manual conflicts do not create duplicate GPU owners. A worker crash with a still-running child cannot release the GPU to another process.
- [ ] Run schedule/job tests individually using unittest discover; expect failure.
- [ ] Implement SQL job claims and schedule occurrence uniqueness, due-time persistence, bounded logs, child process groups and cancellation/recovery. Run one GPU worker shared by generation/training and bounded collection/download workers. Recover running jobs as interrupted only after checking/killing owned child process groups; do not kill unrelated processes. Wire startup/shutdown, API schedules/jobs/log-tail/cancel. Add exact pinned croniter dependency to the server environment setup in `run.sh` and its environment-validation tests, rather than only ML `requirements.txt`.
- [ ] Run new tests and `test_run_sh.py`; expect passing, no real sleeps/process leaks and no STT/Tater workers activated for studio workspaces.
- [ ] Commit: `feat: schedule durable collection and GPU jobs with cron`.

## Stage 2 — Reusable data, training, and reversible publication

### Task 6: Expandable dataset catalog with actual training selection

**Files:** Create `studio/datasets.py`, `studio/dataset_catalog.json`, `tests/test_studio_datasets.py`; modify `cli/setup_negative_datasets`, `cli/wake_word_sample_trainer`, `openwakeword_stage.py` as needed for explicit dataset input configuration.

**Interfaces:** `DatasetService.list(word_id: str, search: str, status: str | None, offset: int, limit: int) -> Page[Dataset]`, `select(word_id: str, dataset_ids: list[str]) -> None`, `download(dataset_id: str) -> Job`, `snapshot(word_id: str) -> list[DatasetInput]`. Each entry declares ID, display/source/license metadata, representation (`audio`/`features`), split (`train`/`evaluation`), adapter and fingerprint. No unsupported upstream feature tensors are passed to the wrong engine.

- [ ] Write failing tests for 200 catalog entries with pagination, shared download/per-word selection isolation, invalid dataset rejection, failed download retry, archive path traversal, and changes affecting only future snapshots. Assert real existing IDs `speech`, `dinner_party`, `no_speech`, `dinner_party_eval` are represented and `dinner_party_eval` never enters training. Test explicit selected inputs generate model configs that omit unselected hardcoded defaults for both model stages; unsupported representations fail clearly, not silently.
- [ ] Run `python -m unittest discover -s tests -p 'test_studio_datasets.py' -v`; expect failure.
- [ ] Implement registry-driven list/download/select routes, installation manifests and safe staging extraction. Reuse downloader/feature contracts; preserve original CLI defaults when no explicit manifest is supplied. Separate augmentation background datasets (AudioSet/CHiME/FMA/MIT where used) from classifier negatives in labels and config, rather than treating every existing downloader as equivalent. Add per-dataset installation support without downloading the whole catalog. Use pinned installed fingerprints for run snapshots.
- [ ] Rerun dataset and existing `test_openwakeword_stage.py`, `test_wham_removal.py`; expect passing. Assert legacy unused WHAM data is not reintroduced.
- [ ] Commit: `feat: add scalable dataset catalog and explicit training selection`.

### Task 7: Generation recipes and reusable synthetic batches

**Files:** Create `studio/generation.py`, `tests/test_studio_generation.py`; modify `cli/wake_word_sample_generator`, `cli/tts_generate_samples.py` only for explicit output/work isolation if necessary; extend API/models/schema.

**Interfaces:** `GenerationService.save_recipe(word_id: str, recipe: GenerationRecipe) -> GenerationRecipe`, `enqueue(word_id: str) -> Job`, `execute(job: Job) -> Batch`, `select_batches(word_id: str, batch_ids: list[str]) -> None`. Recipe fields: `language`, `english_accent`, `tts_mode` (`hybrid|modern|piper`), positive integer `samples`, positive integer `batch_size`; validate against existing `tts_config.py`. Batch stores phrase/recipe snapshot, content refs/families, status and timestamps.

- [ ] Write failing tests for supported language routing, invalid language/mode combinations, English accent gating, immutable phrase/recipe snapshots, incomplete generator output not ready, and two workspaces not sharing `work/wake_word_samples`. Assert requested count maps to `--samples`, `--tts-voice-count` is not exposed, a queued recipe edit cannot mutate the admitted job's recipe, and generation/training share one GPU lock.
- [ ] Run `python -m unittest discover -s tests -p 'test_studio_generation.py' -v`; expect failure.
- [ ] Implement batch jobs using Task 5 queue and isolated job roots; invoke existing generator through argument arrays (never concatenate the phrase into shell code), verify all WAVs and count, register immutable blobs with family IDs, mark completed only after atomic metadata commit. Add recipe/catalog/batch selection routes. Reuse `tts_config.py` engines/catalog; do not build new engine-generated pronunciation preview in this scope.
- [ ] Run generation tests plus `test_tts_config.py` and `test_modern_tts.py`; expect passing without downloading models.
- [ ] Commit: `feat: generate and select isolated synthetic audio batches`.

### Task 8: Snapshot-based isolated training and immutable model archives

**Files:** Create `studio/training.py`, `studio/legacy_training.py`, `tests/test_studio_training.py`, `tests/test_studio_training_cli.py`; modify `train_wake_word`, `cli/wake_word_sample_augmenter`, `cli/wake_word_sample_trainer`, `openwakeword_stage.py`, and narrowly extract needed preparation helpers from `trainer_server.py`.

**Interfaces:** `TrainingService.enqueue(word_id: str, trigger: Literal['manual','scheduled']) -> Job`, `snapshot(word_id: str, run_id: str) -> RunManifest`, `execute(job: Job) -> ModelVersion | None` (None for unchanged scheduled inputs); `TrainingAdapter.run(manifest: RunManifest, run_root: Path, on_log: Callable[[str], None], cancel: Event) -> TrainingResult`. Manifest includes word/config, immutable labeled audio refs/revisions, family/split mapping, selected batches/datasets and fingerprints. Result includes expected artifact paths, checksums, metrics and validation state.

- [ ] Write failing tests for two workspace runs, only positive/negative admitted, skipped/unmapped/discarded excluded, selected batches not regenerated, snapshot taken on job start, label changes applied next run, stale input fingerprint skip only for scheduled jobs, and cancellation preserving prior versions. Assert visible deletion/relabel cannot change a completed manifest; identical/derived audio families have one stable split. Assert failed or missing outputs cannot create a publishable version, and GPU worker crash cannot expose a partial archive.
- [ ] Run both training test files; expect failure.
- [ ] Implement explicit `--input-manifest=<path>` mode in `train_wake_word` while keeping old no-manifest CLI semantics. Manifest mode stages selected blobs into a unique run root, bypasses TTS generation, uses explicit dataset inputs, invokes existing augmentation/training/environment setup, and adapts MWW/OWW inputs consistently. Do not mutate `DATA_DIR` globals to switch jobs. Assign stable evaluation families before augmentation; derived variants inherit the source split. Persist shared seed and split mapping for new families, with content hashes preventing identical imports on opposite sides. Keep required train/eval counts validation clear, including useful errors when no usable positive input exists.
- [ ] Validate artifact manifests, model files, output names, stable model IDs and available metrics; archive under `studio/models/<word_id>/<version_id>/` with UTC trained timestamp and run ID. Commit atomically; retain successful version even if deployment later fails. Run new tests plus `test_training_environment.py`, `test_unicode_shell_wiring.py`, `test_openwakeword_stage.py`, `test_calibrate_detector.py`; expect passing using stub runners.
- [ ] Commit: `feat: train immutable workspace snapshots and archive every model version`.

### Task 9: Leader-only fleet publication, retries, and rollback

**Files:** Create `studio/deployment.py`, `tests/test_studio_deployment.py`; extend kiosk adapter/models/schema/API; modify runtime job completion hook.

**Interfaces:** `DeploymentService.publish(version_id: str) -> list[Publication]`, `retry_due(now: datetime) -> list[Publication]`, `rollback(word_id: str, version_id: str) -> list[Publication]`, `status(word_id: str) -> list[Publication]`. `desired_version` per word/target is authoritative; operations claim desired-version revision before network mutation and recheck under a per-target publication lock. `CommitResult` includes actual accepted and rejected files/models.

- [ ] Write failing tests: every successful version targets leader+standalones only; raw file uploads followed by commit reject HTTP-200/domain failures; unrelated direct-target models preserved; stable MWW manifest references valid uploaded file basename; both selected slots unchanged; inactive model remains inactive; offline retry succeeds; stale retry after rollback does not upload old desired bytes; role change to follower blocks a pending upload. Validate expected hashes match the custom-model remote manifest; profile-ineligible followers are `not_covered`, not successful.
- [ ] Run `python -m unittest discover -s tests -p 'test_studio_deployment.py' -v`; expect failure.
- [ ] Implement upload/commit and per-target serialization, bounded retries with exponential backoff, desired-version revision checks and atomic rollback intent updates. Resolve precise valid filenames and upload validation requirements from sibling `custom_wake_models.dart`; do not assume the archive file layout is accepted unchanged. Reuse stable names so updates replace the same kiosk model. Publish automatically only after Task 8 successful archive creation, expose version/history/status/publish/rollback routes, and observe fleet content via permitted manifests when credentials exist. Without observation, show leader-published/follower-unverified rather than inference success. Never call selection-setting or custom-model-delete commands. User-authorized exception (2026-10-18): call `clearWakeWordModels` after verified updated files to refresh running inference; it clears downloaded-model caches only and may re-download other selected remote models. Followers receive no uploads, but can receive this authenticated refresh after their synced hashes match; missing credentials/offline/sync lag remain pending.
- [ ] Rerun deployment/device tests. Add an opt-in live-device contract test guarded by `STUDIO_TEST_KIOSK_URL` and `STUDIO_TEST_KIOSK_TOKEN`, with explicit separate mutation opt-in and user-provided disposable model; compare two-slot settings before/after and verify the user-authorized cache refresh loads selected stable-ID model bytes through available runtime evidence. Default tests must never contact LAN devices. Do not claim active-version inference merely from upload/hash/refresh acknowledgement; expose refresh-pending and unverified runtime states explicitly.
- [ ] Commit: `feat: publish archived models safely through fleet leaders with rollback`.

## Stage 3 — Compact production UI and migration

### Task 10: Compact Vue shell, workspace selection, and frontend tests

**Files:** Create `frontend/src/studio/{api.ts,types.ts,workspace.ts,routes.ts,studio.css}`, `components/StudioShell.vue`, `pages/WakewordsPage.vue`, `__tests__/workspace.test.ts`, `frontend/vitest.config.ts`; modify `frontend/{package.json,package-lock.json,vite.config.ts,tsconfig.json}`, `frontend/src/{TrainerApp.vue,main.ts}`.

**Interfaces:** typed `studioApi` for Task 1–9 routes; `useWorkspace()` provides `wakewords`, `selectedId`, `load()`, `select(id: string)` and `refreshSelected()`. Minimal hash-based page registry uses exactly the eight agreed page names, preserving direct links and selected word ID; no external router required. Add pinned Tailwind/Vite integration, Vitest, jsdom, Vue Test Utils and `test` script.

- [ ] Write failing component tests: sidebar has Wakewords, Data subsections, Train and Deploy; selection persists navigation/reload and fallback handles a deleted/unknown word ID; changing words aborts stale fetches so previous data never appears under the new phrase. Keyboard focus and narrow-screen navigation remain usable. Wakewords form preserves stable model ID on display-phrase edits.
- [ ] Run `npm --prefix frontend test -- --run src/studio/__tests__/workspace.test.ts`; expect failure before components exist.
- [ ] Implement shell matching approved compact preview: approximately 204px desktop sidebar, 24–26px content padding, 16px card padding, 12–16px gaps, restrained status badges. Use Tailwind utilities/tokens, no external font/CDN requirement; responsive collapsing navigation, proper labels/focus styles. Load real workspace counts and forms; real empty/error/loading states, no illustrative metrics or fake controls. Keep old store only for untouched legacy features until replacement is wired; no giant new monolithic store.
- [ ] Run focused UI tests, `npm --prefix frontend run typecheck`, and `npm --prefix frontend run build`; expect passing and existing offline entry filenames unchanged.
- [ ] Commit: `feat: introduce compact multi-wakeword Vue studio shell`.

### Task 11: Keyboard-first review and searchable sample library

**Files:** Create `components/{AudioPlayer,PaginatedTable}.vue`, `pages/{Classify,Samples}Page.vue`, `__tests__/{classify,samples}.test.ts`; reuse/adapt `frontend/src/components/AudioTrimModal.vue` without singleton paths.

**Interfaces:** `AudioPlayer` receives `sampleId`, authorized same-origin `src` and `autoplayRequested`, emits `ready`, `ended`, `playbackError`; exposes `play`, `pause`, `replay`, `stop`. Classification client uses label revisions and receives server-acknowledged mutations from Task 2; queue state is keyed by word+filters. Paginated library filters source/date/label/kind.

- [ ] Write failing tests for P/N/Space/R/S/Z, focus/modifier suppression, first-gesture autoplay gating, play rejection, next playback only after successful label ACK, double-key prevention, failed-save recovery, undo after navigation and stale audio fetch completion. Assert switching words stops old audio and revokes blob URLs; sample relabel/import/trim/delete use the active workspace and server revisions. Keyboard actions must not fire through an open modal.
- [ ] Run `npm --prefix frontend test -- --run src/studio/__tests__/classify.test.ts src/studio/__tests__/samples.test.ts`; expect failure.
- [ ] Implement compact real-audio player/waveform and visible shortcut legend, filters, progress, skip-for-session, discard confirmation, server-backed undo. Keep unmapped recordings accessible with explicit assignment; a skipped recording is not removed globally. Integrate paginated sample actions and non-destructive trims; announce save/playback errors accessibly.
- [ ] Rerun tests and typecheck; expect passing, with tests explicitly resolving out-of-order requests and rejecting `audio.play()` promises.
- [ ] Commit: `feat: add rapid manual classification and provenance-aware sample browser`.

### Task 12: Shared devices, cron controls, scraping, and deployment UI

**Files:** Create `components/{DeviceRegistry,CronEditor}.vue`, `pages/{Scrape,Deploy}Page.vue`, `__tests__/{devices,scrape,deploy,cron}.test.ts`.

**Interfaces:** `DeviceRegistry` uses one shared registry cache, emits `changed`, displays role/parent/credential/model-sync state; neither page maintains its own device list. `CronEditor` receives `scope` and server `Schedule`, emits saved schedule after server validation; display timezone and server-computed next run, never a browser-local guess.

- [ ] Write failing tests for leader added from either page appearing on both with discovered `Follower` badges; follower credentials entry never displaying stored secrets; follower rows have no direct deploy action; non-syncing profiles/offline/unverified states not green success. Assert shared scrape cron versus word-specific training cron is explicit. Rollback requires confirmation, keeps archive entries, and shows desired versus observed version correctly.
- [ ] Run the four focused Vitest files; expect failure.
- [ ] Implement device add/auth/refresh and error flows, globally scoped scrape schedule/history/manual action and mapping inbox. Deploy shows dated archive, metrics where available, per-device or indirect follower delivery states, retry errors and rollback. Fleet setup prominently explains authoritative mirroring and existing selection propagation. Do not expose fleet profile editing, model-enable controls, or direct follower uploads.
- [ ] Rerun tests and typecheck; expect passing including one failed device while other scrape outcomes remain visible.
- [ ] Commit: `feat: add shared fleet setup cron scraping and model history UI`.

### Task 13: Dataset, Artificial, and Train pages with live job status

**Files:** Create `components/JobConsole.vue`, `pages/{NegativeDatasets,Artificial,Train}Page.vue`, `__tests__/{datasets,artificial,train}.test.ts`.

**Interfaces:** pages use Tasks 5–8 endpoints; `JobConsole(jobId: string)` reads bounded log tails and actual job state, cleans polling/subscriptions on navigation. Artificial uses saved `GenerationRecipe` and completed batch selections; Train displays effective input counts plus explicit optional OWW output and validated training parameters supported by existing CLI.

- [ ] Write failing tests for catalog search/filter/pagination with 200 entries; per-word dataset selection; generated language/mode capabilities including accent disabled for Piper/non-English; immutable phrase from workspace; count/batch size validation; incomplete batch not selectable. Assert changing words doesn't retain the previous recipe, queued/canceled/failed job states are real, scheduled unchanged skips are visible, and unreviewed counts are never described as training inputs.
- [ ] Run the three focused Vitest files; expect failure.
- [ ] Implement compact catalog table with install/progress/license/source; generation recipe form using real catalog/modes and batch history; training input summary, manual start/cancel, cron settings, version/run history and logs. Omit unsupported pronunciation preview; retain real legacy trimming/log behavior through typed adapters. Use no fixed mockup dataset names or counts. Distinguish augmentation backgrounds from negative classifier datasets.
- [ ] Run all frontend tests, typecheck and build; expect passing and no disabled fake feature controls presented as functional.
- [ ] Commit: `feat: connect dataset generation and training pages to real jobs`.

### Task 14: Explicit legacy migration and disable competing background loops

**Files:** Create `studio/migration.py`, `tests/test_studio_migration.py`; modify `trainer_server.py`, `frontend/src/studio/pages/WakewordsPage.vue`, `frontend/src/studio/__tests__/migration.test.ts`, relevant legacy tests only where behavior intentionally changes.

**Interfaces:** `MigrationService.inspect() -> LegacyInventory`, `import_into(word_id: str, selection: LegacyImportSelection) -> MigrationReport`. API `GET /migration` and `POST /migration/import`; inventory returns counts/known model identity, never secrets. Import keyed by inventory fingerprint + word ID is idempotent and requires explicit assignment of unknown phrases.

- [ ] Write failing tests: startup leaves old personal/negative/captured/model files untouched; import requires chosen workspace; duplicate import creates no duplicate recordings; backups/inventory exist; unknown model identity requires assignment; old active jobs block conflicting import. After restart, legacy auto-STT and Tater notification cannot consume studio samples or publish studio models. Existing legacy tests still pass in explicit isolated legacy mode.
- [ ] Run migration unittest/Vitest files; expect failure.
- [ ] Implement inspect/import with originals preserved and durable backup metadata, source labels/provenance and legacy archive registration. Add first-run import flow. Default new studio installations do not start old auto-review/notification workers; define explicit `TRAINER_LEGACY_MODE=1` for isolated existing behavior if retained. Do not silently multiplex legacy singleton endpoints onto whichever word a browser has selected. Disable incompatible old UI/API actions clearly in studio mode.
- [ ] Rerun migration tests and all existing auto-training/session-stop tests in their explicit mode; expect no studio/legacy cross-talk.
- [ ] Commit: `feat: add non-destructive legacy import and isolate old automation`.

### Task 15: Docker packaging, browser workflow, documentation, and release verification

**Files:** Modify `dockerfile`, `dockerfile.blackwell`, `run.sh`, `README.md`, `tests/test_vue_ui.py`, `tests/test_run_sh.py`; create `frontend/playwright.config.ts`, `frontend/e2e/studio.spec.ts`, `tests/test_studio_workflow.py`, update `static/ui` via build and frontend lockfile for Playwright. Add installation/validation instructions for server-test dependencies using the existing server environment, not a heavyweight CUDA install.

**Interfaces:** both images copy `studio/` including SQL/JSON resources and retain port 8789. Playwright uses an isolated temporary data root and fixture HTTP kiosk servers, never the user's devices. E2E server injects a stub GPU command adapter only under an explicit test harness; production startup cannot accidentally activate demo mode.

- [ ] Write failing packaging/workflow tests: add leader → discover followers → provide credentials → scrape twice → classify → select dataset/batch → scheduled stub training → immutable archive → leader upload → rollback; assert zero direct follower uploads and unchanged direct-target selections. Browser test exercises real shortcuts and field-focus suppression, workspace isolation, compact responsive navigation, empty/error states, and a 200-row catalog via pagination. Verify container copy rules include `schema.sql` and `dataset_catalog.json`.
- [ ] Run new workflow tests and `npm --prefix frontend exec -- playwright test` from the configured frontend working directory (use `workdir=frontend` and `npx playwright test` when invoking shell); expect failure before final wiring.
- [ ] Update packaging and README: volume layout, explicit migration, LAN/admin-token setup, one leader versus standalone, follower credentials, rolling retention limits, cron timezone/missed tick behavior, TTS/dataset modes, archive rollback, existing fleet selection authority, live-device opt-in test caveats, and trusted-LAN security boundary. Generate committed offline assets with `npm --prefix frontend run build`; adjust old UI source-structure tests to assert new functional contracts rather than remove coverage. Do not change release VERSION or publish images without user request.
- [ ] Run `python -m unittest discover -s tests -v` in the existing documented server/test environment; `npm --prefix frontend test -- --run`; `npm --prefix frontend run typecheck`; `npm --prefix frontend run build`; `npx playwright test` with `workdir=frontend`; `bash -n run.sh train_wake_word cli/setup_negative_datasets cli/wake_word_sample_generator cli/wake_word_sample_trainer`; `git diff --check`. Expect all passing. Build both Docker variants if resources/network permit; report skipped CUDA training/live-device/container checks explicitly, not as successful verification. Use fresh outputs for final claims.
- [ ] Commit only implementation assets/docs/tests: `feat: package and verify kiosk wakeword studio workflow`. Request a whole-branch review and resolve blocking findings before offering integration options; do not merge/push automatically.

## Plan self-review

- [x] Every design section maps to a task: workspaces/storage 1–2; discovery/collection 3–4; cron/queue 5; datasets/generation 6–7; isolated inputs/evaluation/archive 8; publishing/fleet authority/rollback 9; compact pages 10–13; migration/legacy isolation 14; Docker/offline bundle/docs/end-to-end 15.
- [x] Review Focus cases appear in the owning task's test steps.
- [x] UI depends on stable `/api/studio` service contracts; opaque IDs, record names, queue resources, and role semantics are consistent.
- [x] No satellite changes, automatic selection edits, direct follower uploads, silent legacy assignment, or fake production controls are planned.
- [x] Live selected-model refresh and OWW data representation are verification gates, not assumed capabilities.
- [ ] User reviews plan and chooses execution method before implementation.
