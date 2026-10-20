# Separate provider datasets and explicit MOSS references

## Intent and agreed behavior

Each selected direct provider (OmniVoice, Qwen3-TTS, Piper) must create its own
generated dataset, with its own training-selection checkbox. MOSS is a separate
voice-cloning operation that can use multiple previously generated datasets or
run automatically after the direct providers selected in the same submission.

The user confirmed **per-provider counts**: requesting 20,000 with Qwen and
OmniVoice selected produces two 20,000-sample datasets, not two 10,000-sample
shares. MOSS has a separate requested count and creates another independent
dataset. Earlier fixes and UI changes are checkpointed in commit `eb3d964`.

## Boundaries

- Preserve strict acoustic QA, normalization, exact-duplicate rejection, and
  existing internal batching. No UI batch-size control returns.
- Use the existing serialized GPU queue, ownership checks and cancellation.
  This feature does not add concurrent GPU inference or a warm-model service.
- Never start an unselected direct provider to obtain MOSS references. Never
  substitute another provider's audio into a provider-labelled dataset.
- Do not rewrite or attempt to split historical mixed-provider datasets.
- No live deployment, real dataset generation, or modification of mounted
  production data is required for implementation/testing.

## Submission and count model

One submission atomically creates one existing `generation` job/batch per
selected direct provider. Each child freezes the phrase, language, accent,
internal batch size and requested count. Its recipe has exactly one engine.
Each output is published independently and remains useful if another child
fails. Cancelling one child does not cancel its siblings.

A shared **Samples per provider** value applies to all checked direct providers;
an independent **MOSS samples** value applies to MOSS. This is an implementation
choice, rather than adding individually different counts for every direct model.
Show the prospective dataset count and total requested samples before submission.
Do not automatically select new datasets for training; preserve explicit training
selection. Reference selection and training selection are different operations.

The new operation returns a submission ID plus all child jobs and batch IDs.
Implement an additive `POST /wakewords/{word_id}/generation/submissions` API,
keeping the current `/generation/jobs` API and its legacy ensemble behavior for
existing callers. New Studio submissions use only the new operation. Saved
recipe readers accept missing newly added fields with backward-compatible
defaults. Historical batch recipes and queued legacy jobs retain their semantics.

## MOSS source modes

### Selected completed datasets

Choose one or more seed datasets. MOSS can run with no direct provider selected.
Eligible datasets are complete and committed, contain audio, belong to the same
workspace, match the frozen phrase and chosen language, and have metadata proving
they contain only direct-provider outputs. MOSS-generated datasets are excluded
to avoid chains of synthetic cloning. Historical direct-only datasets can qualify;
ambiguous historical mixed datasets do not.

The source picker is separately paginated/lightweight and must not require
shipping every audio ID to the browser. Preserve selected source IDs across
pages. Bound a submission to 100 distinct source dataset IDs, rejecting duplicate,
unknown, ineligible, cross-workspace or mismatched sources before enqueuing.

Freeze the selected IDs at admission. Deletion is already blocked while the
workspace has active jobs; revalidate readiness and content when MOSS starts.
Source checkbox changes or training deselection after submission do not alter
the admitted operation. Deleting sources after MOSS completes must not destroy
already-published derivatives or their retained parent audio.

### Generate after current selection

This mode requires MOSS enabled and at least one direct provider selected.
Within the same admission transaction, queue direct-provider child jobs first,
then MOSS referencing exactly those newly created dataset IDs. Store the IDs
durably, rather than depending on an in-memory completion callback. Existing
FIFO ordering on the shared GPU resource runs the producers first; MOSS still
checks all its dependencies before invoking any subprocess.

MOSS never uses unrelated old jobs or whichever dataset happens to finish most
recently. If any required producer failed, was cancelled or interrupted, MOSS
fails without GPU inference with an actionable trusted source-readiness message.
Successful direct datasets remain available. No automatic reruns, partial source
substitution, or group-wide cancellation are introduced.

The two modes are mutually exclusive; after-current mode does not silently mix
in manually selected old datasets.

## Reference allocation and output lineage

Collect eligible source audio by normalized content hash, deduplicating clips
that appear in more than one selected dataset. Balance reference allocation
across source datasets rather than consuming only the first dataset. Materialize
approved canonical WAVs into the MOSS job's scoped scratch directory using
validated blob identities and existing no-symlink filesystem protections.

Require at least as many distinct references as requested MOSS outputs. Validate
this at admission for completed sources and again at execution for after-current
sources (whose prospective count can be checked up front). Show actionable
guidance to select more sources or reduce the MOSS count when insufficient.
Use distinct references within a candidate pass; refill attempts may reuse the
approved direct references with fresh seeds. They must never use previously
generated MOSS takes as replacement carriers. Preserve the existing 25% MOSS
candidate allowance, capped by the available pool for that pass.

The CLI gains an explicit reference-manifest input for MOSS-only jobs. The
manifest is created by the server; the API never accepts arbitrary filesystem
paths or caller-chosen audio IDs. MOSS cannot fall back to another engine if
its output fails QA. CLI legacy ensemble behavior remains available to legacy
callers that do not use the explicit-reference path.

Carry each accepted output's source audio ID through candidate generation,
qualification, normalization and final numeric renaming. Before publication,
validate that every final source ID belongs to the approved pool. Persist its
`audio_records.parent_id` and inherit the parent's `family_id`, using the
existing family/split and ancestor-retention machinery. Keep a canonical hash's
existing family assignment when deduplication finds one; if this requires
reconciling incompatible existing families, fail safely rather than silently
creating conflicting split identities. Exact speaker independence is not claimed.

Source dataset IDs and source-audio mappings provide provenance. A completed
MOSS dataset remains a separate training input and is independently selectable.

## Preview behavior

Direct-provider previews remain single-sample operations with no dataset or
saved-recipe side effects. A MOSS preview requires selected, completed references
and uses one approved source. It does not require generating a new direct corpus.
After-current mode cannot preview not-yet-generated references: disable that
preview with an explanation until the user selects completed sources instead.
Use the same reference validation and safe materialization as generation.

## Presentation and refresh

Clearly label each new dataset with its provider, actual sample count, time and
state; MOSS rows additionally identify source datasets. Historical mixed rows
remain labelled as mixed/legacy rather than being assigned invented provenance.
Track every returned child in the existing global queue and refresh the dataset
list as each completes, even while the queue drawer is closed. Maintain current
workspace-switch abort/stale-response protection for submissions and source lists.

Preserve existing independent training-selection and deletion controls. A failed
or queued child never becomes selectable as a completed training dataset.

## Compatibility and architectural approach

Extend immutable recipe JSON with defaults for source IDs, MOSS source mode and
MOSS count. A submission ID can live in each child job's payload, so no general
job-dependency framework or SQL batch/job identity migration is necessary.
Use the existing one-batch-per-job relationship and existing parent/family fields.
Keep orchestration in focused generation-service helpers rather than expanding
the generic queue with provider-specific logic.

Legacy saved MOSS-only recipes without sources remain readable but cannot be
submitted through the new flow until valid references are selected. The new UI
must never admit the current empty-reference MOSS failure. Old active jobs and
the legacy generation endpoint remain unchanged.

## Verification and acceptance

- Multi-provider admission creates separate single-engine jobs/batches with the
  full requested count each; invalid input admits none.
- Each child publishes/selects independently, with no provider substitution.
- MOSS-only submission works with multiple eligible completed sources; invalid
  source states, duplicate content, wrong scope/language/phrase and insufficient
  distinct references are covered.
- After-current submission survives runtime reconstruction and references only
  its own producers; producer failure/cancellation/interruption prevents MOSS
  inference while preserving successful outputs.
- CLI tests prove MOSS receives actual approved reference paths and no unselected
  provider runs. Refills use the external pool, not generated MOSS carriers.
- Source mapping survives rejected candidates and numeric output renaming;
  derived parent/family IDs produce stable training splits and GC retention.
- Source deletion is blocked during queued/running work and safe after completion;
  workspace deletion and historical batch behavior remain covered.
- Frontend tests cover per-provider counts, both MOSS modes, source pagination,
  previews, queue tracking, independent toggles and stale workspace responses.
- Run the complete frontend suite/build and Python suite. Baseline at the
  checkpoint is 131 frontend passes; Python 451 passes, one skip, and one known
  unrelated `test_compose` failure concerning the absent loopback port binding.

## Builder decisions awaiting human review

The user explicitly chose separate datasets, multi-source MOSS, after-current
one-click generation and per-provider counts. Builder choices in this document
are the shared direct-provider count plus separate MOSS count; requiring all
after-current sources to succeed; requiring enough distinct references for the
requested output count; preserving manual training selection; English/other
provider generation settings remaining untouched; and an additive submission API.
