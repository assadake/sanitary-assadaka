import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type PreviewServer, type ViteDevServer } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { VISITE_SEO } from "./app/visite/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/**
 * `dist/index.html` is the whole app (vite-plugin-singlefile). Copying it to
 * `dist/visite/index.html` makes /visite a REAL static file: it works on any
 * static host even when no SPA rewrite is configured (Render does not read
 * vercel.json). The copy gets French/LTR + static SEO meta tags so crawlers
 * see the right page without executing JavaScript.
 */
function staticVisiteHtml(html: string) {
  const title = escapeHtml(VISITE_SEO.title);
  const description = escapeHtml(VISITE_SEO.description);
  return html
    .replace('<html lang="ar" dir="rtl">', '<html lang="fr" dir="ltr">')
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta\s+name="description"[\s\S]*?content=")[^"]*(")/, `$1${description}$2`)
    .replace(
      /(<meta\s+name="keywords"[\s\S]*?content=")[^"]*(")/,
      "$1showroom, visite virtuelle, 360, sanitaire, vasques, robinetterie, baignoires$2",
    )
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(<meta\s+property="og:image:alt"\s+content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta\s+property="og:locale"\s+content=")[^"]*(")/, "$1fr_FR$2")
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, `$1${description}$2`);
}

function gitValue(args: string[]) {
  try {
    return execFileSync("git", args, {
      cwd: __dirname,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "unknown";
  }
}

/**
 * The untouched panorama folder lives in `public/visite360/`, while the /visite
 * page (and the original brief) references `/visite-360/...`. Dev/preview
 * rewrite the URL; static hosts get an exact copy of the same bytes in `dist`.
 * No rename, no source-tree copy, no recompression.
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
      const distDir = path.resolve(__dirname, "dist");
      const panos = path.resolve(__dirname, "public/visite360");
      if (fs.existsSync(panos)) {
        fs.mkdirSync(distDir, { recursive: true });
        fs.cpSync(panos, path.join(distDir, "visite-360"), { recursive: true });
      }

      const indexHtml = path.join(distDir, "index.html");
      if (!fs.existsSync(indexHtml)) return;

      const visiteDir = path.join(distDir, "visite");
      fs.mkdirSync(visiteDir, { recursive: true });
      fs.writeFileSync(
        path.join(visiteDir, "index.html"),
        staticVisiteHtml(fs.readFileSync(indexHtml, "utf8")),
      );

      // Diagnostic: GET /deploy-info.json on the deployed site reveals exactly
      // which commit/branch is live — useful when a manual deploy looks stale.
      fs.writeFileSync(
        path.join(distDir, "deploy-info.json"),
        `${JSON.stringify(
          {
            commit: gitValue(["rev-parse", "HEAD"]),
            shortCommit: gitValue(["rev-parse", "--short", "HEAD"]),
            branch: gitValue(["rev-parse", "--abbrev-ref", "HEAD"]),
            builtAt: new Date().toISOString(),
            pages: ["/", "/visite", "/visite/index.html", "/visite-360/index.html"],
          },
          null,
          2,
        )}\n`,
      );
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
