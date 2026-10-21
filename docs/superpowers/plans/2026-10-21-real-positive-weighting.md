# Real Positive Sampling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give real positives 60% and synthetic positives 40% of positive training draws when both have training data, with safe single-pool fallback.

**Architecture:** Reuse the existing personal-positive feature pool (weight 3) alongside the synthetic-positive pool (weight 2). Route Studio positive samples into the personal directory and generated-batch positives into the generated directory, retaining immutable family split assignments. Empty split handling must not attempt to construct empty mmap files; the upstream loader already excludes providers with zero training examples from sampling.

**Tech Stack:** Python, Bash, unittest/pytest, microWakeWord mmap feature generation.

**Spec:** User-approved design in chat, 2026-10-21: separate real positives, use 60/40 real/synthetic positive sampling, handle absent data properly.

## Global Constraints

- The 60/40 ratio is among positive training draws, not the entire batch.
- Real positives include labeled satellite recordings, microphone captures, and imported positive samples; generated-batch positives remain synthetic.
- Preserve negative sampling weights and all loss penalties.
- Preserve existing family split assignments and held-out data; never move evaluation audio into training to fill an empty pool.
- No database migrations, historical artifact changes, data deletion, deployment, or retraining.
- Leave the user's existing `justfile` modification untouched.

## Review Focus

- Synthetic-only inputs must train without a personal pool.
- Real-only inputs must train without requiring generated feature files.
- A pool with validation/testing audio but no training audio must remain available for evaluation without being sampled for training.
- Sparse per-source splits must not cause empty mmap generation failures.
- Combined absence of required positive splits must retain existing actionable preflight errors.

### Task 1: Route Studio positives into distinct pools

**Files:** `studio/legacy_training.py`, `tests/test_studio_training_cli.py`.

**Interfaces:** Keep `stage_inputs(manifest, root)` returning the split-manifest path. Stage positive entries with a non-null `batch_id` in `work/wake_word_samples`, other positives in `work/personal_samples`, and negatives in `work/reviewed_negatives`. Missing `batch_id` is treated as a real sample for compatibility. Pass the real personal directory to the augmenter instead of `empty-personal`.

- [x] Add staging tests covering mixed inputs, real-only, synthetic-only, negatives, and unchanged split/hash verification. Update the CLI integration test to assert the personal directory and flag.
- [x] Run `python -m pytest tests/test_studio_training_cli.py -q`; confirm new expectations fail before implementation.
- [x] Implement the routing and CLI argument changes without changing manifest schema or split assignment.
- [x] Run the targeted tests and confirm they pass.

### Task 2: Handle empty positive pools and sparse splits

**Files:** `cli/wake_word_sample_augmenter`, `cli/wake_word_sample_trainer`, `tests/test_studio_training_cli.py`, optionally `tests/test_studio_positive_sampling.py` for focused fixtures.

**Interfaces:** Preserve feature names `wake_word_samples_augmented` and `personal_augmented_features` and weights 2.0 and 3.0. For explicit split manifests, skip mmap generation when a particular source/split has no WAVs. Retain feature-provider entries needed for evaluation even if their training split is empty. Do not require synthetic features when real features provide positive training data. Keep legacy non-manifest behavior compatible.

- [x] Add CPU-only tests using the actual augmenter functions and trainer configuration section with lightweight feature-generation fixtures. Assert exact weights, 3/(3+2)=0.6, and unchanged negative weights/penalties.
- [x] Cover synthetic-only, real-only, mixed, empty per-source evaluation splits, evaluation-only real/synthetic pools, and no usable positive training pool. Verify existing aggregate preflight validation still rejects missing required positive splits.
- [x] Run new tests and confirm failures before implementation.
- [x] Implement minimal optional-pool configuration and empty-split handling. Use actual feature availability rather than directory existence alone where determining whether training positives exist.
- [x] Run `python -m pytest tests/test_studio_training_cli.py tests/test_studio_training.py tests/test_studio_datasets.py -q` plus any new test module, then `bash -n cli/wake_word_sample_trainer`.
- [x] Run the full test suite; inspect the diff for unintended data, schema, or negative-training changes. Report verification and note that existing models are unchanged until a new training run.

## Execution notes

- Execute inline unless the user chooses delegation. Do not create commits unless requested.
- Tests should not launch GPU training or modify the live dataset.
