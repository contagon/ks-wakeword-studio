# Kiosk protocol fixtures

Derived read-only from `/home/contagon/PersonalProjects/kiosk-satellite`:

- `app/lib/managers/fleet/fleet_sync_manager.dart`: `fleetIdentity` (1427),
  `_readSelf` (571), `status` (2360), `_syncWakeModels` category gate (985).
  Stable `id` comes from the discovery `fleet` self entry, not name/address.
  `follows` is a **leader name**, not a leader ID; only its presence is used.
  Native `fleet/FleetDiscovery.kt:179` supplies Android `ANDROID_ID`, falling
  back to `unknown`; the fallback is deliberately rejected as an unsafe pin.
- `app/lib/managers/remote/remote_manager.dart`: POST commands (814, 1012),
  raw POST wake-model upload query parameter `name` (788).
- `app/lib/managers/wake_word/wake_word_manager.dart`: listing (1142),
  audio `{mimeType,base64}` command with `{id}` parameters (1159).
- `app/lib/managers/wake_word/wake_diagnostics.dart`: activation `toJson` (63).
- `app/lib/managers/voice/voice_manager.dart`: stage can report `ok:true` plus
  `data.rejected` (1269), manifest `{files: {path: sha256}}` (1356).
- `app/lib/managers/voice/custom_wake_models.dart`: commit `added` is a list of
  `{engine,id}` objects (300), plus file `rejected` entries (321).
  `RejectedWakeFile.toJson` uses `file`, not `name`; untrusted reason/values are
  omitted by the adapter. `wake_catalog.dart:86` defines engine folder names
  (`microwakeword`, `openwakeword`, `vswakeword`).

IDs/names/addresses are synthetic. Tests use loopback only; fixture LAN addresses
are registry data and are never contacted. No fleet/admin tokens came from source
or a device. The test token is an invented string used by the loopback server.
