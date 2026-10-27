# Augmentation caching and bounded parallelism

Status: historical design. Shared feature caching was subsequently removed at the user's request; bounded workers and the approved per-recording RNG policy remain. See `../plans/2026-10-27-remove-augmentation-cache.md`.

## Intent

Reduce the observed 33-minute augmentation stage, especially repeated training
with unchanged synthetic positives and newly collected personal negatives. Keep
all configured augmentation probabilities, acoustic transforms, feature extraction,
family splits, repetitions, shifts, training sampling and validation cadence.

The optimization backlog and measurements are in
`docs/training-performance-improvements.md`.

## Proposed behavior

### Shared, content-addressed split caches

Use a shared feature cache under the tool-data root, separate from isolated run
directories. Each generated/personal/reviewed-negative pool and training/validation/
testing split has its own cache key. Keys include ordered audio content hashes
(including duplicate occurrences), the split, seed, repeat/shift settings, complete
augmentation policy, selected retained corpus fingerprints, engine/frontend
versions and an adapter-policy version. Absolute run paths and worker count are
excluded: a new isolated run directory must not invalidate equivalent inputs.

The cache holds the existing RaggedMmap layout, not a new trainer data format.
Reuse verified immutable files with hardlinks on the same filesystem; copy safely
when hardlinks are unavailable. Run-local output paths and training configuration
remain unchanged. Rebuilding unrelated pools is unnecessary on a negative-only
update. The existing source/snapshot integrity checks remain in place.

Each entry is built in a unique temporary directory under a per-key lock and is
published by atomic rename only after validating its metadata and feature files.
Cancelled, failed, malformed or checksum-mismatched entries cannot be hits. Reject
unsafe links/paths. Do not delete historical run outputs. Cache eviction is not
part of the initial implementation; retained cache size must be documented.

### Bounded CPU augmentation workers

Use a process pool capped at four available CPU workers, with at most twice the
worker count in-flight. Restrict numerical-library threads per worker and hide
CUDA before importing the ML stack; the existing augmentation/microfrontend path
is CPU work, not a reason to allocate one GPU context per worker. Output ordering
must remain deterministic even if workers finish out of order.

Reuse the current audio loading, augmentation and C microfrontend behavior. Each
recording/repetition produces its existing shifted variants; virtual shift storage
is explicitly deferred. Preserve two acoustic training repetitions, one validation
and testing repetition, ten training/validation shifts and one testing shift.

### Approved randomness policy

Stable per-recording/repetition seeds make cached output independent of worker
count and scheduling. Base these on the run seed, audio content, pool/split,
duplicate occurrence and repetition. This changes the exact augmented waveforms
relative to the old single process's global RNG stream, although transform
distributions remain unchanged. Version the policy and training fingerprint so
old features/runs are not misidentified as results from the new policy.

No UI controls are required. A one-worker diagnostic path must produce the same
features as the parallel path under the new policy. Fresh randomness requires a
different seed/policy identity; cache hits are not new acoustic diversity.

## Verification and rollout

- Unit tests for keys, invalidation, empty splits, duplicate content, output order,
  bounded submission, concurrency, integrity, cancellation and failure cleanup.
- Compare one-worker and multi-worker feature bytes under the new deterministic
  policy. Verify selected corpus and split changes invalidate the relevant entry.
- Use isolated real-engine checks for existing RaggedMmap compatibility and
  unchanged example counts, shapes and scaling.
- Measure a cold build, exact-input reuse and a negative-only update. Report cache
  verification/linking time separately from transformation time and include RAM.
- Preserve the active service and official runs. Do not rebuild/deploy or start
  official training as part of this implementation.

## Non-goals

No virtual shifts, larger training batches, less frequent validation, new transform
probabilities, stronger negative penalties, relaxed input checks, GPU microfrontend
replacement, or checkpoint-selection changes.
