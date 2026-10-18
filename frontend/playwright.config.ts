import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  use: { baseURL: "http://127.0.0.1:8798", trace: "retain-on-failure" },
  webServer: {
    command: `${process.env.STUDIO_TEST_PYTHON ?? "/tmp/opencode/wakeword-studio-venv/bin/python"} tests/studio_browser_server.py --port 8798`,
    cwd: "..",
    url: "http://127.0.0.1:8798/api/studio/capabilities",
    reuseExistingServer: false,
  },
});
