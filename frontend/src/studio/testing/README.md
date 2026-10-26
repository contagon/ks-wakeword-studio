# Browser wakeword testing

The Testing page loads an archived version's checksum-validated `.json` and
`.tflite` through the existing Studio archive API. All PCM and inference stay
in the browser. It neither records training samples nor changes deployed
models, manifests, or sensitivity settings.

Microphone access requires **HTTPS or localhost**. The browser must support
AudioWorklet and module workers. The tester uses the reference project's
microWakeWord frontend/model runner in a dedicated worker; license and source
details are in `vendor/README.md` and `vendor/LICENSE` (AGPL-3.0).

Supported models are int8 streaming microWakeWord with 10 ms feature steps.
The model input determines how many feature frames each inference consumes;
input quantization comes from the actual TFLite file. The first 100 feature
frames warm up state, then probabilities are averaged using the manifest's
`micro.sliding_window_size` (default 3).

`micro.probability_cutoff` defaults to 0.90 if absent. Sensitivity uses Voice
Satellite's `1 - (1 - cutoff) * factor`, factors 0.5 / 1 / 2 for Slight / Moderate /
Very, clamped to 0.10–0.99. This is a browser comparison, not a guarantee of the
same acoustic behavior or trigger policy on a deployed satellite.

## Verification

From `frontend/`:

```sh
npm test -- --run
npm run build
npm run test:e2e -- testing.spec.ts
```

For a complete real-model browser smoke test, supply a local model (not bundled
into this repo to avoid redistributing a model under an unrelated license):

```sh
STUDIO_TEST_MODEL=/absolute/path/to/model.tflite npm run test:e2e -- testing.spec.ts
```

Playwright uses Chromium's synthetic microphone, but the real production
bundle, capture worklet, model compiler and inference worker. Physical-mic
recognition quality still needs a manual test with the chosen wakeword.
