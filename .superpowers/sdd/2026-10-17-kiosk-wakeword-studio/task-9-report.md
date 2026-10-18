# Task 9 — blocked at selected stable-ID refresh contract

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
