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

Open **Data → Manual**, select a wakeword and choose **Positive** or **Negative**.
Click **Start recording** / **Stop recording**, or press **Space** when focus is
outside another control. Recording uses your browser's current microphone and
does not stop on silence (a 10-minute safety limit applies).
If a delayed browser timer overshoots that limit, the training preview is capped
at ten minutes while saving still retains the complete original recording.

After stopping, VAD suggests a trim around all detected speech, retaining interior
pauses. Play the selection (**Space**), adjust its bounds, then **Save sample**
(**K** or **Enter**), or **Retake** (**D**).
If speech detection is unavailable or finds no speech, the full clip stays selected;
negative background-noise recordings can still be saved. Originals are retained,
and saved recordings appear alongside scraped data in **Samples**, with a
**Recorded** source filter and capture metadata.

The upload form is at the top of **Manual**, with its own positive/negative label. Uploads
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
docker pull ghcr.io/tatertotterson/microwakeword:v36
```

The release tag must match `VERSION`. Update `WHATS_NEW.md` before tagging; the Docker workflow prepends it to GitHub's automatically generated release notes.

RTX 50-series / Blackwell GPUs use a separate image with CUDA 12.8 and a
Python 3.13 TensorFlow build for `sm_120`:

```bash
docker pull ghcr.io/tatertotterson/microwakeword:blackwell
docker pull ghcr.io/tatertotterson/microwakeword:v36-blackwell
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
uses `compose.yaml`, builds `ks-wakeword-studio:local`, and exposes the UI on
port **8790** of every host interface (http://localhost:8790 locally) with GPU
access and 8 GiB shared memory.

Data lives in the host directory named by `DATA` in `.env` (for example
`DATA=/mnt/datasets/wakeword_studio/`), bind-mounted at `/data`. Stopping or
removing the Compose service does not delete it. Without `just`, use
`docker compose build`, then `docker compose up -d` or `docker compose stop`.
First startup installs dependencies into that directory.

**One-time transition from the existing `docker run` container:** Compose cannot
adopt a manually created container with the same name. When ready to switch,
run the commands below; the data directory is retained. Adding these files does
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

Use a version tag such as `ghcr.io/tatertotterson/microwakeword:v36` when you want to pin a known release instead of tracking `latest`.
For RTX 50-series cards, use `ghcr.io/tatertotterson/microwakeword:blackwell`
or a pinned tag such as `ghcr.io/tatertotterson/microwakeword:v36-blackwell`
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

### Downloaded datasets and training prerequisites

**Data → Downloaded** contains two separate resource types:

- **Negative & evaluation datasets:** downloaded once and selected independently
  for each wakeword. Evaluation-only inputs are not sampled during training.
- **Augmentation datasets:** MIT room impulse responses, AudioSet, Free Music
  Archive, and CHiME-Home. Download and prepare once, then select which backgrounds
  and room echoes each wakeword uses.

Both resource types default to all enabled. Use each section's **Save selection**
button to save changes for the current wakeword, including disabling all datasets.
Existing saved negative selections are preserved; legacy empty selections receive
the new all-enabled default. Downloads remain shared across wakewords. Training
requires every selected dataset to be installed: download them or deselect and save.
Cards show source information, installed size in GB, and sample counts
when available; unknown metadata is labeled rather than estimated.

Augmentation downloads run in the global queue. Preparation initializes the shared
training Python environment if needed, downloads the source audio, converts it to
16 kHz mono PCM WAV, validates it, and publishes the completed corpus. Failed or
cancelled downloads do not publish partial corpora. Existing CLI-installed corpora
are recognized. Viewing the catalog never starts downloads.

If an existing corpus folder contains corrupt/partial audio, Studio reports
**repair required** before downloading anything. Move that specific folder out of
`<data-dir>/training_datasets/`, retaining it for inspection, then retry. Studio
does not delete or overwrite existing operator-managed corpora.

Check free disk space first (Studio shows the exact free space when it is low):
source archives, conversion, and
retained augmentation snapshots need additional space beyond the final installed
size. Source download sizes are not published. Review each source's licensing
terms before using its recordings.

**Train** shows missing selected augmentation prerequisites and links back to
Downloaded. Disabled augmentation corpora are neither required nor used.
Once ready, starting training automatically snapshots the selected inputs,
augments your real/synthetic samples with noise and reverberation, extracts audio
features, then trains and validates the model. Original samples stay unchanged;
augmentation datasets are not deployed to kiosks.

Real positives (recorded, scraped, or uploaded) and selected synthetic positives
use separate training pools. When both have training examples, **60% of positive
training draws come from real samples and 40% from synthetic samples**, regardless
of pool size. If only one pool has training examples, all positive draws use that
pool. Held-out validation/testing audio stays held out, and reviewed negatives
retain their separate hard-negative weighting. These pools are per-run staging
and feature artifacts; permanent audio storage is unchanged. The weighting applies
to new training runs, not existing model archives.

### Job errors and private diagnostics

The job queue and training history show safe, actionable failure guidance. Raw
child stdout/stderr and exception tracebacks are retained in
`<data-dir>/studio/jobs/<job-id>/diagnostics.log` (a bounded 128 KiB tail, file mode
`0600`). These diagnostics are **server-only**, not downloadable through the UI.
They can contain private recordings' metadata, paths, provider output or secrets;
inspect them locally and redact before sharing. Older failed jobs may not have a
diagnostic file; retry once after upgrading to capture the original error.

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
for corpus in mit_rirs_16k audioset_16k fma_16k chime_16k; do
    /data/.venv/bin/python cli/prepare_corpus.py --corpus=$corpus --data-dir=/data
done
```

If CHiME-Home's Internet Archive source is unavailable, setup retries failed or
stalled transfers and automatically replaces corrupt cached archives on the next
attempt. To use a trusted mirror of the **original** `chime_home.tar.gz`, set
`CHIME_AUDIO_URL` in the setup command's environment. For Studio downloads, pass
that variable into the server/container environment. An already downloaded archive
can also be placed at `/data/training_datasets/downloads/chime_home.tar.gz`.
Preprocessed datasets with different audio content are not interchangeable mirrors.

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
Rolling back means publishing an older immutable archive as the new desired version and uploads
it under the **same stable filenames**; it never edits enabled slots or thresholds.
Retries follow the latest desired revision, not an obsolete queued version.
`refresh_pending`, manifest-unverified, and runtime-unverified states are not proof
of live inference; refresh may remain pending until a follower has synchronized and
its own credentials permit verification. The existing leader/fleet remains the
authority for any fleet-controlled selections.

Deployment API:

- `GET /api/studio/wakewords/{word_id}/deployment/status`: per-target publication,
  manifest, refresh and unverified-runtime states.
- `POST /api/studio/wakewords/{word_id}/deployment/publish` with
  `{"version_id":"<archived-version-id>"}`: claim a new desired revision (publishing an
  older version is a rollback) under the same staging prerequisites; this is a real
  mutation endpoint, not a setup check.

## What The UI Does

- **Wakewords**: separate phrases, stable identities and summaries.
- **Negative Datasets / Artificial**: searchable paginated catalog, actual per-word
  selection, saved TTS recipes, immutable completed batches, queued job/log status.
- **Scrape / Classify / Samples**: shared registry, global collection cron, keyboard
  review, provenance, revision-safe labels, non-destructive trimming and audio import.
- **Train / Deploy**: effective inputs, one shared GPU queue, per-word cron, retained
  run manifests/checksums/logs, downloadable archives, and publish/rollback.

### Storage and scheduling

Persist the entire `/data` volume (`DATA_DIR` outside Docker). Studio stores
`studio/studio.sqlite3` (with WAL/SHM), content-addressed `studio/blobs/`, isolated
`studio/jobs/`, versioned `studio/datasets/versions/`, immutable
`studio/models/<word-id>/<version-id>/`. Kiosk credentials
are separate owner-only files in `studio/credentials/`; protect the volume and its
backups as secrets. Credentials are omitted from public APIs and model exports,
but a full-volume backup contains them. Do not manually delete retained blobs,
dataset versions or archives referenced by old runs. Stop the server/workers for
a consistent full-volume backup/restore; do not copy just a live SQLite main file.
Shared downloaded tools/voices and training environments also occupy `/data`.

**Legacy archive policy:** models imported by the retired legacy migration
remain browsable/downloadable as `legacy` / `unvalidated` archives and never create
automatic publication events or change the desired version by import order.
In Deploy, explicitly choose **Validate and
publish**. This invokes the existing
`cli/validate_studio_model.py` using `/data/.venv/bin/python`: TensorFlow must load
the TFLite model, allocate tensors, and expose input/output tensors. Prepare that
environment with `cli/setup_python_venv` first. Checksums or a `TFL3` identifier alone
are not engine validation. Missing runtime, incompatible metadata, or rejected bytes
leave the archive available without publication or remote cache refresh. Successful
explicit validation is recorded separately from immutable archive metadata, and
only then may that explicit action set publication intent under the normal staging
and cache-refresh constraints.

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

To recover a failed **OmniVoice-only** job with retained clips, a local administrator
can run the following inside the updated Studio container:

```bash
docker exec ks-wakeword-studio /data/.recorder-venv/bin/python \
  /root/mww-scripts/cli/studio_recover_generation.py --data-dir=/data \
  --word-id=WORKSPACE_ID --source-job-id=FAILED_JOB_ID
```

This makes an independent checksummed snapshot under `/data/studio/recovery/`,
then queues a new job with the original recipe. Retained audio is rechecked under
unchanged QA before fresh clips fill the shortage. Only a complete validated batch
is published; neither the failed job's files nor training selection is changed.
Keep the snapshot and original files until recovery is verified. Do not run the
ordinary generator against the failed job's directory: it clears its build files.

Fresh refills are sized from each provider's measured **normalized, unique** yield
with a 20% margin, rather than a fixed multiplier. Each round is capped at
20,000 candidates and, by default, the whole job at `max(1024, 12 × samples)`; a provider stops
after three consecutive rounds without progress. Top-ups prefer direct providers
(Qwen3 first), so a multi-provider mix can lean toward them. The generator CLI supports
`--max-candidates` and `--max-generation-seconds` (default six hours). The time
limit stops admission of new rounds; an in-flight round finishes normally, and
Studio's normal cancellation still stops owned children. Incomplete jobs report
retained/missing counts and the stopping reason without publishing a partial batch.

For reproducible duration diagnostics, a local administrator can run
`cli/benchmark_omnivoice.py` with `--data-dir`, `--word-id`, and a **new**
`--output-dir`. It compares seeded duration conditions at batch sizes 1 and 8,
records the installed model/package revisions, applies existing QA and normalization,
and writes `generation.json`, `results.json`, WAVs, and per-clip QA reports.
`--wait-for-gpu-seconds=21600` queues behind active GPU work without interrupting it.
These are normally owned `benchmark` jobs, not generated datasets; the web worker
does not run them without the local benchmark process. No training selection changes.

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

The UI bundle in `static/ui` is build output and is not committed. The dockerfile builds it in a
`node` stage (`npm ci && npm run build`) and copies only the result into the runtime image, so
neither image variant ships Node.js. `docker build .` builds the default image and
`docker build --build-arg VARIANT=blackwell .` builds the RTX 50 / Blackwell one. For local development run `just ui` (or
`npm --prefix frontend run build`); the build type-checks every Vue component first.

### Offline integration verification (no CUDA or live kiosks)

Use an existing server/test Python environment, or create a lightweight venv; do
not install the CUDA training requirements just to test the app. Python 3.12,
`ffmpeg`, `openssl`, Bash, and Node/npm (development only) are used by the suite:

```bash
just test   # creates .venv-test from requirements-dev.txt, type-checks and builds the UI, runs pytest and vitest
just ui     # rebuilds static/ui
just format # Prettier for frontend/ (CI fails on unformatted code)
just e2e    # Playwright browser suite (install Chromium once: npx --prefix frontend playwright install chromium)
```

Without `just`: `python3 -m venv .venv-test && .venv-test/bin/pip install -r requirements-dev.txt`,
then `.venv-test/bin/python -m pytest` (`tests/conftest.py` points `DATA_DIR` at a
temporary directory unless you set it), `npm --prefix frontend run build` and
`npm --prefix frontend test -- --run`.

Playwright rebuilds `static/ui`, then launches the real app with a tests-only,
constructor-injected GPU command runner, fresh temporary data in the system temp directory,
and deterministic loopback HTTP kiosks. There is no production environment variable
that enables fake GPU success; test code is not copied into either Docker image.
These tests verify orchestration, not CUDA inference, downloaded ML weights, a
container build, or real-device behavior. Live-device checks are opt-in only; review
the test's environment variables and required authorization before enabling them,
especially cache clearing/publication. Do not point the integration fixtures at a
real LAN device. Neither image requires Node at runtime; both ship the complete
`studio/` package, SQL/JSON resources, CLI helpers and the built `static/ui` assets.

---

## Language Support

The language picker is built from OmniVoice's live catalog (currently more than 600 languages), with a bundled common-language fallback for offline startup. Languages covered by Qwen3-TTS and MOSS-TTS-Nano are automatically marked `Recommended`; OmniVoice-only languages are marked `Experimental` so lower-resource coverage is not presented as equal quality.

The selected code is sent directly to the supporting model. Model downloads happen only when a language is used, and the Hugging Face cache is persisted under `/data/.cache/huggingface`. A previously fetched language catalog is read from `/data/.cache/omnivoice_languages.json` when present.

Qwen, OmniVoice, and Piper now generate final corpus candidates directly instead of cloning a 128-profile bank. Qwen provides 18,750 balanced voice conditions before an instruction repeats, and Piper uses every speaker in its installed model. MOSS Nano is clone-only, so each MOSS take uses a different already-accepted direct take as its carrier rather than cycling a small bank.

Every generated file is normalized to `16 kHz / mono / 16-bit PCM WAV` and rejected if it contains static, broadband/high-frequency noise, silence, clipping, excessive duration/rambling, or an exact duplicate. A generation manifest records the planned and accepted provider counts and the applied safety limits.

English direct OmniVoice takes use confidence-ordered mask selection with
stochastic token sampling to reduce short-phrase decoder collapse without
repeating a deterministic voice bank. Other languages and carrier/cloning paths
retain upstream sampling defaults. QA limits are unchanged; see the
[decoder investigation and measured yield](docs/omnivoice-decoder-investigation.md).

---

### TTS environments

The three modern engines deliberately use separate environments under `/data/tts-envs/`; their required PyTorch and Transformers versions conflict with one another and with the trainer environment. Model weights can require many gigabytes, so allow extra disk space and time on the first run. After the assets are prepared, later runs reuse the local copies unless the mounted `/data` contents are deleted.

---

## Model files

Each archived model version contains `<model_id>.tflite` and `<model_id>.json`, compatible with existing Tater and ESPHome clients.

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

If you want a clean slate, stop the container and remove the contents of the mounted `/data` directory. That removes every workspace, sample, dataset, training environment, model archive and kiosk credential.

---

## Important Notes

- The UI server is `trainer_server.py`.
- The launcher is `run.sh`.

---

## Credits

Built on top of:

- [microWakeWord](https://github.com/kahrendt/microWakeWord)
- [piper-sample-generator](https://github.com/rhasspy/piper-sample-generator)
- [OmniVoice](https://github.com/k2-fsa/OmniVoice)
- [Qwen3-TTS](https://github.com/QwenLM/Qwen3-TTS)
- [MOSS-TTS-Nano](https://github.com/OpenMOSS/MOSS-TTS-Nano)
- [tensorflow-blackwell-python313](https://github.com/chivitiH/tensorflow-blackwell-python313) for the optional RTX 50-series / Blackwell image
