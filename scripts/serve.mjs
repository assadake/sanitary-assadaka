/**
 * Zero-dependency static server for Render Web Services (`npm start`).
 *
 * A Static Site (see render.yaml) is the recommended target, but an existing
 * Render *Web Service* cannot be converted in place. This file lets that
 * service serve the same `dist/` output with the same SPA fallback.
 *
 * Render injects PORT automatically; no configuration or secret is required.
 */
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../dist", import.meta.url)));
const PORT = Number(process.env.PORT) || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
};

if (!existsSync(join(ROOT, "index.html"))) {
  console.error(`[serve] ${join(ROOT, "index.html")} introuvable. Lancez d'abord : npm run build`);
  process.exit(1);
}

createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url || "/", "http://localhost").pathname);
  } catch {
    res.writeHead(400).end("Bad request");
    return;
  }

  // Strip any leading ../ to keep the request inside ROOT.
  const relative = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, "");
  let file = join(ROOT, relative);
  if (file !== ROOT && !file.startsWith(ROOT + sep)) {
    res.writeHead(403).end("Forbidden");
    return;
  }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file) || !statSync(file).isFile()) file = join(ROOT, "index.html"); // SPA fallback

  const noCache = file.endsWith("index.html") || file.endsWith("deploy-info.json");
  res.writeHead(200, {
    "Content-Type": MIME[extname(file).toLowerCase()] || "application/octet-stream",
    "Cache-Control": noCache ? "no-cache" : "public, max-age=3600",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  });
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  createReadStream(file).pipe(res);
}).listen(PORT, "0.0.0.0", () => {
  console.log(`[serve] ${ROOT} → http://0.0.0.0:${PORT}`);
});
