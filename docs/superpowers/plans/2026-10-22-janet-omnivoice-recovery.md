# Janet OmniVoice Recovery Implementation Plan

> **For agentic workers:** Use the executing-plans skill to implement this plan task-by-task. Track progress here. Execute step 1 first; steps 2–4 are follow-up work, not part of the initial recovery.

**Goal:** Recover the nearly complete Janet corpus without losing accepted audio, then improve reliability and investigate OmniVoice's duration-sensitive yield.

**Architecture:** Preserve the failed job as immutable evidence and make a checksummed copy of its retained clips. Submit recovery as a new, normally owned generation job; reapply unchanged QA, generate only the shortage, and publish through Studio's existing atomic batch-validation path. Keep yield-policy changes and duration experiments separate from recovery.

**Tech Stack:** Python, pytest/unittest, SQLite, Studio's durable job queue, Docker, OmniVoice, Silero VAD, FFmpeg.

**Spec:** The approved findings and recommendations in this conversation, summarized below.

## Evidence and constraints

- Latest source job: `8cdc1396c4bd4f0d9a699502e788e9bb`, Janet (`en`), OmniVoice only, 20,000 requested.
- Failed after 3½ hours with `Only 19953 of 20000 samples passed normalization and QA.`
- 108,365 candidates: 19,953 accepted, 77,621 DC-offset rejections, 7,698 static/noise, 3,064 no speech, 29 other noise rejections.
- Retained clips: `/data/studio/jobs/8cdc1396c4bd4f0d9a699502e788e9bb/generation/.wake_word_samples.build/final` in `ks-wakeword-studio`.
- Previous failed job `56035fa5871b4de4a855b17045aacf68` retained 19,960 clips; do not mix attempts or silently substitute it.
- Successful Qwen3 Janet dataset: `36a1c835c5e34b0893705a48dba06e9d` (20,000 clips).
- Current English decoding already uses position temperature 0 and class temperature 1.
- Source clips, failed job history, QA results, and diagnostics must not be modified or deleted.
- No QA loosening, DC-offset repair, unselected providers, or silent partial success.
- No raw SQL marking a failed job complete; normal queue ownership, cancellation, canonical audio validation, and atomic batch admission still apply.
- Recover on the current branch, as requested. Do not commit, merge, or push without a separate request.

## Review focus

1. Corrupt, symlinked, duplicate, or missing snapshot audio must fail closed before source data can be lost.
2. Recovery metadata must match the source workspace, phrase, recipe, and selected provider.
3. Rejected retained clips must not bypass QA; fresh top-ups must also pass normal QA and deduplication.
4. Recovery failures/cancellation must leave the source and snapshot intact and publish no partial dataset.
5. Existing generation and previews must retain their normal behavior when recovery is not requested.

## Step 1: Preserve and recover the accepted clips

**Files:** `studio/generation_recovery.py` (snapshot/admin admission), `cli/studio_recover_generation.py` (local admin command), `studio/generation.py` (pass explicit recovery manifest), `cli/tts_generate_samples.py` (revalidate/copy retained clips and top up), and recovery-focused tests.

**Interfaces:** `enqueue_recovery(service, word_id, source_job_id)` creates a new queued generation batch with the original recipe and an opaque snapshot ID. `--recovery-manifest=PATH` explicitly opts the generator into checksummed recovery. Snapshots contain copied final WAVs, original recipe/phrase, source job ID, hashes, and the next unused direct-candidate index.

- [x] Confirm the source is a failed, unpublished OmniVoice-only generation job and no GPU operation would be interrupted by deployment.
- [x] Write failing tests for snapshot preservation/integrity, source admission, explicit generator argument propagation, retained-file QA, exact-count top-up, deduplication, and unchanged source files on failure.
- [x] Run the tests and observe the missing recovery behavior fail.
- [x] Implement snapshot copying with unique, non-overwriting destinations; validate source metadata again before admitting the new job. Never edit the original row or recipe selection.
- [x] Add generator recovery that verifies hashes/configuration, reruns existing acoustic QA, copies accepted retained bytes into its own build directory, and seeds deduplication/attempt counters. Request at least 128 fresh candidates per recovery-only batch to avoid tiny geometric top-ups; leave normal-run yield policy unchanged for step 2.
- [x] Run focused tests and the full Python suite; inspect the diff and perform an independent code review.
- [x] Deploy the tested recovery support only when no active GPU job is affected. Preserve a rollback copy of replaced runtime code if using a narrow deployment rather than rebuilding.
- [x] Submit recovery through the normal queue; monitor the new job to completion or report the exact blocker without discarding artifacts.
- [x] Verify 20,000 admitted clips, exact/canonical uniqueness, normal batch visibility, foreign-key integrity, unchanged original clip hashes, and a retained snapshot manifest. Record new job/snapshot IDs and verification results below.

## Step 2: Make recovery sizing yield-aware

**Files:** `cli/tts_generate_samples.py`, recovery/generator tests, and user-facing failure messages as needed.

**Interfaces:** Derive refill candidate budgets from observed normalized unique accepts / generated candidates, not acoustic accepts alone. Keep provider boundaries and normal QA unchanged.

- [x] Add failing tests reproducing approximately 18.4% yield with 20,000 requested, zero-yield providers, duplicate-heavy output, and exceptions.
- [x] Replace the fixed 1.5× refill sizing with observed-yield sizing plus a documented safety margin and explicit candidate/time budgets; stop on repeated no progress.
- [x] Report retained count, shortage, failure reason, and recovery guidance rather than only a generic child failure.
- [x] Verify bounded behavior, exact-count completion when yield permits, cancellation, and unchanged provider provenance; run the full suite and review.

## Step 3: Investigate duration-sensitive generation

**Files:** A standalone benchmark under `cli/` or `docs/` and `docs/omnivoice-decoder-investigation.md`; change production durations only after evidence supports it.

**Interfaces:** Controlled benchmark inputs and results must record model revision, decoder settings, random seeds, requested/actual duration, batch size, generation/QA time, rejection reasons, hashes, and semantic spot-checks.

- [ ] Benchmark Janet at 0.845, 0.937, 1.030, 1.123, and 1.215 seconds using matched seeds and unchanged production QA, with batch-size 1 and 8 controls.
- [ ] Confirm the existing observation: 1.030-second candidates passed about 76%, versus 2.6–5.1% for the other four buckets, in two production attempts. Treat this as correlation until controls resolve duration versus batching/decoding effects.
- [ ] Check accepted audio for correct Janet pronunciation, byte/canonical duplicates, and reasonable speaker diversity; include other phrases before generalizing.
- [ ] If validated, add regression tests and a narrowly scoped duration policy, update the generator version, and document measured yield and limitations. Otherwise document the unresolved cause and next experiment.

## Step 4: Keep the successful Qwen3 corpus available

- [x] Verify dataset `36a1c835c5e34b0893705a48dba06e9d` is still complete and contains 20,000 clips.
- [x] Explain its availability as the interim training source; do not change the user's dataset selection or start training without authorization.
- [x] After OmniVoice recovery, verify both provider datasets remain independently selectable and correctly attributed.

## Execution record

- **Step 1 complete and live-data verification passed.** Steps 2–4 remain follow-up work; no yield-policy change or duration benchmark has been performed.
- Baseline Python suite: 431 passed, 1 skipped. After initial recovery implementation: 438 passed, 1 skipped; one pre-existing Starlette/AnyIO deprecation warning.
- Independent preservation backup created in the data volume at `/data/studio/recovery-backups/8cdc1396c4bd4f0d9a699502e788e9bb-20261022T191104Z`: 19,953 copied WAVs (638,714,734 bytes), per-file SHA-256 manifest, original diagnostics, and an online SQLite backup. Original job remains failed and unchanged.
- User authorized deploying recovery support via a brief idle-container restart and submitting the new recovery job, after the safety review passes.
- Docker image built successfully. Existing database and runtime schema are both version 19; no schema migration is pending.
- Review fix pass: bound snapshot workspace/source/full recipe to the admitted job; added recovery-specific canonical deduplication, failure, and cancellation tests; disabled ordinary cache reuse for explicit recovery. Full Python suite after fixes: 442 passed, 1 skipped, 192 subtests passed; existing warning unchanged. `git diff --check` passed.
- Redeployed the rebuilt image after checking the queue was still empty; Studio readiness endpoint returned HTTP 200. Previous image retained as `ks-wakeword-studio:pre-janet-recovery-20261022`.
- New recovery job: `88d05fba85334695a8b44f9a16ae2b23`; snapshot: `/data/studio/recovery/dc3cc07962424e678f120fc2ce9f097f`. Completed normally at `2026-10-22T19:20:40.563915+00:00` (started `19:14:31`, about 6 minutes).
- Retained QA accepted 19,906/19,953 clips; 47 retained clips were rejected on recheck. Generated 525 fresh candidates across four batches; normalized 94 accepted replacements/top-ups to reach exactly 20,000. QA limits and duration policy were unchanged.
- Final verification: SQL admission count and canonical-hash uniqueness both 20,000; positions 0–19,999; output WAV canonical hashes match admitted records; batch visible as complete through the Studio API; foreign-key check clean.
- Rehashed all 19,953 original and snapshot WAVs against the preservation manifest after completion; all unchanged. Original failed job row is byte-for-byte equivalent to its backed-up fields. Both the preservation backup and recovery snapshot remain on disk.
- Existing Qwen3 dataset remains complete at 20,000 clips. Recovered OmniVoice dataset is **not selected for training**; no training or dataset-selection changes were made.
- Choices made: new queued job plus independent snapshot instead of rewriting failed history (extra disk/job record); explicit recovery bypasses the ordinary cache (extra validation on direct reruns). Pronunciation/diversity assessment remains part of step 3.
- Follow-up authorized: execute steps 2–4 without redoing recovery. Current branch and uncommitted changes retained.
- Step 2 policy: maximum 20,000 candidates per round, total `max(1024, 12 × samples)`, 20% yield margin, 1% minimum yield estimate, 128-candidate refill floor, 3 consecutive no-progress rounds per provider. Six-hour soft deadline admits no new rounds after expiry; current owned subprocess finishes normally. CLI overrides available for total candidate and time budgets. MOSS refills exclude already-accepted external carrier IDs.
- Step 3 initial benchmark refused the busy GPU safely: user-started training `070f0836a81b482d96c330952f6d7dcd` was active. Retried with a normal queued benchmark and six-hour wait; no interruption/restart. Artifacts will be under `/data/studio/benchmarks/janet-duration-20261022-seed1-run2` (48 takes per duration/batch-size condition, seed 20261022).
- Step 4 verification: both provider datasets are complete with 20,000 distinct normalized hashes; all 40,000 canonical blob files rehashed successfully. Both appear independently through the direct-source API with correct provider labels. Both were selected by the user when checked during their manual training job; verification made no selection changes and started no training.
- **Step 2 complete (code and tests only; not yet deployed to the running container).** Added tests for selected-provider-only refills with stalled-provider retirement, time-budget behavior, and the real `ProcessRunner` failing an incomplete child as `generation_incomplete` with safe retained/missing log text. Studio cancellation is unchanged (owned child process group), covered by existing generation cancellation tests.
- Review fixes: one candidate count admitted per round (deadline can no longer change it mid-round); hybrid MOSS refills skip carriers of accepted MOSS takes and never clone MOSS outputs; disk/OOM/etc. guidance takes precedence over `generation_incomplete` when every round failed; README/comment note the Qwen3-first top-up lean. Re-review verdict: ready. Full suite: 463 passed, 1 skipped, 194 subtests; `git diff --check` clean.
- Known, accepted minor limits: an exception inside normalization can leave stale dedup/source bookkeeping for that round; yield is slightly underestimated when normalization stops at its limit (only makes requests larger); `engine_error` is judged from each provider's last round.
- **Step 3 on hold at user request.** Last benchmark attempt (`c63f8490d95e433d95d4d13fbd488956`) failed with `handler_failed`; the benchmark review findings (sequential child attachment, owned normalization, SQLite startup/enqueue retries, failed-attempt timing) remain unaddressed.
