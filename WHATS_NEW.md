- Training and deployment now support microWakeWord exclusively; companion-model controls, training stacks and uploads have been removed.
- Existing model archives remain intact. Only the microWakeWord JSON/TFLite pair is published.

## Previous release: NVIDIA WakeWord Trainer v37

- Restored openWakeWord training for wake phrases containing words missing from CMUdict.
- Downloads Tater's preserved DeepPhonemizer checkpoint from Hugging Face and verifies its exact size and SHA-256 before use.
- Automatically replaces cached S3 error responses and pins the NVIDIA trainer to openWakeWord Trainer v1.0.3.
