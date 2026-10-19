"""Validate the resolved deployment contract without starting any containers."""

import json
import shutil
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


@unittest.skipUnless(shutil.which("docker"), "Docker CLI is not installed")
class ComposeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        version = subprocess.run(
            ["docker", "compose", "version"], capture_output=True, text=True, timeout=10,
        )
        if version.returncode:
            raise unittest.SkipTest("Docker Compose plugin is not installed")

    def test_resolved_service_keeps_loopback_gpu_and_existing_data_volume(self):
        result = subprocess.run(
            ["docker", "compose", "-f", str(ROOT / "compose.yaml"), "config", "--format", "json"],
            cwd=ROOT, capture_output=True, text=True, timeout=10,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        config = json.loads(result.stdout)
        service = config["services"]["studio"]
        self.assertEqual(service["container_name"], "ks-wakeword-studio")
        self.assertEqual(service["image"], "ks-wakeword-studio:local")
        self.assertEqual(service["build"]["context"], str(ROOT))
        self.assertEqual(service["build"]["dockerfile"], "dockerfile")
        self.assertEqual(service["restart"], "unless-stopped")
        self.assertEqual(service["shm_size"], "8589934592")
        self.assertEqual(service["ports"][0]["host_ip"], "127.0.0.1")
        self.assertEqual(str(service["ports"][0]["published"]), "8790")
        self.assertEqual(service["ports"][0]["target"], 8789)
        self.assertEqual(service["gpus"][0]["count"], -1)
        self.assertEqual(service["environment"]["REC_PORT"], "8789")
        self.assertEqual(service["environment"]["PIP_NO_CACHE_DIR"], "1")
        self.assertEqual(service["labels"]["com.centurylinklabs.watchtower.enable"], "false")
        self.assertEqual(service["volumes"][0]["target"], "/data")
        volume = config["volumes"][service["volumes"][0]["source"]]
        self.assertEqual(volume["name"], "ks-wakeword-studio-data")
        self.assertTrue(volume["external"], "Compose must not delete the existing application data")
