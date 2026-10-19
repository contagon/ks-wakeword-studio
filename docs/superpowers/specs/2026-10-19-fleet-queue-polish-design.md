# Fleet and global queue polish

## Approved direction

The user approved the compact queue cards and kiosk edit/delete controls shown in `.superpowers/brainstorm/1663530-1792431415/content/fleet-job-queue-compact.html`.

- Allow editing kiosk connection addresses, including discovered followers.
- Allow removing kiosks from Studio, with confirmation.
- Add a top-right queue icon opening a right-hand overlay drawer.
- Show jobs across all wakewords, kiosks, and followers, independent of the selected workspace.
- Replace inline job consoles with the global queue.
- Remove Automatic training from Train, not from Automate.

## Fleet behavior

Editing changes Studio's connection address, not kiosk identity, role, membership, or enabled wakewords. Validate using the existing URL normalizer. A follower's manually edited address survives fleet refreshes. Saving an address must work even if the kiosk is currently unreachable. Retain server-only credentials; never expose them to the browser.

Removal is local to Studio and preserves recordings, models, publications, and historical provenance. Removing a leader also removes its discovered followers from the visible registry. A removed follower may be rediscovered by an explicit fleet refresh, as disclosed in the confirmation. No remote fleet-changing commands are sent.

Implementation choice: use retained registry records with a removal marker rather than SQL deletion because collection and publication history have foreign keys to devices. Removed records cannot be automatic collection/publication targets or authenticate through stale snapshots. Explicit registration or roster discovery may restore them. An omitted roster member is not automatically restored.

## Global queue behavior

Use the existing persisted Studio job system; do not introduce a second execution queue. Include manual and scheduled jobs and shared dataset downloads. Collection jobs can span multiple devices: show those device IDs without inventing separate per-follower jobs. Synchronous operations need not become jobs.

The icon displays the total queued/running/cancelling count even when the drawer is closed. The drawer groups Running (including cancelling), Queued, and recent terminal jobs. Compact cards use roughly 10px vertical padding, a single title/status/cancel row, concise workspace/device metadata, and collapsed logs. Fetch log tails only when expanded. History supports loading older jobs; active jobs must not disappear behind history pagination.

Implementation defaults: poll status every 2 seconds, refresh immediately after enqueue/cancel, preserve the drawer across page/workspace navigation, and open it on manual enqueue or a View in queue action. Closing the drawer does not stop job monitoring or execution. No automatic opening for scheduled jobs. Show shared-work labels when `word_id` is null, and fallback IDs when workspace/device names are unavailable.

The modal drawer supports Escape, backdrop close, focus containment, focus restoration to its trigger, and narrow-screen full width. Keep the existing light/dark styling and add no dependencies.

## Page integration

Remove inline consoles from Classify collection, Artificial generation/previews, Negative Datasets, and Train including run-history consoles. Retain useful domain results (preview audio, completed batches, collection warnings, training history) and offer View in queue links where useful. Page completion updates must continue while the drawer is closed; do not lose update callbacks by simply deleting JobConsole.

Train no longer fetches schedules just to render the removed Automatic training section. Automation settings and scheduled runs remain functional in Automate.

## Non-goals and safeguards

No remote kiosk renaming, role editing, wakeword selection changes, new scheduler, job execution reorder controls, or new dependencies. Preserve unrelated user changes in `compose.yaml`, `.env`, `UI_PREVIEW.md`, and existing preview files. Implementation occurs only after the implementation-plan handoff.
