# Overall UI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the four Overall items in TODOS.md.

**Architecture:** Reuse the Studio's browser-local `absoluteTime` formatter and reactive global job queue. Keep explicit queue-opening controls, but remove automatic opening after submissions. Apply shared CSS for busy buttons, failure badges, and selection-button alignment.

**Tech Stack:** Vue 3, TypeScript, Vitest, existing Studio CSS.

**Spec:** User-approved description in this conversation: browser-local readable dates and times throughout; no automatic queue opening; gray disabled submission buttons with spinners while queued/running; red failure badges; right-aligned Save selection buttons.

## Global Constraints
- Use browser-local dates and times, not relative-time text.
- Preserve explicit View in queue controls and queue monitoring.
- Do not alter backend timestamp storage or scheduling timezones.
- Build on existing frontend patterns without adding dependencies.

## Review Focus
- Invalid or missing timestamps must not render Invalid Date.
- Active jobs discovered after navigation must still disable their matching submission controls.
- Terminal jobs must release busy controls, including failures and cancellations.
- Dataset activity must affect the matching dataset, not every download button.
- Failures must remain legible in both light and dark themes.

### Task 1: Browser-local timestamps
**Files:** `frontend/src/studio/time.ts`; timestamp renderers in `pages/{TrainPage,DeployPage,ArtificialPage,AutomatePage,WakewordsPage,TestingPage,ClassifyPage}.vue` and `components/{JobQueueCard,CollectionHistory,CronEditor}.vue`; `frontend/src/studio/__tests__/{time,train,deploy}.test.ts`.

**Interfaces:** Reuse `absoluteTime(value: string | Date): string`; retain other time exports unless unused, to avoid unrelated API changes.
- [x] Add formatter tests comparing output with browser-local Intl formatting, covering explicit UTC offsets, invalid values, and empty values; adjust train/deploy assertions to local-only output.
- [x] Run `npm test -- --run src/studio/__tests__/time.test.ts src/studio/__tests__/train.test.ts src/studio/__tests__/deploy.test.ts` in frontend; confirm new expectations fail before implementation.
- [x] Replace raw timestamp and relative-time rendering with `absoluteTime`, and remove clocks used only for relative displays. Inspect remaining timestamp fields for missed renderers.
- [x] Rerun targeted tests and confirm PASS.

### Task 2: Quiet queue submissions and busy controls
**Files:** `frontend/src/studio/pages/{ArtificialPage,TrainPage,NegativeDatasetsPage,ClassifyPage}.vue`; `frontend/src/studio/components/AugmentationDatasets.vue`; `frontend/src/studio/studio.css`; corresponding `__tests__/{artificial,train,datasets,classify}.test.ts`.

**Interfaces:** Consume `queue.activeJobs`, `queue.jobs`, `queue.track(job)`, and `isActiveJob(job)`. Keep `queue.show(id)` exclusively for explicit user actions.
- [x] Add tests asserting submission leaves the queue closed, matching buttons have `aria-busy="true"` and are disabled during requests and active jobs, terminal jobs release them, and explicit queue buttons still open the drawer. Include restored active jobs, workspace changes, individual download isolation, and collection submission where applicable.
- [x] Run `npm test -- --run src/studio/__tests__/artificial.test.ts src/studio/__tests__/train.test.ts src/studio/__tests__/datasets.test.ts src/studio/__tests__/classify.test.ts`; confirm regression expectations fail.
- [x] Remove automatic `queue.show` calls. Derive active state using job kind, workspace and dataset/provider identifiers; expose it via disabled and aria-busy bindings. Keep matching download controls rendered during activity. Add shared busy-button spinner and gray styling, respecting reduced motion.
- [x] Rerun targeted tests and confirm PASS.

### Task 3: Failure badges, alignment, and final checks
**Files:** `frontend/src/studio/studio.css`; `frontend/src/studio/pages/{ArtificialPage,NegativeDatasetsPage,DeployPage}.vue`; `frontend/src/studio/components/AugmentationDatasets.vue`; corresponding frontend tests; `TODOS.md`.

**Interfaces:** Reuse `studio-status-failed` and add a consistent selection-action class with auto left margin.
- [x] Add assertions for failure status classes and right-aligned selection-action classes. Cover light/dark failure rules with stylesheet checks or browser assertions.
- [x] Run affected tests and confirm new assertions fail.
- [x] Add red failure/interrupted badge styles for both themes; bind missing failure classes and map publication failures to the failure style. Mark every Save selection button with the shared right-alignment class.
- [x] Run `npm test -- --run` and `npm run build` in frontend; inspect `git diff --check` and the final diff. Mark Overall checklist complete only after successful verification.

No commits are requested; leave reviewed changes in the working tree.
