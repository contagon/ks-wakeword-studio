<div align="center">
  <a href="https://taterassistant.com">
    <img src="images/tater-repo-logo.png" alt="microWakeWord Trainer" width="460"/>
  </a>
</div>
<p align="center">
  <a href="https://taterassistant.com">
    <img alt="Visit Tater Assistant" src="https://img.shields.io/badge/Tater%20Assistant-Visit%20Website-F28C28?style=for-the-badge&logo=googlechrome&logoColor=white" />
  </a>
</p>

Kiosk Wakeword Studio manages independent wakeword workspaces, collects rolling kiosk diagnostics, supports manual review and synthetic batches, schedules NVIDIA/CUDA training, and publishes reversible archived microWakeWord models through one fleet leader plus standalone kiosks.

Real samples come from device-captured wake audio, close misses, or manual uploads. Every saved sample is normalized to `16 kHz / mono / 16-bit PCM WAV` before training.

### Record or upload samples

Open **Data → Record**, select a wakeword and choose **Positive** or **Negative**.
Click **Start recording** / **Stop recording**, or press **Space** when focus is
outside another control. Recording uses your browser's current microphone and
does not stop on silence (a 10-minute safety limit applies).
If a delayed browser timer overshoots that limit, the training preview is capped
at ten minutes while saving still retains the complete original recording.

After stopping, VAD suggests a trim around all detected speech, retaining interior
pauses. Play the selection, adjust its bounds, then **Save sample**, or **Retake**.
If speech detection is unavailable or finds no speech, the full clip stays selected;
negative background-noise recordings can still be saved. Originals are retained,
and saved recordings appear alongside scraped data in **Samples**, with a
**Microphone** source filter and capture metadata.

The upload form is now on **Record**, with its own positive/negative label. Uploads
are not automatically trimmed and retain their **Import** provenance.

Browser microphone access requires **HTTPS** or **localhost**. For remote use,
use a trusted HTTPS connection or forward Studio to your local machine and open
it through localhost; a plain HTTP VPN/LAN address will normally block recording.

---

## Docker Image

```bash
docker pull ghcr.io/tatertotterson/microwakeword:latest
```

Tagged releases also publish matching immutable image tags:

```bash
docker pull ghcr.io/tatertotterson/microwakeword:v17
```

The release tag must match `VERSION`. Update `WHATS_NEW.md` before tagging; the Docker workflow prepends it to GitHub's automatically generated release notes.

RTX 50-series / Blackwell GPUs use a separate image with CUDA 12.8 and a
Python 3.13 TensorFlow build for `sm_120`:

```bash
docker pull ghcr.io/tatertotterson/microwakeword:blackwell
docker pull ghcr.io/tatertotterson/microwakeword:v17-blackwell
```

Use the Blackwell image only for RTX 50-series cards. It includes the
community-built TensorFlow wheel from
[chivitiH/tensorflow-blackwell-python313](https://github.com/chivitiH/tensorflow-blackwell-python313),
which is unofficial and licensed CC BY-NC 4.0.

---

## Run The Container

### Local Compose workflow

With Docker Compose v2.30+ and the NVIDIA Container Toolkit installed:

```bash
just build
just start
just stop
```

`just logs` follows logs and `just status` shows service status. The `justfile`
uses `compose.yaml`, builds `ks-wakeword-studio:local`, and exposes the UI at
**http://localhost:8790** with GPU access and 8 GiB shared memory. Forward port
8790 for remote access; it is deliberately bound only to loopback.

Data stays in the external Docker volume `ks-wakeword-studio-data`; `just start`
creates it if missing, and stopping/removing the Compose service does not delete
it. Without `just`, use `docker compose build`, create the volume with
`docker volume create ks-wakeword-studio-data`, then `docker compose up -d` or
`docker compose stop`. First startup installs dependencies into the volume.

**One-time transition from the existing `docker run` container:** Compose cannot
adopt a manually created container with the same name. When ready to switch,
run the commands below; the data volume is retained. Adding these files does
not stop or replace the currently running container automatically.

```bash
docker stop ks-wakeword-studio
docker rm ks-wakeword-studio
just start
```

### Published image workflow

```bash
docker run -d \
  --gpus all \
  --shm-size=8g \
  --network host \
  -e REC_PORT=8789 \
  -v $(pwd):/data \
  ghcr.io/tatertotterson/microwakeword:latest
```

Use a version tag such as `ghcr.io/tatertotterson/microwakeword:v17` when you want to pin a known release instead of tracking `latest`.
For RTX 50-series cards, use `ghcr.io/tatertotterson/microwakeword:blackwell`
or a pinned tag such as `ghcr.io/tatertotterson/microwakeword:v17-blackwell`
in the same `docker run` command.

The flags:

- `--gpus all` enables GPU acceleration.
- `--shm-size=8g` provides shared memory for audio processing workers. This is separate from free disk space and requires recreating an existing container.
- `--network host` exposes the trainer server directly on your host. Studio initiates authenticated requests to kiosks; it does not require legacy satellite push uploads.
- `-e REC_PORT=8789` sets the trainer web UI and captured-audio port. Change this value if `8789` is already in use.
- `-v $(pwd):/data` persists models, downloaded voices, datasets, samples, and generated wake-word artifacts.

If you do not use host networking, publish the trainer port and make sure satellites can reach it from your LAN.

Open:

```text
http://localhost:8789
```

If you change `REC_PORT`, open that port instead. For a local-only service without host networking, publish `127.0.0.1:8789:8789` instead; use a secured reverse proxy for remote access.

---

## Kiosk Studio setup and deployment safety

**Security boundary: the trainer UI and `/api/studio` have no built-in user
authentication. Anyone who can reach the trainer can review private recordings,
change jobs, enroll targets, or trigger publication using its saved credentials.**
Keep it on a trusted admin LAN or loopback, firewall the port, and use an
authenticated HTTPS reverse proxy/VPN for other access. Never expose it directly
to the Internet. Kiosk admin tokens authenticate the trainer *to each kiosk*, not
users to this UI. Submit credentials only over a trusted transport (HTTPS outside
loopback), both from your browser to Studio and from Studio to the kiosk;
browser request inspection can see a submitted password.

1. Create a workspace in **Wakewords** with a unique stable model ID. Editing its
   phrase does not rename device files or change historical versions.
2. In **Kiosks**, add one leader URL and its admin password, or
   add independent standalone kiosks. Multiple fleets/leaders are not supported.
   Refresh the leader roster to discover followers. Each follower initially shows
   **Credentials required**: enter that kiosk's own admin password. Discovery never
   harvests/copies fleet tokens and does not make followers direct upload targets.
   The password is set in kiosk-satellite under **Settings → Device → Remote
   Administration**; its default admin port is **2324**. Studio exchanges the
   password server-side at `/api/login` for a **3650-day (10-year) token**, clears
   the password field immediately, and saves only the token—not the password.
   Existing saved tokens continue to work without re-entering passwords. Treat
   these tokens like passwords: changing the kiosk's admin password does **not**
   revoke tokens already issued. Failed logins require entering the password again.
3. In **Classify → Unmapped**, configure exact device/engine/source-phrase mappings
   to workspaces. **Collect** at the top right immediately queues collection for
   the selected workspace, even when automatic collection is disabled. Recordings
   mapped to other workspaces are skipped before download; unknown sources may
   enter the shared Unmapped inbox but are never implicitly assigned. The Collect
   tab shows fleet-wide collection history. Collect twice safely: source tombstones
   deduplicate recordings, including discarded/deleted clips. Collection never
   clears kiosk diagnostics. Kiosk history is rolling and finite; scrape often
   enough for the device's configured retention. Missed/evicted audio cannot be
   recovered, and Studio does not invent an exact count of previously lost clips.
4. **Classify** with P/N (positive/negative), Space (play/pause), R (replay), S
   (skip this session), Z (undo), and D (confirm discard). Shortcuts pause while
   editing fields/buttons. Acknowledged labels, not mere playback, control training.
5. Select installed negative datasets and completed artificial batches per word;
   save training settings and run manually or configure schedules in **Automate**,
   immediately below Deploy. New unsaved artificial recipes use 50,000 total
   samples; batching remains internal and saved recipes are preserved. Preview
   always uses one sample.
   Piper stays visible with availability guidance when local voice files are missing;
   viewing the catalog never downloads models.

### Workspace automation and theme

**Automate** edits only the workspace selected in the header. Collection,
classification, training, and deployment have independent enable controls and
five-field cron/timezone schedules. Switching workspaces does not enable or start
anything. Automatic classification can run after collection or on a schedule,
using Faster Whisper (recommended, managed `small.en`/`small`) or Parakeet ONNX
(managed INT8 `nemo-parakeet-tdt-0.6b-v3`). STT uses the same queue-owned GPU
resource as training/generation, with CUDA/CPU fallback and lazy model caching in
`/data/auto_train_models`. Model downloads happen only when inference is requested;
fixture tests do not download or run these models.

Clear non-wake activations may become negatives; empty/ambiguous speech stays
pending. Close misses never become automatic negatives, and confirmed positive
promotion is separately opt-in. Manual labels/trims win revision conflicts; no
automatic rule deletes audio. Disabling collection preserves existing recordings
but cannot preserve future clips evicted from a kiosk's finite rolling buffer.

Training creates archives without publishing by default. **Deploy after successful
training** is a separate opt-in and applies to new successful manual or scheduled
runs, not failed/skipped runs or imported legacy archives. Scheduled deployment is
independent of training and publishes only a new eligible archive. Manual rollback
is not silently undone by retries or a later tick without a newly trained archive.
Existing publication staging/quarantine requirements below still apply.

**Upgrade with the old Studio runtime stopped.** The additive schema upgrade
preserves existing training schedules, archives, recordings, desired publications
and authorized retries. It disables the old global scrape schedule and cancels its
unclaimed scheduled jobs (history retained); each workspace inherits its timing
disabled until explicitly enabled. New automation and deploy-after-training default
off, and historical training archives are not replayed automatically. The legacy
explicit fleet scrape API remains for compatibility but is not used by the new UI.

The header theme toggle defaults to your system light/dark preference and remembers
an explicit override in browser storage. It works without storage permission too.

### Prepare immutable augmentation inputs before Studio training

Classifier-negative feature datasets are separate from raw augmentation inputs.
Studio requires all four real installed corpora before an execution snapshot can
be committed. Prepare them explicitly (substitute your mounted `DATA_DIR`):

```bash
bash cli/setup_python_venv --data-dir=/data
bash cli/setup_mit_audio --data-dir=/data
bash cli/setup_audioset --data-dir=/data
bash cli/setup_fma --data-dir=/data
bash cli/setup_chime --data-dir=/data
```

These setup commands perform real, potentially large downloads/conversions. Run
them to completion while training is stopped; Studio does not silently install
corpora after taking a snapshot. Missing/empty/unsafe roots fail training with
setup guidance. Studio hashes each installed file and retains independent copies
under `studio/augmentation/<content-fingerprint>/`. microWakeWord uses
only these pinned paths, never the mutable shared roots. Raw corpus copies are
**not classifier-negative features**, nor are they labeled human negatives.

Intentional cost: the first snapshot of each distinct corpus version needs an
additional full corpus copy plus temporary staging space; changed versions remain
retained for old manifests. Unchanged versions share retained storage across words
and runs. Every snapshot scans/hashes the shared and retained bytes, and the engine
boundary verifies retained checksums again.
Expect substantial disk I/O and snapshot latency on large installations, even for
an unchanged scheduled run. No automatic corpus pruning is performed; retain these
directories with the database and archives. Do not edit retained copies manually.

Studio publication uploads archived models only to the configured fleet leader and
standalone kiosks. Followers receive models through existing fleet synchronization;
eligible followers need their own admin credentials for hash verification and the
authorized cache refresh. Publication does not change either selected slot, engine,
thresholds, or fleet profiles, and does not delete custom models.

**Before enrolling a publication target, arrange initially clean kiosk upload
staging. Do not perform concurrent external/manual model uploads during
trainer-owned publication**, including retries and rollback. This is a required
operational boundary, not an automatic cleanliness check. The kiosk API exposes
no remote staging-list, staging-discard, or staging-lock operation; installed-file
hashes do not reveal staged files. Uncoordinated admin-client safety cannot be
guaranteed. Coordinate other upload clients before enabling automatic publication.

Trainer-owned interrupted uploads are journaled and restored to current desired
versions before later commits. Unknown external staged files, however, may be
committed **before** unexpected acceptance is detected. The trainer then quarantines
the target (`staging_blocked`, cause `staging_unowned`) and stops further automatic
commits/refreshes; quarantine does not undo those unknown changes. Stop external
uploads and arrange separately authorized operator cleanup and review of any
unexpectedly accepted models. There is no automatic cleanup/quarantine-release
endpoint, and republishing does not bypass quarantine. A journaled optional file
with no current desired replacement also blocks publication rather than deleting
it or committing obsolete bytes.

The user-authorized `clearWakeWordModels` operation runs only after verified
publication/synchronization. Cache refresh restarts detection and
clears all engines' downloaded-model caches. Other selected remote models may need
to be downloaded again. Custom uploads and settings remain intact. File verification
and refresh acknowledgement are **not** proof of the version used by inference;
offline, uncredentialed, excluded, and lagging followers are not reported as success.
Rollback chooses an older immutable archive as the new desired version and uploads
it under the **same stable filenames**; it never edits enabled slots or thresholds.
Retries follow the latest desired revision, not an obsolete queued version.
`refresh_pending`, manifest-unverified, and runtime-unverified states are not proof
of live inference; refresh may remain pending until a follower has synchronized and
its own credentials permit verification. The existing leader/fleet remains the
authority for any fleet-controlled selections.

Read-only API help (available even before any model is published):

- `GET /api/studio/deployment/capabilities`: typed staging prerequisites, unavailable
  remote safeguards, quarantine consequences, and operator-action notices. This
  endpoint does not contact kiosks or claim that staging is clean.
- `GET /api/studio/wakewords/{word_id}/deployment/status`: per-target publication,
  manifest, refresh and unverified-runtime states.
- `GET /api/studio/wakewords/{word_id}/deployment/history`: paginated observations.
- `POST /api/studio/wakewords/{word_id}/deployment/publish` or `/rollback` with
  `{"version_id":"<archived-version-id>"}`: claim a new desired revision under the
  same staging prerequisites; these are real mutation endpoints, not setup checks.

## What The UI Does

- **Wakewords**: separate phrases, stable identities, summaries, explicit legacy import.
- **Negative Datasets / Artificial**: searchable paginated catalog, actual per-word
  selection, saved TTS recipes, immutable completed batches, queued job/log status.
- **Scrape / Classify / Samples**: shared registry, global collection cron, keyboard
  review, provenance, revision-safe labels, non-destructive trimming and audio import.
- **Train / Deploy**: effective inputs, one shared GPU queue, per-word cron, retained
  run manifests/checksums/logs, downloadable archives, publication history and rollback.

### Storage, migration and scheduling

Persist the entire `/data` volume (`DATA_DIR` outside Docker). Studio stores
`studio/studio.sqlite3` (with WAL/SHM), content-addressed `studio/blobs/`, isolated
`studio/jobs/`, versioned `studio/datasets/versions/`, immutable
`studio/models/<word-id>/<version-id>/`, and migration records. Kiosk credentials
are separate owner-only files in `studio/credentials/`; protect the volume and its
backups as secrets. Credentials are omitted from public APIs and model exports,
but a full-volume backup contains them. Do not manually delete retained blobs,
dataset versions or archives referenced by old runs. Stop the server/workers for
a consistent full-volume backup/restore; do not copy just a live SQLite main file.
Shared downloaded tools/voices and training environments also occupy `/data`.

No singleton data is silently assigned on startup. Back up the volume, stop legacy
training, create/select a destination workspace, and inspect **Wakewords → Legacy
import**. Explicitly assign unknown phrases/models to workspace IDs before import.
Legacy `personal_samples/`, `negative_samples/`, `captured_audio/` and
`trained_wake_words/` are copied with provenance, never moved or erased. Repeat
imports are deduplicated. Unsupported/unsafe files are skipped and counted; inspect
the report. To revert migration, restore the stopped-server backup rather than
editing SQLite or deleting referenced files manually.

Imports now serialize across processes and commit each source path/content/workspace
claim atomically with its sample/archive record. After a conversion failure or
interruption, retry the import: already admitted sources are skipped, not duplicated.
The inventory completion marker is only a summary, not the admission boundary.

**Legacy archive policy:** import is not successful new training. Imported models
remain browsable/downloadable as `legacy` / `unvalidated` archives and never create
automatic publication events or change the desired version by import order.
Their provenance run endpoint returns a separate `kind: legacy` record, not a
fabricated modern training manifest. In Deploy, explicitly choose **Validate and
publish** (rollback also requires this validation). This invokes the existing
`cli/validate_studio_model.py` using `/data/.venv/bin/python`: TensorFlow must load
the TFLite model, allocate tensors, and expose input/output tensors. Prepare that
environment with `cli/setup_python_venv` first. Checksums or a `TFL3` identifier alone
are not engine validation. Missing runtime, incompatible metadata, or rejected bytes
leave the archive available without publication or remote cache refresh. Successful
explicit validation is recorded separately from immutable archive metadata, and
only then may that explicit action set publication intent under the normal staging
and cache-refresh constraints. Importing further historical versions does not replace
the explicitly chosen version.

Studio mode is the default and default-denies **all legacy `/api` routes** outside
`/api/studio`. `TRAINER_LEGACY_MODE=1` is an explicit isolated compatibility opt-in
for old clients, **not** a demo/stub switch; Studio GPU work is blocked there to
avoid competing legacy GPU owners. The old embedded trainer is retired from the
Studio UI. Instructions below marked legacy require this mode.

Schedules use standard **five-field cron**, an explicit IANA timezone (UTC by
default), and show the next UTC instant. DST gaps/folds follow pinned croniter
6.0.0 + zoneinfo behavior, not a promise of one wall-clock execution every day:
check the displayed next instant around transitions. Restart/delayed polling
coalesces missed ticks to one pending occurrence rather than replaying every tick;
in-flight scopes are not duplicated. Unchanged scheduled training skips a new
build; global collection and each word's training schedule are independent.

### TTS and dataset compatibility

The Artificial page has generation settings above a list of generated datasets.
Choose individual models (OmniVoice, Qwen3-TTS, MOSS-TTS, and installed Piper voices)
using checkboxes. **Generate dataset** remembers the settings and creates a separate
dataset for each provider. **Samples per provider** is not divided: selecting Qwen
and OmniVoice at 20,000 requests two 20,000-sample datasets. Each completed dataset
has an independent training checkbox; new datasets are not selected automatically.
Each model's **Preview** generates one
sample of the workspace phrase using the current language/accent, with playback
controls; previews never enter the training datasets or change saved settings.
Both generation and previews use the GPU queue and report real job progress.
MOSS has its own sample count and requires direct-provider reference audio. Select
multiple completed source datasets, or enable **Generate after current selection**
to queue MOSS after this submission's direct providers with one click. This mode
uses only those new datasets, not older jobs. If any producer fails or is cancelled,
MOSS stops before inference; successful direct datasets remain available.
MOSS needs at least as many distinct reference clips as requested outputs (clips
duplicated across datasets count once). Choose more sources or lower its count
if necessary. Reference selection is separate from training selection. MOSS output
is another independent dataset and retains source family identities for train/eval
splits. MOSS previews require completed sources; after-current mode cannot preview
references that do not exist yet. Historical mixed-provider datasets remain intact
and cannot serve as MOSS sources; completed direct-only historical datasets can.
Piper availability depends on installed voices; English accent
emphasis applies only where supported. Completed selected synthetic batches join
explicitly reviewed real audio; generation is not silently rerun by training.
Evaluation families remain stable across variants and historical runs.

The current negative catalog contains **MWW feature tensors only** (`mww_mmap`),
not generic WAV backgrounds or other engines' embeddings. `dinner_party_eval` is evaluation-only
and is never sampled as a training negative. Augmentation backgrounds are separate
from classifier negatives. Raw-audio catalog conversion is not implemented. An incompatible
selection fails with an actionable error—no silent stock-negative download or
incompatible feature reuse. Real training also requires independent positive train,
validation and testing families (and corresponding reviewed-negative splits when
used); a tiny smoke-test corpus is not sufficient for actual ML training.

The production bundle is committed under `static/ui`, so neither NVIDIA Docker image needs Node.js. To change the UI, edit `frontend/src` and rebuild it before building the image:

```bash
cd frontend
npm install
npm run build
```

`npm run build` type-checks every Vue component before writing the offline bundle copied into both the standard CUDA and Blackwell images.

### Offline integration verification (no CUDA or live kiosks)

Use an existing server/test Python environment, or create a lightweight venv; do
not install the CUDA training requirements just to test the app. Python 3.12,
`ffmpeg`, `openssl`, Bash, and Node/npm (development only) are used by the suite:

```bash
python3 -m venv /tmp/opencode/studio-tests
/tmp/opencode/studio-tests/bin/python -m pip install fastapi==0.115.6 uvicorn==0.49.0 python-multipart==0.0.9 croniter==6.0.0 httpx==0.28.1 PyYAML numpy
DATA_DIR=/tmp/opencode/studio-unit-data /tmp/opencode/studio-tests/bin/python -m unittest discover -s tests -v
npm --prefix frontend ci
npm --prefix frontend test -- --run
npm --prefix frontend run typecheck
npm --prefix frontend run build
cd frontend
# Playwright 1.63.0 uses cached Chromium revision 1243; install only if absent:
npx playwright install chromium
STUDIO_TEST_PYTHON=/tmp/opencode/studio-tests/bin/python npm run test:e2e
```

Playwright launches the real app and committed static UI with a tests-only,
constructor-injected GPU command runner, fresh temporary data under `/tmp/opencode`,
and deterministic loopback HTTP kiosks. There is no production environment variable
that enables fake GPU success; test code is not copied into either Docker image.
These tests verify orchestration, not CUDA inference, downloaded ML weights, a
container build, or real-device behavior. Live-device checks are opt-in only; review
the test's environment variables and required authorization before enabling them,
especially cache clearing/publication. Do not point the integration fixtures at a
real LAN device. Neither image requires Node at runtime; both ship the complete
`studio/` package, SQL/JSON resources, CLI helpers and prebuilt `static/ui` assets.

---

## Legacy compatibility reference (requires TRAINER_LEGACY_MODE=1)

The remaining singleton workflow reference applies to explicit legacy API clients,
not the default Studio UI. Legacy push-upload routes are rejected in Studio mode.

### Captured Audio Workflow

To collect samples from a sat, point its trainer feedback setting at this app. Tater Native satellites use the native settings popup in Tater. Older ESPHome satellites can still use their device entities.

For Tater Native satellites, enable trainer feedback in Tater:

- `Send Good Wakes To Trainer` toggles upload of confirmed wake-word triggers.
- `Send Close Misses To Trainer` toggles upload of near misses.
- `Trainer App URL` sets the trainer address, for example `http://trainer.local:8789` or `http://<trainer-ip>:8789`.

For older ESPHome firmware, the equivalent capture setup is exposed as device entities:

- `Capture Wake Audio` toggles upload of wake-word triggers.
- `Capture Close Misses` toggles upload of near misses.
- `Trainer App URL` sets the trainer address, for example `http://<trainer-ip>:8789`.

Satellites send raw captured audio to:

```text
/api/upload_captured_audio_raw
```

Keep the training app running and reachable at the `Trainer App URL` while capture is enabled. The sats upload clips live; if the app is stopped or the URL is wrong, captured audio will not be saved.

In the `Captured Audio` tab:

- play each clip from the inbox
- mark good wake-word clips as `This is good`
- mark bad triggers as `False wake`
- discard clips that should not be used

Approved clips move into:

```text
/data/personal_samples/
```

False wakes move into:

```text
/data/negative_samples/
```

Captured audio is boosted for easier playback in the UI, then kept in the correct training format.

---

## Samples

The `Samples` tab is the sample library.

- `Personal` samples are positive examples of the wake word.
- `Negative` samples are reviewed false wakes or hard negatives.
- Both can be played back and removed one at a time.
- Manual upload is available here as an optional seed path.

Accepted manual upload formats include:

- WAV
- MP3
- M4A
- FLAC
- OGG
- AAC
- OPUS
- WEBM

Uploads are validated or converted with `ffmpeg` into:

```text
16 kHz / mono / 16-bit PCM WAV
```

Starting a new session does not clear samples. Use the clear buttons in `Samples` if you want to remove saved personal or negative clips.

---

## Auto Training

`Auto Training` is an opt-in sample-review and retraining loop. It is disabled until you enter the exact wake phrase and enable it.

For each new wake-trigger clip sent to the trainer:

1. The selected local STT engine transcribes the audio.
2. If the transcript contains the configured wake phrase, the clip stays in `Captured Audio` for manual review by default.
3. If speech was transcribed but the wake phrase is absent, the clip moves to `/data/negative_samples/` as an auto-reviewed hard negative.
4. Empty transcripts, VAD-blocked captures, and captures for another wake word stay out of the automatic negative path.

Two optional cleanup rules are available:

- `Delete confirmed good wakes` removes normal wake-trigger clips after STT confirms the configured phrase.
- `Promote confirmed close misses` checks close misses that passed VAD and moves them to the personal positive samples only when STT confirms the configured phrase.

A close miss with an empty transcript or without the configured phrase stays in `Captured Audio`; it is never turned into a negative automatically. Saving Auto Training settings also scans existing eligible captures. Enabling close-miss promotion reviews previous unreviewed close misses, while enabling cleanup removes previously confirmed good wakes without transcribing them a second time.

Auto Training exposes only an engine selector. Faster Whisper is the recommended default and uses CUDA with `float16` when CTranslate2 can see an NVIDIA GPU, with a CPU `int8` fallback. The trainer manages `small.en` for English and `small` for other languages. Parakeet ONNX uses the managed INT8 `nemo-parakeet-tdt-0.6b-v3` model with CUDA and CPU fallback. Downloaded STT models are cached in `/data/auto_train_models/`.

Scheduled training runs only after the configured number of new automatic negatives has accumulated. A successful run securely publishes the trained wake-word name and JSON URL to the linked Tater instance. Tater saves it as the global satellite wake word and pushes the updated setting to every connected satellite, so no satellite firmware change is required.

The `Trainer public URL` must be reachable from the satellites. With the documented `--network host` command, the trainer can normally use the LAN address from the browser request or host network. If you open the UI as `http://localhost:8789`, enter a value such as `http://192.168.1.50:8789`, or start the container with `REC_PUBLIC_BASE_URL` set to that value. When using Docker bridge networking, always set this URL to the published host address; a container bridge address is not satellite-reachable.

The default Tater URL, `http://127.0.0.1:8501`, assumes the documented host networking. Change it to a container-reachable Tater address if you use another Docker network. Click `Link Tater` and enter the short-lived code shown in Tater Voice Settings; the resulting trainer-specific link credential is stored in `/data/auto_train_config.json` with owner-only permissions.

---

## Training Flow

1. Enter the wake phrase in `Trainer`.
2. Choose the language and TTS source.
3. Optionally check browser pronunciation with `System preview`.
4. Review the positive and negative sample counts.
5. Click `Start training` and watch the popup training console.

Personal samples are optional. Training can run with zero personal samples after confirmation, using generated TTS samples and the stock negative datasets.

Reviewed negative samples are converted into `/data/work/reviewed_negative_features/` and inserted into the training YAML as a hard-negative feature set when present.

Training produces a calibrated microWakeWord JSON/TFLite pair. No companion engine or separate training environment is installed.

On RTX 50-series / Blackwell GPUs, the Blackwell Docker image keeps sample generation and augmentation in the normal Python 3.12 trainer environment, then runs only the TensorFlow training/export stage in `/data/.venv-blackwell` with Python 3.13 and the Blackwell-native TensorFlow wheel.

---

## Language Support

The language picker is built from OmniVoice's live catalog (currently more than 600 languages), with a bundled common-language fallback for offline startup. Languages covered by Qwen3-TTS and MOSS-TTS-Nano are automatically marked `Recommended`; OmniVoice-only languages are marked `Experimental` so lower-resource coverage is not presented as equal quality.

The selected code is sent directly to the supporting model. Model downloads happen only when a language is used, and the Hugging Face cache is persisted under `/data/.cache/huggingface`. The fetched language catalog is cached under `/data/.cache/omnivoice_languages.json`.

### TTS modes

- `Four-provider ensemble` is the default. It uses OmniVoice for every catalog language, adds Qwen3-TTS and MOSS-TTS-Nano where supported, and adds Piper when a compatible model exists.
- `Modern only` uses the multilingual providers without Piper.
- `Piper only` preserves the previous generator as an explicit legacy fallback.

Where a Piper voice is unavailable, the default route automatically continues with the modern providers.

Qwen, OmniVoice, and Piper now generate final corpus candidates directly instead of cloning a 128-profile bank. Qwen provides 18,750 balanced voice conditions before an instruction repeats, and Piper uses every speaker in its installed model. MOSS Nano is clone-only, so each MOSS take uses a different already-accepted direct take as its carrier rather than cycling a small bank.

Every generated file is normalized to `16 kHz / mono / 16-bit PCM WAV` and rejected if it contains static, broadband/high-frequency noise, silence, clipping, excessive duration/rambling, or an exact duplicate. A generation manifest records the planned and accepted provider counts and the applied safety limits.

English direct OmniVoice takes use confidence-ordered mask selection with
stochastic token sampling to reduce short-phrase decoder collapse without
repeating a deterministic voice bank. Other languages and carrier/cloning paths
retain upstream sampling defaults. QA limits are unchanged; see the
[decoder investigation and measured yield](docs/omnivoice-decoder-investigation.md).

---

## Dataset Behavior

The first training run downloads and prepares missing training assets into `/data`, including:

- isolated Python environments for each selected modern TTS engine
- selected TTS model weights and the direct generated corpus
- additional language-specific Piper voices only when hybrid or legacy Piper mode is selected
- negative datasets and background data
- the Python training environment
- generated samples and augmented feature caches

The three modern engines deliberately use separate environments under `/data/tts-envs/`; their required PyTorch and Transformers versions conflict with one another and with the trainer environment. Model weights can require many gigabytes, so allow extra disk space and time on the first run. After the assets are prepared, later runs reuse the local copies unless the mounted `/data` contents are deleted.

---

## Trained Wake Words

The `Wake Words` tab lists locally trained wake-word packages from `/data/trained_wake_words/`.

- Copy the JSON URL into the Tater Native satellite settings to switch wake words live.
- Links use the configured public trainer URL, a non-loopback browser host, or the detected LAN address instead of advertising `127.0.0.1` to satellites.
- Open the JSON or model links directly for quick inspection.
- The JSON includes the matching model path plus Tater tuning metadata.
- No firmware flashing happens from this trainer app anymore.

Use the main Tater app for satellite firmware updates and USB flashing.

---

## Output Files

Successful runs produce timestamped training output folders such as:

```text
/data/output/<timestamp>-<wake_word>-<samples>-<steps>/<wake_word>.tflite
/data/output/<timestamp>-<wake_word>-<samples>-<steps>/<wake_word>.json
```

The trainer also syncs Tater-ready wake-word artifacts into:

```text
/data/trained_wake_words/<wake_word>.tflite
/data/trained_wake_words/<wake_word>.json
```

The `<wake_word>.json` and `<wake_word>.tflite` names remain compatible with existing Tater and ESPHome clients. The `Wake Words` tab exposes the JSON manifest and TFLite model links.

The JSON keeps the standard microWakeWord fields for compatibility:

```json
{
  "micro": {
    "probability_cutoff": 0.97,
    "sliding_window_size": 6
  }
}
```

It also includes Tater Native metadata used by newer satellites and the Tater settings UI:

```json
{
  "model_format": "tflite_stream_state_internal_quant",
  "quantization": "int8",
  "sample_rate": 16000,
  "tater_native": {
    "format_version": 1,
    "wake_threshold": 0.97,
    "wake_sliding_window": 6,
    "close_miss_threshold": 0.80,
    "frontend": {
      "name": "tflm_microfrontend",
      "sample_rate": 16000,
      "feature_duration_ms": 30,
      "feature_step_ms": 10,
      "feature_size": 40
    }
  }
}
```

Calibration metrics are included under `calibration` so false accepts/hour and recall can be surfaced in the UI.
Calibration evaluates thresholds from `0.95` through `1.00` with sliding windows of `5`, `6`, and `7`. Among candidates within 0.5 percentage points of the best recall, it prefers the lowest measured ambient false-accept rate. If calibration cannot complete, packaging uses the conservative `0.97` threshold and a window of `6`.

---

## Resetting Everything

If you want a clean slate, stop the container and remove the contents of the mounted `/data` directory.

That removes:

- personal samples
- negative samples
- captured inbox clips
- downloaded Piper voices
- modern TTS environments, model weights, and completed direct-generated corpora
- cached datasets
- training environments
- trained models
- Auto Training settings, state, transcripts, and cached Faster Whisper models

---

## Important Notes

- Personal samples are optional.
- Negative samples are optional but useful for reducing false wakes.
- Auto Training is disabled by default and only classifies actual wake triggers automatically.
- The UI server is `trainer_server.py`.
- The launcher is `run.sh`.
- Trainer capture settings live in Tater for Tater Native satellites, and on device entities for older ESPHome satellites.

---

## Credits

Built on top of:

- [microWakeWord](https://github.com/kahrendt/microWakeWord)
- [piper-sample-generator](https://github.com/rhasspy/piper-sample-generator)
- [OmniVoice](https://github.com/k2-fsa/OmniVoice)
- [Qwen3-TTS](https://github.com/QwenLM/Qwen3-TTS)
- [MOSS-TTS-Nano](https://github.com/OpenMOSS/MOSS-TTS-Nano)
- [tensorflow-blackwell-python313](https://github.com/chivitiH/tensorflow-blackwell-python313) for the optional RTX 50-series / Blackwell image
