# Augmentation Cache and Parallelism Implementation Plan

> **For agentic workers:** Use executing-plans to implement inline with test-driven development.

**Goal:** Reuse unchanged split features and parallelize cold augmentation with deterministic bounded CPU workers.

**Architecture:** Lightweight identity/cache modules handle split selection, content keys, checksums, locks and atomic materialization. A spawn-based worker pool loads the existing CPU augmentation/frontend once per worker and returns one acoustic variant per task; the parent writes the unchanged RaggedMmap format and time shifts. Studio forwards shared cache paths and pinned manifests, and archives a private augmentation report.

**Tech Stack:** Python, ProcessPoolExecutor (spawn), NumPy, existing microWakeWord/audiomentations/librosa/RaggedMmap stack, pytest.

**Spec:** `docs/superpowers/specs/2026-10-27-augmentation-speed-design.md` (approved including per-recording seeds).

## Global Constraints
- Keep split isolation, transform settings, repeat/shift counts and model training behavior.
- Up to four CPU workers, bounded to twice that many submitted tasks, one numerical-library thread per worker, no worker GPU contexts.
- Keys include content/duplicates, split/pool/seed, policy, selected corpus fingerprints, implementation and engine/dependency identities; paths and worker count do not affect keys.
- Only complete verified cache entries are reusable. Preserve all source/retained checks and historical run outputs.
- No live deployment, restart or official training; isolated tests only.

## Review Focus
- Corrupt/partial entries and unsafe links must not become hits.
- Cancelled/failed builds never publish a usable partial entry.
- Adding negatives or changing run paths must not invalidate unchanged generated split features.
- Worker count/completion order must not change feature bytes or retain unbounded results.
- One-worker/multi-worker output must match under real augmentation and remain valid engine mmap input.

### Task 1: identities and verified cache materialization
**Files:** new `studio/augmentation_cache.py`, new `studio/augmentation_features.py`, new `tests/test_augmentation_cache.py`.
- [x] RED: keys/invalidation, split selection, duplicates, hit/miss, integrity, concurrency, link/copy, failed build and unsafe paths.
- [x] GREEN: implement content identities, per-key locks, manifests and atomic cache/run-local publication.
- [x] Run focused tests.

### Task 2: deterministic bounded workers and CLI
**Files:** new `studio/augmentation_worker.py`, new `studio/mww_augmentation.py`, replace `cli/wake_word_sample_augmenter`; tests in new `tests/test_augmentation_features.py` plus existing CLI/split tests.
- [x] RED: ordered/bounded submission, per-task seeds, preserved settings/counts, no ML import on hits, empty splits and error cleanup.
- [x] GREEN: spawn pool reused across split builds, CPU-only initializer, existing transforms/frontend, shifted mmap writer, reports and legacy argument compatibility.
- [x] Run focused tests and isolated real-engine one/two-worker equality checks.

### Task 3: Studio integration, provenance and verification
**Files:** `studio/mww_training.py`, `studio/training.py`, existing training tests, README/backlog/spec/plan.
- [x] RED: shared cache/pinned manifest forwarding, RNG-policy fingerprint invalidation, archived report.
- [x] GREEN: connect Studio and document cache disk growth/no eviction plus worker controls.
- [x] Run full Python suite, diff/syntax checks and independent review; fix important findings with regression tests.
- [x] Benchmark a bounded cold/warm/negative-only fixture in an isolated container; label limits honestly and do not deploy.

## Verification record

- Final full-suite rerun after review fixes: `.venv-test/bin/python -m pytest -q` — 581 passed,
  4 skipped, 204 subtests passed. Optional ML environments account for skips.
- `git diff --check` — clean.
- Isolated real-engine rerun after count validation, fsync and CPU quota hardening:
  one/two-worker feature bytes and keys identical; all warm splits reused without
  workers; one added negative rebuilt only reviewed-negative training features.
  Fixture wall times: one worker 9.621 s, two 3.400 s, warm 0.335 s,
  negative-only update 3.148 s. Log: `/tmp/opencode/augmentation-engine-check-final.log`.
- Small fixture timings include startup/warming effects, not full-corpus speedup
  estimates. Production/GPU benchmarking is deferred; no deployment, live restart
  or official training was performed.
- Independent read-only review found two Important issues: missing soxr/numpy-rms/
  numpy-minmax identities and noncanonical nested corpus discovery. Both now have
  regression tests and fixes. Explicit relative-sorted corpus file lists preserve
  selected-corpus precedence without relying on the dependency's os.walk order.
- Strengthened real-engine fixture passed with identical feature bytes/cache keys
  across relocated nested corpora created in opposite directory orders. Timings:
  one worker 10.242 s, two 3.406 s, warm 0.342 s, negative update 3.095 s.
  Log: `/tmp/opencode/augmentation-engine-review-fixes.log`.
- Minor provenance feedback addressed by archiving complete per-split identity
  recipes (including no-cache runs). Peak RAM and separate build/verification/
  materialization timing measurements remain deferred, not reported as measured.
- Targeted follow-up review confirmed both Important findings addressed, with no
  remaining Important issues found. Implementation remains uncommitted on
  `training-speed`.
