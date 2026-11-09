import fs from "node:fs";
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type PreviewServer, type ViteDevServer } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * The untouched panorama folder lives in `public/visite360/`, while the /visite
 * page (and the original brief) references `/visite-360/...`. This alias keeps
 * every asset exactly where it is: no rename, no copy in the source tree, no
 * recompression. Dev/preview rewrite the URL; static hosts get an exact copy
 * of the same bytes in the build output under the expected prefix.
 */
function visite360Alias() {
  return {
    name: "visite-360-path-alias",
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, _res, next) => {
        if (req.url?.startsWith("/visite-360/")) {
          req.url = req.url.replace(/^\/visite-360\//, "/visite360/");
        }
        next();
      });
    },
    configurePreviewServer(server: PreviewServer) {
      server.middlewares.use((req, _res, next) => {
        if (req.url?.startsWith("/visite-360/")) {
          req.url = req.url.replace(/^\/visite-360\//, "/visite360/");
        }
        next();
      });
    },
    closeBundle() {
      const from = path.resolve(__dirname, "public/visite360");
      if (!fs.existsSync(from)) return;
      const to = path.resolve(__dirname, "dist/visite-360");
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.cpSync(from, to, { recursive: true });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile(), visite360Alias()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    // The Arena preview is served through a proxied e2b.app host.
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    allowedHosts: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
