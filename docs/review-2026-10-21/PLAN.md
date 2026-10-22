# Codebase review and cleanup plan (2026-10-21)

Branch reviewed: `polish-microwakeword-studio` @ `a11eefa`.

Scope: all of `trainer_server.py`, `studio/`, `cli/` and the root scripts, Docker/CI, `frontend/src` and the tests.
The UI was run through `tests/studio_browser_server.py` with seeded data (2 wakewords, a leader and a follower kiosk, collected clips, an artificial batch, 2 training runs and 1 queued job). Each page was captured at 1440px in light and dark themes and at 390px mobile width. Screenshots were taken locally and not committed; `screenshots/*.png` references below name the capture each finding came from.

**Ground rule:** apart from the decisions below, every item keeps current, correct Studio behavior. Bug fixes (§1) change only incorrect behavior.

## Decisions (resolved 2026-10-21)

| Topic | Decision | Where |
|---|---|---|
| Legacy mode (`TRAINER_LEGACY_MODE`, legacy UI, legacy CLI pipeline, Studio's legacy import) | **Delete** | §2 |
| `compose.yaml` | **Keep as is.** Make the README and `test_compose.py` match it | §1 B21 |
| Unused API routes | **Remove** | §3 |
| `static/ui` build output | **Stop committing.** Build it in Docker | §4 |
| Server dependency install | **Keep installing at container start** for now | §8 (deferred) |

Two questions were not asked explicitly. The defaults used:
- Studio's legacy-import routes (`/migration*`) are both legacy and unused, so they are deleted.
- The worker maintenance loop moves to a behavior-neutral 5–10 s interval (§7).

---

## 0. Current health

| Check | Result |
|---|---|
| `vitest run` | 26 files, 207 tests, all pass |
| `pytest tests` (with `DATA_DIR` set to a temp dir) | 535 pass, **2 fail**, 1 skip |
| `pytest tests` (no `DATA_DIR`) | 5 collection errors (`PermissionError: /data`), because `trainer_server` does work at import time. Deleting legacy removes the cause. |
| README test command (`unittest discover`) | Silently skips 24 pytest-style tests, which hides one of the failures |
| CI | Nothing runs tests. `docker-publish.yml` builds and pushes on tags only |

The two failures:
- **`test_studio_automation.py::test_upgrade_preserves_training_disables_global_scrape`.** The fixture fakes a v12 database but leaves the v18 `run_number` column, so migration 18 runs again. The fixture is stale; production is fine. Fixed by B20.
- **`test_compose.py`.** It asserts a loopback port bind and a named volume. Fixed by B21.

---

## 1. Bugs to fix

These are real defects in the code that stays. The four legacy-server bugs from the first draft disappear with §2: Piper download using the wrong `Request` class, path traversal in `/api/samples/revert`, `STATE` written outside its lock, and lost status lines.

### Studio

| # | Where | Bug | Fix |
|---|---|---|---|
| B1 | `frontend/src/components/AudioTrimModal.vue:221-229` | **The Samples → Trim dialog is completely unstyled.** It renders as raw text below the app (`screenshots/samples-trim-modal-unstyled.png`). Its classes (`.modal-backdrop`, `.trim-modal`, `.button`) live in `trainer.css`, which is only imported by the unreachable `LegacyTrainer.vue`, and it teleports outside `.studio-app`. The sliders start at 0–1 s with a hard-coded `max=60` and no duration or waveform, so **Save trim** pressed straight away cuts the sample to its first second. Line 11's `fetch(target.src)` result is thrown away. | Rebuild it as a `studio-modal-backdrop` + `studio-card` dialog reusing `CaptureReview.vue` (waveform, start/end, play) on the fetched blob and its decoded duration. Delete `AudioTrimModal.vue` with the legacy frontend (§2.2). |
| B2 | `frontend/src/studio/components/DeviceRegistry.vue:118`, `studio.css:131` | **The kiosk Edit form overlaps its row.** It renders inside the non-wrapping flex row, squeezes the URL and covers Delete (`screenshots/kiosks-edit-form-overlap.png`). `grid-column:1/-1` does nothing inside a flex container. | Add `flex-wrap` to the row and `basis-full` to the form. |
| B3 | `studio.css:136-147`, with `studio-status-${status}` in `JobQueueCard:37`, `AugmentationDatasets:91`, `TrainPage:78`, `ArtificialPage:192`, `NegativeDatasetsPage:75` | **Most status pills have no style.** Classes are built from the raw status (`-complete`, `-queued`, `-running`, `-available`, `-installed`, `-cancelled`), but CSS only defines `success`, `warning`, `muted`, `neutral`, `failed` and `interrupted`. So they render as bare bold 11px text, while "failed" and the kiosk badges are pills (compare `train.png` with `kiosks.png`). | One `statusTone(status)` map in `jobs.ts`, used everywhere. |
| B4 | `studio.css:90` (narrow media query) | **The mobile header stretches on short pages.** The single-column grid shares spare height between rows (`screenshots/mobile-header-stretch.png`). | Add `grid-template-rows: auto 1fr` in the `max-width: 650px` block. |
| B5 | `studio/samples.py:350` | The Samples **Import** filter also returns legacy-migrated samples, which the UI labels "Legacy". | `s.source=? AND cm.sample_id IS NULL AND mp.sample_id IS NULL` |
| B6 | `studio/storage.py:90` | **An agent sandbox path is left in production code:** `temp_root = "/tmp/opencode" if …`. | Delete it and use the default temp dir. |
| B7 | `studio/samples.py:167,213,225` | `_prepare()` runs ffmpeg (30 s timeout) **inside `BEGIN IMMEDIATE` while holding the process-wide Store lock**, which stalls HTTP, job logs and workers. | Normalize before the transaction. Keep only `blobs.put` and the inserts inside it. |
| B8 | `studio/api.py:512` | Upload compares the raw `content_type`, while the capture routes (`:519`, `:527`) strip parameters and lowercase. So `audio/webm;codecs=opus` is rejected only on upload. | One `_mime_ok(upload)` helper used by all three routes. |
| B9 | `studio/samples.py:340` and others | (Hardening) string SQL rewrite `clause.replace("r.created_at","s.created_at")`. | Pass the column into `_query`. |
| B10 | `WakewordsPage.vue:49-51` | **"Workspace saved." never shows.** `select()` fires the page's own `watch(selectedId)`, which aborts the mutation before the guard. `refreshSelected()` also runs twice. | Drop the explicit `refreshSelected()` and set `saved` before `select()`. |
| B11 | `ClassifyPage.vue:192` | **Classify shortcuts stop working after a mouse click.** A focused `<button>` counts as "editing". | Use RecordPage's rule (`RecordPage.vue:59-65`: on a focused control, suppress only Space and Enter) as one shared helper. |
| B12 | `ClassifyPage.vue:152` | Conflict detection uses `message.includes("conflict")`, but `StudioApiError` rewrites messages. | `cause instanceof StudioApiError && cause.status === 409`, as `SamplesPage.vue:47` does. |
| B13 | `ClassifyPage.vue:3` | The undo stack is a plain module array shared across workspaces, so undo in B can revert a label made in A. | A reactive `Map<wordId, stack>`. |
| B14 | `SamplesPage.vue:18` | The After/Before filters use UTC midnight while the UI shows local times. | `new Date(\`${d}T00:00\`).toISOString()` |
| B15 | `DeployPage.vue:68` | A second Publish aborts the first request on the client while the server keeps processing it. | Disable every Publish button while one is in flight. |
| B16 | `ClassifyPage.vue:226` | An unlabeled search box that filters nothing; it exists only for `e2e/studio.spec.ts:83`. | Remove it and point the e2e test at the kind `<select>`. |

### Scripts and tests

| # | Where | Bug | Fix |
|---|---|---|---|
| B17 | `cli/shell.functions:70-77` | `-q`/`-v` hit `break`, which silently drops every argument after them (verified). | Remove the `break`s. |
| B18 | `cli/setup_audioset:59-67` | `find_rev` prints every match and never returns, so the rev and the pattern can mismatch. | Add `return 0` after the first hit. |
| B19 | `cli/wake_word_sample_augmenter:118-125` | Hard-sets `TF_GPU_ALLOCATOR` and related variables, overriding the Blackwell path that unsets them. | Use `os.environ.setdefault`. |
| B20 | `tests/test_studio_automation.py:65-78` | Stale v12 fixture (see §0). | Also drop `studio_jobs_run_number` and the `run_number` column in the fake downgrade. |
| B21 | `tests/test_compose.py`, `README.md:84-92` | Both describe a loopback bind and a named volume that `compose.yaml` doesn't use (compose is kept as is). | Assert the actual `"8790:8789"` and `$DATA:/data`, and rewrite the README's Local Compose section to match (bind mount via `DATA` in `.env`; reachable on all interfaces). |
| B22 | `cli/setup_fma:30-33,140` | The fallback saves `fma_xs.zip` as `fma_small.zip`. The cache check compares the mp3 count with the wav count, so it re-extracts when files are corrupt. | Name the fallback correctly and compare wav with wav. |
| B23 | `cli/tts_generate_samples.py:638-645` | Reads `REC_VENV_DIR` (set nowhere), with a `data_dir.parent.parent` fallback. | Use `${data_dir}/.recorder-venv` only. |

---

## 2. Delete legacy code

### 2.0 Before deleting: import any remaining legacy data

Studio's legacy import (`studio/migration.py`) is deleted here as well. If `/data` still holds any un-imported legacy data, run the import **once before this phase lands**:
- `personal_samples/`, `negative_samples/`, `captured_audio/`
- trained models in `trained_wake_words/`

Check with `GET /api/studio/migration`, then `POST /api/studio/migration/import`. Afterwards the old directories (plus `trim_history/`, `.auto_train*`) can be removed by hand. Code never deletes them.

### 2.1 Server: `trainer_server.py` (4,310 → ~50 lines)

- Keep only:
  - FastAPI app creation.
  - The Studio router.
  - The `/` index and `/static` mount.
  - Studio runtime startup and shutdown.
- Rewrite it as a `create_app(runtime=None)` factory plus a FastAPI `lifespan` (replacing the deprecated `@app.on_event`) and no import-time side effects.
- Delete the `TRAINER_LEGACY_MODE` flag, the `/api/*` 409 middleware, `LEGACY_STUDIO_READONLY_PATHS`, `legacy_active` (`trainer_server.py:213`, `studio/runtime.py`) and `StudioCapabilities.legacy_mode`.
- Removed `/api/*` paths will return 404 instead of 409.
- `tests/studio_browser_server.py` then calls `create_app(runtime)` instead of patching `studio.runtime.StudioRuntime` during import.

### 2.2 Frontend (~1,450 lines, already unreachable)

- Delete `LegacyTrainer.vue`, `trainer.css`, `trainerStore.ts`, `src/api.ts`, `src/types.ts`, and `AudioTrimModal.vue` (after B1 is rebuilt).
- Delete every `:not(.legacy-scope *)` qualifier in `studio.css:46-58`.
- Inline `TrainerApp.vue` into `main.ts`; 6 tests import it and need updating.

### 2.3 CLI pipeline that only legacy used

Studio trains through `studio/legacy_training.py` → `wake_word_sample_augmenter`/`wake_word_sample_trainer`, and generates through `tts_generate_samples.py` directly. The legacy `train_wake_word` pipeline is otherwise unused.

| Delete | Why it's dead after legacy |
|---|---|
| `train_wake_word` (root) | Studio only uses its first 14 lines, which `exec cli/studio_train.py`. Change `studio/legacy_training.py:96` to run `[sys.executable, REPO/'cli/studio_train.py', …]` directly. The process group stays the same. |
| `cli/wake_word_sample_generator` | Only called by `train_wake_word:135` |
| `cli/setup_training_datasets`, `cli/setup_negative_datasets` | Only called by `trainer_server.py` and by each other. Studio downloads negatives through `studio/datasets.py`. |
| `cli/system_summary`, `cli/cudainfo`, `cli/test_python` | Diagnostics for `train_wake_word` and `setup_python_venv:309`. `cudainfo` pulls in numba just to print GPU info. |
| `cli/run_generator_with_progress.py` | 0 references even today |

Also update these references:
- the `dockerfile` and `dockerfile.blackwell` COPY of `train_wake_word`;
- the `setup_python_venv:130-139` `.venv/bin` symlink loop;
- `run.sh:160-170`: the `TRAIN_CMD` and legacy dir env exports.

Then `shell.functions` loses its `KNOWN_ARGS` callers that no longer exist.

### 2.4 Studio legacy import

- Delete `studio/migration.py` (426 lines) and its routes (also in §3).
- Delete the `LegacyInventory`, `LegacyImportSelection` and `MigrationReport` models.
- **Keep:**
  - the `migration_*_provenance`, `migration_source_claims` and `legacy_model_validations` tables;
  - `deployment._validate_legacy`;
  - the "Legacy" source label in Samples.

  Already-imported samples and versions must keep working. No schema change is needed.

### 2.5 Studio code that only looks like legacy (keep)

- **`studio/legacy_training.py` is the active training adapter.** Rename it to `mww_training.py` (§10).
- **Studio's language list** (`studio/generation.py:52,68`) reads Piper/OmniVoice catalog caches that only legacy code refreshes. In Studio mode they are already never refreshed, so deleting legacy is behavior-neutral. Optional follow-up: port the ~60-line fetch-and-cache into `studio/generation.py` so new languages appear.

### 2.6 Tests and docs

- **Delete:** `test_auto_train.py` (823 lines), `test_data_management.py`, `test_session_stop.py`, `test_mww_only.py`, `test_studio_migration.py`, the `MigrationBoundaryTests` in `test_studio_final_fixes.py`, the legacy-language tests in `test_modern_tts.py`, and the legacy parts of `test_vue_ui.py` (32-37, 55-123).
- **Adjust** the tests that import `trainer_server` or `train_wake_word`, keeping their non-legacy assertions: `test_training_environment.py` (re-point to `studio.legacy_training.training_environment` and `cli/check_training_venv`), `test_run_sh.py`, `test_unicode_shell_wiring.py`, `test_studio_training_cli.py:161,221`, `test_studio_packaging.py`, and `test_studio_jobs.py:605-617` / `test_studio_workspaces.py:175` (they patch `trainer.*`).
- **Add** one regression test: a database at v18 that contains the `migration_*` tables still opens, and an imported model version still validates and publishes.
- **README:** delete §524 "Legacy compatibility reference" through "Important Notes" (keep Credits), plus the migration paragraphs in "Storage, migration and scheduling".

---

## 3. Remove unused API routes (17)

None of these has a production frontend caller (grep of `studioApi.*` outside `__tests__`). Nothing in `cli/` or on the kiosks calls Studio.

| Route | Notes |
|---|---|
| `GET /capabilities` | Only reported `legacy_mode` |
| `GET /migration`, `POST /migration/import` | §2.4 |
| `GET /deployment/capabilities` | Static notices. Its prose also leaves `models.py` |
| `GET /wakewords/{id}/training/runs/{run_id}` | |
| `GET /wakewords/{id}/models/{version_id}` | The archive download routes stay |
| `GET /wakewords/{id}/deployment/history` | |
| `POST /wakewords/{id}/deployment/rollback` | Identical to publish |
| `PUT /wakewords/{id}/generation/recipe` | The `GET` stays (Artificial uses it) |
| `POST /wakewords/{id}/generation/jobs` | UI uses `generation/submissions` |
| `GET /wakewords/{id}/generation/batches/{batch_id}` | |
| `PUT /schedules/{scope}` | Only `CronEditor.vue` (test-only) used it. `GET /schedules` stays |
| `POST /jobs` | Generic enqueue of any kind or payload |
| `GET /jobs/health` | |
| `POST /scrape` | Synchronous network collection inside the request. UI uses `collection/jobs` |
| `GET /devices/{id}/source-mappings` | The `PUT` stays |
| `PATCH /wakewords/{id}` | Rename/language UI was removed earlier |

**Follow-on deletions:**
- Service methods that only these routes call. Verify each by grep when implementing; candidates are `GenerationService.enqueue`, the synchronous `CollectionService` scrape path, `schedules` save, `TrainingService` manifest getters and the `DeploymentService` rollback/history/capabilities methods.
- The matching `studioApi` methods: `capabilities`, `migration`, `importLegacy`, `updateWakeword`, `sourceMappings`, `scrape`, `enqueueScrape`, `health`, `saveGenerationRecipe`, `generate`, `batch`, `trainingManifest`, `model`, `deploymentCapabilities`, `deploymentHistory`, `saveSchedule`, plus their types.
- `JobConsole.vue` and `CronEditor.vue`, both test-only.

**Tests that seed through these routes must switch to the UI's routes:**
- `e2e/studio.spec.ts:77-78`: replace `/scrape` with `collection/jobs` and `/__test/drain-collection`.
- `e2e/studio.spec.ts:333`: replace `generation/jobs` with `generation/submissions` and `/__test/drain-gpu`.
- The Python tests that hit them (`test_studio_collection`, `test_studio_generation`, `test_studio_deployment`, `test_studio_jobs`, …). Keep the tests' intent and change only the entry point. Tests whose sole subject is a removed route are deleted.

---

## 4. Stop committing `static/ui`

1. Add a Node build stage to **both** dockerfiles:
   ```dockerfile
   FROM node:22-slim AS ui
   WORKDIR /src/frontend
   COPY frontend/package.json frontend/package-lock.json ./
   RUN npm ci
   COPY frontend/ ./
   RUN npm run build            # vite outDir ../static/ui → /src/static/ui
   …
   COPY --chown=root:root static/ /root/mww-scripts/static/
   COPY --from=ui --chown=root:root /src/static/ui /root/mww-scripts/static/ui
   ```
   `.dockerignore` already excludes `frontend/node_modules`, `test-results` and `playwright-report`.
2. Add `static/ui/` to `.gitignore` and run `git rm -r --cached static/ui`. `static/index.html`, `static/images/` and `static/studio-theme.js` stay tracked.
3. Local workflow:
   - `just ui` runs `npm --prefix frontend ci && npm --prefix frontend run build`.
   - The Playwright `webServer.command` runs the build first.
   - `just test` depends on `ui`.
4. Tests:
   - `test_vue_ui.py::test_static_shell_loads_prebuilt_bundle` should keep the `index.html` checks and only check the bundle size when `static/ui` exists.
   - Delete `test_vue_ui.py:125-138`.
   - Update the COPY expectations in `test_studio_packaging.py:35`.
5. CI builds the UI before running tests. The planned "committed bundle drift" check is no longer needed. The worker-hash churn fix (`assets/[name].js`) also becomes optional.

---

## 5. UI polish (screenshot-confirmed)

### 5.1 Layout and alignment

1. **Card headings sit off-centre next to their buttons.** `.studio-app h2 { margin: 0 0 12px }` applies inside flex header rows, so the heading sits ~6px above the button's centre. Seen in "Collection history / Refresh history", "Unmapped / Refresh inbox", "Fleet setup / Refresh registry" and the Automate "Enabled" toggles. Fix: `.flex > h2, .studio-toolbar > h2 { margin: 0 }`, plus `items-center` on `CollectionHistory.vue:22`.
2. **Page headers differ on every page.**
   - Manual's "View samples →" is top-aligned.
   - Deploy's "Manage kiosks →" floats on its own line.
   - Classify→Collect's "Collection settings →" is inline in body text.
   - Testing alone has `max-width: 960px` and different card padding (`testing.png`).

   Fix: one `<PageHeader title description><slot/></PageHeader>`, and drop Testing's scoped max-width.
3. **Only the Data nav group is indented** (`StudioShell.vue:72`); Models has a label but no indent. Apply `studio-sub` to both labelled groups.
4. **Rows have misaligned actions.**
   - Deploy's buttons are top-aligned against 3-line blocks, while Train centres them.
   - On Downloaded and Artificial, the status text is top-aligned while the buttons sit lower.
   - Samples table text cells are top-aligned while the action buttons are centred.

   Fix: one `.studio-list-row` (flex, `items-center`, `gap-3`, `flex-wrap`, with `min-w-0 flex-1` on the text) for all lists, and `vertical-align: middle` on table cells.
5. **Downloaded: "Save selection" is placed differently in its two sections.** It is on its own row for negatives but in the header for augmentation, and the status text ends at different right edges. Put both in the section header and give the status a fixed slot.
6. **The workspace delete confirmation** renders at the *bottom* of the page, far from its button, without moving focus (`wakewords-delete-confirm.png`). Use the shared `<ConfirmDialog>` (§6.2).
7. **Kiosk badges float mid-row at different x positions** for leader and follower ("Refresh followers" shares the flex row). Put the badges in a fixed column and the actions on the right. Role casing is inconsistent ("leader" vs "Follower").
8. **The brand wraps to two lines** in the 204px sidebar. Use `nowrap` or a slightly smaller size.
9. **Automate:**
   - The status line has `mt-3` in some cards and none in Deployment.
   - Deployment shows a "Manual only" pill where the others have an "Enabled" checkbox.
   - "Save automation settings" floats outside every card.
   - Classification rules are inside a `<details>` (the one open `TODOS.md` item).

   Normalize the spacing (`AutomatePage.vue:62,70,73-74`), show the rules inline, and right-align or sticky-footer the save button.
10. **Spacing gaps:**
    - `SamplesPage.vue:89`: Remove and Cancel touch.
    - `SourceInbox.vue:24`: the assign button sits flush under its `<p>`.
    - `ArtificialPage.vue:162` has no top margin.
    - The MOSS fieldset (`:167-179`) has no gap and an unstyled legend.
    - `ArtificialPage.vue:197` has an unstyled `<h3>`.
    - A `.studio-note` that is the last child of a card adds an extra 12px.

### 5.2 Mobile (390px, `screenshots/mobile-*.png`)

1. **Downloaded is badly broken.** Each description wraps one word per line next to the status and button. Fixed by §5.1.4.
2. **The Samples table overflows.** Revision and Actions are cut off, and "pending" breaks as "pendin/g". Below 650px, stack each row as a card using CSS only (`display:block` rows with `data-label` captions).
3. **Deploy, Artificial and Train metadata wraps one word per line.** Fixed by §5.1.4.
4. **The Manual upload file input is truncated.** Stack the controls below 650px.
5. **The header takes ~210px** (three rows). Put theme and queue on the same row as the wakeword select.
6. **The Testing graph's text scales down with the SVG viewBox** until it is unreadable. Use fixed-size HTML axis labels.

### 5.3 Visual consistency

1. **Errors look like successes.** The green `.studio-note` is used for `role="alert"`, for the "Disk space is low" warning and for neutral info. Add `.studio-note-error` and `.studio-note-warning` (the latter replaces `studio-collection-warning`).
2. **Button emphasis is inconsistent.**
   - Train makes "Save parameters" primary and "Start training" secondary.
   - "Save selection" is primary on Downloaded but secondary on Artificial.
   - Destructive confirms are green in Samples and Classify but plain elsewhere.

   Add a `studio-danger` style.
3. **Run naming varies.** Train and Deploy say "Run #N · date", but Testing's version select says "date · e3f45f43". Use "Run #N · date" everywhere. Deploy also has two bold lines and prints recall raw.
4. **Raw IDs are shown to users:** a 32-char job id as the Collection history title, "Revision 0" on the Classify card, and "Job df97…" in the queue logs. Show a date or label instead, and keep the id in `title=`.
5. **Number formatting:** `0.000006444 GB` should go through a `formatBytes()` helper, and "1 samples" needs pluralizing.
6. **Busy spinners are missing** on Publish, Create/Delete workspace, Upload/Save sample and Automate/Train save. Add `:aria-busy`.
7. **The light-theme waveform is nearly invisible** (`AudioPlayer.vue:63`). Use `currentColor` or a CSS variable.
8. **Native and custom controls are mixed.** Testing's "Sensitivity" is a custom button with a text caret. Manual uses a `<select>` for the upload label but a segmented toggle for the recording label. Pick one control per concept.
9. **Accessibility:**
   - `ThemeToggle.vue:7` has a fixed `aria-label` that contradicts its visible text.
   - The queue-error "!" is never announced.
   - The Classify tabs lack arrow-key navigation, and their `aria-controls` points to removed panels.
   - Modals don't move or return focus (fixed by `ConfirmDialog`).

---

## 6. Redundancy to consolidate (behavior-neutral)

### 6.1 Backend (`studio/`)

| Duplicate | Copies | Consolidate to |
|---|---|---|
| flock context manager | 6 | `storage.flock(path)`. This also removes the `DeploymentService(store, None, None)._lock('intent')` hack (`workspace_deletion.py:129,153`, `batch_deletion.py:45,67`) |
| `with open_directory(x): pass` as mkdir | 15 | `storage.ensure_directory()` |
| Safe regular-file read (O_NOFOLLOW + S_ISREG) | ~9 | `storage.read_regular()` |
| fsync-tree | 3 | `storage.fsync_tree()` |
| File sha256 | 3 | `hashlib.file_digest` |
| `utc_now` / `_now()` | 2 + 7 | One `iso_now(clock)` |
| Pagination validation | 8 | `check_page()` |
| Workspace-exists check | 16 extra transactions | `require_word(db, id)` inside the existing transaction |
| Audio record insert | 2 (`samples._audio`, `generation.py:283`) | One helper |
| `generation_recipes` upsert | 3 | One helper |
| Deletion journal / blob cleanup | 2 (`workspace_deletion`, `batch_deletion`) | `deletion.py` |
| `runtime.py` lazy properties | 15, plus a 15-line reset | A property factory (~150 → 30 lines) |
| Augmentation corpus list | 3 | One list, with the flags derived from it |
| `collection.py:255` `resolve_source` | Resolved again inside `ingest` | Pass `None` |
| `studio_dataset_selections` | Written, never read since v17 | Drop the dual write. Add migration v19 `DROP TABLE` |

Also:
- **N+1 queries:** `samples._sample` (+2 queries per row), `generation.list` (+3 per row), `collection.list_runs`, `training.runs` and `training.versions` (slices in Python). Same output with fewer queries.
- **Test-only code to delete:** `CollectionService.collect_device`, `TrainingService.successful_version`, the `TrainingAdapter` Protocol, the `'runs'` category in `db.py:136`/`workspace_deletion.py`, and the unused `RESOURCES` import in `augmentation_datasets.py:11`.

### 6.2 Frontend

1. **Five confirm-dialog implementations** → one `<ConfirmDialog>` on `<dialog>.showModal()`, which provides the focus trap, Esc handling and inert background. `JobQueueDrawer` can use `<dialog>` too.
2. **The "fetch all pages" loop, ×5** → `fetchAll(pageFn)`.
3. **Abort-controller + `generation` counter + `*Current` guards on every page** → a ~6-line `latestRequest()` helper.
4. **Job-finished watchers ×3, busy checks ×3, and the active-status list ×4** → `queue.busy(kind, wordId)`, `onJobFinished(pred, cb)` and an exported `ACTIVE_STATUSES` (dedupes `isActiveJob`).
5. **Audio:**
   - `SamplesPage.vue:19-37` duplicates AudioPlayer's blob logic; setting `audio.src = studioApi.audioUrl(...)` is enough.
   - Waveform peaks are computed ×3; use one `peaks(buffer, n)`.
6. **Label/source option lists ×3** (`SamplesPage.vue:55,64,78`) → one const.
7. **Hand-built hrefs** (`TrainPage:25`, `ClassifyPage:30`) → `routes.href(id, {tab})`.
8. **`StudioShell.vue:91-101`'s 11-branch `v-if`** → `Record<PageId, Component>` with `<component :is>`.
9. **Dead code:**
   - `relativeTime`/`prettyTime` (`time.ts`).
   - `PaginatedTable`'s `noun` prop.
   - `DeviceRegistry`'s `surface` branches and `changed` emit.
   - `.studio-safety` and `[data-quarantine-notice]`.
   - The `@theme --color-studio-surface` token.
   - The `addListener` fallbacks.

### 6.3 Scripts and Docker

1. **The four corpus scripts** (`setup_mit_audio/fma/audioset/chime`) → one table-driven `cli/prepare_corpus.py`, called from `setup_augmentation.py`. Preserve:
   - the per-corpus output naming;
   - the `*_corrupted_files.log` files;
   - for MIT, replacing its HF downloader with `snapshot_download(..., allow_patterns="16khz/*.wav")`.
2. **Move duplicated shell code into `shell.functions` once:**
   - GPU/Blackwell detection (copied 4×);
   - `pip_install` and the microWakeWord clone (2×);
   - the CUDA lib-path heredoc (`run.sh` and the trainer);
   - TF env setup.
3. **`dockerfile`/`dockerfile.blackwell`** → one file with `ARG BASE_IMAGE`/`EXTRA_PYTHON`, built as a CI matrix. Do this together with the §4 node stage.
4. **The "check venv, else setup, re-check" pattern (×3)** → give `setup_python_venv` the fast health-check exit that `setup_blackwell_venv` already has.
5. **`tts_generate_samples.py`:**
   - Delete `ensure_voice_bank` and `generate_engine` (0 callers) and the ~650 lines reachable only from them, with their tests (`test_modern_tts.py` 243-523).
   - Delete the dead `--mode bank|generate` in `tts_qwen_worker.py`.
   - Delete the dead Whisper path in `tts_reference_qa.py`.
   - Merge the near-identical fallback and recovery loops into `_fill()`.
6. **Smaller items:**
   - `wake_word_sample_augmenter:45-97` repeats an 8× default pattern; use one loop.
   - `tts_config.QWEN_LANGUAGE_NAMES` is an identity copy; alias it.
   - The `MWW_CALIBRATION_*` defaults are defined twice.
   - Unused `justify_text`, `EXTRA_ARGS` and `OPTION_COUNT` in `shell.functions`.
   - `setup_audioset:200`'s `expected_filecount` is never used.
   - The `--tts-voice-count` chain goes away with `train_wake_word`.

### 6.4 Tests

1. **Shared helpers to move into `studio_harness.py`/`conftest.py`:** the 6 WAV builders, 2 fake trainer writers, 2 loopback kiosk servers (rename the unrelated in-process `FixtureKiosk` in `test_studio_deployment.py`), ~25 `FastAPI()+router+TestClient` blocks, and the 7 test modules that import other test modules.
2. **Duplicate runs:** `test_studio_scoped_collection.py` re-runs all 23 `CollectionTests`. Fold its 5 tests into `test_studio_collection.py`.
3. **Badly named file:** `test_studio_final_fixes.py`. Its remaining `AugmentationTests` move to `test_studio_training.py`.
4. **Vitest:** add `unstubGlobals: true` and delete ~16 `afterEach(vi.unstubAllGlobals)`; use `fakeStudio.json()` (redefined in 9 files); add a `mountWithWorkspace()` helper (copied in 6+ files).
5. **E2E:** add a `createWord()` helper. Fold `wakeword-layout.spec.ts` and `overall-polish.spec.ts` into `studio.spec.ts:220`.
6. **Brittle source-grep tests:**
   - Delete `test_wham_removal.py`.
   - Replace `test_unicode_shell_wiring.py` with a behavioral argv check in `test_studio_training_cli.py`.
   - Replace `test_studio_speech.py`'s `find_spec` scaffolding with a normal import.
   - Delete `test_studio_packaging.py:74`'s unused env vars.

---

## 7. Hacks to replace

| Hack | Better approach |
|---|---|
| **The maintenance loop runs every 0.25 s** (`jobs.py:599-611` → `runtime._maintenance`). It does an automation reconcile, a deployment `retry_due` (INSERT…SELECT over all versions, enrolling every intent) and a flock, 4×/s. A manual publish holds that same flock across network timeouts and stalls the scheduler. | Keep the 0.25 s job-claim poll, but run `_maintenance` every 5–10 s (backoffs are ≥30 s, so this is behavior-neutral). |
| `Store.transaction`: `timeout=0` plus a hand-rolled 5× BEGIN retry (~150 ms), after which it returns 500 | `sqlite3.connect(..., timeout=5)` and a plain `BEGIN IMMEDIATE`. |
| `migration.py` used `store._connection` directly | Gone with §2.4. |
| Private members used across classes (`jobs._enqueue/_record/_finish…`, `samples._get/_prepare…`, `training._page`) | Public functions or methods. |
| Lazy in-function imports to dodge cycles that mostly don't exist | Hoist them. The one real cycle disappears with `storage.flock`. |
| Post-construction injection (`runtime.py:77` `automation.deployment = …`, and `TrainingService` building `AugmentationDatasetService` ad hoc) | Constructor arguments. |
| Broad excepts that drop tracebacks (`jobs.py:568,593,607`, `collection.py:276`) | `logging.exception(...)`. |
| Download-job payloads JSON-decoded in Python to filter by dataset (`datasets.py:139,176`, `augmentation_datasets.py:75`) | `json_extract(payload,'$.dataset_id')=?`. |
| `wake_word_sample_trainer:180-285` builds YAML via heredoc, sed, perl, then a Python rewrite; it breaks on `#`, `\|` or `@` in paths | Generate it entirely in `dataset_config.py` with `yaml.safe_dump`, keeping the same weights and order. |
| microWakeWord and piper-sample-generator cloned at unpinned HEAD, with a silent `rm -rf` and reclone, while the augmenter monkeypatches `Clips.audio_generator` | `git checkout <sha>` and record the sha in the stack marker. |
| `setup_augmentation.py:32` symlinks `.venv` into the stage dir | Use the `python` on PATH (or a `PYTHON` env var). |
| Vite library mode plus a `process.env.NODE_ENV` define, used to build an app | App mode with `rollupOptions.input` and fixed `entryFileNames`; same output paths. |
| `static/studio-theme.js` duplicates `theme.ts`; `index.html`'s `theme-color` matches neither theme | Inline the six lines in `index.html`; `theme.ts` only reads the stored preference. |
| `AutomatePage.vue:40` `JSON.parse(JSON.stringify())` | `structuredClone(toRaw(...))`. |
| `/tmp/opencode` and `/home/contagon/...` paths in tests, the Playwright config, e2e screenshots and the README | `tempfile`/`tmp_path`, `test.info().outputPath()`, and an env override with a portable default. |

---

## 8. Deferred (decided: not now)

- **Runtime dependency install in `run.sh:29-118`** stays. A later, still-runtime improvement: move the list to a pinned `requirements-server.txt`, store its sha256 in the venv, and reinstall only when it changes. This drops the hand-rolled version probe and pins torch, numpy, faster-whisper and onnx-asr. The README test setup can reuse it.
- **Untracking `.env`.** `compose.yaml` stays as is and needs `.env` (`env_file` plus `$DATA`), but the tracked file holds your machine path. If you want it untracked: `git rm --cached .env`, ignore it, and commit `.env.example` (`DATA=/path/to/data`). The compose file is unchanged, and fresh clones copy the example.

---

## 9. Repo hygiene

- Untrack `.kiro/` (machine-local paths) and `.superpowers/` (already in `.gitignore` but tracked) with `git rm -r --cached`.
- Delete `mmw.png` (unreferenced) and `TODOS.md` (its one open item is §5.1.9).
- Archive or delete the 17 stale AI planning docs in `docs/superpowers/plans|specs/`.
- Fix the stale `justfile:9` comment, the README version examples (`v17`; VERSION is 36), and `.gitignore`'s missing trailing newline.
- Trim `.bashrc` from 135 lines of Debian boilerplate to the ~15 that matter.
- The dockerfile COPYs files one by one with `--chmod=0755` on non-executables. Simplify this together with the §4 node stage.

---

## 10. Maintainability and tooling

1. **Formatting.** Vue lines reach 1,650 characters, and there is no Prettier or ESLint. Add Prettier (`printWidth: 120`) and make **one mechanical reformat commit on its own**. Enable `noUnusedLocals`.
2. **Split large components:** `ClassifyPage.vue` → `ReviewQueue`; `ArtificialPage.vue` → `MossSources` and `GeneratedDatasets`. In `studio/models.py`, move the exceptions to `errors.py` and move UI prose out of the data layer.
3. **Naming:**
   - `studio/legacy_training.py` → `mww_training.py`, with `sha256`, `checked_file` and `REPO` moved to `storage.py`.
   - `RecordPage` → `ManualPage` and `NegativeDatasetsPage` → `DownloadedPage` (keep the old hash redirects).
   - `PaginatedTable` → `Pager`.
4. **Schema migrations:** `db.py:44-102` is a correct, atomic, `user_version` chain, but written as 17 `if version < N` blocks. Replace them with an ordered `MIGRATIONS` tuple and a loop (optionally `studio/migrations/NNN_*.sql`). **Never edit applied files and don't squash**, because the v10/v13/v17/v18 data steps matter for older databases.
5. **API layer:**
   - One `StrictBody` base instead of ~20 repeated `model_config`.
   - One `from studio.models import`.
   - `Store.data_dir` instead of ~12 uses of `store.root.parent`.
   - One `REPO` constant.
6. **Test running:**
   - `pytest.ini`/`pyproject` with `testpaths = tests` and `pythonpath = . tests`.
   - `tests/conftest.py` defaulting `DATA_DIR` to a temp dir.
   - `requirements-dev.txt`.
   - README test section → `python -m pytest`.
7. **justfile:** add `ui`, `test` (`ui` + pytest + `npm test -- --run` + typecheck), `e2e`, `shell` (`docker compose exec studio bash`) and `build-blackwell`.
8. **CI:** add `test.yml` (`npm ci` + build, pytest, vitest, typecheck) on push and PR. Make `docker-publish.yml` depend on it and build both images as a matrix.

---

## Progress

- **Phase 1 done (2026-10-21).**
  - Added `pytest.ini`, `tests/conftest.py`, `requirements-dev.txt`, the `just ui`/`test`/`test-venv`/`e2e`/`shell` recipes, and `.github/workflows/test.yml` (required by `docker-publish.yml`).
  - Fixed B6, B20 and B21, removed the `/tmp/opencode` paths, and updated the README test section.
  - Fixed two pre-existing e2e failures:
    - a stale Deploy assertion that expected a version id instead of "Run #N";
    - `overall-polish.spec.ts` leaving a queued collection job that broke the Automate test in full-suite order.
  - Baseline: pytest 537 passed, 1 skipped; vitest 207 passed; typecheck clean; Playwright 18 passed, 1 skipped (opt-in real-model test).
- **Phase 2 done:** the legacy inventory on `/data` was empty (0 personal, negative, captured and models), so there was nothing to import.
- **Phase 3 done (commits `88d82fc`, `692fa54`, `014d964`, `4d93eef`):**
  - §2 legacy removal.
  - §3 all 17 routes.
  - §4 `static/ui` is built in Docker; the full image build was verified locally.
  - §6.3.5 dead TTS code: about 11,600 lines deleted in total.
  - After this phase: pytest 449 passed, 1 skipped; vitest 204 passed; Playwright 18 passed, 1 skipped. A pixel diff of every page before and after the frontend deletions showed only timing noise.
  - Deferred:
    - **The `:not(.legacy-scope *)` qualifiers in `studio.css`.** Removing them lowers selector specificity, and a pixel diff showed 1px shifts on checkboxes and a changed corner on the selected wakeword card. Handle them in §5 along with the B1 trim-dialog rebuild; `AudioTrimModal.vue` still wraps itself in `legacy-scope`.
    - **Service methods that are now test-only.** `GenerationService.enqueue/save_recipe/get_batch`, `TrainingService.get_manifest`, `ScheduleService.save`, `WorkspaceService.update/source_mappings`, and `StudioRuntime.health` (plus the WorkerPool health bookkeeping) are kept because many tests use them for setup. `publication_history` is still written but no longer read. Tidy these in phase 8.
- **Phase 4 done (commits `391e76b`, `e290d2e`, `bf9cd85`, `d866b9f`):**
  - Fixed B1–B4, B7–B19 and B23.
  - **B5 was not a bug.** `test_import_filter_retains_existing_legacy_membership_but_excludes_microphone` deliberately counts migrated samples under both Import and Legacy, so that change was reverted.
  - **B11 reverses an asserted behaviour.** The e2e test used to require that a letter key on a focused button does nothing. Letters now always work (matching Manual), while Space/Enter on a focused control keep their native click.
  - **B22 was only partly done.** The FMA fallback now warns. The mp3-vs-wav count compare only re-extracts after an interrupted conversion, so it was left as is.
  - After this phase: pytest 450 passed, 1 skipped; vitest 205; Playwright 18 passed, 1 skipped. Screenshots confirmed the trim dialog (desktop and mobile), the kiosk editor, the status pills and the mobile header.
- **Phase 5 done (commits `2c15917`, `95fce5c`, plus the follow-up check):**
  - Prettier 3.9.10 with `printWidth: 120`. `just format` reformats; CI and `just test` run `format:check`. `95fce5c` is listed in `.git-blame-ignore-revs`.
  - **Templates now compile with `whitespace: "preserve"`.** Prettier moved a space between inline tags onto a new line, and Vue's default `condense` then dropped it, which broke the Kiosks badge spacing.
  - A pixel diff of all pages (light, dark and 390px) against the pre-format build shows only known noise.
  - `noUnusedLocals` was not enabled; it belongs to phase 7.
- **Phase 6 done (commits `adf7274`, `c3a7b61`, `698bba5`, plus the mobile commit):** UI polish in §5.
  - Added shared pieces: row, note, danger and section-header styles, `PageHeader`, `ConfirmDialog` and `format.ts`.
  - Every change was checked with screenshots (light, dark, 390px).
  - On request, the items first kept as-is were reworked too: Samples stacks as cards on phones, Testing sensitivity is a native select, and Manual uses one label toggle. The theme-toggle and Automate deployment changes were tried, then reverted at the user's request.
  - Only the job ids in the expanded queue logs remain, for debugging.
  - Focus restoration and trapping in dialogs was dropped at the user's request; the native `showModal()` handles focus.

## 11. Order of work

Each phase ends with `just test`, the Playwright e2e suite, and a screenshot pass. The seeding and screenshot script used for this review is worth keeping as `just screenshots`.

1. **Safety net:**
   - pytest config and `conftest`, B20, B21, the `/tmp/opencode` removals;
   - `just ui`, `just test`, CI.
   - Record the green baseline.
2. **Before the big deletion:** run the legacy data import if anything is left (§2.0).
3. **Big deletions:**
   - legacy removal (§2);
   - unused API routes (§3), rewriting test seeding to UI routes;
   - stop committing `static/ui`, with the Docker node stage (§4);
   - the dead code in §6.3.5.

   These delete most of the surface the later phases would otherwise touch.
4. **Bug fixes** B1–B19, B22–B23.
5. **Prettier reformat** in one commit, alone.
6. **UI polish (§5).** Shared pieces first: `PageHeader`, `ConfirmDialog`, `.studio-list-row`, `statusTone`, the note variants, the h2 margin and the danger button. Then per-page fixes, then mobile.
7. **Frontend consolidation (§6.2)**, then the lib→app build switch.
8. **Backend consolidation (§6.1)** and the backend hacks in §7.
9. **Scripts and Docker (§6.3, §7):** single dockerfile, corpus script, YAML generation, pinned clones.
10. **Test consolidation (§6.4)**, in parallel with phases 7–9.
11. **Repo hygiene (§9)**, at any point.
