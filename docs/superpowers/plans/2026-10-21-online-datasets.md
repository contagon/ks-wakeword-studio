# Online Datasets and actionable job errors

Approved scope: rename the dataset page, add shared augmentation downloads, keep
automatic training augmentation, and improve error visibility. Work directly in
the current checkout; commit after verification. No live downloads or restart.

## Implementation checklist
- [x] Add a shared augmentation catalog, owned/deduplicated download jobs, verified
  installations with durable job metadata, and read-only readiness/storage reporting.
- [x] Add safe public error codes/messages and bounded owner-only child/exception
  diagnostics, without exposing arbitrary provider output or credentials.
- [x] Expose the catalog/download endpoints and reject manual training requests
  with missing augmentation prerequisites; recheck scheduled runs at execution.
- [x] Rename the UI to Online Datasets, preserve old links, separate shared
  augmentation from per-workspace classifier selection, and show readiness/errors.
- [x] Run backend/frontend suites, build static assets, review, and prepare commit.

## Decisions and verification
Use existing allowlisted setup scripts inside queue-owned subprocesses. Stage raw
downloads separately and publish only verified corpora. Reuse the existing
augmentation lock so snapshots cannot race installation. Do not download during
GET requests or silently enable/alter classifier selections. Unpublished sizes
remain unknown, not invented estimates. Training environment setup is part of
download preparation; it is not a separate mandatory manual step.

Tests must cover deduplication, retry/cancellation, partial and unsafe installs,
cross-workspace sharing, no GET side effects, missing training prerequisites,
safe public errors/private raw output, UI download/progress and existing selection
behavior. Large real downloads and GPU inference are excluded from fixture tests.

Progress: baseline host pytest could not collect (fastapi/croniter missing); an
isolated temporary test environment was used. Existing untracked brainstorm
state is unrelated and will not be committed.

Implementation evidence: new backend tests were observed failing before the
catalog, download service, private diagnostics and error codes existed, then
passed. New frontend tests were observed failing before the renamed page,
download controls, prerequisite gating and safe error mapping existed, then
passed. Follow-up RED→GREEN tests cover persistent cache placement, newest-attempt
status ordering, prevention of installed-corpus replacement, and private log
locations. New feature tests: 18 passed. Frontend: 180 passed;
typecheck and production build passed. Browser suite: 15 passed, 1 optional real
model test skipped. Final full backend suite: 506 passed, 1 skipped and the existing
Compose test failure because unchanged compose.yaml publishes on all interfaces
while the test expects loopback and an external named volume. No Compose change
is included. Shell syntax and git diff whitespace checks passed. No live service
restart, dataset download, GPU inference, or deployment was performed.

## Review and decisions

Independent review found unsafe MIT upstream paths, acceptance of corrupt legacy
WAVs, expensive retries against partial directories, and incomplete AudioSet
source downloads being accepted. All four have RED→GREEN regression coverage:
the MIT manifest is checked before writing; readiness checks WAV headers and
final frames; incomplete existing folders are rejected before queuing; AudioSet
fails on missing source tarballs and the owned setup bridge emits a completion
receipt only after success. Publication requires that receipt. Additional tests
cover catalog-vs-queue stale status, parent disk/permission errors, and bounded
shutdown of diagnostics when a descendant continues writing. No review findings
remain deferred.

Ruling: existing incomplete operator-managed corpora require a manual move aside
before retry — preserves operator data instead of deleting or silently replacing
it — cost: one manual repair action for an already broken installation.

Ruling: update the pre-existing browser training test to the current explicit
provider submission API and internal batching UI — the old batch-size input no
longer exists — cost: no production behavior change.

Ruling: leave unrelated Compose configuration unchanged — the requested feature
does not authorize changing network exposure or data mounts — cost: its existing
configuration/test mismatch remains visible in the full-suite report.
