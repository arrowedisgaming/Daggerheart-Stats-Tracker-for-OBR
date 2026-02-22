import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative base path for local dev, repo name path for GitHub Pages
  base: process.env.GITHUB_PAGES === 'true' ? '/Daggerheart-Stats-Tracker-for-OBR/' : './',
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        popover: resolve(__dirname, "popover.html"),
        background: resolve(__dirname, "background.html"),
      },
    },
  },
  server: {
    cors: true,
  },
});