# Remove Augmentation Cache Implementation Plan

> **For agentic workers:** Use executing-plans to implement inline, with test-driven development and an independent final review. Steps use checkbox syntax for tracking.

**Goal:** Remove shared augmentation feature caching and benchmark a full fresh build on the trimmed SATA SSD.

**Architecture:** Keep the import-safe CLI and bounded spawn workers from `a6c25fc`; generate run-local mmap features on every invocation. Replace cache publication with a small run-local atomic writer; retain input integrity checks and basic augmentation reports, without cache keys, hit/miss logic, locks, checksum inventories or hardlink/copy reuse.

**Tech Stack:** Python, pytest, existing microWakeWord/audiomentations/frontend/RaggedMmap, isolated Docker benchmark.

**Spec:** User request in this conversation: remove the entire augmentation caching mechanism, inspect the introducing commit, and run another full benchmark after successful TRIM/idle recovery. Keep unrelated training improvements.

## Global Constraints

- Preserve four-worker maximum, CPU affinity/quota limits, one numerical thread per worker, CPU-only initialization, and at most twice the worker count in flight.
- Preserve per-recording/repetition seeds, corpus file ordering, splits, augmentation probabilities, repeats/shifts, feature bytes and model-training behavior.
- Preserve the pending 2,000-step validation change and other pre-existing uncommitted changes.
- Do not deploy, restart services, start model training or delete retained data, historical outputs or existing shared cache files.
- Benchmark all 40,480 archived Janet recordings and all nine splits on `/mnt/datasets`, producing 690,732 feature examples. Production mounts stay read-only; clean up only private benchmark outputs.

## Review Focus

- Removing cache must not weaken source hashes or pinned-corpus validation.
- Failed/cancelled builds must not leave a final-looking partial feature directory.
- Existing outputs and symlink destinations must not be overwritten.
- Repeated runs must actually regenerate features; no remaining hidden reuse or cache switches.
- Reports/tests/documentation must describe uncached generation rather than stale hit/miss behavior.

### Task 1: Replace cache with run-local generation

**Files:** `studio/mww_augmentation.py`, `studio/augmentation_features.py`, `studio/mww_training.py`, `tests/test_mww_augmentation.py`, `tests/test_augmentation_features.py`, `tests/test_studio_positive_sampling.py`, `tests/test_studio_training_cli.py`; remove `studio/augmentation_cache.py` and its cache-only tests.

**Interfaces:** `FeatureBuilder.write` and `task_seed` stay unchanged. Simplify `generate_pool` to source/output/pool plus assignments, seed, builder and report. Add `write_features(destination, build, expected_examples)` for temporary-sibling generation, count validation, durable atomic publication and cleanup; no reusable feature store.

- [x] Add failing tests asserting every fresh output rebuilds, no shared cache directory/keys/hits are produced, and cache CLI options are rejected.
- [x] Retain/adapt tests for empty splits, existing outputs, unsafe paths, count mismatch, failed build and cancellation cleanup.
- [x] Run new behavior assertions before implementation (eight expected failures in `tests/test_augmentation_output.py`).
- [x] Remove cache root/flags, cache identities and manifest materialization. Move only deterministic-seeding serialization and source-hash helpers into `augmentation_features.py`; remove `split_identity`.
- [x] Keep report provenance and pinned corpus checks separate from removed cache identity machinery. Retain durable syncing of new run-local outputs, without hashing output files for cache verification.
- [x] Update affected callers and tests; run focused augmentation/CLI/training tests to green.

### Task 2: Verification, documentation and full benchmark

**Files:** `tests/test_augmentation_engine.py`, `tests/test_studio_training.py`, `README.md`, `docs/training-performance-improvements.md`, historical cache spec/plan status notes, this plan; diagnostic harness/logs under `/tmp/opencode`.

**Interfaces:** The CLI always generates fresh output; `logs/augmentation.json` retains policy version, worker PIDs/count and per-split recording/example counts, sizes and durations without cache metadata.

- [x] Adapt real-engine checks for one/two-worker byte identity, relocated nested corpora and regeneration after input updates; remove warm-cache assertions.
- [x] Preserve private report archival coverage using uncached report fields. Do not invalidate scheduled-run fingerprints solely for removing storage reuse, since seeds and feature bytes remain unchanged.
- [x] Update README/backlog to mark caching removed and explain that old cache files are not automatically deleted. Preserve historical design records with a superseded note.
- [x] Run `.venv-test/bin/python -m pytest -q`, `git diff --check`, and the optional isolated real-engine check; record actual results.
- [x] Request read-only independent review of cache removal against `a6c25fc`; resolve important findings before completion.
- [x] Run the updated real CLI with explicit, distinct input/output directories on the complete retained Janet manifest. Include input hashing, feature generation, writing and syncing; exclude model training. Record staging separately and check all counts and feature sizes.
- [x] Compare measured full duration with the 72m31s pre-TRIM SATA, 3m23s NVMe cached build and 2m07s discard-only results, noting different storage paths and diagnostic conditions.
- [x] Remove only newly created benchmark features; retain logs. Report test/review/benchmark results and leave changes uncommitted unless asked to commit.

## Progress

- Inspected `a6c25fc` and current pending changes. Removal must be selective: parallel workers, deterministic seeding and canonical corpus ordering were introduced alongside the cache.
- User approved inline execution on existing `training-speed`; no new branch.
- Task 1 implemented: eight output/cache-option regression tests failed first,
  then passed with the fresh run-local writer. Focused suite: 46 passed.
- Full Python suite: 581 passed, 4 skipped, 204 subtests passed. Diff check and
  trainer shell syntax check clean.
- Real-engine test passed: one/two-worker bytes match, reordered/relocated noise
  trees match, repeated runs start workers and freshly regenerate features,
  negative updates preserve unchanged positive bytes. Log:
  `/tmp/opencode/augmentation-without-cache/engine-test.log`.
- Ruling: keep dependency/engine provenance in reports and selected-corpus
  verification even though cache-key identities are gone; these remain useful
  for reproducibility and retained-input safety, not feature reuse.
- Shared cache files and historical run outputs were not touched. No deployment,
  model training, commit or push performed.
- Independent read-only review finished with no Critical, Important or Minor
  findings; it confirmed no feature-reuse path or existing-cache deletion remains.
- Full real-CLI SATA benchmark passed: process 274.21 s (4m34s), augmentation
  report 274.05 s, input staging separately 18.93 s. Verified 40,480 recordings,
  nine splits, 690,732 examples and 34,094,943,063 feature bytes; no cache fields
  or reuse. This is about 16x faster than the pre-TRIM 72m31s SATA run, but does
  not isolate cache-removal effects from storage recovery. Benchmark-only staged
  inputs/features were removed. No OOM; cgroup filesystem caching reached the
  16 GiB limit. Evidence: `/tmp/opencode/augmentation-without-cache/summary.json`
  and `augmentation.log`.
  Benchmark harness: `/tmp/opencode/augmentation-without-cache/benchmark.py`.
