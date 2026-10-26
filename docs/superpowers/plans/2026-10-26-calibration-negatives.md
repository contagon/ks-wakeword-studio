# Calibration Negatives Implementation Plan

> **For agentic workers:** Use executing-plans to implement this plan task-by-task.

**Goal:** Include ordinary validation negatives in calibration without using testing data or misrepresenting captured events as listening hours.

**Architecture:** Load positives, ordinary negatives, and ambient tracks from validation only. Keep the existing ambient-budget tiers and recall allowance; within that allowance prioritize ordinary-negative rejection, then ambient false accepts. Persist additive metrics without breaking existing metadata consumers.

**Tech Stack:** Python, NumPy, unittest/pytest, shell packaging script.

**Spec:** `docs/training-false-positive-recommendations.md`, recommendation 1, narrowed and approved in conversation.

## Global Constraints
- No augmentation, sampling, split, class-weight, or training changes.
- Testing data must not influence threshold selection.
- Ordinary-negative durations must not contribute to ambient hours.
- Report feature-track counts honestly: shifted tracks are not independent recordings.
- Missing validation negatives retain ambient-only selection with an explicit warning.

## Review Focus
- Missing validation positives or ambient data: fail clearly, never fall back to testing.
- No ordinary negatives: null rejection rate and unchanged selection behavior.
- Multiple triggers in one negative track: count one accepted event.
- Recall loss beyond the allowance: never trade it for better negative rejection within a tier.
- Artifact compatibility: preserve existing fields and export new negative metrics.

### Task 1: Validation loading and negative-aware selection
**Files:** `cli/calibrate_detector.py`, `tests/test_calibrate_detector.py`.
- [x] Add failing loader tests for retained negatives and missing-validation failures.
- [x] Add failing scoring tests for negative event counts, empty negatives, and strict cutoff comparison.
- [x] Add failing selection tests for negative rejection, recall constraints, and ambient-tier priority.
- [x] Run focused tests and observe failures.
- [x] Implement validation-only loading, negative scoring, and negative-aware ranking.
- [x] Run focused tests.

### Task 2: CLI artifacts and packaging
**Files:** `cli/calibrate_detector.py`, `cli/wake_word_sample_trainer`, `tests/test_calibrate_detector.py`, `docs/training-false-positive-recommendations.md`.
- [x] Add failing CLI integration test using fixture inference and feature data, asserting JSON metrics and selected settings.
- [x] Infer ordinary negatives and persist rejection/count metrics plus track-unit caveat; forward metrics into packaged metadata.
- [x] Document implementation status and remaining measurement limitations.
- [x] Run focused tests, full pytest suite, shell syntax check, and diff checks.

No commits or retraining are requested.

## Execution record

- Baseline: 508 passed, 1 skipped, 194 subtests passed.
- Red/green: seven focused failures before core changes; two CLI failures before wiring; one packaging failure before forwarding metrics; final focused run 16 passed.
- Final suite: 519 passed, 1 skipped, 194 subtests passed, two existing dependency deprecation warnings.
- `bash -n cli/wake_word_sample_trainer` and `git diff --check` passed.
- Independent read-only review found no Critical, Important, or Minor issues.
- Review boundary: real-engine inference and real-world quality remain unverified; fixture tests validate selection and artifact behavior, not deployment gains.
