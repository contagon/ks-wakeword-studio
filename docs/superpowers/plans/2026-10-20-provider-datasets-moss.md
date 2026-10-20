# Separate Provider Datasets and MOSS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Save one full-sized dataset per selected provider and let MOSS clone explicit completed sources or follow the same submission's direct providers.

**Architecture:** Keep one generation batch per existing GPU job. Add an atomic submission facade and source-validation/materialization helpers, explicit CLI MOSS references with per-output provenance, and a source-aware Studio form. Preserve the legacy ensemble endpoint and queue ownership model.

**Tech Stack:** Python dataclasses/FastAPI/SQLite, standard-library orchestration, Vue 3/TypeScript/Vitest; no new runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-10-20-provider-datasets-moss-design.md`

## Global Constraints

- Per-provider requested counts; MOSS has its own count.
- At most 100 distinct source dataset IDs; same workspace, phrase and language; committed direct-only datasets.
- Require at least the requested number of distinct canonical references; retries may reuse direct references, never MOSS outputs.
- Preserve all QA, normalization, duplicate and GPU ownership/cancellation protections.
- Historical batches, legacy generation API and old active jobs retain their semantics.
- No live production data changes, model installs, GPU generation or deployment during implementation.
- Existing Python baseline: 451 passes, one skip, one unrelated Compose loopback-binding failure. Frontend baseline: 131 passes.

## Review Focus

- Admission racing source deletion: validate and enqueue in one existing write transaction; test deletion is blocked while admitted work is active.
- Restart/cancellation of a source producer: immutable source batch IDs and runtime readiness checks prevent MOSS inference; test reconstruction and failed/cancelled producers.
- Rejected candidates/numeric renaming: final source mapping follows actual accepted paths, not candidate order; test lineage after QA and normalization skips.
- Cross-source duplicates and existing family identity: deduplicate canonical hashes; preserve valid family assignments and fail conflicting assignments atomically; test both cases.
- Workspace-switch and pagination races: source selections and submission tracking are workspace scoped and abortable; test stale responses, multi-page selection and completion refresh.

---

### Task 1: Atomic provider submissions and source catalog

**Files:** `studio/models.py`, new `studio/generation_submissions.py`, `studio/generation.py`, new `tests/test_generation_submissions.py`.

**Interfaces:** Extend `GenerationRecipe` with defaulted `moss_source_batch_ids: list[str]`, `moss_after_current: bool`, `moss_samples: int | None`. Add `GenerationSubmission(id, jobs, batch_ids)` and lightweight `GenerationSource(id, phrase, language, providers, sample_count, created_at)`. Expose `GenerationService.submit(word_id, recipe)` and `.sources(word_id, language, offset=0, limit=50)`; implement in the focused helper module. Child job payloads carry `submission_id` and `provider_dataset=True`.

- [ ] Write failing tests: two direct engines at 3 samples admit two jobs with `samples == 3` and one engine each; invalid engine/source/count input leaves zero jobs; legacy enqueue remains one job.
- [ ] Run `pytest tests/test_generation_submissions.py -q` and confirm missing submission/source behavior fails.
- [ ] Implement recipe validation and atomic admission, source catalog filtering/pagination, immutable saved submission recipe, ordered child jobs and MOSS dependency IDs. Default unspecified MOSS count to direct count; require a positive explicit/effective count whenever enabled. Reject conflicting source modes, invalid types, duplicates and more than 100 IDs.
- [ ] Verify tests including MOSS-only completed sources, after-current IDs, insufficient references and absent sources. Commit this task.

### Task 2: Explicit MOSS references in the CLI

**Files:** `cli/tts_generate_samples.py`, `tests/test_modern_tts.py`.

**Interfaces:** `--reference-manifest` accepts server-authored JSONL `{audio_id, path, normalized_hash, family_id}` records. `Generator` keeps the immutable external pool, uses it for all MOSS initial/refill/recovery passes and emits `source_audio_ids: {final_filename: source_audio_id}` in `.generation_manifest.json`. Existing invocations without this option remain compatible. Add source IDs/hashes to cache signature.

- [ ] Write failing tests using a real temporary reference manifest and simulated external provider/QA: MOSS-only receives references; no unselected provider runs; refills do not reference MOSS output; rejected candidates and numeric renaming preserve parent mapping.
- [ ] Run the new tests to confirm failures before implementation.
- [ ] Implement validated reference loading (MOSS-only mode, distinct IDs/hashes, readable files, enough references), raw-path/source mapping and final provenance. Version the signature. Preserve legacy ensemble paths and gates.
- [ ] Run the entire modern TTS test module. Commit this task.

### Task 3: Safe MOSS execution, previews and persisted lineage

**Files:** new `studio/generation_references.py`, `studio/generation.py`, `tests/test_generation_submissions.py`, test fixtures only where needed.

**Interfaces:** `reference_pool(service, db, word_id, phrase, recipe, required)` returns balanced, canonical-deduplicated approved audio records; bound the materialized pool to the candidate allowance. `materialize_references(service, job, recipe, phrase, required)` writes approved blobs to no-follow scoped files and returns manifest path plus approved records. `output_parents(output, approved, count)` verifies exact filename/source-ID coverage and returns parents in the same sorted order as `_read_audio`.

- [ ] Write failing tests with source/child WAVs having different content: MOSS execution receives a manifest; descendants inherit `parent_id` and `family_id`; malformed/unapproved mapping rolls back publication; MOSS preview uses one source and saves no training audio.
- [ ] Run to establish red.
- [ ] Revalidate after-current source readiness before invoking subprocess; log only trusted actionable error text. Materialize via `BlobStore.read` and existing safe directory helpers. Validate bounded output manifest and canonical family conflicts before publication. Preserve ancestors through existing GC machinery and legacy execution without references.
- [ ] Test restart, cancelled/failed/interrupted dependencies, cross-workspace and language/phrase mismatches, duplicate hashes, source deletion while queued and after completion, and derived family split stability. Run generation/deletion/training tests. Commit this task.

### Task 4: Additive API and client contracts

**Files:** `studio/api.py`, `frontend/src/studio/types.ts`, `frontend/src/studio/api.ts`, `tests/test_generation_submissions.py`.

**Interfaces:** POST `/wakewords/{word_id}/generation/submissions` returns `GenerationSubmission`; GET `/wakewords/{word_id}/generation/sources?language=...&offset=...&limit=...` returns `Page[GenerationSource]`. Extend recipe bodies with defaults. Existing `/generation/jobs` returns its existing `Job`. TypeScript adds `submitGeneration` and `generationSources`; legacy `generate` remains available.

- [ ] Write failing HTTP tests for per-provider response counts, 422/409/404 scoped validation and source pagination without embedded audio arrays; preserve old endpoint assertions.
- [ ] Run red, implement routes and TS records/methods, then run API tests and TypeScript checking. Commit this task.

### Task 5: Per-provider Studio form and MOSS sources

**Files:** `frontend/src/studio/pages/ArtificialPage.vue`, optional focused `frontend/src/studio/components/MossSourcePicker.vue`, `frontend/src/studio/__tests__/artificial.test.ts` and affected fetch fixtures.

**Interfaces:** Form submits extended recipe to `submitGeneration`. Global queue tracks all returned jobs; page watches current submission IDs and refreshes generated datasets per completion. Source picker owns pagination, keeps selection across pages and aborts stale workspace/language loads. Batch labels derive provider names from single-engine recipes and show source IDs for MOSS.

- [ ] Update frontend tests first: per-provider count copy and total, MOSS manual/after-current modes, source eligibility/count guidance, all child jobs tracked, independent dataset selections, preview requirements and stale workspace responses. Assert existing internal batch settings and preview counts remain correct.
- [ ] Run affected Vitest tests and observe failures.
- [ ] Implement separate MOSS controls and count, mutual exclusion of source modes, source picker, single-click submissions and per-child refresh. Disable MOSS preview in after-current mode with explanatory copy; manual previews submit selected sources with one output. Keep direct previews and hidden batching unchanged.
- [ ] Run full frontend suite/typecheck/build. Commit source/UI changes with rebuilt `static/ui` assets.

### Task 6: Integration verification and documentation

**Files:** `README.md`, this plan, optional additional focused regression tests.

- [ ] Update README with per-provider counts, independent training toggles, manual/after-current MOSS references, failure behavior and legacy mixed dataset limitations.
- [ ] Run full Python suite and frontend suite/build; report the named pre-existing Compose failure rather than fixing unrelated binding configuration.
- [ ] Request an independent read-only code review of the complete feature; resolve material findings with tests.
- [ ] Check diff/compile, commit completed feature checkpoints and report compatibility/deployment state. Never deploy or start real generation implicitly.

## Execution

The user approved the design and said to proceed. Execute inline in the current
session/branch; do not ask for another process-choice approval. Keep local
`.superpowers/brainstorm` runtime files untracked. Track task completion here.
