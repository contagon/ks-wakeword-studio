# Kiosk Password Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace manual token entry with a transient kiosk admin password, exchanging it server-side for a saved long-lived token.

**Architecture:** Extend the existing bounded kiosk transport for the unwrapped `/api/login` response. Password-based service entry points obtain a token before invoking the existing identity-checked registry operations. Keep existing saved tokens and the credential file format unchanged.

**Tech Stack:** Python/FastAPI, Vue/TypeScript, unittest, Vitest.

**Spec:** User-approved description in this conversation: replace token fields for registration and follower authentication; request a 10-year token, save only the token, immediately clear the field, never save/log passwords, show safe login errors, update tests and setup instructions.

## Global Constraints

- Send `{password, ttl_days: 3650}` to the kiosk, without an Authorization header.
- The kiosk login response is `{token: ...}`, NOT the command `{ok, data}` envelope.
- Preserve existing URL validation, base paths, TLS verification, size/time bounds, no redirects and no proxies.
- Do not store passwords in the database, credential files, frontend reactive registry, local storage, or logs.
- Do not expose returned tokens to the frontend; verify identity before saving credentials.
- Existing saved credentials require no migration; manual token entry is removed from the UI/API.
- Do not modify the sibling kiosk-satellite repository.

## Review Focus

- Login failures, rate limiting and reflected remote secrets produce fixed safe errors.
- Invalid login payloads/tokens fail without credential writes.
- Redirects, oversized bodies and TLS failures retain transport safeguards.
- Identity mismatch and inactive followers retain current registry safety rules.
- Password fields clear before awaiting either successful or failed requests.

---

### Task 1: Server-side password exchange

**Files:** `studio/kiosk.py`, `studio/devices.py`, `studio/api.py`, `tests/kiosk_fixture.py`, `tests/test_studio_kiosk.py`, `tests/test_studio_devices.py`; update API-consuming tests as needed.

**Interfaces:** Add `KioskClient.login(device: Device, password: str) -> str`, `DeviceService.add_with_password(url: str, password: str, role: Literal["standalone", "leader"]) -> Device`, and `DeviceService.set_password(device_id: str, password: str) -> Device`. Keep existing token-based internal registry operations; HTTP request models accept only `password`, not `token`.

- [x] Add failing transport tests for login request path/base path, no bearer header, `ttl_days == 3650`, unwrapped token response, invalid/missing token, blank/non-string password, 401/403/429, redirects, size bounds and safe errors without reflected secrets.
- [x] Run the new tests and confirm they fail (login/API coverage lives in `tests/test_studio_login.py`).
- [x] Implement bounded login support reusing transport mechanics without weakening command response sanitization; reject invalid passwords before network I/O and validate returned tokens.
- [x] Add failing service/API tests for registration and follower authentication using passwords, identity mismatch, inactive follower preservation, rejected legacy token payloads, and absence of passwords/tokens from public responses and passwords from persisted files.
- [x] Implement password service entry points and update API models/routes; preserve token-based internal operations and existing credential files.
- [x] Update affected API fixtures/tests to submit passwords, while retaining internal token compatibility coverage.
- [x] Run transport, login and registry tests using `/tmp/opencode/wakeword-studio-venv/bin/python`; all pass.

### Task 2: Password-based device forms and setup instructions

**Files:** `frontend/src/studio/components/DeviceRegistry.vue`, `frontend/src/studio/devices.ts`, `frontend/src/studio/api.ts`, `frontend/src/studio/__tests__/devices.test.ts`, related frontend/e2e tests, `README.md`, generated `static/ui/` assets.

**Interfaces:** Keep existing frontend API method names but rename credential parameters and JSON keys to `password`; registry cache continues to contain only `Device` data.

- [x] Add failing tests asserting password labels/payloads for registration and followers, immediate clearing during pending requests and after errors, and no passwords in shared registry state.
- [x] Run `npm --prefix frontend test -- --run src/studio/__tests__/devices.test.ts`; confirm failures.
- [x] Replace token fields and parameters with passwords; explain that only the obtained token is saved. Correct the kiosk address example to port 2324.
- [x] Update README setup/security guidance with password exchange, 3650-day lifetime, per-device passwords, transport visibility, and password changes not revoking existing tokens.
- [x] Run `npm --prefix frontend test -- --run`, `npm --prefix frontend run build`, and the Studio Python suite with writable `DATA_DIR`; all pass (90 UI tests, 268 Studio tests run with 1 skipped). Playwright: 7 pass.
- [x] Review the diff for accidental secret retention, unrelated changes and generated-asset consistency before reporting completion. No commits requested; changes remain on the current branch.

## Verification notes

- Full-project Python discovery: 379 tests run, 1 error, 1 skipped. The unchanged `test_compose.ComposeTests.test_resolved_service_keeps_loopback_gpu_and_existing_data_volume` expects `host_ip=127.0.0.1`, but unchanged `compose.yaml` publishes `8790:8789` without a host IP. Left outside this feature's scope.
- Independent review: no Critical/Important issues. Deferred minor: stronger before/after credential-file counts and database-reference assertions for failure cases.
