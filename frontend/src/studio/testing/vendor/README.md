# Voice Satellite browser inference

Copied from `voice-satellite-card-integration/src/wake-word` on 2026-10-20:
`custom-model-runner.js`, `tflite-quant-reader.js`, `versioned-url.js`, and
`micro-frontend-js/index.js` (renamed `micro-frontend.js`).

These files retain the reference project's GNU Affero General Public License
v3; see `LICENSE`. Source:
https://github.com/jxlarrea/voice-satellite-card-integration
at revision `78f0f4b74fec0d5be39de9089915dd1129991096`.

Local change: export `compileModel` so the tester can compile checksum-validated
archive bytes directly, without the reference application's asset URL/cache.
TypeScript declarations are local integration code. No runtime dependency on
the sibling checkout, remote CDN, TensorFlow service, or Home Assistant.
