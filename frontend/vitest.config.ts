import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue({ template: { compilerOptions: { whitespace: "preserve" } } })], // same as vite.config.ts
  test: { environment: "jsdom", restoreMocks: true, include: ["src/**/*.test.ts"] },
});
