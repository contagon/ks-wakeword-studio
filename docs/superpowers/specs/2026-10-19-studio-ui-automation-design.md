# Studio UI and workspace automation design

## Status and source of truth

The user approved the interactive preview through revision 6 and asked to continue. This document records that design, plus explicitly identified engineering defaults needed to make it real. Production implementation has not started.

Visual reference: `.superpowers/brainstorm/1558512-1792423791/content/studio-navigation-preview-v6.html`. The preview is a layout reference, not production code, and its illustrative data, DOM-rearrangement scripts, and simulated actions must not be copied into the app.

## Intent

Separate fleet setup from daily audio review and wakeword automation. Make collection, classification, training, and deployment understandable and controllable without implicitly publishing every successful training run. Retain the existing Vue/TypeScript frontend, Python/FastAPI services, SQLite persistence, and queue-owned worker architecture.

## Approved navigation and pages

Sidebar order:

1. Wakewords
2. Kiosks
3. Data: Negative Datasets, Artificial, Classify, Samples
4. Models: Train, Deploy, Automate

Automate is immediately after Deploy; there is no separate Automation group or Automations label. Remove the standalone Scrape page. Existing Scrape links should resolve to Classify's Collect tab without losing the workspace selection.

### Kiosks

Flat fleet setup page, with no Setup/Automate tabs. Move the existing device registry here, preserving the user's in-progress password-login work. Remove registration/credential forms from Classify and Deploy. Keep delivery status and relevant publication warnings on Deploy, with a Manage kiosks link.

### Classify

Tabs: Review, Collect, Unmapped. Review retains current player, keyboard shortcuts, labeling, undo, skip, and discard confirmation. Collect contains history and links to collection settings, not kiosk setup or editable schedules. History remains fleet-wide and is labeled as such. Unmapped remains a shared fleet inbox and distinguishes assigning one recording from saving a reusable device/engine/source-phrase mapping.

Place a primary **Collect** button at the top right of the page, visible on every tab. It queues collection for the currently selected workspace immediately, even if its automatic schedule is disabled. Disable it with no selected workspace; show queued/running/progress/failure states and refresh that workspace's pending queue after completion. Do not block the HTTP request on kiosk downloads or change kiosk settings. A workspace switch must not attach the old action's result or notice to the new workspace.

### Automate

All controls apply to the workspace selected in the header. Do not show a separate Wakeword-specific banner or a Wakewords to collect list. The Automatic collection card may name the selected workspace as contextual copy. Switching workspaces only changes the settings being viewed; it never enables or triggers a workflow.

Cards:

- Automatic collection: per-workspace enable switch, schedule/timezone, last result and next run.
- Automatic classification: per-workspace enable switch, Faster Whisper (recommended default) or Parakeet ONNX, after-collection or scheduled mode, optional classification rules.
- Automatic training: independent enable/schedule, skip unchanged inputs, link to training inputs.
- Automatic deployment: independent scheduled enable/schedule, plus optional **Deploy after successful training**. Show manual-only/after-training/scheduled/both status.

Keep manual Train and Deploy actions on their existing pages. Replace their schedule editors with status and links to Automate. Use the existing five-field cron/timezone semantics; friendly presets may wrap cron without a new scheduling library. Expose last run/failure and next occurrence using real persisted schedules/jobs, not preview placeholders.

### Wakewords

Remove Selected workspace/Open workspace buttons. Make each card an accessible keyboard-operable selection target with an obvious selected state; right-align the language. Remove the persistent bottom-right edit module. Preserve rename/language editing and deletion in a small Actions menu and dialogs, including existing destructive confirmation and deployed-identity protections. Keep creation and overview.

### Artificial

Use **50,000 total samples** and **100 batch size** for a new unsaved recipe, matching upstream `cli/shell.functions`. Preserve saved recipe values, including existing 1/1 recipes. Preview remains 1/1. Samples remain shared across selected engines; explain engine-specific effective batch limits and memory usage.

Piper remains visible for supported languages when voice assets are absent, disabled with an actionable explanation. Existing installed voices enable normal selection and previews. Distinguish supported-but-not-installed from unsupported-language cases. Merely opening the page never downloads models; no automatic installer is in scope.

### Theme

Header light/dark toggle; default to the OS preference until the user overrides it. Persist the explicit preference in local storage and tolerate denied/malformed storage. Follow live OS changes only without an explicit preference. Apply the theme before first paint to avoid flashing light mode. Style all Studio surfaces, inputs, hover/focus/selected/disabled states, badges, modals, errors, audio controls and logs; preserve readable contrast and meaningful verified-success colors. Do not leak Studio theme rules into the separately scoped legacy trainer.

## Backend behavior and engineering defaults

The following are builder decisions, not additional user quotations. They should be reviewed with the implementation plan.

### Settings, scopes, and upgrade

- Persist automation settings by stable workspace ID, never display phrase or selected browser state. New automation switches default off; Faster Whisper and automatic-negative labeling are the default classification choices once classification is enabled. Close-miss promotion defaults off. New schedule presets: collection every 30 minutes, classification hourly when scheduled, training daily 02:00 UTC, deployment daily 04:00 UTC; all use UTC until changed.
- Retain existing per-workspace training schedules unchanged. Retire the old global automatic `scrape` schedule and preserve its record/history disabled; copy its cron/timezone into disabled workspace collection schedules so there is no hidden fleet-wide collection bypass. Cancel unclaimed global scheduled scrape jobs on upgrade, retain their rows, and never kill live owners or delete their work. Upgrade must occur with the old runtime stopped; document that prerequisite.
- Stop unconditional publication of training archives. Existing desired versions, explicit publications and authorized retries remain intact. Old unconsumed training events are baselined as processed, not replayed when the new policy is first enabled. Existing workspaces receive deployment-after-training off, matching the approved separation.
- Settings changes affect future dispatch. Already-started network work is not undone. Disabling an automatic schedule prevents queued scheduled work from starting; it does not cancel manual requests. The new dispatcher rechecks enabled/policy state when a scheduled job is claimed.
- Workspace deletion removes new settings, status, classification provenance, and workspace schedules in the existing transaction/cleanup scheme; preserve shared data and other workspaces.

### Collection isolation and unmapped recordings

Resolve exact device + engine + source-phrase mappings before downloading. A workspace collection imports only recordings mapped to that workspace and skips recordings mapped to other workspaces without marking them seen, failed, discarded, or permanently suppressed. Re-enable/manual collection can fetch skipped recordings still present in the kiosk's rolling buffer; no promise of recovering evicted recordings.

Unknown sources may still enter the existing shared Unmapped inbox, once per device/clip, during a collection pass. They are never assigned to the selected workspace implicitly and never auto-classified. This shared discovery is the deliberate exception to workspace-scoped imports, and must be stated in Collect/Unmapped help text. Preserve idempotence, tombstones, conflict quarantine, bounded retries, pinned device identity, fleet membership safety and device locking. Recheck mappings at ingest if they change during a download; never route the result into another workspace as a side effect of a scoped job.

Manual collection bypasses the workspace's schedule/enable state, not safety checks or workspace filtering. The new UI must not call the old fleet-wide scrape endpoint. Keep the old explicit fleet API for compatibility, clearly outside the new scoped workflow; no new UI or scheduler uses it.

### Automatic classification

Run through the durable job queue on the GPU resource, so STT cannot overlap training/generation. Use a queue-owned child process with lazy model loading to release model memory after the job. Reuse upstream STT model choices/runtime fallback and conservative transcript matching, without invoking legacy file-moving/deleting workflows or writing global legacy auto-train state.

- Operate on pending diagnostic samples in this workspace only; never manually imported positives/negatives, synthetic audio, unmapped sources, quarantined recordings, or VAD-blocked captures.
- Use the mapped workspace phrase/language. For a nonempty activation transcript clearly missing the phrase, label negative only when the automatic-negative rule is enabled. Preserve upstream minimum transcript length, normalized token matching and ambiguous/near-match handling, including Faster Whisper's guided confirmation before deciding a near match.
- Ordinary confirmed wakes remain pending for manual review. Empty/short/ambiguous transcripts remain pending. Close misses never become automatic negatives; optional confirmed close-miss promotion may label positive. No automatic deletion.
- Record engine/model, settings fingerprint, sample/audio revision, safe outcome and timestamps; do not put raw transcripts or arbitrary remote metadata into public job results/logs. A concurrent manual edit/trim/delete wins: optimistic revision checks prevent overwrites. Process each unchanged sample/config once; changed audio or classification settings may be reconsidered. An explicitly undone automatic label remains pending and is not immediately relabeled for the same audio/config.
- After-collection dispatch runs only for successful new mapped imports, or a partial collection with successful imports, in that workspace. Scheduled mode scans eligible pending backlog. Persist trigger events and dedupe them across restart; no reliance solely on a fallible in-memory completion callback.

### Training and deployment independence

Both manual and scheduled training produce immutable archives without publication unless the workspace opted into deployment-after-training. The option applies to successful new manual or scheduled training runs. Failed/cancelled/interrupted/skipped/unchanged runs and legacy imported archives do not trigger it. Recheck policy at successful completion, dispatch durably once per eligible version, and recover the finish/callback crash window without replaying old archives.

Scheduled deployment is separately enabled and publishes the latest newly eligible completed, validated non-legacy archive at the tick. No new archive means a visible skipped result, not a republish. Track an archive-insertion high-water mark rather than trusting timestamps. Manual publication/rollback establishes a high-water mark through currently existing eligible archives, so automatic retries or later scheduled ticks do not undo a deliberate rollback; a newly completed archive may trigger future automation. Turning scheduled deployment on is an explicit request to evaluate the latest eligible archive once, without changing the deploy-after-training setting. Subsequent ticks use the recorded watermark.

Keep publication's existing exclusive staging/quarantine prerequisites, leader-authoritative mirroring, follower eligibility, retry bounds and desired-versus-observed status. Automation does not edit enabled engine slots, thresholds or wakeword selections. Disabling automation does not cancel already authorized delivery retries. If scheduled and after-training deployment converge on one version, create one intent without redundant revision churn.

## Boundaries and delivery

No new dependencies, router framework, installer UI, live GPU training, remote kiosk publication, Docker restart, commit of unrelated changes, or visual-preview code in the production bundle. Existing uncommitted kiosk password-login work is user work and must be preserved. Tests use fixture kiosks and stub inference/training; actual model/hardware smoke tests are explicitly separate.

Build in three dependent slices: workspace automation backend, navigation/workflow frontend, and theme/polish/integration. Keep service boundaries small: scheduling, automation policy/dispatch, classification, collection, publication and theme each retain clear ownership.

## Acceptance

Production UI matches the final preview's layout and naming, with real persisted settings and real queue/status feedback. Workspace switching is race-safe. Automation stays off until enabled, training alone does not publish, manual Collect works when scheduling is off, Piper availability is explained, defaults match upstream, existing saved data survives upgrade, and light/dark mode works across reloads and narrow layouts. Python service/API tests, frontend unit tests, typecheck/build, and fixture-based browser tests cover the workflows without contacting real devices or loading GPU models.
