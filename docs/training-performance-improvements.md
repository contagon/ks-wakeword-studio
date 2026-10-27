# Training performance improvements

Investigation: 2026-10-27. Working branch: `training-speed`.

## Measurements and limits

The inspected Hey Doof run used 40,000 generated positives, batch size 16,
80,000 training steps and validation every 500 steps. Its observed stages were:

| Stage | Observed time |
| --- | ---: |
| Input snapshots, verification, staging and environment preparation | ~6 minutes |
| Augmentation and feature generation | 33 minutes 8 seconds |
| Engine initialization and first 500 steps | ~4 minutes 27 seconds |
| Subsequent training and validation through step 53,000 | ~23 minutes 31 seconds |

Within that last stage, validation consumed ~12 minutes 19 seconds and the
intervals between validation summaries consumed ~11 minutes 12 seconds (including
checkpoint overhead). Once warm, 500 training steps took ~3.1 seconds versus
~6.7 seconds per full validation pass. These are run observations, not universal
benchmarks or promises for different input sets/hardware.

Most steady resident memory was clean, file-backed mmap data: approximately
20 GiB in one snapshot, versus ~1.3 GiB anonymous working memory. Validation caused
temporary allocations that increased total RSS toward 29 GiB. Clean file-backed
pages are reclaimable; resident mmap pages are not equivalent to a Python leak.

## Completed: streaming validation

- Commit `eb6f032` streams batches from existing mmap providers, rather than
  building and shuffling complete validation feature arrays first.
- All examples, truncation/scaling, metric/reset logic, batch size 128 and the
  500-step validation interval are preserved. Evaluation order changes; aggregate
  results match within floating-point tolerances. NumPy RNG advancement is retained.
- A 20,000-example host-input fixture reduced peak tracked allocation from
  1,092.5 MiB to 10.9 MiB and preparation time from 2.86 s to 1.21 s.
- Optional real-engine checks matched all metrics against eager and bounded-array
  paths, including uint16 scaling, padding, ambient splitting and partial batches.
- This is **not** an end-to-end GPU speedup measurement. Full-data GPU timing is
  deferred while official training is active. This change is not yet deployed.

## 1. Cache and parallelize augmentation — implemented, not deployed

Target the measured 33-minute stage, without changing augmentation probabilities,
recording splits, repeat counts, feature extraction, training sampling or loss.

- Reuse completed features when audio content, split, seed, augmentation policy,
  selected corpus fingerprints and engine/frontend versions match.
- Cache generated, personal and reviewed-negative pools/splits independently:
  adding a reviewed negative must not rebuild unchanged generated positives.
- Use bounded CPU workers for independent recordings and a bounded number of
  in-flight results; keep GPU contexts out of augmentation workers (TensorFlow
  remains a CPU-side dependency of the existing microfrontend import).
- Preserve deterministic output ordering and make results independent of worker
  scheduling/count. Stable per-recording/repetition seeds require a versioned
  policy; exact waveforms will differ from the old global-random-stream policy.
- Publish cache entries atomically with integrity metadata and per-key locking;
  never reuse partial, corrupt or wrong-split entries. Do not silently mutate cached
  data, weaken retained-input checks or make cancellation leave a usable partial entry.
- Log stage timings, cache hits/misses and worker count. Benchmark cold builds,
  warm reuse, and a small negative-only update separately.

Implementation: versioned split-level cache with full file checksums, per-key
locks, atomic publication, read-only hardlink/copy materialization, and up to four
spawn workers with one numerical-library thread each. Submission is capped at
twice the worker count. The approved per-recording seed policy produces identical
one/two-worker feature bytes and changes exact waveforms relative to the old
global RNG stream. The scheduled training fingerprint is incremented accordingly.

An isolated 15-recording fixture using the real augmentation, background-noise
mixing, C frontend and mmap writer measured 9.90 s (one worker), 3.14 s (two),
0.12 s (all cached), and 2.81 s (one new training negative). The last case rebuilt
only the negative-training split; generated and held-out split features were hits.
These small-fixture times include interpreter/library/cache warming effects and
are **not** a prediction of the full 33-minute corpus speedup. No production run
or deployment has been performed for this optimization.

## 2. Store time shifts virtually — deferred

Each augmented spectrogram currently produces ten overlapping shifted feature
records. The inspected generated training feature file occupied ~29.4 GiB.
Store each acoustic variant once and derive shifted views when reading instead.
This could reduce the shifted storage component by roughly 10x, not necessarily
total run storage or wall time. Preserve logical example counts and sampling
probabilities; test both nonstreaming validation and streaming inference behavior.

## 3. Validate less frequently — deferred experiment

Moving from every 500 to every 2,000 steps removes ~75% of full validation passes.
At the observed warm rate this could save ~13 minutes per 80,000-step run.
It also assesses fewer checkpoints and can change selected-model quality. Do not
combine it with input-pipeline optimization until equivalent full-set validation
has been measured; an interim subset must not silently replace final evaluation.

## 4. GPU batching and prefetching — deferred

Overlap input work/transfers with GPU execution; benchmark larger validation
batches cautiously. Training updates were already fast, and other services held
~19 GiB of the RTX 3090's 24 GiB VRAM. A larger training batch changes optimization
behavior and must be compared at a controlled exposure/recall target, not treated
as a free performance change. Keep CPU-only systems supported and GPU fallback
explicitly opt-in.

## 5. Reduce repeated preparation work — deferred

Investigate repeated corpus hashing, retained-snapshot verification, metadata
scans and engine startup separately. Existing corpus snapshots rehash both source
and retained copies, and the worker verifies retained corpora again. Prefer
versioned immutable installations and validated manifests; do not remove integrity
checks solely because paths or modification times look unchanged.

## Rollout constraints

- Change and measure one factor at a time; do not reduce dataset coverage to look faster.
- Do not interrupt official training or redeploy without a separate request.
- Preserve split isolation and input provenance; existing failed/cancelled run
  artifacts are not disposable benchmark directories.
- Record cold/warm timings, private allocations versus file-backed RSS, peak VRAM,
  example counts and metric equivalence when making performance claims.
