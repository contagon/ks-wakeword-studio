import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

export default defineConfig({
  // The production server mounts this library and its worker under /static/ui/.
  base: "./",
  // Templates are Prettier-formatted, which assumes HTML whitespace rules; Vue's default
  // "condense" would drop a space that Prettier moved onto a new line between inline tags.
  plugins: [vue({ template: { compilerOptions: { whitespace: "preserve" } } }), tailwindcss()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: resolve(import.meta.dirname, "../static/ui"),
    emptyOutDir: true,
    lib: {
      entry: resolve(import.meta.dirname, "src/main.ts"),
      formats: ["es"],
      fileName: () => "trainer-ui.js",
    },
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => (assetInfo.name?.endsWith(".css") ? "trainer-ui.css" : "[name][extname]"),
      },
    },
  },
});
