# Kiosk Wakeword Studio design

Status: approved by user on 2026-10-17; implementation planning authorized. Execution approach to be selected after plan review.

## Intent

Repurpose this NVIDIA Docker trainer around improving multiple wakewords using Kiosk Satellite diagnostic recordings. The core workflow is scheduled collection, fast manual labeling, manual or scheduled training, and automatic publication of successful models. Preserve dated model versions for rollback.

## Confirmed requirements

- Replace top navigation with a compact sidebar: Wakewords; Data → Negative Datasets, Artificial, Scrape, Classify, Samples; Train; Deploy.
- Each Data, Train, and Deploy page has a wakeword dropdown. The selected context follows navigation.
- Support multiple independent wakewords.
- Collect diagnostic recordings on a configurable cron schedule. Operate within the kiosk's existing rolling history (10 activations and 10 near misses); do not change kiosk retention.
- Remember recordings already collected; do not repeatedly import or relabel them.
- Users manually classify positive/negative recordings in an autoplay, keyboard-first interface.
- Train manually or through a separate configurable cron schedule.
- Retain dated versions of all trained model artifacts for rollback.
- Publish successful models to configured kiosks, but do not enable an inactive wakeword or change either of a kiosk's two enabled selections. Updating an already active wakeword must refresh that model.
- Support one fleet and/or individually registered kiosks. A shared registry serves Scrape and Deploy. Adding a leader from either page automatically discovers its followers; deployment goes through the leader for managed followers.
- Auto-discovered followers can require individually supplied admin credentials for scraping; user accepted entering them once.
- Clearly mark discovered followers as followers. Upload only to the fleet leader and standalone kiosks, never directly to followers. The user accepts the leader as authoritative and existing fleet-sync behavior, including selection propagation and removal of follower-only models; the trainer itself must not edit enabled selections.
- Negative datasets will become numerous; design a catalog rather than fixed cards.

## Technology and scope

Recommendation (builder's call, not an explicit user technology choice): keep Vue 3, TypeScript, Vite, FastAPI, and existing training tools. Add TailwindCSS for consistent compact styling. React migration brings no required capability and is not recommended. Preserve the committed offline production bundle and Docker support without a Node runtime requirement.

Build on existing TTS, model training, dataset download, normalization, trimming, and logs where usable. Existing singleton sample/session/auto-training state must become wakeword-scoped rather than merely placing a new UI over it.

Do not modify Kiosk Satellite in this project without separate authorization. Do not require fleet-wide setting changes, enable diagnostic recording automatically, or change wakeword slots. Do not automatically transcribe/promote/discard recordings: the new training loop uses explicit human labels. Existing Tater-specific deployment and automatic STT review are not part of the new primary workflow; disable those background paths for new workspaces so they cannot mutate kiosk data or publish independently. Keep unrelated legacy endpoints only where they can be safely isolated; no commitment to preserve the old UI.

## Workspace and persistence

Use durable structured metadata (recommended SQLite beneath the mounted data directory), with audio, generated batches, logs, and model files on disk. Builder chooses schema and module boundaries.

Maintain:
- Wakewords with stable immutable IDs, phrase, language/accent, safe model identifier, source-name mappings, selected negative datasets, generation recipe, and autotrain cron/timezone.
- Shared device registry keyed by kiosk identity rather than address: standalone, leader, or discovered follower; connection address; credentials reference; fleet membership; profile/model-sync capability; last seen and errors.
- Collection schedule (shared across devices), timezone, run history, and per-device results. The schedule is shown on Scrape regardless of selected wakeword; routing is based on recorded phrase mappings, not the currently open dropdown.
- Source recordings identified by `(device identity, diagnostic clip ID)` with timestamp, source wakeword/engine, activation versus near miss, scores and available diagnostic metadata, local file path/hash, collection outcome, and label history.
- Per-wakeword labels and synthetic batch selection; never infer that a negative for one phrase is a negative for another.
- Immutable training-run input manifests, effective configuration, dataset fingerprints, random seeds where supported, timestamps, logs, outputs, validation outcome, and publication status.
- Model versions and per-target desired/observed publication status with timestamps and retry errors.

Retain collected identity tombstones after local sample deletion or discard, so the next scrape does not resurrect a rejected recording. A corrupt/interrupted download is retryable, not marked successfully collected. Write files atomically and commit metadata only when durable. Hashes verify content and catch conflicting reused identities; do not collapse distinct device recordings into a single training example silently. Preserve source audio and maintain normalized training copies where normalization changes bytes.

Keep admin tokens server-side, protected on disk, excluded from API responses, frontend bundles, exports by default, and logs. The trainer is intended for a trusted LAN; do not imply it is secure for unauthenticated public exposure. Scope filesystem access and bound remote requests, audio downloads, conversion, and upload sizes. Validate configured device endpoints and prohibit unexpected redirect destinations. Builder determines private-LAN-compatible connection validation and explicit TLS policy; never silently disable certificate verification.

## Pages

### Wakewords

Create, edit, and list wakeword workspaces, with pending-review counts, latest model, and schedules. Creation establishes phrase, language, and stable model ID. Editing display text must not silently rename a deployed model. Detect duplicate/ambiguous diagnostic phrase mappings and require explicit resolution. Do not delete archived models or samples as a side effect of changing the active workspace.

### Negative Datasets

Searchable, filterable compact catalog with dataset description/source, license where available, disk/download size, installation state, progress/error, and inclusion for the selected wakeword. Share downloads on disk while maintaining wakeword-specific selection. Reuse actual existing supported datasets; do not present fictional mockup categories as available datasets. Registry structure should allow more datasets without redesigning the page. Changes affect future runs, not an active run's snapshot.

### Artificial

Compact generation recipe and batch history, separate from human review. Phrase comes from the selected wakeword, not an independently editable duplicate. Expose existing Hybrid, Modern-only, and Piper-only routes, supported language catalog, and conditional English accent emphasis. Explain which engines actually participate for the selected language and whether an accent setting applies; do not promise direct arbitrary engine selection if the backend cannot provide it.

Recommendation: explicit generation jobs producing identifiable batches; choose which completed batches enter future training. Keep previously generated batches instead of silently replacing them. Failed/partial batches are not training-ready. Training should reuse selected completed batches rather than regenerate synthetic inputs silently on every scheduled run. Use existing generator capabilities and expose supported options only. Exact batching controls and target counts must be grounded in the generator during implementation planning. An engine-generated pronunciation preview was shown as a proposal, not an agreed requirement: defer it unless existing support makes it straightforward; do not mislabel browser system-voice playback as generator output.

### Scrape

One shared collection cron, timezone, enabled state, human-readable schedule, next run, last results, manual "Scrape now", and collection history. Device management here and Deploy use the same registry and add-device flow.

Adding a leader authenticates using its admin token, calls `fleetStatus`, imports followers by stable identity and reported addresses, and keeps membership fresh before scheduled collection and on explicit refresh. Adding a standalone uses its own admin token. Deduplicate devices entered manually and later discovered through the leader. Auto-discovery never copies or invents follower admin tokens; show "Credentials required" and let users enter each once. A bad/offline follower must not block collecting from other devices. Membership removal stops future automatic collection/publication through that fleet but retains samples and history; do not delete anything remotely. Flag role changes for reconciliation rather than silently converting a removed follower to standalone.

Collect both activation and near-miss lists using `getWakeWordActivations`, then retrieve unseen audio using `getWakeWordActivationAudio`. Do not clear kiosk diagnostics. Warn about disabled diagnostics, auth errors, offline devices, retention loss risk, and an entry evicted between listing and audio retrieval. Only report known retrieval failures; total recordings lost between scrapes cannot be measured reliably.

Route source wakeword names through explicit per-device/engine mappings to local workspaces. Unknown or ambiguous phrases remain in an unmapped inbox visible from Scrape/Classify until assigned, never guessed or dropped.

### Classify

Wakeword-scoped queue, source/device and activation/near-miss filtering, useful metadata, compact waveform/player, visible label actions and shortcut legend. Start playback after an explicit initial user gesture to respect browser autoplay restrictions; subsequently autoplay the next clip after an acknowledged label. Handle playback failures without labeling or losing queue position.

Proposed shortcuts: P positive, N negative, Space play/pause, R replay, S skip, Z undo. Suppress global shortcuts while editing fields or when modifier keys are held. Labels persist server-side; prevent double submissions, recover failed saves, stop old audio on transitions, and provide undo backed by label history. Skip leaves the recording unlabeled and eligible for later review. Support explicit discard with tombstone retention. Distinguish positive phrase presence from whether the kiosk triggered. Reviewed samples appear in Samples and are eligible for subsequent runs; pending, discarded, and skipped recordings are not.

### Samples

Search/filter by label, source/device, date, and real versus artificial; paginate large libraries. Play, inspect, relabel, trim using existing features where appropriate, import with explicit wakeword/label, and delete with confirmation. Keep provenance and non-destructive trim history. Changing a label or deleting a file never rewrites a completed training run's input manifest.

### Train

Manual launch and wakeword-specific autotrain cron/timezone. Show effective training inputs, positive/negative/artificial counts, model outputs (microWakeWord with optional openWakeWord companion as already supported), progress/logs, run history, errors, and cancellation.

Defaults proposed by builder: skip scheduled runs if input/config fingerprints have not changed; no additional "minimum new negatives" threshold; at most one GPU training/generation job at a time with a durable queue. Serialize jobs and snapshot their inputs when they actually begin, not while they wait. Labels created during an active run are picked up next time. Pin selected synthetic batches and negative dataset versions/fingerprints. Persist enough input references/content to keep archived-run provenance valid if the visible library changes; use content-addressed/reference-counted storage or retained run copies (builder chooses).

Schedules use standard five-field cron with an explicit IANA timezone, validation, next-run display, and restart-safe run claiming. Default UTC. Coalesce missed ticks to at most one pending run per schedule after downtime; do not replay an unbounded backlog. Manual/scheduled overlapping scrape calls also serialize per device and remain idempotent. Schedule changes do not terminate active jobs.

Successful training is not a promise of improved performance: retain validation metrics available from the training tools and show them alongside prior versions. Preserve a stable held-out evaluation split by recording/content family so the same audio and derived variants cannot cross train/evaluation boundaries as datasets grow. Require supported artifact checks and successful training before automatic publication; no invented metric threshold. Failed runs retain logs and any diagnostic artifacts but are not publishable versions. Every successful completed model version is archived even if a later deployment fails.

### Deploy

Publish archived files through Kiosk Satellite's existing custom-model upload mechanism, staging files using `POST /api/voice/wake-models/upload?name=...`, then `commitCustomWakeModels`. Check returned accepted/rejected results rather than interpreting HTTP 200 as complete success. Use stable model identities and filenames on devices; use versioned immutable directories only in this trainer. Preserve unrelated uploaded models. Publication means model availability, not changing engine, wakeword selection, thresholds, or either enabled slot.

For a configured fleet, publish to the leader and use existing model sync for eligible followers. Clearly label device roles in Scrape and Deploy; followers are collection sources and indirect distribution recipients, never direct upload targets. Every registered standalone kiosk and the one registered fleet leader are publication targets for every wakeword; adding a leader enrolls its current and future eligible followers indirectly. There is no separate collection-only enrollment or per-wakeword target selection in the initial scope, consistent with the user's request to publish to all configured kiosks.

Kiosk code mirrors custom model files only when a follower profile syncs Voice Satellite; it can remove follower-only files. The user explicitly accepts the leader as authoritative: existing fleet propagation of settings/selections and removal of follower-only files are allowed existing behavior, not changes initiated by the trainer. The no-selection-change and unrelated-model-preservation requirements apply to the trainer's own actions and directly uploaded targets, not an override of existing leader-controlled mirroring. Warn about this in fleet setup. Display non-syncing profiles as blocked/not covered, not successfully deployed, and do not change profiles automatically. A follower cannot be manually treated as a standalone upload target while it remains a fleet member. Support one configured leader plus standalone kiosks; multiple-fleet management is out of scope initially.

Archive manifest/model bundles, timestamp, checksums, configuration, run ID, data provenance, and available metrics for every successful version. Show per-target publication state and retries for offline targets; distinguish leader upload success, follower file synchronization, and runtime use. Verify remote content using the existing SHA-256 custom-model manifests where accessible; do not claim active inference simply from upload success. Rollback republishes a chosen archived version under the same stable identity without deleting newer trainer archives or enabling an inactive word. Automatic retry must respect the current desired version so an old retry cannot undo a newer publish or rollback.

Current source indicates custom-model changes refresh engine/catalog state, but implementation must verify replacement of a selected stable-ID model actually reloads new bytes and preserves both slots. Add an integration/contract test for that behavior; if unsupported by the existing API, report the blocker rather than change satellite behavior or force selections.

## Migration and compatibility

Do not silently assign existing singleton personal/negative/captured samples to a new wakeword. Provide explicit one-time import into a chosen workspace, retaining a backup and recording provenance. Existing trained files can be registered as legacy archived versions when their phrase/model identity is known, otherwise require assignment. New structured metadata and directories must not clobber old paths or in-progress jobs. Document migration, persistent volume layout, and Docker dependencies.

## Acceptance and verification

- Sidebar and all data contexts work with two or more wakewords; no cross-workspace sample/config leakage.
- Large catalogs/libraries paginate or filter without rendering every item.
- Restarting/repeating scraping never duplicates imported or discarded clip identities; transient download failures retry.
- Adding the one leader from either page discovers followers in both; missing follower credentials are actionable and do not prevent other devices from working.
- Cron expression/timezone validation, due-run claiming, overlap, restart recovery, missed ticks, and GPU queue behavior have deterministic tests.
- Classification shortcuts, autoplay gating, undo, skip, stale requests, and failed saves have UI tests.
- Real reviewed, generated, and negative-dataset inputs remain traceable in each run; unlabeled data cannot enter training.
- Upload/commit rejection, offline retry, fleet eligibility, stable-ID replacement, rollback, and no-selection-change contracts are tested using realistic API fixtures; validate live device behavior when a user-provided test device is available.
- Existing relevant Python tests pass, frontend typechecking/build pass, and built static assets are updated. Real CUDA training verification is separately reported if unavailable locally.

## Design workflow checklist

- [x] Confirm workflow, retention, schedules, publication, and fleet credentials with user.
- [x] Review compact visual mockup with user.
- [x] Draft full design.
- [x] Independent builder check and resolve material gaps: leader authority confirmed by user; followers explicitly marked and never uploaded to directly; publication enrollment clarified from the existing all-devices requirement.
- [x] User approves full design and builder-chosen defaults.
- [ ] Produce implementation plan after design approval.

## Left to the builder

Schema/API shapes, backend module extraction, scheduler library, queue mechanism, pagination/search implementation, component structure, Tailwind theme tokens, concrete dataset registry entries based on current tooling, and exact generator batching mechanics. These choices must satisfy this design rather than expand product scope. Do not begin product implementation before full-design approval.
