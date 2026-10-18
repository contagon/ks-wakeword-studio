# Final-review fix wave

Base: `e360dad`. Scope: all Important findings I1–I5 and concrete Minor findings M1/M2 from `final-review.md`. No subagents/reviewers, branch/worktree changes, LAN/GPU contacts, release, push, or merge. Read the full findings first, then the approved spec/plan and current producer/consumer contracts.

## Changes and policy

### I1 — immutable production augmentation category

- Added typed `AugmentationInput` records, separate from classifier-negative `DatasetInput` records. All four actual production inputs (MIT RIR, AudioSet, FMA, CHiME) must exist as nonempty real directories before snapshot admission.
- `studio/augmentation.py` hashes relative filenames and complete file content; rejects symlinks/special files; retains independently copied, checksum-verified, fsynced content-addressed versions. Files are made read-only. Replacing the shared installation changes the next effective fingerprint without changing the original retained paths/bytes. Concurrent retention is filesystem-lock serialized.
- Corpus resolution/retention happens **before** the final execution metadata snapshot, outside SQLite's write transaction. The final snapshot includes retained references/fingerprints and remains transactionally consistent with labels/settings/dataset/batch selection. Existing manifests remain immutable/readable; historical manifests without pins cannot silently train through mutable fallback.
- Removed post-snapshot corpus installers from manifest-mode orchestration. MWW receives all four pinned augmenter flags. OWW receives its actual MIT/AudioSet dependencies through pinned asset links. Engine-boundary checksum verification fails closed. Neither raw corpus copies nor RIRs are relabeled as classifier-negative feature inputs.
- README provides actual `cli/setup_python_venv`, `setup_mit_audio`, `setup_audioset`, `setup_fma`, `setup_chime` commands and intentional costs: full initial retained copy/staging space for each distinct content version; old versions retained indefinitely; full shared/retained hashing plus engine-boundary verification even for scheduled skip checks. Substantial disk I/O/latency is intentional, but not a long-held SQLite write lock.
- Tests exercise production retention, replacement, unchanged prior manifests, missing setup before manifest commit, independent metadata writers during retention, real manifest CLI command flags, explicit classifier feature manifests, OWW asset resolution, and refusal to invoke any environment setup for unpinned manifests. Tiny fixture roots only; no corpus downloads.

### I2 — imported archive is not successful new training

- New imports create completed **`legacy_import`** bookkeeping jobs, not completed train jobs. Archives carry `origin=legacy` / `validation_state=unvalidated`; existing imported records are recognized by durable migration provenance, including pre-fix archives whose JSON has no origin field.
- Automatic reconciliation excludes migration archives from both new and previously queued unconsumed deployment events. `successful_version()` does not expose imports as training success; scheduled comparison excludes imports. Import alone never creates publication intent, replaces the desired version, or requests cache refresh.
- Smallest safe policy: **explicit Publish/rollback validates the selected imported version immediately before intent**, using the existing `cli/validate_studio_model.py` in the real prepared training interpreter. The CLI gained an explicit retained `--model-file` input; its existing TensorFlow interpreter/load/allocation/input/output checks are unchanged. There is no TFL3-only validator, automatic installation, invented metric threshold, or migration-time validation success.
- Missing interpreter or engine rejection fails before publication intent. Validation observations live in a separate `legacy_model_validations` table; immutable archive records are not rewritten. Every explicit legacy publication validates again. Retry/staging boundaries also refuse unvalidated imports, protecting pre-fix intents.
- Unvalidated/corrupt/incompatible historical archives remain listed and ZIP-downloadable with checksum/path validation. Publication-manifest compatibility is deliberately separate from archival download integrity. Deploy explains the unvalidated state, TensorFlow/environment prerequisite, and explicit **Validate and publish** action.
- Tests reject corrupt bytes through the actual validator subprocess with a test-only engine module, exercise a chosen explicitly validated archive, then import additional history and verify unchanged desired intent/no deployment events. This is orchestration/validation-gate coverage, **not real TensorFlow/CUDA model qualification**.

### I3 — complete artificial-batch selection

- Added a workspace-scoped complete selected-ID endpoint, independent of 50-row batch pages. Artificial initializes this Set once per word and preserves unsaved selections and recipe edits while paging; visible page responses cannot replace off-page selection.
- Word changes abort/invalidate old requests and mutations, clear selection/recipe state and reset offset to zero. Batch saving is guarded until the complete selection has loaded.
- UI tests use 60 batches, selected IDs on both pages, edits on both pages, saves from either page, later-page workspace switching, and a stale prior-word response. Backend endpoint coverage creates 55 actual fixture batches and confirms both selected IDs are returned despite the 50-row list page.

### I4 — classification beyond the first 100

- Exhausting an acknowledged/locally skipped window triggers server refill. Refills restart at the live pending offset zero (labels shrink that set) and scan subsequent bounded pages past session-skipped IDs without mutating their pending labels.
- Skip Sets are protected during loading and scoped to word for the active Classify visit; switching words/filters cannot leak IDs or revive skipped entries. Stale refills are aborted/generation checked. Refill, undo and assignment admissions prevent duplicate IDs.
- True server emptiness is distinguished from session-skipped/exhausted windows; failed/exhausted local windows provide a retry action instead of a false empty-queue message.
- Tests label through 101 of 125 samples, skip all 125 past a fully skipped first window, check unchanged pending labels/no label requests, revisit words with isolated skips, and reject a delayed old-word refill response.

### I5 — durable per-source migration admission

- Schema v12 adds unique `(word_id, source_path, content_hash)` claims; content fingerprints include sidecar bytes when present. Each claim, imported sample/model record, and provenance row commits in **one SQLite transaction**. Model files/directories are fsynced before the metadata/claim commit.
- Cross-runtime/process filesystem locking serializes inventory checks/backups/admissions; failed inventories resume by checking per-source claims rather than relying on the final inventory marker. Source drift during admission causes rollback. Backup copying can resume a partially created backup directory.
- Pre-v12 admissions with recorded path/workspace and matching original bytes can be recovered from existing provenance and claimed without duplicate admission; matching is not global audio deduplication. Unrelated same-content imports remain distinct examples.
- Tests interrupt after first sample, after first model, and between sample admission/claim commit; retry from separate runtime connections concurrently; check exact sample/model totals; simulate pre-claim upgrade recovery. No duplicate durable examples/versions are created.
- Historical limitation: a crash in the **old** implementation between its sample commit and its separate provenance commit could already have left a sample with no recorded legacy source identity. Such an old orphan cannot safely be attributed by global content matching; inspect/restore the pre-migration backup rather than silently collapsing distinct examples. The new transaction removes that crash gap prospectively.

### M1 / M2

- **M1:** relabel select is visible; only its accessible caption remains `sr-only`. The existing relabel revision/ACK test now asserts no visually hidden ancestor.
- **M2:** supported `LegacyRun` provenance record (`kind: legacy`) and API union normalize both old and new imported manifests; no fabricated config/seed is required. Endpoint tests cover imported and pre-fix-schema JSON. Frontend API types reflect the union.

## RED → GREEN evidence

All Python commands use the existing lightweight test environment, not a new ML environment. Command outputs are retained locally under `/tmp/opencode/final-fixes-*.log` (not committed).

### Focused RED runs

1. `env DATA_DIR=/tmp/opencode/wakeword-studio-baseline /tmp/opencode/wakeword-studio-venv/bin/python -m unittest discover -s tests -p test_studio_final_fixes.py -v`
   - Initial test-first run: 17 tests (then included inherited baseline cases), **2 failures / 4 errors**: missing augmentation admission, absent augmentation field, interrupted migration duplication, legacy manifest `KeyError: config`; two errors were corrected test harness access (`runtime.store` → `runtime.training.store`). Added real validator-gate coverage subsequently failed before implementation. Initial expected defects were not treated as passing evidence.
   - Additional targeted RED: incompatible imported metadata could not be downloaded (**1 error / 9 tests**); pre-v12 source-claim recovery duplicated the first sample (**1 failure / 10 tests**); retention blocked another SQLite writer (**1 database-locked error / 11 tests**). Each was corrected and rerun.
   - During validator integration, attempting to store validation by updating the archive correctly hit the existing `Model archive is immutable` trigger. Replaced that attempted update with the separate validation-observation table; the final archive immutability contract remains unchanged.
2. `npm --prefix frontend test -- --run src/studio/__tests__/classify.test.ts src/studio/__tests__/artificial.test.ts`
   - **3 failed / 19 passed**: lost unsaved page-one selection; queue exhaustion at the first 100 ACKs; inability to advance beyond the first fully skipped window.
3. `npm --prefix frontend test -- --run src/studio/__tests__/samples.test.ts`
   - **1 failed / 8 passed**: relabel select had an `sr-only` ancestor.
4. `npm --prefix frontend test -- --run src/studio/__tests__/deploy.test.ts`
   - Legacy archive notice/action regression failed before the UI change. An additional existing shared-registry test failed because the new test initialized its intentional module cache first; put the cache-initialization assertion first, preserving that assertion rather than weakening it.

### Independent baseline replay (no checkout/worktree changes)

Exported only base production dependencies into an external scratch directory:

```bash
mkdir -p /tmp/opencode/final-fix-base-red
git archive e360dad studio cli/validate_studio_model.py tts_config.py openwakeword_stage.py | tar -x -C /tmp/opencode/final-fix-base-red
```

From `/tmp/opencode/final-fix-base-red`, ran:

```bash
env DATA_DIR=/tmp/opencode/wakeword-studio-baseline /tmp/opencode/wakeword-studio-venv/bin/python -m unittest discover -s /home/contagon/.local/share/opencode/worktree/4aa75c/kiosk-wakeword-studio/tests -p test_studio_final_fixes.py -v
```

Final regression module against unmodified base production code: **11 tests, 4 failures / 7 errors**. In particular, corrupt explicit publication was incorrectly accepted, migration enrolled a deployment event, retries duplicated a sample, the legacy endpoint crashed, and augmentation/claim contracts were absent. The first scratch attempt lacked `tts_config.py`; exporting the two needed root dependencies corrected that harness setup before the meaningful replay.

### Focused GREEN runs

- Same focused Python command in the working directory: **11 passed**.
- `env DATA_DIR=/tmp/opencode/wakeword-studio-baseline /tmp/opencode/wakeword-studio-venv/bin/python -m unittest discover -s tests -p 'test_studio*training*.py' -v`: **24 passed** at that checkpoint; subsequent extra CLI admission test is included in the final full suite.
- Same Classify/Artificial focused UI command: **22 passed** at initial GREEN; additional stale-response tests are included in the final UI suite.

## Final verification

| Exact command | Fresh result |
| --- | --- |
| `env DATA_DIR=/tmp/opencode/wakeword-studio-baseline /tmp/opencode/wakeword-studio-venv/bin/python -W always::ResourceWarning -m unittest discover -s tests -v` | **349 tests, OK, 1 skip** (348 passed), 30.850s. No ResourceWarning output. The skip is the existing opt-in live-device mutation contract. |
| `npm --prefix frontend test -- --run` | **71 passed**, 13 files. |
| `npm --prefix frontend run typecheck` | Exit 0. |
| `npm --prefix frontend run build` | Exit 0; 46 modules; offline JS regenerated and committed. CSS emitted identically, so no CSS diff. |
| `npm run test:e2e` with working directory `frontend` | **4 Chromium workflows passed**, 3.3s, using cached Chromium and the real existing loopback/test-only GPU harness. |
| `bash -n run.sh train_wake_word cli/setup_negative_datasets cli/wake_word_sample_generator cli/wake_word_sample_trainer cli/setup_mit_audio cli/setup_audioset cli/setup_fma cli/setup_chime` | Exit 0. |
| `git diff --check` | Exit 0. |

An earlier full run exposed seven expected schema-upgrade harness failures (old tests expected schema 11, and fake downgrades left new tables behind). Updated version expectations to 12 and kept the new schema idempotent like the surrounding migration schemas; did not remove upgrade assertions. That checkpoint was **344 tests, 5 failures / 2 errors / 1 skip** and is superseded by the final clean run above. All observed failed checkpoints are accounted for here; none is represented as passing verification.

## Limitations and handoff

- No real corpus download, training, TensorFlow/ONNX installed-runtime qualification, CUDA/Blackwell execution, Docker image build/run, live kiosk refresh, inference observation, or device slot verification was performed. Tests use tiny real local corpus trees, test-only executable/runtime substitutes, and the existing loopback kiosk harness.
- Full-volume backups must include retained augmentation versions. Orphan staging/blob/archive files from a filesystem-write/SQL-rollback boundary may consume disk but are not publishable records; no broad cleanup was added.
- Existing approved cache-refresh and clean/exclusive-staging constraints remain intact. No direct follower uploads or selection-setting commands were added. No production demo/mock success path was introduced.
- One cohesive fix wave; return this commit to the parent session for the requested single follow-up review. No reviewer was spawned here, per instruction.
