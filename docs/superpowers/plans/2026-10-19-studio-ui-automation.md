# Studio UI and Workspace Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the approved Studio navigation, workspace-scoped automation and manual collection, usable Artificial defaults/Piper states, and persistent light/dark mode.

**Architecture:** Extend the existing SQLite services and durable queue rather than introducing another scheduler. A workspace automation service owns policy/settings and durable follow-up dispatch; collection, classification and deployment retain separate handlers. Vue pages use typed APIs and stable workspace IDs, with a small isolated theme controller.

**Tech Stack:** Python, FastAPI/Pydantic, SQLite, croniter/zoneinfo; Vue 3, TypeScript, Tailwind CSS, Vitest and Playwright.

**Spec:** `docs/superpowers/specs/2026-10-19-studio-ui-automation-design.md`

## Global Constraints

- Preserve unrelated uncommitted kiosk password-login work; never reset or overwrite it.
- No new dependencies, router framework, installer UI, live GPU training, remote kiosk publication, Docker restart, commit of unrelated changes, or visual-preview code in the production bundle.
- Defaults for unsaved generation recipes: **50,000 total samples**, **100 batch size**. Preview remains **1/1**; preserve saved values.
- All new automation switches default off. Preserve existing workspace training schedules. Deploy-after-training defaults off for existing and new workspaces.
- Sidebar order: Wakewords, Kiosks, Negative Datasets, Artificial, Classify, Samples, Train, Deploy, Automate. No Kiosks tabs or standalone Scrape page.
- No Wakeword-specific banner or Wakewords to collect list; header selection chooses the workspace whose settings are being edited.
- Manual Collect bypasses schedule enablement, never workspace isolation or kiosk safety checks.
- Preserve optimistic revisions, immutable training archives, tombstones, child ownership, pinned kiosk identities and publication staging/quarantine safety.
- Existing desired publications/retries survive policy changes. Do not replay historical archives on upgrade.
- Use existing five-field cron/timezone behavior; never perform network/model work inside SQL transactions.

## Review Focus

1. Switching workspaces while load/save/Collect is in flight must not leak settings, labels or success notices into the new workspace (Tasks 2, 6, 7).
2. A mapping changes while audio downloads: a scoped run must not import into another workspace or permanently suppress that clip (Task 2).
3. A crash after training/collection commit but before follow-up dispatch must neither lose authorized work nor replay it twice, including rollback and simultaneous deployment triggers (Tasks 3, 4).
4. Upgrade with old global scrape schedules and historic unconsumed publication events must not silently keep fleet collection or republish old models (Tasks 1, 4).
5. Denied browser storage, live OS theme changes, no selected workspace, missing voices, and narrow-screen menus must remain usable without unwanted work (Tasks 5–8).

## Workspace and baseline

Before implementation use `using-git-worktrees` to decide isolation safely. A worktree created from HEAD does **not** include the user's uncommitted password-login changes; do not silently test against a version that omits them. If isolation cannot include those dependencies without touching user work, obtain agreement for inline execution in the current workspace. Do not stash, reset or commit their work. Stage only task-owned hunks if commits are requested; plan commit steps never authorize including pre-existing changes.

Record the starting `git status --short` and run baseline tests before changing production code. Python tests use `/tmp/opencode/wakeword-studio-venv/bin/python` if available; otherwise use the project's already prepared environment, never install packages implicitly. All shell commands below run from the repo root unless a frontend directory is specified.

## File map

- New `studio/schema_automation.sql`, `studio/automation.py`: settings migration, typed policy, durable trigger/outcome records and follow-up dispatch.
- New `studio/classification.py`, `studio/speech.py`, `cli/studio_classify.py`: revision-aware automatic review and queue-owned STT subprocess, without legacy global mutations.
- Existing `studio/models.py`, `db.py`, `jobs.py`, `schedules.py`, `runtime.py`, `api.py`, `workspace_deletion.py`: public records, migration wiring, handler/scope registration, typed endpoints, cleanup.
- Existing `studio/collection.py`: optional workspace filter and preserved shared Unmapped discovery.
- Existing `studio/deployment.py`: gated archive discovery and rollback-safe automatic high-water marks, retaining publication safety.
- Existing `studio/training.py`: configurable skip-unchanged behavior for scheduled runs.
- Existing `studio/generation.py`, `tts_config.py`: catalog availability metadata and shared generation defaults.
- New `frontend/src/studio/pages/KiosksPage.vue`, `AutomatePage.vue`; new focused collection/source-mapping components used by Classify.
- Existing frontend `routes.ts`, `components/StudioShell.vue`, page files, `types.ts`, `api.ts`, `workspace.ts`, `studio.css`: approved navigation, state, layout and API integration.
- New `frontend/src/studio/theme.ts`, `components/ThemeToggle.vue`, and `static/studio-theme.js`; existing `static/index.html`: early theme initialization and controls. Vite builds a library from `frontend/src/main.ts`, not an HTML entry, so the initializer belongs outside the build-cleared `static/ui` directory.
- Existing and new Python/Vitest/Playwright tests listed per task; generated `static/ui/trainer-ui.js` and `.css` only through the established build.

## Contract shared by tasks

Add these records in `studio/models.py` and matching TypeScript interfaces:

- `AutomationSchedule`: `enabled: bool`, `cron: str`, `timezone: str`.
- `ClassificationPolicy`: `enabled: bool`, `trigger: Literal['after_collection','schedule']`, `engine: Literal['faster_whisper','parakeet_onnx']`, `auto_negatives: bool`, `promote_close_misses: bool`.
- `DeploymentPolicy`: `after_training: bool` (scheduled deployment enablement lives in its schedule).
- `AutomationSettings`: `collection: AutomationSchedule`, `classification: ClassificationPolicy`, `classification_schedule: AutomationSchedule`, `training: AutomationSchedule`, `skip_unchanged: bool`, `deployment: AutomationSchedule`, `deployment_policy: DeploymentPolicy`.
- `AutomationStatus`: `settings: AutomationSettings`, `schedules: list[Schedule]`, `last_jobs: dict[str, Job | None]` (keys `scrape`, `classify`, `train`, `deploy`).

`AutomationService.get(word_id: str) -> AutomationStatus`, `save(word_id: str, settings: AutomationSettings) -> AutomationStatus`, `reconcile() -> None`, `handle_deploy(job: Job, context: JobContext) -> dict`.

Defaults: collection `*/30 * * * *`, classification `0 * * * *`, training `0 2 * * *`, deployment `0 4 * * *`, all UTC/off except preserved existing training schedule; classification trigger `after_collection`, engine `faster_whisper`, auto_negatives true, promote_close_misses false; skip_unchanged true; after_training false.

Scopes: `scrape:{word_id}`, `classify:{word_id}`, `train:{word_id}`, `deploy:{word_id}`. Jobs use existing resources: scrape/deploy `collection`, classify/train/generation/preview `gpu`, download `download`. Generic job requests cannot inject executable commands, arbitrary audio paths, transcripts or policy overrides; handlers resolve authoritative settings and records server-side.

### Task 1: Persist workspace policy and migrate existing schedules safely

**Files:** Create `studio/schema_automation.sql`, `studio/automation.py`, `tests/test_studio_automation.py`; modify `studio/db.py`, `models.py`, `schedules.py`, `workspace_deletion.py`, `tests/test_studio_schedules.py`, `tests/test_studio_workspace_deletion.py`.

**Interfaces:** Produce the records and `AutomationService.get/save` above. Save all four schedules/policy atomically, returning canonical status. Reuse a transaction-aware schedule validation/upsert helper instead of nesting `Store.transaction()`.

- [ ] Write failing `test_new_workspace_automation_defaults`, asserting the exact defaults above, no schedule enabled, no settings created for an unknown ID, and `NotFound` for unknown get/save.
- [ ] Write `test_settings_roundtrip_isolated_and_strict`: save two workspaces with different engines/timezones, reopen Store, assert isolation; reject unknown engines/triggers, non-bools, malformed cron/timezone and unknown keys with unchanged old settings. Scheduled classification is effective only when the policy is enabled and trigger is `schedule`.
- [ ] Write `test_upgrade_preserves_training_disables_global_scrape`: build a version-12 database with active train/global scrape schedules and queued global scheduled work, migrate, assert training preserved, old scrape/history retained disabled, workspace scrape schedules copied disabled, queued old scheduled jobs retained cancelled. No manual job is cancelled; upgrade assumes old runtime stopped.
- [ ] Write `test_delete_removes_only_target_automation`: settings/events/results/schedules of deleted workspace disappear; another workspace and shared Unmapped/history survive. Active new workspace jobs still block deletion.
- [ ] Run `python -m pytest tests/test_studio_automation.py tests/test_studio_schedules.py tests/test_studio_workspace_deletion.py -q`; confirm new tests fail for missing behavior.
- [ ] Implement schema version 13 and typed validation/settings. Keep existing schemas immutable; add bounded sanitized event/status storage. Defaults from existing training schedules override new off defaults. Reopening version 13 must not reset saved policies.
- [ ] Extend `ScheduleService.save/tick` to map the four scopes to job kinds/workspace IDs and retain existing occurrence coalescing/DST behavior. Retired bare `scrape` cannot be re-enabled through settings API; compatibility history stays readable. Register new kinds in Task 3 before starting workers.
- [ ] Run the targeted command again; require all tests pass, including existing cron tests. Commit only task-owned changes if commits are part of the approved execution method.

### Task 2: Workspace-filtered, asynchronous manual collection

**Files:** Modify `studio/collection.py`, `runtime.py`, `api.py`, `models.py`, `tests/test_studio_collection.py`; create `tests/test_studio_scoped_collection.py`.

**Interfaces:** Extend `CollectionService.run(device_ids: list[str] | None = None, *, word_id: str | None = None) -> CollectionRun`; existing `None` remains explicit legacy fleet behavior. Add `POST /api/studio/wakewords/{word_id}/collection/jobs -> Job` (201), body optional `device_ids`; enqueue `scrape` with that word ID. Existing fleet history endpoints remain readable.

- [ ] Write `test_workspace_collection_skips_other_mappings_before_download`: fixture kiosk lists clips mapped A, B and unknown; A run downloads A/unknown only, imports A pending and unknown shared, leaves B with no attempts/tombstones, and later B run can import B.
- [ ] Write `test_mapping_change_during_download_never_cross_imports`: change A mapping to B in the transport seam, assert no B sample from the A run and no permanent suppression; B may collect subsequently.
- [ ] Write `test_manual_collect_queues_when_automatic_off`: API returns 201/queued before fixture audio is fetched; worker imports A and not B even with A schedule off. No word gives validation error on scoped endpoint. Existing explicit fleet API retains compatibility.
- [ ] Write tests preserving existing tombstones, duplicate identity handling, quarantined conflicts, credential/identity errors and cancellation checks between clips. A partially successful run reports successful imports without claiming fleet-wide success.
- [ ] Run `python -m pytest tests/test_studio_scoped_collection.py tests/test_studio_collection.py -q`; confirm new failures.
- [ ] Implement mapping filter before fetching audio and recheck under the ingest admission transaction. Preserve shared unknown-source discovery without guessing selected-word ownership. Scoped jobs validate the workspace at execution and use queue cancellation checks; scheduled disabled jobs finish with `{'skipped': True, 'reason': 'disabled'}` while manual ones run.
- [ ] Implement the endpoint and runtime handler result `{'run_id': str, 'status': str, 'new': int}`; keep credentials/raw remote strings out of results. Do not accept a browser-supplied settings snapshot.
- [ ] Rerun targeted tests plus `tests/test_studio_devices.py` and `tests/test_studio_login.py`; require pass. Commit only task-owned changes if approved.

### Task 3: Conservative queued classification and durable collection follow-ups

**Files:** Create `studio/speech.py`, `studio/classification.py`, `cli/studio_classify.py`, `tests/test_studio_classification.py`, `tests/test_studio_speech.py`; modify `studio/automation.py`, `jobs.py`, `runtime.py`, `samples.py`, `workspace_deletion.py`, `tests/studio_harness.py`.

**Interfaces:** `SpeechTranscriber(cache_dir: Path).transcribe(audio_path: Path, *, engine: str, language: str, phrase: str) -> dict`; returned dict contains bounded `transcript`, optional `guided_transcript`, `engine`, `model`. `ClassificationService.handle(job: Job, context: JobContext) -> dict` returns counts only. CLI accepts `--input-manifest=<owned path>` and `--output-json=<owned path>`; no arbitrary shell execution. `AutomationService.reconcile()` creates deduped classification jobs for completed scoped collection jobs with `new > 0` under enabled after-collection policy.

- [ ] Write policy table tests for both engines: clear non-phrase activation -> negative when enabled; confirmed ordinary wake -> pending; empty/too-short/ambiguous -> pending; near misses never -> negative; optional confirmed close miss -> positive; VAD-blocked/quarantined/unmapped/other-workspace/non-diagnostic -> untouched.
- [ ] Pin upstream matching/model behavior in `test_studio_speech.py`: Unicode/token boundaries, minimum transcript chars 2, `WAKE_PHRASE_GUIDANCE_MIN_SIMILARITY = 0.68`, Whisper English `small.en`/other `small`, Parakeet `nemo-parakeet-tdt-0.6b-v3` from `istupakov/parakeet-tdt-0.6b-v3-onnx` with INT8 quantization and CUDA/CPU fallback; near matches get guided Whisper confirmation, not automatic negatives. Stub all model libraries/downloads.
- [ ] Write `test_manual_revision_wins`, `test_undo_not_immediately_reclassified`, `test_new_audio_or_policy_can_be_reconsidered` and cancellation tests. Assert exactly one automatic label transition for unchanged revision/settings across restart; no raw transcript in public job result/logs.
- [ ] Write `test_collection_followup_recovers_commit_callback_gap`: completed/partial-success collection with imported mapped audio dispatches once after restart; no new mapped samples, disabled policy, schedule-mode policy or cancelled job dispatches none.
- [ ] Write `test_classify_owns_gpu_and_child_lifetime`: queued classification cannot overlap training/generation and cancellation retains ownership until child exit. Update stub runner to recognize the new CLI before falling through to its training branch.
- [ ] Run `python -m pytest tests/test_studio_classification.py tests/test_studio_speech.py tests/test_studio_jobs.py -q`; confirm new failures.
- [ ] Implement lazy STT loading and upstream algorithms in a dependency-isolated module (do not import `trainer_server` into the child or mutate its global legacy state). Use `JobContext.run` and private owned job files, validate subprocess JSON bounds before revision-checked label admission, and retain processing provenance keyed by sample/audio/config. Refactor shared matching constants only if legacy tests remain compatible.
- [ ] Register `classify` on GPU and `deploy` on collection resources, update scheduler scope dispatch, recheck enabled policies at claim, and persist follow-up processing atomically with dedupe job insertion. Reconcile durable completed jobs rather than relying solely on completion hooks. Drain scheduled pending backlog in bounded batches and check cancellation between samples.
- [ ] Rerun targeted tests, `tests/test_auto_train.py` and `tests/test_studio_samples.py`; require pass without GPU/network. Commit only task-owned changes if approved.

### Task 4: Decouple training from publication and add scheduled deployment

**Files:** Modify `studio/deployment.py`, `automation.py`, `runtime.py`, `training.py`, `workspace_deletion.py`, `tests/test_studio_deployment.py`, `tests/test_studio_training.py`, `tests/test_studio_workflow.py`; create `tests/test_studio_automation_deployment.py`.

**Interfaces:** `AutomationService.handle_deploy(job, context) -> dict` resolves the latest eligible version server-side and calls existing publication safety paths. Automation event keys distinguish scheduled occurrences and training versions but dedupe the resulting version intent. `DeploymentService` exposes a transaction-aware policy gate for `_reconcile`, preserving explicit `publish/rollback` behavior.

- [ ] Write `test_training_archives_without_publication_by_default` for both manual and scheduled success; archives survive and no automatic intent is created. Existing explicit publish/rollback tests keep working.
- [ ] Write `test_after_training_opt_in_only_successful_new_versions`: enabled setting publishes once; failed/cancelled/skipped/interrupted/imported-legacy runs do not. Policy disabled before finish prevents dispatch. Restart after committed archive recovers once, never old baselined archives.
- [ ] Write `test_scheduled_deployment_independent_of_training`: with training off and schedule on, latest eligible archive is evaluated once; later ticks without newer archive skip. After-training off does not prevent scheduled or explicit publication.
- [ ] Write `test_rollback_survives_automatic_reconcile_and_tick` and `test_both_triggers_one_intent`: archive insertion order/high-water mark survives restart; rollback marks all then-existing archives processed; a genuinely new archive may publish; concurrent triggers do not churn revisions or undo rollback.
- [ ] Write `test_upgrade_retains_authorized_delivery_not_historical_events`: desired version/retry state persists, old unconsumed archives are baselined, legacy imports excluded. Disabling automation does not revoke an existing explicit delivery retry.
- [ ] Write `test_skip_unchanged_setting_only_affects_scheduled_training`: default preserves current behavior; disabling it runs scheduled unchanged inputs; manual training still executes.
- [ ] Run `python -m pytest tests/test_studio_automation_deployment.py tests/test_studio_deployment.py tests/test_studio_training.py -q`; confirm new failures.
- [ ] Replace unconditional archive-to-intent discovery with the policy/event gate. Keep processing and watermarks transactional and event registration durable across callback gaps. Scheduled deploy and after-training share existing archive validation, exclusive-staging, target enrollment and retry paths; no network under settings transactions and no direct follower uploads.
- [ ] Rerun targeted tests, `tests/test_studio_deployment_contract.py`, `tests/test_studio_workspace_deletion.py`, `tests/test_studio_workflow.py`; update workflow tests to explicitly opt in where automatic publication is intended. Require pass. Commit only task-owned changes if approved.

### Task 5: Restore visible Piper availability and generation defaults

**Files:** Modify `tts_config.py`, `studio/generation.py`, `frontend/src/studio/pages/ArtificialPage.vue`, `types.ts`, `tests/test_studio_generation.py`, `frontend/src/studio/__tests__/artificial.test.ts`.

**Interfaces:** Catalog entries retain current `engines` (actually runnable engines) and add `model_availability: list[{engine: str, supported: bool, available: bool, reason: str | None}]`. Add Python `DEFAULT_GENERATION_SAMPLES = 50000`, `DEFAULT_GENERATION_BATCH_SIZE = 100` and expose them through a typed `GET /generation/defaults` endpoint, consumed as the canonical UI fallback; test parity with `cli/shell.functions`. Supported-but-missing Piper never enters backend allowed engine selections.

- [ ] Write backend tests for installed English `.pt`, installed non-English `.onnx`, missing supported voice, and unsupported language; unavailable selection is rejected and viewing catalog performs no download. Derive Piper-supported languages from the repository's existing voice/language metadata rather than inventing support for every OmniVoice language.
- [ ] Write UI tests: unsaved recipe uses 50000/100 after defaults load; saved 1/1 remains 1/1; preview sends 1/1; samples shared across engines; missing supported Piper renders disabled explanatory card; installed Piper can select/preview; unsupported language explains unavailability instead of offering a usable control.
- [ ] Run `python -m pytest tests/test_studio_generation.py -q` and `npm --prefix frontend test -- --run src/studio/__tests__/artificial.test.ts`; confirm new failures.
- [ ] Implement catalog/defaults endpoints and typed client. Avoid briefly enabling Generate with placeholder 1/1 while defaults load; do not overwrite saved recipes on pagination or workspace change. Retain current engine-specific generator caps, accent rules and validation.
- [ ] Rerun targeted tests and frontend typecheck; require pass. Commit only task-owned changes if approved.

### Task 6: Typed Automate API and workspace-safe settings page

**Files:** Modify `studio/api.py`, frontend `api.ts`, `types.ts`; create `frontend/src/studio/pages/AutomatePage.vue`, `frontend/src/studio/__tests__/automate.test.ts`; extend `tests/test_studio_automation.py`.

**Interfaces:** `GET /wakewords/{word_id}/automation -> AutomationStatus`; `PUT` same path accepts exactly `AutomationSettings` with strict nested Pydantic records (extra forbidden). TS `studioApi.automation(word, signal?)` and `saveAutomation(word, settings, signal?)`. Use `CronEditor` in controlled mode or a new focused `AutomationScheduleFields.vue`; it must not save independently behind the aggregate Save button.

- [ ] Write API tests for roundtrip/defaults, 404, strict invalid nested data, atomic failed save, and sanitized failure bodies.
- [ ] Write UI tests for four cards, both STT choices, independent training/deployment switches, optional after-training, scheduled-classification fields, workspace-specific collection enable/schedule, exact naming, and absence of the two removed scope/list sections. Show actual next/last run, skipped result and error states.
- [ ] Write slow-transport tests using `fakeStudio.hold`: A load/save resolves after switching to B; B retains its own data/notice. No selection disables saving and does not call an invalid word endpoint. Failed save retains edits with actionable error; no double submission.
- [ ] Run `python -m pytest tests/test_studio_automation.py -q` and `npm --prefix frontend test -- --run src/studio/__tests__/automate.test.ts`; confirm new failures.
- [ ] Implement atomic API and AbortController/generation-token page state, cloning nested settings before mutation. Switching workspace resets dirty state and loads authoritative settings without implicitly enabling work. Saved settings return canonical status. Do not render raw transcript/config blobs or stale status from another word.
- [ ] Rerun targeted tests and `npm --prefix frontend run typecheck`; require pass. Commit only task-owned changes if approved.

### Task 7: Navigation, Kiosks, Classify collection and compact Wakewords

**Files:** Create `frontend/src/studio/pages/KiosksPage.vue`, `components/CollectionHistory.vue`, `components/SourceInbox.vue`, `__tests__/kiosks.test.ts`, `__tests__/navigation.test.ts`; modify `routes.ts`, `components/StudioShell.vue`, `DeviceRegistry.vue`, `pages/ClassifyPage.vue`, `WakewordsPage.vue`, `TrainPage.vue`, `DeployPage.vue`, `workspace.ts`, `api.ts`, `types.ts`, existing page tests and `frontend/e2e/studio.spec.ts`.

**Interfaces:** Add route IDs `kiosks`, `automate`; retired `scrape` aliases to `classify` with `tab=collect`, retaining `word`. Classify tabs use typed URL state `review|collect|unmapped` so links/history work. Add `studioApi.collect(word, device_ids?, signal?) -> Job` for Task 2; poll existing job/status endpoints rather than call synchronous fleet scrape. Group navigation by explicit metadata, not current fragile array indices.

- [ ] Write navigation tests for exact approved order/grouping, no extra Automation label, Kiosks without tabs, old hash alias and browser back/forward retaining workspace/tab. Deploy/Train links lead to Automate with same workspace.
- [ ] Write Kiosks/Deploy tests confirming one registry edit surface, preservation of password-login credential handling, target status still loaded even without the registry component mounted, and empty-fleet Manage kiosks links.
- [ ] Write Classify tests: header Collect visible on all tabs; queued/running state and duplicate-click prevention; disabled automatic collection still allows manual; no selection disables; partial/failure/cancel visible; completion refreshes queue without interrupting a newer manual review or leaking A result into B. Source mapping remains reusable, while Assign affects only one recording. Unmapped help describes shared discovery.
- [ ] Write Wakewords tests for clickable/keyboard selection, selected indicator, right language alignment, no Open/Selected buttons or persistent edit form, Actions dialog rename/language/save/error, escape/focus restoration, and existing deletion conflict/confirmation protections.
- [ ] Run `npm --prefix frontend test -- --run src/studio/__tests__`; confirm new failures against existing pages.
- [ ] Implement page/components and state lifecycle. Move collection/history/inbox behavior out of the old page without copy-pasting duplicate loaders; then retire `ScrapePage.vue` only after confirming no imports remain. Keep keyboard shortcuts paused while editing tab forms, and collection polling scoped/disposed. Move cron editing off Train to Automate while retaining status. Preserve DeviceRegistry's pre-existing user changes and secret clearing.
- [ ] Rerun all frontend unit tests/typecheck and fixture browser navigation tests; require pass. Commit only task-owned hunks if approved.

### Task 8: Persistent, scoped, accessible dark mode

**Files:** Create `frontend/src/studio/theme.ts`, `components/ThemeToggle.vue`, `__tests__/theme.test.ts`, `static/studio-theme.js`; modify `static/index.html`, `StudioShell.vue`, `studio.css`, browser tests.

**Interfaces:** `createThemeController(): { dark: Ref<boolean>; toggle(): void; dispose(): void }`; preference key `studio.theme`, values `light|dark`. Pre-paint initializer applies `document.documentElement.dataset.studioTheme`; dynamic controller uses the same key/precedence. CSS theme variables live under `.studio-app` / `html[data-studio-theme] .studio-app`; legacy descendants are explicitly excluded as existing rules require.

- [ ] Write tests for OS light/dark defaults, live OS change without override, explicit persisted choice surviving reload and ignoring later OS changes, invalid/denied storage fallback, and listener cleanup. Button has an accessible name and pressed state.
- [ ] Add a browser assertion that early initializer sets the theme before Vue mounts, plus dark/light modal, input/disabled/focus, waveform/audio, status/error and selected-card states on wide/narrow layouts. Legacy scoped trainer must not inherit new custom theme backgrounds/colors or unwanted native control color schemes.
- [ ] Run `npm --prefix frontend test -- --run src/studio/__tests__/theme.test.ts`; confirm new failures.
- [ ] Implement controller and self-contained pre-paint initializer with storage exceptions caught, loaded synchronously from `/static/studio-theme.js` before the stylesheet in `static/index.html`. Replace its existing forced-dark color-scheme metadata with adaptive Studio behavior; retain explicit legacy styling. Use CSS custom properties for existing Studio colors instead of duplicating the entire stylesheet. Scope `color-scheme` to Studio controls rather than globally altering legacy content. Retain verified-success semantics and readable focus/hover/disabled states.
- [ ] Rerun theme tests, all frontend unit tests and typecheck. Capture light/dark screenshots at 1440px and 390px against the fixture server, inspect dialogs/header/nav overflow and readability; fix regressions before marking done. Commit only task-owned changes if approved.

### Task 9: Integration, production bundle and handoff

**Files:** Modify `tests/studio_browser_server.py`, `tests/studio_harness.py`, `frontend/e2e/studio.spec.ts`, `tests/test_studio_workflow.py`, `tests/test_studio_packaging.py`, `README.md`; rebuild `static/ui/trainer-ui.js`, `static/ui/trainer-ui.css` using the established frontend build.

**Interfaces:** No new public contract. Fixtures expose deterministic per-workspace settings, scoped collection, classification result files and explicit opt-in publication; production never enables a stub by request payload.

- [ ] Add an end-to-end fixture workflow: create/select A, configure kiosk once, map A/B sources, enable only A collection/classification, collect manually from Classify, verify A pending/negative outcomes and B isolation, train with deploy-after-training off and assert archive-only, explicitly enable after-training and verify one authorized fixture publication after new training, then rollback and verify no automatic replay. Reload/switch workspaces to verify settings remain isolated.
- [ ] Add browser coverage for Automate link placement, old Scrape hash alias, current-workspace collection, saved generation values/Piper states, theme persistence and narrow-screen accessibility. No fixture test may contact non-loopback kiosks or download models.
- [ ] Run targeted new browser/integration tests before adjusting fixture implementation; record initial failures. Implement only missing fixture seams and resolve real production integration failures without weakening isolation/publication assertions.
- [ ] Run `python -m pytest tests -q`; require zero failures or identify baseline/environment blockers explicitly.
- [ ] Run `npm --prefix frontend test -- --run`, `npm --prefix frontend run typecheck`, and `npm --prefix frontend run build`; require success. Check the build includes early theme initialization and no prototype content.
- [ ] Run `npm --prefix frontend run test:e2e`; require success using the configured fixture server. Do not start a second browser test server on an occupied port or reuse a production instance.
- [ ] Update README with new navigation, workspace collection/unknown-source semantics, migration-off policies, independent training/deployment, model/runtime requirements and theme behavior. Preserve the password-login documentation already being edited.
- [ ] Review `git diff --check`, task-owned diff and final status against the recorded baseline; no credentials, UI session keys, inference transcripts or unrelated work in production output. Request an independent final code review through `requesting-code-review` before integration. Do not commit/push or operate live kiosks without the user's chosen execution/integration authorization.

## Self-review record

- Spec coverage: navigation, fleet setup, shared Unmapped, scoped manual/scheduled collection, classification, independent publication, generation/Piper, workspace actions, theme, migration and deletion each have an owning task.
- Contracts: one aggregate settings API; enabled schedules use four stable scope prefixes; deployment flags are not conflated with training; readonly status fields are not accepted on PUT.
- Failure classes: stale UI requests (6/7), mapping races (2), revision races/undo/model failures (3), callback/restart/rollback/migration (1/3/4), storage/no-selection/voices/narrow UI (5–8).
- Scope: no new dependencies, hardware operations, unrelated user changes or prototype code in shipped files. Production implementation waits for plan review and an execution-method choice.

## Execution and review results

Implemented natively on `polish-microwakeword-studio` as requested, after checkpoint `f10ca14`. All nine implementation tasks have test-backed commits. Independent source review found no critical issues; its four important findings were reproduced with failing tests and corrected in one final fix pass:

- Preserve inherited training schedules when explicit publication first initializes automation watermarks.
- Invalidate label/undo/conflict responses when the selected workspace changes.
- Refresh the shared Unmapped inbox after collection and expose an explicit inbox refresh action.
- Report actual collection outcomes and failed/imported/unmapped/evicted counts, not just queue-handler completion, with a highlighted history link.

The reviewer’s keyboard-focus minor was treated as important because an open modal allowed keyboard access to background workspace/create controls. Edit dialogs now contain Tab/Shift+Tab and restore focus on Escape; unit and browser tests cover this.

Final verification: **102 frontend tests**, **9 fixture browser tests**, typecheck, production build and whitespace checks pass. Full Python run: **426 passed, 1 skipped**, plus the single pre-existing failure `tests/test_compose.py::ComposeTests::test_resolved_service_keeps_loopback_gpu_and_existing_data_volume`; deselecting only that named test gives 426 passed / 1 skipped / 1 deselected. That unrelated deployment configuration was deliberately not repaired.

Validation uses fixture kiosks and stubbed inference/training, not real hardware/model downloads or live deployments. Generated bundles were rebuilt and exercised by the browser suite rather than manually reviewing minified output. Preview server files/access links remain untracked to avoid committing temporary session keys. Local `compose.yaml` and `.env` changes that appeared during execution are user work and are preserved outside implementation commits. No merge, push, Docker restart or live device operation was performed.
