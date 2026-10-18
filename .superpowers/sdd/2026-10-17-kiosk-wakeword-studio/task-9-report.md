# Task 9 — blocked at selected stable-ID refresh contract

**2026-10-18 update: the user authorized cache refresh; the historical blocker below is resolved. Task 9 is now implemented. See the appended implementation/verification report.**

## Outcome

**Task 9 is not implemented.** Stopped at the brief's explicit compatibility gate before adding upload/retry/API/lifecycle code. No LAN requests, satellite modifications, agents, reviewers, branches, or worktree operations. No inference-success claim.

The ordinary upload/commit path does **not** refresh an already-running selected model when its stable ID, phrase and local path remain unchanged. An existing workaround, `clearWakeWordModels`, does restart the engine, but first deletes **every** cached downloaded model across all three engines. I have not inferred permission to use that model-cache-deletion command under the explicit “Never call selection-setting or model-delete commands” constraint. This is an authorization/compatibility blocker, not a claim that the satellite has no restart mechanism whatsoever. If cache-only deletion was intended to be permitted, the parent should clarify that interpretation before proceeding.

## Authority inspected

Read the exact Task-9 brief first; shared interfaces/Global Constraints in `docs/superpowers/plans/2026-10-17-kiosk-wakeword-studio.md`; authoritative spec publication/refresh requirements; Task-8 report; current `studio/{kiosk,devices,training,jobs,runtime,models,db,api}.py`.

Sibling source: `/home/contagon/PersonalProjects/kiosk-satellite`, HEAD **d46bc0caf276aeaadd0a04a5ef2eefb3bef12931** (`git rev-parse HEAD`, exit 0). Read-only inspection; no sibling files changed.

## Precise refresh evidence

Paths below are relative to sibling `app/lib/managers/`:

1. `voice/custom_wake_models.dart:268–324`: commit replaces only matching stems inside the classified engine directory; after accepting models it calls `_reload()`.
2. Same file `103–150`: `_reload` reconstructs catalog entries with the same stable `id`, phrase and local `File(...).uri` path; then calls `onChanged()`. No content digest/revision enters the model reference.
3. `voice/voice_manager.dart:995–999`: `_customChanged()` publishes catalog status, invokes `_sync()` and refreshes Home Assistant selects. It does not stop the inference engine.
4. Same file `2533–2560`: `_sync()` rebuilds `WakeWordConfig` from existing settings/custom catalog, then calls `_wakeWord.configure(config)`.
5. `voice/wake_catalog.dart:252–287`: references contain ID, phrase, manifest URL, confidence scale and cutoff. Replacing bytes at the same path does not change these values.
6. `wake_word/engine.dart:116–126,247–261`: reference/config equality compares those values, engine, energy gate and stop model, not file contents/hash/version.
7. `wake_word/wake_word_manager.dart:1432–1452`: `changed = _config != config || _released || _failed`; a healthy running equal config is not stopped.
8. Same file `1592–1623`: `_syncNow()` stops on runner/config changes, and starts only if the engine is not running. Equal stable-path replacement leaves the old loaded model running.
9. `wake_word/model_source.dart:14–17,28–42`: local custom files bypass download caches; new bytes are read on a fresh load, but that does not itself trigger a fresh load.
10. `wake_word/wake_word_manager.dart:1062–1085`: **`clearWakeWordModels`** stops the engine, calls `WakeModelCache.clear()`, then `_sync()`; reports `removed`, `bytesFreed`, `restarted`. `wake_word/model_cache.dart:18,25–40` deletes every cached file under `vsww_models`, `mww_models`, `oww_models`, not just the newly published custom model. It does not delete custom archives or settings, but it is a broad cache-model deletion/re-download side effect, not a targeted non-deleting refresh.

Thus catalog/file availability and active inference must be reported separately. Merely verifying a post-commit remote manifest would not satisfy the selected-model-refresh requirement. Changing phrase, ID, path, selection, engine, threshold or mute settings to manufacture a restart is not an acceptable workaround.

## Upload/commit/hash contracts verified for the next implementer

- `remote/remote_manager.dart:786–799`: POST `/api/voice/wake-models/upload?name=<basename>` takes raw bytes and delegates to `stageCustomWakeModel` with request length, not multipart/archive upload; returns command-result JSON and HTTP 200/400.
- `voice/custom_wake_models.dart:201–255`: basename only, no folders/backslashes/leading dot; only `.json`, `.tflite`, `.onnx`; max 64 MiB per file; nonzero complete length; staging uses `.part` then rename.
- Same file `271–324,336–437`: commit groups by stem, validates engine loading, replaces only matching stem in its engine, and returns `added: [{engine,id}]`, `rejected: [{file,...}]`. Transport success alone is insufficient. MWW requires the JSON and TFLite **same stem**, valid MWW manifest and loadable model. Raw OWW is a separate stem/model without MWW JSON; do not upload same-stem OWW and MWW together. Task-8 archive layout is not an upload envelope.
- `voice/voice_manager.dart:1324–1331`: `commitCustomWakeModels` wraps domain commit results in `CommandResult.ok`, so HTTP 200 / `ok:true` can still contain rejected files or omit an expected model.
- `voice/custom_wake_models.dart:477–490`: remote manifest keys are `engineFolder/basename`, values SHA-256 over actual file bytes; compare expected uploaded bytes, not version directory names. Preserve unrelated direct-target models; never invoke remote deletion to reconcile.
- Existing `studio/kiosk.py` already checks `{ok,data}` and upload-time live identity/role, exposes `CommitResult.added/rejected`, and verifies manifest hash syntax. A future service must check actual expected accepted models/rejected files and expected hashes, not merely method return.

## Existing integration contracts inspected

- `TrainingService.successful_version(job_id)` and `versions(word_id)` join `model_versions` to Job **complete**. Archive rename/row existence alone does not authorize publication. Cancelled/interrupted/half-published versions remain excluded.
- `WorkerPool.register_completion('train', callback)` is post-completion/child-cleanup. Callback errors log `completion_hook_failed` without invalidating training. That callback alone is not an atomic durable publication outbox: recovery must reconcile completed versions and persist an idempotent claim/intent before network work, without overwriting a later manual rollback.
- Current `StudioRuntime` registers training but no completion publication callback or publication retry lifecycle. Those remain unchanged.
- `DeviceService.publication_targets()` filters active credentialed leader/standalones. A future implementation must also represent missing-credential direct targets and indirect followers in status, recheck live role before mutation, and mark profile-ineligible followers `not_covered`. Registry filtering alone is not a stale-operation guard.
- Required desired-version revision, per-target cross-operation serialization, rollback atomic intent, bounded durable retries, follower manifest observation, archive/download/history/status/publish/rollback APIs remain **unimplemented**. No new schema or half-functional deployment endpoint was introduced.

## Verification / TDD status

No RED/GREEN commands were run and no passing deployment tests are claimed. The requested focused TDD and single baseline-281 full-suite run were **not reached**, because the task explicitly says to stop when selected stable-ID refresh is unsupported by the permitted API operations. Running the unchanged suite would not resolve that source contract or justify implementing a forbidden workaround.

No live-device test was attempted; neither device credentials nor a separate mutation opt-in were supplied. Default inspection made no LAN calls. No fixture simulation is presented as evidence of actual native/Dashboard inference reload.

## Required decision to resume

Either explicitly permit the existing global **cache-only** deletion/restart command (and accept its unrelated-cache/re-download consequences, with a source/fixture test and optional separately opted-in disposable live test), or separately authorize a satellite-side non-deleting refresh/invalidation capability. Satellite changes are outside this task's authorization. The ordinary commit-only path is insufficient; the task must not be marked complete on that basis.

Only this requested report is committed. Production code remains unchanged.

---

## Resumed Task 9 — implemented with the authorized cache refresh

The user explicitly approved `clearWakeWordModels` after its effects were explained ("yeah doing teh cache-refresh is fine"). Reread the refreshed exact brief and amended authoritative spec. This is an authorization change, **not** a satellite change. Preserved the historical investigation above and included the parent's tracked plan/spec amendments in the scoped implementation commit. Review base remains **12082db**; **b8f4b66** was report-only.

### Outcome and interfaces

- Implemented `studio/deployment.py`, additive schema **v9** `studio/schema_deployment.sql`, `Publication`, runtime construction/completion/retry integration, kiosk refresh/filename validation, model archive/publication HTTP routes, and 23 deployment tests (22 passing, one deliberately skipped live test). Baseline 281 + 23 = **304 tests**, final full suite **OK (skipped=1)**.
- `DeploymentService(store, devices, training, *, clock=utc_now)` exposes required `publish(version_id)`, `retry_due(now)`, `rollback(word_id, version_id)`, `status(word_id)`; also `reconcile()` (no network), `version(version_id, word_id=None)`, paginated `history`, validated `artifacts`, and complete ZIP `archive` stream. Runtime property: `runtime.deployment`.
- `Publication` carries word/device, desired version, monotonic intent revision, publication state, attempt count/next retry, **separate** manifest/refresh/runtime states, fixed sanitized error code, update timestamp, and user-visible `cache_effect` warning. No credentials or raw remote failure strings are persisted/reflected.
- `KioskClient.refresh_models(device)` pins identity, calls the authorized command, and validates actual `removed`, `bytesFreed`, `restarted` fields. It does not assert loaded-version inference from `restarted`. Filename validation now rejects non-model extensions before transport.
- `CommitResult` continues to preserve actual remote `added` engine/ID models and named rejected files; no fictional accepted-file list is synthesized. Service checks every required accepted engine/stem, refuses domain rejection even under successful transport, and separately verifies all expected remote file hashes.

### Safety and lifecycle

1. **Completion gate/outbox:** `JobQueue._finish` inserts a training version's deployment event in the **same SQLite transaction** as Job `complete`, after child cleanup. Cancelled/failed/interrupted archives never get this success event. Startup/periodic reconciliation also discovers successful pre-v9 archives or a missed callback, in archive-row order. Consumed events never overwrite a later manual rollback. A backlog coalesces to the newest desired version per word; superseded archives remain retained.
2. **Desired intent:** one global per-word desired version/revision, mirrored atomically to every registered target, including followers and missing-credential targets. New registry targets enroll into the existing desired revision; formerly inactive/profile-excluded targets become pending when eligibility changes. New publication/rollback resets retry state and increments revision, even for the same version.
3. **Serialization:** filesystem `flock` intent gate spans intent claim and network mutations; per-target flocks cover the shared remote staging area across wakewords. These locks are not merely Python thread locks and release on process death. Revision/current role/identity are rechecked before mutations, including follower refresh. Rollback waits for any already-running operation, then atomically claims its revision; no old retry/refresh may execute afterward. This deliberately favors correctness over parallel kiosk throughput. No SQL transaction spans network/credential calls.
4. **Recoverable in-flight phases:** attempt claims persist as `pending` before remote work; verified-but-unacknowledged refresh persists as a due `refresh_pending` state. Both survive a crash. A crash after remote acknowledgement but before local acknowledgement may repeat the authorized refresh (at-least-once remote semantics), not strand it or claim inference success.
5. **Upload boundary:** validate **all archived checksums** before any upload, then verify exact in-memory upload buffers again. Only stable MWW `<model_id>.json` + `<model_id>.tflite`, plus optional distinct-stem `<model_id>.oww.onnx`, are sent. OWW JSON/bundle/config/log/archive files are **not** sent to remote model staging. MWW manifest must reference its real uploaded stable basename. Raw file POSTs precede commit. No custom-model-delete, selection, engine, threshold, profile-edit, fleet-file-delete or diagnostics-clear command is issued.
6. **Direct targets:** only active leader/standalone uploads, with live pinned identity/role checks on each stage/commit boundary. Existing same-stem replacement is kiosk-owned; unrelated direct-target models are untouched. If files already match after a crash/refresh failure, skip re-upload and proceed to hash-gated refresh.
7. **Followers:** **never upload**. Only eligible active followers with their own credentials are observed. Require the leader's verified matching desired version and the follower's own exact expected hashes before refresh; reread the manifest immediately before refresh. Missing credentials/offline/sync lag/profile exclusion are not success. Loss of previously synced bytes resets manifest state to `unverified`. Existing leader fleet propagation/settings/profile authority remains unchanged; this code does not perform fleet mirroring.
8. **Retry bounds:** six network attempts per target/desired revision, exponential backoff starting 30 seconds (cap one hour), persisted ISO UTC due times; exhausted targets remain explicitly exhausted/pending refresh with fixed cause. Missing stored credentials are an administrative waiting state polled every five minutes without network or attempt consumption. Manual publish/rollback explicitly retries by claiming a new revision. Role/identity drift is blocked for explicit reconciliation, not silently converted into a standalone.
9. **Worker lifecycle:** startup reconciliation performs no network. Existing post-completion hook attempts due publication only after durable completion. Existing scheduler worker invokes retry maintenance; shutdown joins existing workers before closing SQLite. No independent scheduler/daemon/process pool was added and no legacy STT/Tater path is enabled.
10. **Observation honesty:** direct final state `published`, follower final state `synced`; these require hash verification and refresh acknowledgement. `manifest_state='verified'`, `refresh_state='acknowledged'` remain distinct from `runtime_state='unverified'`. The current API does not attest the digest loaded into inference, so runtime-version proof is deliberately not invented. `refresh_pending`, `sync_pending`, `credentials_required`, `offline`, `not_covered`, `role_changed`, `hash_mismatch`, `rejected`, `archive_invalid`, `inactive`, `exhausted` provide actionable non-success states.

### HTTP contract

Under `/api/studio/wakewords/{word_id}`:

- Existing `GET /models?offset=&limit=` remains successful-only model history.
- `GET /models/{version_id}` returns the completed immutable version, with workspace ownership checked.
- `GET /models/{version_id}/archive` streams a complete checksum-validated ZIP (including provenance/config/logs/metadata), using an anonymous temporary file and bounded-memory chunks; closes after streaming. `GET /models/{version_id}/archive/{name}` serves only validated deployable basenames.
- `GET /deployment/status` returns current per-target Publication records and cache-refresh side-effect warning.
- `GET /deployment/history?offset=&limit=` returns retained revision/attempt/observation history, normal Page limits 1–100.
- `POST /deployment/publish` and `POST /deployment/rollback`, body **exactly** `{"version_id":"..."}`, return updated publication records. Cross-workspace rollback is 409; incomplete version is 409; bad/missing record follows existing sanitized 422/404 handling. No tokens in these bodies/responses.

### Source/fixture and live test contract

Added `tests/fixtures/kiosk/refresh_contract.json`, pinned to the inspected sibling commit. Default tests use only local in-memory protocol fixtures, **loopback HTTP**, and read-only sibling source. Source test can use `STUDIO_KIOSK_SOURCE`; it skips that cross-check only if sibling source is absent. Here it ran and passed.

Source verification extends the original chain: `wake_word/isolate_engine.dart` stop clears running state/kills its isolate; fresh start calls `loadModels(config)`; `mww/mww_engine.dart` calls `_store.fetch(ref.manifestUrl)`; `mww/mww_model_store.dart` rereads the manifest and bypasses downloaded caches for local models; `model_source.dart` reads local file bytes anew. Refresh handler stops → cache-clears → syncs, without settings writes. Cache deletion directories exclude `custom_wake_words`. Source/fixture checks are evidence about source control flow, **not execution of Dart/native inference**.

Live contract is present but **not executed**. All of the following are required: `STUDIO_TEST_KIOSK_URL`, `STUDIO_TEST_KIOSK_TOKEN`, **separate** `STUDIO_TEST_KIOSK_MUTATE=1`, `STUDIO_TEST_KIOSK_MODEL_DIR`, `STUDIO_TEST_KIOSK_MODEL_ID`. Operator must already select a disposable changed MWW model and configure both slots; test refuses a follower upload and never changes selections or cleans up by deleting the model. It checks commit results, exact remote hashes, refresh restart, before/after slot+engine preservation, `getWakeWordState` listening/local model reference/precision. Those runtime fields are restart/load evidence, not loaded-digest attestation. No LAN device was contacted and no real cache refresh/upload occurred in this session.

### Actual RED → GREEN commands/output

All commands use:

```sh
env DATA_DIR=/tmp/opencode/wakeword-studio-baseline /tmp/opencode/wakeword-studio-venv/bin/python -m unittest discover -s tests
```

Each log below corresponds to the suffix shown, with `-v` and `> /tmp/opencode/<log> 2>&1`.

| Log | Pattern / actual result |
| --- | --- |
| `task-9-red.log` | `-p 'test_studio_deployment.py'`: RED, missing `studio.deployment`, 1 import error |
| `task-9-green-initial.log` | Initial implementation attempt first failed 8 tests because the new test fixture lacked mandatory positive audio; fixture corrected using existing sample ingestion. Rerun overwrote this log: 8 tests **OK**. This was a test-setup error, not claimed production RED evidence. |
| `task-9-integration-red.log` | `-p 'test_studio_deployment.py'`: 13 tests, RED 2 failures: ZIP archive route absent (404), newly eligible follower remained `not_covered` |
| `task-9-studio-integration-red.log` | `-p 'test_studio*.py'`: 189 tests, 5 failures/1 error: old migration expectations still said v8, reconstructed-v3 fixture retained v9 tables; narrowly updated expected schema version and fixture table removal |
| `task-9-contract-red.log` | `-p 'test_studio_deployment_contract.py'`: 4 tests, RED 1 failure/1 live skip: adapter accepted `.zip` filename |
| `task-9-observation-red.log` | `-p 'test_studio_deployment.py'`: 15 tests, RED 1 failure: follower lost files while refresh pending but retained stale `verified` manifest marker |
| `task-9-deployment-green.log` | `-p 'test_studio_deployment.py'`: 17 tests **OK** before final crash-window additions |
| `task-9-focused-green.log` | `-p 'test_studio_deployment*.py'`: 21 tests **OK (skipped=1)** before crash-window additions |
| `task-9-devices-green.log` | `-p 'test_studio_devices.py'`: 15 tests **OK** |
| `task-9-crash-red.log` | `-p 'test_studio_deployment.py'`: 19 tests, RED 2 failures: process death during a retry claim stranded `offline` with no due time; death after hash verification stranded a pending refresh as terminal publication |
| `task-9-final-focused-green.log` | `-p 'test_studio_deployment*.py'`: **23 tests in 2.629s, OK (skipped=1)** |

The requested full-suite command was run **twice**, not once: first 302 tests passed, then self-inspection found the two crash-window gaps above. Added failing regressions, corrected durable phase state, reran focused tests and the full suite rather than leaving unverified changes. Initial output is `/tmp/opencode/task-9-full-tests.log`: `Ran 302 tests in 26.025s`, `OK (skipped=1)`.

Final full command:

```sh
env DATA_DIR=/tmp/opencode/wakeword-studio-baseline /tmp/opencode/wakeword-studio-venv/bin/python -m unittest discover -s tests -v > /tmp/opencode/task-9-final-full-tests.log 2>&1
```

Actual exit **0**; all 349 output lines read:

```text
Ran 304 tests in 27.188s
OK (skipped=1)
```

Only skipped test is the explicitly mutation-opted-in live contract. Existing-style `ResourceWarning: unclosed <socket.socket [closed] ...>` occurred during `test_inactive_credentials_route_still_rejects_identity_mismatch_and_bad_token`; that test passed. Existing fixture TTS/setup progress remains. Warnings were not suppressed or claimed fixed. No production/test modifications after final full verification; only this report/staging/commit operations follow.

### Risks / limits

- No satellite changes, real-device requests, native/Dart runtime execution, GPU/model/provider/corpus download, accuracy claim, agents/reviewers, or branch/worktree operations. Authorization to implement cache refresh was **not** treated as permission to run live mutations.
- Cache refresh can interrupt detection/audio streaming and clear **all downloaded-model caches**, possibly requiring network re-download of unrelated selected remote models. Custom uploaded files/settings/credentials/diagnostics are not deleted. User-facing Publication warning exposes the cache/restart consequences. Failed or disabled inference remains unverified even after a successful refresh command.
- Coarse intent serialization means a slow bounded HTTP attempt delays unrelated targets and manual rollback until it finishes. Per-target locks cannot exclude an independent remote UI/admin or another trainer using a different data root. Concurrent external remote mutations can invalidate observations; hashes are reread before refresh, but there is no remote atomic compare-and-refresh API.
- Remote operations are at-least-once across process death, not exactly-once; repeated cache refresh after a lost acknowledgement is possible. Retried already-matching content is not re-uploaded. Exhaustion/role drift requires operator action or explicit publish to claim a fresh revision; no unlimited mutation loop.
- Status/history record observations at their timestamps, not permanent truth or digest-attested inference. History and retained archives currently have no GC/quota policy. ZIP export uses temporary disk proportional to archive size; artifact checks/read buffers assume Task-8 immutable archives and do not protect against a hostile concurrent same-UID filesystem writer.
- Deployment consumes the existing registry; existing collection/manual fleet refresh remains responsible for discovering membership/profile changes. It does not invent follower credentials, change fleet profiles, or mirror/delete follower files itself.
- Existing older migration tests were changed only to expect v9 and remove v9 tables from their reconstructed old-schema fixture; their preservation assertions remain intact. Added a real v8→v9 preservation test.

### Commit

Scoped implementation commit uses the requested subject `feat: publish archived models safely through fleet leaders with rollback`; includes parent plan/spec authorization amendments and this tracked report. Commit ID is supplied in the final status message.

---

## Task 9 review fix — round 1

Verified both Important findings against production code and sibling `custom_wake_models.dart:227–255,271–320`: uploaded staging files persist across process death, and **every** later commit consumes the entire staging folder, not merely the caller's uploaded subset. Existing process locks and installed-file hash checks did not neutralize stale persistent bytes. Also verified that terminal `synced` rows were skipped after profile/member removal. No satellite changes, agents, LAN calls, or real uploads/cache refreshes were used for this fix.

### Changes

- Additive **v10**, `studio/schema_deployment_staging.sql`: `deployment_staging(device_id,word_id,filenames,claimed_revision)` durably owns the entire possible filename set **before the first upload**. Intent/rollback updates never delete this journal. Existing v9 stores conservatively seed ownership using every retained deployable artifact name for each previously enrolled word/target, so pre-fix trainer-owned staging is not silently treated as clean after upgrading. A real v9→v10 migration regression simulates a persisted old attempt and verifies recovery.
- `DeploymentService._commit_current` executes under the existing global current-intent gate and per-target lock. It resolves **all dirty words on that target** to their **current** desired revisions, validates all affected archives before any upload, journals the complete filename sets, overwrites every affected staged model with the current desired pair/companion, and only then performs the target-wide commit. Recovery is required even when installed hashes already match and even when another dirty word's ordinary retry is not due. No stale recorded version is replayed.
- Commit acceptance must exactly equal the required engine/stem set (including cardinality); a superset is no longer success. All affected installed hashes must match before ownership is cleared. Recovered other words are durably scheduled `refresh_pending` **before** clearing the journal, so interruption cannot lose their refresh obligation. Failures/crashes retain ownership for future recovery.
- Known journaled filenames with **no counterpart in the current desired archive** (for example a staged optional OWW companion removed by rollback) produce terminal `staging_blocked`, cause `staging_artifact_not_desired`, before any upload/commit/refresh. There is no fabricated delete/discard/invalid-placeholder workaround. Another word cannot bypass this block with its own commit.
- Unexpected accepted engine/IDs produce durable per-target `deployment_staging_blocks` quarantine, cause `staging_unowned`. No subsequent publication revision/word may commit or refresh that target. Reconciliation invalidates its existing terminal direct-target successes as well. Actual client commit results continue to preserve unexpected accepted entries and named rejected files, rather than filtering evidence away.
- `DeploymentService._enroll` now reconciles **terminal rows too**. Inactive/removed members become `inactive`; followers losing Voice Satellite coverage become `not_covered`. Their manifest/runtime observations are reset to `unverified`, refresh to `pending`, due mutation is cleared, and the transition is recorded in history. This is local SQLite/registry work with **zero network calls**. Existing re-eligibility logic reopens only genuinely eligible active rows; exhausted normal remote retries remain bounded.
- Older migration tests were updated only for latest version **10** and to remove the two new staging tables when reconstructing v3. Existing data-preservation assertions remain. Public service/API signatures are unchanged, with the additional truthful `staging_blocked` state/cause codes.

### Regression coverage

Added 11 tests (10 deployment service cases, one real loopback HTTP client case):

1. Stage version B, die before commit, rollback to already-installed A, publish a different word: B cannot be reinstalled.
2. Die immediately after rollback intent commits; a different word's next publication repairs dirty A to current desired bytes before committing anything.
3. Assert durable complete staging ownership exists inside the first upload callback.
4. Unexpected accepted models do not count as success; persistent quarantine prevents later commits.
5. Previously synced follower becomes profile-excluded: `not_covered`, manifest unverified, no network.
6. Previously synced follower is removed/inactive: `inactive`, pending refresh, no network.
7. Optional staged file absent from current desired version blocks both its own and another word's commit without deleting/staging placeholders.
8. Concurrent repair of another dirty word and rollback serialize under the current desired-intent lock; the final installed bytes belong to the later desired revision.
9. Quarantine invalidates an older word's terminal target success on reconciliation, without network.
10. Actual v9→v10 upgrade conservatively recovers unjournaled pre-fix **trainer-owned** staging.
11. Actual loopback HTTP commit envelope preserves extra accepted engine/IDs and rejected filenames for exact caller validation, while excluding raw rejection secrets.

Existing follower no-upload, source reload/slot preservation, crash/retry, cross-workspace rollback, and live-mutation opt-in tests remain intact.

### Actual RED / GREEN evidence

All unittest commands used the requested prefix:

```sh
env DATA_DIR=/tmp/opencode/wakeword-studio-baseline /tmp/opencode/wakeword-studio-venv/bin/python -m unittest discover -s tests
```

Commands add the pattern and `-v`, redirecting stdout/stderr to the log listed.

| Log under `/tmp/opencode/` | Command suffix / observed output |
| --- | --- |
| `task-9-round1-red.log` | `-p 'test_studio_deployment.py' -v`: **25 tests; FAILED (failures=5, errors=1)**. Both persistent-staging corruption regressions failed with actual B vs A byte mismatch, terminal follower cases remained `synced`, unexpected accepted model was falsely `published`, ownership table did not exist. |
| `task-9-round1-initial-green.log` | `-p 'test_studio_deployment.py' -v`: 25 tests, one remaining old-schema assertion failure (`10 != 9`); existing migration expectations were then updated. |
| `task-9-round1-quarantine-red.log` | `-p 'test_studio_deployment.py' -v`: **28 tests; FAILED (failures=1)**: another word's old terminal target status stayed `published` after unknown-staging quarantine. Added terminal quarantine reconciliation. |
| `task-9-round1-focused-green.log` | `-p 'test_studio_deployment*.py' -v`: **Ran 34 tests in 4.112s; OK (skipped=1)**. |

One full-suite run for this fix round:

```sh
env DATA_DIR=/tmp/opencode/wakeword-studio-baseline /tmp/opencode/wakeword-studio-venv/bin/python -m unittest discover -s tests -v > /tmp/opencode/task-9-round1-full-tests.log 2>&1
```

Exit **0**:

```text
Ran 315 tests in 27.947s
OK (skipped=1)
```

The only skip is the separately opted-in live mutation test. Existing socket `ResourceWarning` appeared during `test_inactive_credentials_route_still_rejects_identity_mismatch_and_bad_token`, which passed; no warning was suppressed. No production/test changes follow the full passing run; only report/staging/commit operations. `git diff --check` passed during focused verification.

### Controller decision still needed: unowned external staging

**The current kiosk API cannot enumerate or safely discard unowned staging before a commit.** The installed-file manifest excludes `.staging`. Exact post-commit acceptance detects unexpected models only **after** that commit may already have installed them; it cannot reconstruct overwritten external bytes or undo unknown effects. Quarantine prevents further automatic commits/refreshes and does not claim that the first external contamination was prevented or repaired. Trainer-owned crash contamination is now repaired before commit; genuinely unowned content is not.

Controller: should publication require exclusive, initially-clean ownership of the kiosk staging directory (with a separately approved operator recovery procedure for unknown staging), or should this remain a blocker pending a separately authorized satellite staging-inspection/recovery capability? **No staging-discard API, external-model deletion, quarantine-release endpoint, or satellite modification has been invented or authorized here.**

The conservative v9 migration can also block when an old optional staged filename has no current desired replacement, even if the actual remote staging happened to be empty. That is an intentional fail-closed ambiguity; automatically committing obsolete companion bytes merely to clear staging would violate desired-version authority. No live cleanup was attempted.

### Commit

Scoped round-1 fix commit is reported in the final message; includes this report, deployment persistence/reconciliation changes, new regressions/client contract, and narrow migration-fixture expectations only.

---

## Controller ruling — staging operational boundary documented

Round-1 fix was committed as **5715d1a**. The controller has now resolved the operational-policy question above: **supported publication requires initially clean kiosk upload staging and no concurrent external/manual uploads during trainer-owned publication**, including retries/rollback. This does not add a technical remote guarantee. The API cannot list/discard/lock staging, and unknown external files can be committed before unexpected acceptance triggers quarantine; separately authorized operator cleanup/review is required. No new user permission question or actual device action is needed for documenting that boundary.

Implemented documentation/help only, without changing publication, selected slots, deletion behavior or quarantine recovery:

- Typed immutable `DeploymentCapabilities` record in `studio/models.py` and read-only `GET /api/studio/deployment/capabilities`. Explicit booleans state both prerequisites and the absence of automatic cleanliness checking, remote staging inspection, remote discard and remote lock. Notice strings explain uncoordinated-client risk, post-commit quarantine, and required operator action. It is static help, not a successful clean check or a device probe; it is available before any model/status exists.
- Deployment status OpenAPI help points to that capabilities endpoint without changing the existing list response shape.
- `README.md` now has Kiosk Studio setup/deployment guidance: initially clean/exclusive staging, trainer-owned recovery vs unowned ambiguity, `staging_blocked` / `staging_unowned`, no automatic cleanup/quarantine release or republish bypass, optional-companion blocking, cache-refresh effects, follower policy, separate manifest/refresh/runtime observations, and help/status/history/publish/rollback route references. No fictional staging cleanup command is suggested.
- Added a contract test asserting typed OpenAPI help, all capability flags/notices, and **zero kiosk calls**. No new agent, satellite modification or LAN mutation occurred.

Actual TDD commands use the same requested Python/DATA_DIR prefix as above:

```sh
env DATA_DIR=/tmp/opencode/wakeword-studio-baseline /tmp/opencode/wakeword-studio-venv/bin/python -m unittest discover -s tests -p 'test_studio_deployment.py' -v > /tmp/opencode/task-9-boundary-red.log 2>&1
```

RED exit **1**: `Ran 30 tests in 2.688s`, `FAILED (failures=1)`; the new help route returned **404 instead of 200**.

```sh
env DATA_DIR=/tmp/opencode/wakeword-studio-baseline /tmp/opencode/wakeword-studio-venv/bin/python -m unittest discover -s tests -p 'test_studio_deployment*.py' -v > /tmp/opencode/task-9-boundary-green.log 2>&1
```

GREEN exit **0**: `Ran 35 tests in 4.212s`, `OK (skipped=1)`.

```sh
env DATA_DIR=/tmp/opencode/wakeword-studio-baseline /tmp/opencode/wakeword-studio-venv/bin/python -m unittest discover -s tests -v > /tmp/opencode/task-9-boundary-full-tests.log 2>&1
```

Full suite exit **0**: **`Ran 316 tests in 27.998s`, `OK (skipped=1)`**. Only the explicitly opted-in live mutation test was skipped; existing socket ResourceWarning appeared during the passing `test_inactive_credentials_route_still_rejects_identity_mismatch_and_bad_token`. `git diff --check` passed. No production/test changes after these runs; only this report and scoped commit operations follow. The new commit/head is returned in the final status.
