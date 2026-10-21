# Downloaded Datasets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the online-datasets TODO section with default-enabled, per-wakeword selections that training honors.

**Architecture:** Downloads stay shared. SQLite stores explicit wakeword selections, including empty selections; readiness and immutable training snapshots use the effective augmentation selection. Existing Vue cards present the selections and shared storage information.

**Tech Stack:** Python, FastAPI, SQLite, Vue, TypeScript, pytest, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-21-downloaded-datasets-design.md`

## Global Constraints

- Implement only the six items under “online datasets” in `TODOS.md`.
- Augmentation selections are per wakeword; downloads remain shared.
- Keep the existing stack, with no new dependencies, and preserve existing URLs.
- Default all datasets enabled; preserve explicitly saved selections, including empty lists.
- Do not invent sample counts or silently fall back to disabled corpus paths.

## Review Focus

- An explicitly empty selection survives reload and service restart.
- A delayed response for wakeword A cannot overwrite wakeword B's selection.
- Disabling missing or invalid corpora removes only those corpora from prerequisites.
- A pinned training run retains its original selection after settings change.
- Feature shard count is not a sample count; unavailable metadata remains unknown.

---

### Task 1: Persistent default-enabled selections

**Files:** `studio/db.py`, new `studio/schema_dataset_preferences.sql`,
`studio/datasets.py`, `studio/augmentation_datasets.py`, `studio/api.py`,
`tests/test_studio_datasets.py`, `tests/test_online_datasets.py`.

**Interfaces:** Add `AugmentationDatasetService.selection(word_id: str) -> list[str]`,
`select(word_id: str, dataset_ids: list[str]) -> None`, and optional
`word_id` to `catalog` and `require_ready`. Add GET/PUT
`/wakewords/{word_id}/augmentation/datasets`; PUT accepts `DatasetSelectionBody`.
Keep the shared GET `/augmentation/datasets` compatible.

- [x] Write tests asserting untouched wakewords select all negative and augmentation IDs; selecting `[]` persists across restart; selecting one wakeword does not affect another; invalid/duplicate IDs leave state unchanged.
- [x] Run `pytest tests/test_studio_datasets.py tests/test_online_datasets.py -q` and confirm new assertions fail.
- [x] Add schema version 17 with explicit saved-selection state and augmentation membership. Migrate existing nonempty negative selections as explicit; untouched/legacy empty selections receive defaults. Make negative list and snapshot use the same effective selection.
- [x] Implement scoped augmentation catalog/selection endpoints, with `selected` flags and readiness computed only from enabled rows. Retain shared catalog behavior.
- [x] Run the targeted tests; update old assertions whose empty-default behavior is intentionally superseded.

### Task 2: Honor augmentation selection through training

**Files:** `studio/augmentation.py`, `studio/training.py`, `studio/api.py`,
`studio/legacy_training.py`, `cli/wake_word_sample_augmenter`,
`tests/test_studio_training.py`, `tests/test_studio_training_cli.py`,
`tests/test_online_datasets.py`.

**Interfaces:** Extend `snapshot(store, selected_ids=None)` to pin only supplied
IDs (None preserves legacy all). `pinned_paths(manifest)` accepts validated
subsets, including empty. Pass an explicit augmentation selection to the CLI,
so omission cannot trigger legacy corpus defaults.

- [x] Write tests for manual/scheduled training with a missing disabled corpus, enabled missing corpus, subset snapshot, and empty selection. Assert saved run inputs remain unchanged after selection edits.
- [x] Write CLI tests that inspect actual augmenter arguments/configuration for selected backgrounds only, no RIR, and no datasets; unknown/duplicate manifest IDs remain rejected.
- [x] Run the targeted training/CLI/online-dataset tests and confirm expected failures.
- [x] Apply wakeword readiness in both API and worker; capture effective selection before corpus snapshotting; pin only those inputs.
- [x] Validate pinned subsets without weakening path/fingerprint checks. Extend the augmenter with an explicit selection flag, use only selected corpus paths, and disable RIR/background transforms when their path lists are empty. Preserve legacy command defaults when the flag is absent.
- [x] Run targeted tests and confirm they pass.

### Task 3: Downloaded page and dataset metadata

**Files:** `frontend/src/studio/pages/NegativeDatasetsPage.vue`,
`frontend/src/studio/components/AugmentationDatasets.vue`,
`frontend/src/studio/{api.ts,types.ts,routes.ts,errors.ts}`,
`frontend/src/studio/pages/TrainPage.vue`, `studio/{models.py,datasets.py,errors.py}`,
frontend dataset/workspace/train tests and fixtures, `frontend/e2e/studio.spec.ts`.

**Interfaces:** Add scoped frontend augmentation catalog/save methods. Add nullable
`sample_count` to negative dataset responses. Emit catalog storage status from the
augmentation component to the parent for top-level warning placement.

- [x] Add UI tests for “Downloaded”, no search field, augmentation checkbox save/reload/isolation, stale requests after workspace switches, warning before both catalogs, and matching description/license/GB/sample metadata lines.
- [x] Add backend metadata tests using real supported mmap metadata; assert missing/legacy metadata returns unknown rather than shard count. Run new tests and confirm failures.
- [x] Persist sample counts during installation using supported mmap metadata without loading feature data; keep old installations compatible with nullable counts.
- [x] Remove the negative search control/state; rename visible labels and error links, retaining route IDs/aliases. Match card detail lines, using unknown placeholders when needed.
- [x] Add scoped augmentation selection loading/saving with abort/generation guards, preserve unsaved selections during download refreshes, and show a scoped Save selection button.
- [x] Move low-space warning immediately below the page heading using emitted storage data; keep storage totals available. Use scoped readiness on Train without changing its layout.
- [x] Run frontend tests, backend dataset tests, and update relevant browser assertions for the intentional copy/default changes.

### Task 4: Verification and checklist

**Files:** `TODOS.md`, `README.md`, generated `static/ui/` build outputs if tracked.

- [x] Run `pytest -q`; report every failure or environment blocker.
- [x] Run `npm test -- --run` and `npm run build` from `frontend/`.
- [x] Run the relevant Playwright dataset test using the repository's test server configuration; report any environment blocker.
- [ ] Review the diff for scope, selection isolation, empty-list behavior, retained snapshots, and accurate counts.
- [x] Update README dataset terminology/selection instructions and mark only the six completed online-dataset TODOs.

Verification: frontend 184 passed; production build passed; browser 15 passed,
1 skipped. Full backend 528 passed, 1 skipped, with one unrelated failure:
`tests/test_compose.py::ComposeTests::test_resolved_service_keeps_loopback_gpu_and_existing_data_volume`
expects `host_ip` on the unchanged Compose port binding.
