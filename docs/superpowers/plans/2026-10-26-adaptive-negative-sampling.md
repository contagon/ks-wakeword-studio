# Adaptive Negative Sampling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give wake words with more independent personal-negative training families a larger, bounded share of negative training draws.

**Architecture:** Count unique negative training families from the retained Studio manifest and pass that count through the existing shell trainer to the Python configuration generator. Normalize the negative sampling weights there, retaining the effective allocation in the training YAML and command logs. No frontend changes or new dependencies.

**Tech Stack:** Python, Bash, pytest/unittest, existing YAML training configuration.

**Spec:** `docs/training-false-positive-recommendations.md`, section 3, agreed adaptive refinement only. Other recommendations are out of scope for this change.

## Global Constraints

- Hardcoded minimum personal share 0.10, maximum 0.40, midpoint 200; no UI controls.
- For `n > 0`, target personal share is `0.10 + 0.30 * n / (n + 200)`.
- Count distinct `family_id` values for negative training audio only; duplicates, positives and held-out negatives must not inflate the count.
- Keep combined negative sampling weight 37 whenever a usable negative training provider exists.
- Preserve downloaded providers' relative weights (12:12:5 for all three standard pools), zero evaluation weights, existing positive weights and all loss penalties.
- Preserve explicit dataset selection; never silently add downloaded datasets.

## Review Focus

- Zero personal training families: allocate all negative weight to selected downloaded training providers.
- Personal-only training: allocate all negative weight to personal negatives rather than enforcing an impossible downloaded share.
- Downloaded subsets: renormalize only selected positive-weight downloaded providers; evaluation providers remain zero.
- Missing family count with usable personal-negative training features: fail clearly instead of silently using the old fixed ratio.
- Unchanged scheduled inputs: a new adapter version must invalidate fingerprints from the old weighting.

## Task 1: Implement and verify adaptive sampling end to end

**Files:**
- Modify `studio/mww_training.py`: manifest family counting and trainer argument.
- Modify `cli/wake_word_sample_trainer`: accept/forward internal family-count argument; distinguish usable training features from evaluation-only pools.
- Modify `cli/dataset_config.py`: hardcoded curve, normalization, validation and retained allocation metadata/log output.
- Modify `studio/training.py`: increment fingerprint adapter version from 3 to 4.
- Modify `tests/test_studio_positive_sampling.py`: update shell configuration fixture and retain positive sampling coverage.
- Modify `tests/test_studio_training_cli.py`: verify manifest counting and adapter-to-trainer argument propagation.
- Modify `tests/test_studio_training.py`: prove old adapter-version-3 fingerprints are invalidated.
- Create `tests/test_studio_negative_sampling.py`: numerical allocation and edge cases.
- Update `docs/training-false-positive-recommendations.md`: mark adaptive sampling implemented after verification; leave other recommendations pending.

**Interfaces:**
- `negative_training_family_count(manifest: dict) -> int` in `studio/mww_training.py` counts distinct training-negative families.
- Internal trainer argument `--reviewed-negative-families=<integer>` flows from Studio through Bash to `dataset_config.py`.
- `personal_negative_share(family_count: int) -> float` in `cli/dataset_config.py` returns zero at count zero and the agreed curve otherwise; rejects negative counts.
- Training YAML retains a `negative_sampling` metadata mapping with family count, target share, effective share and combined negative weight. Engine feature rows retain their existing schema.

- [ ] **Step 1: Write failing tests.** Exercise actual configuration generation and shell forwarding, not source-string assertions. Pin personal shares at 29 families (`0.13799126637554585`), 200 (`0.25`) and 276 (`0.2739495798319328`). Check monotonicity and upper bound at a large count, combined weight 37, unchanged 2/3 positive weights and 1.25 personal loss penalty. Cover zero families, duplicate family IDs, held-out negatives, downloaded subsets, evaluation-only personal pools, personal-only selection, and missing/negative count errors. Extend the fingerprint regression to compare adapter version 3 against the new snapshot.
- [ ] **Step 2: Verify red.** Run `.venv-test/bin/python -m pytest -q tests/test_studio_negative_sampling.py tests/test_studio_positive_sampling.py tests/test_studio_training_cli.py tests/test_studio_training.py`; confirm failures expose the absent adaptive behavior.
- [ ] **Step 3: Implement.** Use the interfaces above. For mixed pools, personal weight is `37 * target_share`; distribute the remaining weight proportionately among selected downloaded training providers. With only one kind of negative pool, assign it all 37. Retain evaluation-only feature providers at zero sampling weight. Do not manufacture providers if neither training pool exists; preserve existing validation responsibilities. Reject missing/negative family counts when personal training features are usable, and reject inconsistent positive counts without usable personal training features. Log family count and target/effective shares. Increment adapter fingerprint version to 4.
- [ ] **Step 4: Verify green.** Rerun the focused command, `just test`, `just e2e`, `bash -n cli/wake_word_sample_trainer`, and `git diff --check`. Inspect generated YAML in tests for effective ratios and unmodified penalties. No GPU training or deployment is authorized by this plan.
- [ ] **Step 5: Review and document.** Request a read-only review of the implementation diff; resolve blocking findings. Update the recommendations document to distinguish this implementation from untested real-world effectiveness.
- [ ] **Step 6: Commit.** Commit only the adaptive-sampling changes and related tests/docs on `false-positives`. Do not merge or push without a separate request.

## Execution Checklist

- [x] Create `false-positives` from merged `main`.
- [x] Inspect the current adapter, config generator and training tests.
- [x] Write and self-review this implementation plan.
- [x] Confirm execution approach and whether to work in an isolated worktree (inline on `false-positives`, as approved).
- [ ] Complete Task 1 and report verification evidence.
