from __future__ import annotations

import pathlib
import unittest


REPO_ROOT = pathlib.Path(__file__).resolve().parents[1]


class VueTrainerUiTests(unittest.TestCase):
    def test_static_shell_loads_the_ui_bundle(self) -> None:
        index = (REPO_ROOT / "static" / "index.html").read_text(encoding="utf-8")
        self.assertIn('id="trainer-app"', index)
        self.assertIn('/static/ui/trainer-ui.css', index)
        self.assertIn('/static/ui/trainer-ui.js', index)
        self.assertNotIn("fonts.googleapis.com", index)

    @unittest.skipUnless((REPO_ROOT / "static" / "ui" / "trainer-ui.js").exists(), "UI not built; run `just ui`")
    def test_built_bundle_is_complete(self) -> None:
        self.assertGreater((REPO_ROOT / "static" / "ui" / "trainer-ui.js").stat().st_size, 100_000)
        self.assertGreater((REPO_ROOT / "static" / "ui" / "trainer-ui.css").stat().st_size, 10_000)

    def test_studio_mounts_real_pages(self) -> None:
        shell = (REPO_ROOT / 'frontend/src/studio/components/StudioShell.vue').read_text()
        api = (REPO_ROOT / 'frontend/src/studio/api.ts').read_text()
        for page in ('Wakewords', 'Kiosks', 'NegativeDatasets', 'Artificial', 'Classify', 'Samples', 'Train', 'Deploy', 'Automate'):
            self.assertIn(f'{page}Page,', shell)  # registered in the PAGES map
        for contract in ('/queue', '/label', '/generation/submissions', '/training/jobs', '/datasets', '/deployment/publish'):
            self.assertIn(contract, api)
        classify = (REPO_ROOT / 'frontend/src/studio/pages/ClassifyPage.vue').read_text()
        self.assertIn('expected_revision', api)
        self.assertIn('shortcutTarget(event)', classify)
        self.assertIn('data-shortcuts', classify)
        self.assertIn('AbortController', classify)


if __name__ == "__main__":
    unittest.main()
