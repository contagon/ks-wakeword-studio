import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

export default defineConfig({
  // The FastAPI server serves the bundle and its worker from /static/ui/; static/index.html loads it.
  base: "./",
  // Templates are Prettier-formatted, which assumes HTML whitespace rules; Vue's default
  // "condense" would drop a space that Prettier moved onto a new line between inline tags.
  plugins: [vue({ template: { compilerOptions: { whitespace: "preserve" } } }), tailwindcss()],
  build: {
    outDir: resolve(import.meta.dirname, "../static/ui"),
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve(import.meta.dirname, "src/main.ts"),
      output: {
        entryFileNames: "trainer-ui.js",
        assetFileNames: (assetInfo) => (assetInfo.name?.endsWith(".css") ? "trainer-ui.css" : "[name][extname]"),
      },
    },
  },
});
