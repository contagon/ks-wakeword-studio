"""Loopback-only kiosk protocol fixture; never connects to a LAN kiosk."""
import copy
import json
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

FIXTURES = Path(__file__).parent / "fixtures/kiosk"
TOKEN = "private-admin-token-never-reflect"
PASSWORD = "private admin password — never persist"


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
