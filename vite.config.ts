import { readFileSync } from "fs";
import { resolve } from "path";
import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";

function devManifestPlugin(): Plugin {
  const staticManifest = JSON.parse(
    readFileSync(resolve(__dirname, "public/manifest.json"), "utf-8")
  );

  return {
    name: "dev-manifest",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url !== "/manifest.json") return next();

        const host = req.headers.host || "localhost:5173";
        const protocol = req.headers["x-forwarded-proto"] || "http";
        const origin = `${protocol}://${host}`;

        const manifest = {
          ...staticManifest,
          icon: `${origin}/icon.svg`,
          background_url: `${origin}/background.html`,
          action: {
            ...staticManifest.action,
            icon: `${origin}/icon.svg`,
            popover: `${origin}/index.html`,
          },
        };

        res.setHeader("Content-Type", "application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.end(JSON.stringify(manifest, null, 2));
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [devManifestPlugin(), react()],
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