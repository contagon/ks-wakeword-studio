"""Loopback-only kiosk protocol fixture; never connects to a LAN kiosk."""
import base64
import copy
import hashlib
import json
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from studio_harness import wav

FIXTURES = Path(__file__).parent / "fixtures/kiosk"
TOKEN = "private-admin-token-never-reflect"
PASSWORD = "private admin password — never persist"


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def fixture(name):
    return json.loads((FIXTURES / f"{name}.json").read_text())


class KioskServer:
    def __init__(self):
        self.identity = fixture("identity")
        self.fleet = fixture("fleet")
        self.responses = {}
        self.requests = []
        owner = self

        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *args):
                pass

            def do_POST(self):
                body = self.rfile.read(int(self.headers.get("Content-Length", 0)))
                owner.requests.append((self.path, self.headers.get("Authorization"), body))
                login = self.path == "/kiosk/api/login"
                if not login and self.headers.get("Authorization") != f"Bearer {TOKEN}":
                    self.send_response(401)
                    self.end_headers()
                    return
                data = owner.responses.get(self.path)
                if callable(data):
                    data = data()
                if login and data is None:
                    if json.loads(body).get("password") == PASSWORD:
                        data = {"token": TOKEN}
                    else:
                        data = (401, {}, json.dumps({"error": "invalid password"}).encode())
                if data is None:
                    command = self.path.rsplit("/", 1)[-1]
                    data = {"fleetIdentity": owner.identity, "fleetStatus": owner.fleet,
                            "getWakeWordActivations": fixture("diagnostics"),
                            "getWakeWordActivationAudio": {"ok": True, "data": {"mimeType": "audio/wav", "base64": "UklGRg=="}},
                            "commitCustomWakeModels": {"ok": True, "data": {"added": [{"engine": "microwakeword", "id": "hey_kitchen"}], "rejected": []}},
                            "customWakeModelsManifest": {"ok": True, "data": {"files": {"microwakeword/hey_kitchen.tflite": "a" * 64}}}}.get(command, {"ok": True})
                status, headers, payload = data if isinstance(data, tuple) else (200, {}, json.dumps(copy.deepcopy(data)).encode())
                try:
                    self.send_response(status)
                    for key, value in headers.items():
                        self.send_header(key, value)
                    self.send_header("Content-Length", str(len(payload)))
                    self.end_headers()
                    self.wfile.write(payload)
                except (BrokenPipeError, ConnectionResetError):
                    pass

        self.server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.url = f"http://127.0.0.1:{self.server.server_port}/kiosk"

    def close(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()


class StatefulKiosk:
    """Minimal real HTTP kiosk protocol fixture; it binds loopback only."""

    def __init__(self, kiosk_id: str, *, leader: bool, follower: "StatefulKiosk | None" = None):
        self.kiosk_id, self.leader, self.follower = kiosk_id, leader, follower
        self.requests: list[tuple[str, bytes]] = []
        self.files: dict[str, bytes] = {}
        self.staged: dict[str, bytes] = {}
        self.slots = ["fixture-selected-a", "fixture-selected-b"]
        self.audio = wav(1, 0.2)
        self.clip_id = 'clip-1'
        owner = self

        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *_args):
                pass

            def do_POST(self):
                body = self.rfile.read(int(self.headers.get("Content-Length", "0")))
                owner.requests.append((self.path, body))
                login = self.path == "/api/login" and json.loads(body) == {"password": PASSWORD, "ttl_days": 3650}
                if not login and self.headers.get("Authorization") != f"Bearer {TOKEN}":
                    self.send_response(401); self.end_headers(); return
                command = self.path.rsplit("/", 1)[-1]
                if login:
                    payload = {"token": TOKEN}
                elif self.path.startswith("/api/voice/wake-models/upload?name="):
                    owner.staged[self.path.split("=", 1)[1]] = body
                    payload = {"ok": True, "data": {}}
                elif command == "fleetIdentity":
                    payload = {"ok": True, "data": {"id": owner.kiosk_id, "leader": owner.leader,
                                                      "follows": None if owner.leader else "fixture-leader"}}
                elif command == "fleetStatus":
                    followers = []
                    if owner.follower is not None:
                        followers = [{"id": owner.follower.kiosk_id, "address": "127.0.0.1",
                                      "port": owner.follower.port, "profile": "voice", "phase": "synced"}]
                    payload = {"ok": True, "data": {"self": {"id": owner.kiosk_id}, "leader": True,
                        "following": None, "profiles": [{"id": "voice", "categories": ["Voice Satellite"]}],
                        "followers": followers}}
                elif command == "getWakeWordActivations":
                    payload = {"ok": True, "data": {"enabled": True, "activations": [{"id": owner.clip_id,
                        "at": "2026-10-18T00:00:00+00:00", "wakeWord": "Hello robot", "engine": "mww"}], "nearMisses": []}}
                elif command == "getWakeWordActivationAudio":
                    payload = {"ok": True, "data": {"mimeType": "audio/wav", "base64": base64.b64encode(owner.audio).decode()}}
                elif command == "commitCustomWakeModels":
                    staged = dict(owner.staged); owner.staged.clear()
                    for name, value in staged.items():
                        engine = "microwakeword" if name.endswith((".json", ".tflite")) else "openwakeword"
                        owner.files[f"{engine}/{name}"] = value
                    ids = sorted({name.rsplit(".", 1)[0] for name in staged})
                    payload = {"ok": True, "data": {"added": [{"engine": "microwakeword", "id": name} for name in ids], "rejected": []}}
                elif command == "customWakeModelsManifest":
                    payload = {"ok": True, "data": {"files": {name: sha(value) for name, value in owner.files.items()}}}
                elif command == "clearWakeWordModels":
                    payload = {"ok": True, "data": {"removed": 0, "bytesFreed": 0, "restarted": True}}
                else:
                    self.send_response(404); self.end_headers(); return
                encoded = json.dumps(payload).encode()
                self.send_response(200); self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(encoded))); self.end_headers(); self.wfile.write(encoded)

        self.server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        self.port = self.server.server_port
        self.url = f"http://127.0.0.1:{self.port}"
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def close(self):
        self.server.shutdown(); self.server.server_close(); self.thread.join(timeout=5)

    def command_count(self, name: str) -> int:
        return sum(path.rsplit("/", 1)[-1].split("?", 1)[0] == name for path, _ in self.requests)
