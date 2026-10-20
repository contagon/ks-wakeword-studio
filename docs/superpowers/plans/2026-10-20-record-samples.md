# Record Samples Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Data → Record for browser microphone samples and relocate the existing Studio sample upload form there.

**Architecture:** Capture with browser MediaRecorder; send the stopped clip to a stateless Studio preview endpoint for normalization and VAD bounds. Review and adjust locally, then explicitly save the original clip and chosen trim into the existing immutable sample/audio library. Use additive capture provenance metadata, following the existing projected provenance pattern, rather than inventing a diagnostic device or rebuilding the samples table.

**Tech Stack:** Vue 3, TypeScript, MediaRecorder/Web Audio, Python/FastAPI, SQLite, existing ffmpeg normalization, lazy Silero VAD.

**Spec:** User-approved conversation and `.superpowers/brainstorm/3454560-1792518033/content/record-page.html`. The acceptance contract below records the approved flow and implementation defaults.

## Acceptance Contract

- Add Record to Data navigation, preserving the selected wakeword in links.
- Record through the browser's current/default microphone, not the server's microphone.
- Start and stop explicitly using a button or Space. Never auto-stop on silence.
- Positive/negative selector defaults to positive. Upload has its own independent label.
- After Stop, suggest a VAD trim with 80 ms padding at each end, bounded by clip duration; use first speech start through last speech end, retaining interior pauses.
- Show a waveform, trimmed playback, Adjust trim, Retake and Save sample. Do not create a sample before explicit Save.
- Retain the original audio and derivative family lineage. Save microphone provenance distinct from uploads (`import`) and scraped samples (`diagnostic`).
- No speech or unavailable VAD means full-clip selection and a clear warning, not data loss or a blocked negative noise sample.
- Move the current single-file upload form from Samples to Record. Preserve its endpoint, formats, explicit label and non-automatic trimming behavior. Leave the legacy trainer upload untouched.
- Disable capture/upload until a wakeword is selected. Surface permission, unsupported browser, device and network errors.
- Space ignores repeats, modifiers, editable fields, other interactive controls and open modal/job-drawer interactions; native button keyboard activation must not toggle twice.
- Preserve unsaved review data after failed analysis/save; allow retry. Disable duplicate operations during processing/saving.
- Stop tracks and playback, abort requests, clear timers and release object URLs on retake, workspace change and unmount. Late permission/analysis responses must not resurrect obsolete recordings.

## Global Constraints

- Reuse normalization to 16 kHz mono signed 16-bit WAV and existing bounded upload/duration validation; no unbounded decoding or client filenames as paths.
- Do not import `trainer_server.py` into Studio or reuse its global legacy session state.
- Actual remote microphone access needs HTTPS or a browser-trusted secure context; show guidance without changing deployment/TLS configuration.
- Preserve unrelated work in `JobQueueDrawer.vue`, `static/ui/trainer-ui.js` and `job-drawer.test.ts`; do not overwrite the generated bundle without integrating current source changes.
- No automatic commits or dependency installation without user authorization. Proposed commit messages below are optional handoff boundaries.

## Review Focus

1. Permission resolves after navigation: stop the newly granted tracks and never start an orphan recorder (Task 3).
2. Negative clip has background noise but no speech: keep the complete clip, playable and saveable (Tasks 1, 3).
3. Workspace switches during analysis or save: no result or label from the previous word may attach to the new word (Tasks 2, 3).
4. Trimmed duplicate matches another evaluation family: preserve existing collision rejection, never silently merge families (Task 2).
5. Repeated keydown, focused controls or a modal: exactly one intended transition, no accidental capture or premature stop (Task 3).

---

### Task 1: Stateless VAD preview

**Files:** Create `studio/capture.py`, `tests/test_studio_capture.py`; modify `studio/models.py`, `studio/api.py`.

**Interfaces:**
- `CapturePreview`: `duration_s: float`, `start_s: float`, `end_s: float`, `trim_method: str` (`silero` or `none`), `warning: str | None` (`no_speech` or `vad_unavailable`).
- `analyze_capture(data: bytes, max_bytes: int) -> CapturePreview` in `studio/capture.py`; normalize using `normalize_audio` before detecting speech.
- `POST /api/studio/wakewords/{word_id}/samples/capture/preview`: multipart `audio`; verify workspace/MIME/size, return `CapturePreview`, and persist no database rows or blobs.
- Lazy Silero loader and inference run under a lock because its model state is mutable. Keep Studio isolated from legacy server initialization. Inject/mock speech detection in unit tests; no model downloads in tests.

- [ ] Write tests for first-to-last speech with 0.08 s padding, bounds clamping, separated speech with interior silence retained, no speech retaining full duration, unavailable VAD warning, malformed/oversized audio rejection and unknown workspace. Assert preview leaves sample/blob counts unchanged.
- [ ] Run `python -m pytest tests/test_studio_capture.py -v`; confirm the new contract fails before implementation.
- [ ] Implement the preview model, isolated VAD utility and bounded multipart route. Decode and inference errors must not leak paths or raw diagnostics. Invalid audio remains an error; only unavailable/failed VAD falls back to full clip.
- [ ] Run the new tests plus `python -m pytest tests/test_studio_samples.py -v`; require all passing.

### Task 2: Save microphone samples with durable provenance

**Files:** Create `studio/schema_capture.sql`; modify `studio/db.py`, `studio/models.py`, `studio/samples.py`, `studio/api.py`, `tests/test_studio_capture.py`.

**Interfaces:**
- Add schema version 16: `sample_capture_metadata(sample_id PRIMARY KEY REFERENCES samples(id), trim_method TEXT NOT NULL, start_s REAL NOT NULL, end_s REAL NOT NULL, duration_s REAL NOT NULL)` with an immutable-update trigger and constraints on method (`silero`, `manual`, `none`) and finite valid interval. This table identifies microphone capture; never store browser device identifiers.
- Keep underlying `samples.source='import'` compatible with its immutable CHECK; project public source as `microphone` when capture metadata exists, then existing migration provenance/source. Update public source filtering so import excludes microphone captures and legacy behavior stays unchanged.
- Add optional `capture` metadata to the public `Sample` and TypeScript counterpart later; keep diagnostics' existing restricted metadata projection unchanged.
- `SampleService.capture_audio(word_id: str, label: str, audio: BinaryIO, start_s: float, end_s: float, trim_method: str) -> Sample`: normalize, validate, preserve original/root audio, create cropped derivative if needed, attach provenance and publish one visible labeled sample atomically. Reuse existing blob and family admission logic; do not commit an imported sample before trimming.
- `POST /api/studio/wakewords/{word_id}/samples/capture`: multipart `audio`, `label`, `start_s`, `end_s`, `trim_method`; return 201 Sample. Capture accepts only positive/negative, unlike generic manual relabeling.

- [ ] Write tests for positive/negative saves, original bytes retained, exact crop frames, full-clip saves, metadata and source/filter behavior, normalized original family sharing, cross-family trim collision, no partial sample on failure, invalid/nonfinite/out-of-range bounds, invalid labels/methods, unknown word and migration/reopen retaining old samples/history.
- [ ] Run `python -m pytest tests/test_studio_capture.py -v`; confirm new save tests fail before implementation.
- [ ] Implement additive migration, public metadata projection, atomic service method and API. Ensure trimmed audio remains undoable through existing history where applicable, originals remain addressable and existing sample operations still work.
- [ ] Run `python -m pytest tests/test_studio_capture.py tests/test_studio_samples.py -v`; require all passing. Check schema-version assertions elsewhere and update only those whose contract is legitimately changed.

### Task 3: Browser capture, review and relocated upload

**Files:** Create `frontend/src/studio/capture.ts`, `frontend/src/studio/components/CaptureReview.vue`, `frontend/src/studio/pages/RecordPage.vue`, `frontend/src/studio/__tests__/record.test.ts`; modify `frontend/src/studio/api.ts`, `frontend/src/studio/types.ts`, `frontend/src/studio/routes.ts`, `frontend/src/studio/components/StudioShell.vue`, `frontend/src/studio/pages/SamplesPage.vue`, `frontend/src/studio/studio.css`, `frontend/src/studio/__tests__/fakeStudio.ts`, `frontend/src/studio/__tests__/samples.test.ts` and route/navigation tests as required.

**Interfaces:**
- `studioApi.previewCapture(word: string, audio: File, signal?: AbortSignal): Promise<CapturePreview>` and `studioApi.saveCapture(word: string, audio: File, label: 'positive' | 'negative', selection: { start_s: number; end_s: number; trim_method: 'silero' | 'manual' | 'none' }, signal?: AbortSignal): Promise<Sample>` consume Tasks 1–2.
- `useMicrophoneCapture()` in `capture.ts` owns permission, MediaRecorder, stream, elapsed time, original File, state (`idle`, `requesting`, `recording`, `review`, `error`) and `start(): Promise<void>`, `stop(): void`, `reset(): void`, `dispose(): void`. Choose a supported MediaRecorder MIME (WebM/Opus, Ogg/Opus, MP4 fallback); use browser defaults when none can be negotiated and validate the resulting container server-side.
- `CaptureReview.vue` takes `audio: File`, `preview: CapturePreview`; emits `selection` with validated bounds and trim method. Decode local audio for waveform/selection playback, close audio contexts and revoke URLs. Adjust trim uses actual duration, not the current legacy-dependent modal's fixed 1-second Studio fields.
- `RecordPage.vue` owns selected label, analysis/save lifecycle and independent upload form. Freeze capture's workspace identity; cleanup/clear on workspace change. Snapshot save payload and ignore stale UI responses. No auto-save and no sample creation on Retake.

- [ ] Write MediaRecorder/getUserMedia tests for explicit start/stop, positive/negative labels, full original upload plus selected bounds, trimmed review, manual adjustment, save success/reset, retake without mutations and independent upload labels. Assert Samples no longer renders import form, while Record imports via the unchanged endpoint and View samples retains word selection.
- [ ] Add tests for denied/missing/insecure microphone, MIME selection, empty recorder output, VAD warnings, decode failure, failed preview/save retry preserving original, duplicate click prevention, late permission/analysis results, workspace changes and resource cleanup. Cover keyboard focus/repeat/modifier/modal guards including native Space activation on the recording button.
- [ ] Run `npm --prefix frontend test -- --run src/studio/__tests__/record.test.ts src/studio/__tests__/samples.test.ts`; confirm newly required behavior fails before implementation.
- [ ] Implement capture ownership, review component and page using existing Studio light/dark styling and responsive layout. Move (do not duplicate) the Studio upload form; leave sample management and legacy upload intact. Add public microphone provenance display/filter and route mounting.
- [ ] Run `npm --prefix frontend test -- --run` and `npm --prefix frontend run typecheck`; require all passing, including existing navigation and sample regressions.

### Task 4: Integration verification and usage notes

**Files:** Create `frontend/e2e/record.spec.ts`; modify `README.md` only for recording/shortcut/secure-context usage. Review `frontend/playwright.config.ts` before selecting browser test commands.

- [ ] Add a browser test using fake microphone media for start/stop, review, label, save and navigation to the combined sample library; exercise Space and manual trim beyond one second. Mock API analysis where needed, but verify real browser media lifecycle and playback.
- [ ] Run the specific Playwright test using the repository's configured web server and confirm it passes; if browser prerequisites are absent, report the blocker rather than claiming a real browser test.
- [ ] Document Data → Record, Space shortcut, manual Stop, explicit Save, original retention and HTTPS/localhost requirement. No TLS provisioning or additional recording modes.
- [ ] Run `python -m pytest tests/test_studio_capture.py tests/test_studio_samples.py -v`, `npm --prefix frontend test -- --run` and `npm --prefix frontend run typecheck`; inspect final diff for unrelated changes and run the frontend build without discarding existing bundle work. Report exact verification outcomes and any pre-existing failures.

## Self-Review

The acceptance contract maps to Tasks 1–4; all five Review Focus risks have explicit owning tests. Preview persists no data, Save is atomic, and microphone source projection preserves the existing constrained schema. Existing runtime already installs Silero; failures degrade visibly rather than requiring new dependencies. Implementer should inspect current work before touching any file and avoid committing incidental mockup state/session keys.
