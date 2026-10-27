# Streaming Validation Implementation Plan

> **For agentic workers:** Use executing-plans to implement this plan inline.

**Goal:** Stop materializing full validation arrays while preserving every example and the pinned engine's validation metrics.

**Architecture:** A validation-only feature-handler adapter supplies lazy evaluation inputs backed by the existing provider generators. The launcher converts these inputs to bounded TensorFlow datasets and continues to call upstream's original validation/reset/metric implementation. Training, calibration, augmentation, and the installed engine source remain unchanged.

**Tech Stack:** Python, NumPy, TensorFlow 2.20, pinned microWakeWord mmap providers, pytest.

**Spec:** User-approved conversation outline: first stream validation, keep every example, metrics, batch size 128, and the 500-step evaluation interval; do not redeploy or interrupt active training.

## Global Constraints
- Preserve ordinary `truncate_start` and ambient `split` provider semantics, labels, counts, scaling, and final partial batches.
- Preserve upstream metric accumulation across ordinary and ambient sets, including reset suppression.
- Do not use testing data to choose detector thresholds; calibration is unchanged.
- No larger training batches, less frequent validation, augmentation caching, or dependency/source mutations in this change.
- Commit existing GPU/memory/fallback fixes separately before implementation (done: `d54c317`).

## Review Focus
- Ambient splitting counts must match the pinned provider's exclusive endpoint and stride.
- Multiple providers, empty modes, uint16 scaling, fixed cutoffs, and partial batches must retain all existing examples.
- Validation must never call the handler's eager whole-array loader.
- TensorFlow callbacks must not retain per-pass arrays or provider-generated temporary buffers after evaluation.
- Lightweight tests must be supplemented with real-engine metric and memory checks without changing the live service.

### Task 1: Provider-backed validation batches
**Files:** new `studio/mww_validation.py`, new `tests/test_streaming_validation.py`.
- [x] Add failing tests for provider ordering, truncation arguments, labels, partial batches, counts, repeatability, and resource release.
- [x] Observe failures, then implement lazy validation batches and an upstream-compatible validation-handler adapter.
- [x] Run focused tests; verify no full-array loading or unbounded buffering.

### Task 2: Launcher integration and real-engine verification
**Files:** `cli/train_mww.py`, `tests/test_bounded_validation.py`, `tests/test_streaming_validation.py`, `README.md`.
- [x] Add failing integration tests proving upstream validation uses lazy sources and preserves metric accumulation/restoration.
- [x] Integrate the adapter with existing bounded evaluation; keep the array fallback for compatibility tests/other callers.
- [x] Run full pytest suite, syntax/diff checks, and read-only independent review.
- [x] Compare upstream eager, bounded-array, and streaming metrics in an isolated real TensorFlow process.
- [x] Document measurements and limits; do not deploy or start official training.
- [ ] Deferred: measure repeated full-data GPU validation time/RAM when official training is no longer active; do not infer GPU speedup from the host-input fixture.

## Execution notes
- Implementation module lives in `studio/` to reuse the existing repository package and avoid ambiguous bare CLI imports; the launcher adds the repository root using the existing config-script convention.
- Small labels and weights are real NumPy arrays, keeping the upstream `reshape` interface intact without dummy labels or a forked metric implementation.
- Provider counts are checked before the final batch (Keras does not request another batch after the declared steps).
- Real-engine isolated CPU check: all 595 ordinary and 740 ambient examples match the eager provider path; all upstream metrics match eager and bounded-array baselines over 12 passes at rtol=1e-5, atol=1e-6. Checked uint16 scaling, short-clip padding, multiple cutoffs, ambient exclusive endpoints and partial batches.
- Active service/container was not modified. Full-data GPU timing remains deferred while official training is active.
- Host-input allocation fixture (20,000 float32 spectrograms, 178x40, real pinned provider methods): eager loading peaked at 1,092.5 MiB tracked allocation / 2.86 s; streamed iteration peaked at 10.9 MiB / 1.21 s. This is not an end-to-end GPU benchmark.
- Final lightweight suite: 555 passed, 3 skipped, 204 subtests passed; two skips are optional real-engine checks, both of which passed separately in an isolated read-only CPU container.
- Independent review: no Critical/Important findings; one Minor missing-cleanup-coverage finding addressed with five tests for successful completion, explicit early close, shape mismatch, count mismatch, and provider exceptions. No product changes were required; final full suite is green.
