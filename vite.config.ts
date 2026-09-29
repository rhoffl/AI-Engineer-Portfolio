import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// Single self-contained index.html: deploys to any static host (GitHub Pages,
// S3, Netlify, Azure Static Web Apps) or opens directly from disk.
export default defineConfig({
  base: "./",
  plugins: [viteSingleFile()],
  build: { outDir: "dist", target: "es2020" },
});
