# Training false-positive findings and recommendations

Date: 2026-10-26

Both **Hey Doof** and **Janet** are producing frequent real-world false positives. This document preserves the initial investigation, proposed improvements, and subsequent agreement on adaptive negative sampling. Adaptive sampling is now implemented on `false-positives`; the other recommendations remain pending. No real-world improvement has yet been validated through retraining or replay of the offending audio.

## Negative-data mix at the initial investigation

Before adaptive sampling, with all three downloaded training datasets selected, the configured sampling weights were:

| Negative source | Sampling weight | Share of negative draws |
| --- | ---: | ---: |
| Personal/reviewed negatives | 8 | 21.6% |
| Downloaded speech | 12 | 32.4% |
| Downloaded dinner party | 12 | 32.4% |
| Downloaded non-speech | 5 | 13.5% |

Downloaded dinner-party evaluation has weight zero and is not sampled for training. Source: `cli/dataset_config.py` and `studio/datasets.py`.

That ratio was fixed by provider sampling weights, not dataset sizes. Collecting more personal negatives increased diversity within their allocation but did not increase their share of draws. The adaptive implementation below replaces these fixed weights.

Other existing settings:

- Personal negatives have a 1.25× sample loss penalty compared with downloaded negatives.
- The negative class has a 20× class weight; the positive class has weight 1.
- With both positive pools and all negative pools present, approximately 88% of training draws are negative.
- Generated and personal positives have sampling weights 2 and 3, respectively: personal recordings receive 60% of positive draws when both training pools exist.
- Recorded audio is assigned stable family-based splits targeting 80% training, 10% validation, and 10% testing. Actual counts vary, particularly for small datasets.

### Latest archived runs inspected

| Model | Run manifest date | Personal negative training | Validation | Testing |
| --- | --- | ---: | ---: | ---: |
| Hey Doof | 2026-10-25 | 276 | 31 | 32 |
| Janet | 2026-10-24 | 29 | 2 | 3 |

These are archived input counts, not necessarily the current sample inventory. They count recordings; independent family counts may differ.

## 1. Correct the calibration blind spot

**Finding:** `cli/calibrate_detector.py`, in `_load_eval_sets`, selects positive examples from ordinary validation data and measures false accepts using `validation_ambient`. It filters out the ordinary validation negatives. Reviewed negatives are generated under `validation` and `testing`, not their ambient counterparts, so they do not influence detector threshold calibration.

The latest inspected Hey Doof calibration reported approximately **0.207 false accepts/hour over 9.67 hours** of downloaded ambient audio. Its **31 personal validation negatives** were excluded from that calibration. Good downloaded-corpus results therefore do not establish good rejection of captured deployment confusions.

### Proposed improvements

- Choose detector thresholds using both downloaded and representative local continuous negative audio, reporting false accepts/hour.
- Also evaluate held-out captured false positives, reporting an event-level rejection rate.
- Preserve a separate untouched test set; do not tune thresholds on it. The existing calibration fallback to testing should not replace a proper validation set.
- Do not treat trigger-centered captures as representative hours of normal listening: they are deliberately enriched for difficult events.

## 2. Preserve clean hard negatives

**Finding:** `cli/wake_word_sample_augmenter` uses the same augmentation pipeline for positives and reviewed negatives, including:

- Background noise with 70% probability, at 5–10 dB SNR when background corpora are enabled.
- Room impulse responses with 70% probability when the RIR corpus is enabled.
- Gain, pitch, distortion, EQ, filtering, and colored-noise transformations.

Captured false positives already contain the actual microphone and room characteristics. Adding more noise or reverberation may obscure the feature that originally fooled the detector. This is a hypothesis to test, not a measured cause.

### Proposed improvements

- Retain an unmodified feature version of every reviewed hard negative.
- Add lighter augmented variants alongside the clean versions rather than transforming every version aggressively.
- Evaluate on clean, unmodified held-out captures as well as any robustness variants.

## 3. Adjust personal-negative sampling without changing class balance

### Initial experimental proposal

Compare the existing approximately 22% personal-negative share with approximately 35%, retaining broad downloaded speech coverage. With downloaded weights unchanged, changing the personal-negative weight from 8 to 16 would yield 35.6% personal negatives.

This was an initial experiment suggestion, not a guaranteed fix. It also changes the overall negative-versus-positive sampling balance, so the subsequent adaptive proposal below is preferred: keep the combined negative weight constant.

Janet has relatively few personal training negatives and is particularly vulnerable to memorizing them. Compare runs at matched positive recall rather than judging only by lower false accepts. Do not simultaneously increase the already-large negative class weight.

### Agreed refinement: hardcoded adaptive ratio

**Implementation status:** implemented on `false-positives`, with automated configuration, family-counting, shell-forwarding and fingerprint regression tests. This is not yet evidence of fewer deployment false positives.

Use a smooth bounded curve based on the number of **independent personal-negative training families**, not augmented feature counts:

```text
if n == 0:
    personal_share = 0
else:
    personal_share = min_share + (max_share - min_share) * n / (n + midpoint)
```

Agreed hardcoded constants:

```text
min_share = 0.10
max_share = 0.40
midpoint = 200
```

No UI controls or user-facing configuration are requested. The earlier midpoint suggestion of 100 was superseded by the user's choice of 200.

Illustrative results, assuming each recording is an independent training family:

| Personal-negative training families | Personal share | Downloaded share |
| --- | ---: | ---: |
| 0 | 0% | 100% |
| 29 (Janet illustration) | 13.8% | 86.2% |
| 200 | 25.0% | 75.0% |
| 276 (Hey Doof illustration) | 27.4% | 72.6% |

The curve approaches 40% without exceeding it. Counting families avoids inflating the allocation with duplicates or augmented copies. Sample count remains only a proxy for diversity, not proof of an optimal ratio.

Keep the existing combined negative sampling weight of 37 constant for the all-pools case:

```text
personal_weight = 37 * personal_share
downloaded_total_weight = 37 * (1 - personal_share)
```

Allocate the downloaded total using the existing **12:12:5** proportions for speech, dinner party, and non-speech. Loss penalties remain unchanged. With a subset selected, renormalize only those downloaded training providers in their original proportions. With no personal training negatives, downloaded providers receive all 37 weight; with only personal training negatives, they receive all 37 (100% effective personal share). Evaluation-only providers remain at zero. No selected negative training pools means no invented fallback providers.

The `negative_sampling` section of each new run's retained `config/training_parameters.yaml` records the independent training-family count, target personal share, effective personal share and total negative weight. The command log reports the same allocation. A missing family count for personal training features, or a positive count without those features, fails clearly. The adapter fingerprint version is incremented so unchanged scheduled inputs can retrain under the new policy.

## 4. Increase genuine augmentation diversity

**Finding:** training produces two independently augmented versions per recording. Each version then produces ten small time-shifted feature variants. These shifts help alignment but are not twenty independently augmented acoustic examples.

### Proposed improvements

- Test more independently augmented versions, especially for personal recordings.
- Retain clean examples alongside the augmented versions.
- Prefer collecting genuinely different confusions over endlessly augmenting a small set of events.

## 5. Align checkpoint selection with deployment objectives

**Finding:** the trainer selects `best_weights` using `average_viable_recall`. In the inspected installed engine, this metric averages recall over an ambient false-accept range up to **2/hour**, while final calibration targets **0.25/hour**. These are different objectives.

The aggregate reported positive recall is also overwhelmingly synthetic. For example, the latest Hey Doof calibration used 39,570 positive feature tracks, with only four underlying personal validation recordings versus 3,953 synthetic validation recordings; the ten shifts per recording are not independent examples.

### Proposed improvements

- Compare candidate checkpoints using quantized streaming inference at the intended deployment false-positive budget.
- Include held-out personal hard negatives in those comparisons.
- Report real-recording recall separately from synthetic recall.
- Measure false-positive improvements at matched recall so an effectively disabled detector is not mistaken for a better model.

## Recommended experiment order

1. Correct calibration's exclusion of personal negatives and establish useful held-out metrics.
2. Preserve clean hard negatives and compare lighter augmentation against the current pipeline.
3. Evaluate adaptive negative sampling with the agreed 10–40% bounds and midpoint 200.
4. Test additional independent augmentation diversity and deployment-aligned checkpoint selection.

Change one factor at a time where practical. Do not start by gathering more synthetic positives, increasing training steps, or increasing negative loss weights: the evidence does not yet establish those as the limiting factors.

## Investigation limits

The findings above are based on repository code, the installed microWakeWord engine, and retained training manifests/configurations/calibration artifacts. No offending deployment audio was replayed through the deployed detector, and no retraining experiment was run. These are evidence-backed gaps and testable improvements, not a confirmed explanation for every false activation.
