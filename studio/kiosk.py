"""Bounded admin-only kiosk transport. No proxies, redirects, or TLS downgrade.

Protocol authority: kiosk-satellite remote_manager.dart, fleet_sync_manager.dart,
wake_word_manager.dart and voice_manager.dart. Never log remote bodies/errors.
"""

import base64
import binascii
import http.client
import json
import math
import re
import ssl
import time
from collections.abc import Callable
from typing import BinaryIO
from urllib.parse import quote, unquote, urlsplit, urlunsplit

from studio.models import (CommitResult, CredentialsRequired, Device, DiagnosticClip,
                           DiagnosticListing, IdentityMismatch, KioskIdentity,
                           RemoteRejected, RemoteUnavailable, ValidationError)


def normalize_url(url: str) -> str:
    try:
        if not isinstance(url, str) or len(url) > 2048 or any(ord(c) <= 32 for c in url):
            raise ValueError
        parsed = urlsplit(url)
        if (parsed.scheme not in ("http", "https") or not parsed.hostname or
                parsed.username is not None or parsed.password is not None or
                parsed.query or parsed.fragment or "\\" in url or
                any(part in (".", "..") for part in unquote(parsed.path).split("/"))):
            raise ValueError
        # Accessing port also validates its range and syntax.
        if parsed.port == 0:
            raise ValueError
        return urlunsplit((parsed.scheme, parsed.netloc, parsed.path.rstrip("/"), "", ""))
    except (ValueError, TypeError):
        raise ValidationError("Invalid kiosk URL") from None


def validate_token(token: str) -> str:
    if (not isinstance(token, str) or not 1 <= len(token) <= 8192 or
            any(ord(c) <= 32 or ord(c) >= 127 for c in token)):
        raise ValidationError("Invalid admin credential")
    # Reject visibly fleet-scoped JWTs; actual authority is always checked by kiosk.
    parts = token.split(".")
    if len(parts) == 3:
        try:
            claims = json.loads(base64.urlsafe_b64decode(parts[1] + "=" * (-len(parts[1]) % 4)))
        except (ValueError, binascii.Error, UnicodeError):
            claims = None
        if isinstance(claims, dict) and "fleet" in claims:
            raise ValidationError("An individual admin credential is required")
    return token


def _clean(value: object, token: str) -> object:
    if isinstance(value, dict):
        return {key: _clean(item, token) for key, item in value.items()
                if isinstance(key, str) and not re.search(r"token|password|secret|credential|authorization", key, re.I)
                and _clean(key, token) == key}
    if isinstance(value, list):
        return [_clean(item, token) for item in value]
    if isinstance(value, str):
        value = value.replace(token, "[redacted]")
        value = re.sub(r"\bBearer\s+[A-Za-z0-9._~+/=-]+", "Bearer [redacted]", value, flags=re.I)
        return re.sub(r"\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+", "[redacted]", value)
    return value


class KioskClient:
    def __init__(self, credentials: Callable[[Device], str], *, timeout: float = 10,
                 max_body: int = 32 * 1024 * 1024, max_upload: int = 64 * 1024 * 1024):
        self.credentials = credentials
        self.timeout = timeout
        self.max_body = max_body
        self.max_upload = max_upload

    def _request(self, device: Device, path: str, body: bytes) -> dict:
        if not device.active:
            raise RemoteRejected("Kiosk is inactive")
        token = validate_token(self.credentials(device))
        parsed = urlsplit(normalize_url(device.url))
        connection = None
        try:
            if parsed.scheme == "https":
                connection = http.client.HTTPSConnection(parsed.hostname, parsed.port,
                    timeout=self.timeout, context=ssl.create_default_context())
            else:
                connection = http.client.HTTPConnection(parsed.hostname, parsed.port, timeout=self.timeout)
            deadline = time.monotonic() + self.timeout
            connection.request("POST", parsed.path + "/api/" + path, body=body,
                               headers={"Authorization": f"Bearer {token}",
                                        "Content-Type": "application/octet-stream" if "upload?" in path else "application/json",
                                        "Accept": "application/json"})
            response = connection.getresponse()
            # Never consume redirect/error bodies or follow their locations.
            if response.status in (401, 403):
                raise CredentialsRequired("Kiosk admin credentials required")
            if response.status != 200:
                raise RemoteRejected("Kiosk rejected request")
            length = response.getheader("Content-Length")
            if length is not None and (not length.isdigit() or int(length) > self.max_body):
                raise RemoteRejected("Invalid kiosk response size")
            payload = bytearray()
            while True:
                remaining = deadline - time.monotonic()
                if remaining <= 0:
                    raise TimeoutError
                if connection.sock is not None:
                    connection.sock.settimeout(remaining)
                block = response.read1(min(65536, self.max_body + 1 - len(payload)))
                if not block:
                    break
                payload.extend(block)
                if len(payload) > self.max_body:
                    raise RemoteRejected("Invalid kiosk response size")
            data = json.loads(payload)
            if not isinstance(data, dict) or data.get("ok") is not True:
                raise RemoteRejected("Kiosk command failed")
            result = data.get("data")
            if result is None:
                result = {}
            if not isinstance(result, dict):
                raise RemoteRejected("Invalid kiosk response")
            return _clean(result, token)
        except (OSError, http.client.HTTPException):
            raise RemoteUnavailable("Kiosk unavailable") from None
        except (ValueError, RecursionError, UnicodeError):
            raise RemoteRejected("Invalid kiosk response") from None
        finally:
            if connection is not None:
                connection.close()

    def command(self, device: Device, name: str, params: dict) -> dict:
        if not isinstance(name, str) or not re.fullmatch(r"[A-Za-z][A-Za-z0-9]{0,100}", name):
            raise ValidationError("Invalid kiosk command")
        try:
            body = json.dumps(params, allow_nan=False).encode()
        except (ValueError, TypeError):
            raise ValidationError("Invalid kiosk parameters") from None
        if len(body) > self.max_body:
            raise ValidationError("Kiosk parameters too large")
        return self._request(device, "commands/" + name, body)

    def identity(self, device: Device) -> KioskIdentity:
        data = self.command(device, "fleetIdentity", {})
        kiosk_id = data.get("id")
        if (not isinstance(kiosk_id, str) or kiosk_id == "unknown" or not re.fullmatch(r"[A-Za-z0-9_-]{1,200}", kiosk_id)
                or type(data.get("leader")) is not bool):
            raise RemoteRejected("Invalid kiosk identity")
        if device.id and device.id != kiosk_id:
            raise IdentityMismatch("Kiosk identity changed")
        return KioskIdentity(kiosk_id, data["leader"], data.get("follows") is not None)

    def _verify(self, device: Device, *, upload: bool = False) -> None:
        identity = self.identity(device)
        if upload and (not device.active or device.role not in ("leader", "standalone") or
                       identity.follows or (identity.leader != (device.role == "leader"))):
            raise RemoteRejected("Kiosk is not a direct publication target")

    def diagnostics(self, device: Device) -> DiagnosticListing:
        self._verify(device)
        data = self.command(device, "getWakeWordActivations", {})
        clips = []
        try:
            if type(data["enabled"]) is not bool:
                raise ValueError
            for key, near in (("activations", False), ("nearMisses", True)):
                if not isinstance(data[key], list):
                    raise ValueError
                for clip in data[key]:
                    if not isinstance(clip, dict) or not isinstance(clip.get("id"), str):
                        raise ValueError
                    scores = {key: clip[key] for key in ("score", "threshold")
                              if type(clip.get(key)) in (int, float) and math.isfinite(clip[key])}
                    clips.append(DiagnosticClip(clip["id"], clip.get("at"), clip.get("wakeWord", ""),
                                                clip.get("engine", ""), near, scores, clip))
            return DiagnosticListing(data["enabled"], clips)
        except (KeyError, TypeError, ValueError):
            raise RemoteRejected("Invalid kiosk diagnostics") from None

    def audio(self, device: Device, clip_id: str) -> bytes:
        self._verify(device)
        data = self.command(device, "getWakeWordActivationAudio", {"id": clip_id})
        try:
            if data.get("mimeType") != "audio/wav":
                raise ValueError
            return base64.b64decode(data["base64"], validate=True)
        except (KeyError, TypeError, ValueError, binascii.Error):
            raise RemoteRejected("Invalid kiosk audio") from None

    def stage_model(self, device: Device, name: str, content: BinaryIO) -> None:
        if not isinstance(name, str) or not re.fullmatch(r"[A-Za-z0-9_-][A-Za-z0-9_.-]{0,199}", name):
            raise ValidationError("Invalid model filename")
        body = content.read(self.max_upload + 1)
        if not isinstance(body, bytes) or not body or len(body) > self.max_upload:
            raise ValidationError("Invalid model size")
        self._verify(device, upload=True)
        data = self._request(device, "voice/wake-models/upload?name=" + quote(name, safe=""), body)
        if data.get("rejected"):
            raise RemoteRejected("Kiosk rejected model file")

    def commit_models(self, device: Device) -> CommitResult:
        self._verify(device, upload=True)
        data = self.command(device, "commitCustomWakeModels", {})
        if (not isinstance(data.get("added"), list) or not all(isinstance(x, dict)
                and isinstance(x.get("engine"), str) and isinstance(x.get("id"), str) for x in data["added"])
                or not isinstance(data.get("rejected"), list)):
            raise RemoteRejected("Invalid model commit response")
        # Names identify actual rejections; free-form reasons/values are not public data.
        rejected = [{"file": item["file"]} for item in data["rejected"]
                    if isinstance(item, dict) and isinstance(item.get("file"), str)]
        if len(rejected) != len(data["rejected"]):
            raise RemoteRejected("Invalid model commit response")
        return CommitResult([{"engine": item["engine"], "id": item["id"]} for item in data["added"]], rejected)

    def model_manifest(self, device: Device) -> dict[str, str]:
        self._verify(device)
        files = self.command(device, "customWakeModelsManifest", {}).get("files")
        if not isinstance(files, dict) or not all(isinstance(k, str) and isinstance(v, str)
                and re.fullmatch(r"[a-f0-9]{64}", v) for k, v in files.items()):
            raise RemoteRejected("Invalid kiosk manifest")
        return files
