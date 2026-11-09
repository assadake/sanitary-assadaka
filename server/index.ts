import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { Pool } from "pg";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRODUCTS, type Product } from "../src/data/catalog.ts";
import { DEFAULT_SITE_CONTENT, type SiteContent } from "../src/site-content.ts";

const app = express();
const LEGACY_TEMPLATE_IDS = [
  ...Array.from({ length: 5 }, (_, index) => `TL-${1001 + index}`),
  ...Array.from({ length: 7 }, (_, index) => `TL-${2001 + index}`),
  ...Array.from({ length: 6 }, (_, index) => `TL-${3001 + index}`),
  ...Array.from({ length: 5 }, (_, index) => `TL-${4001 + index}`),
  ...Array.from({ length: 4 }, (_, index) => `TL-${5001 + index}`),
  ...Array.from({ length: 5 }, (_, index) => `TL-${6001 + index}`),
  ...Array.from({ length: 4 }, (_, index) => `TL-${7001 + index}`),
  ...Array.from({ length: 5 }, (_, index) => `TL-${8001 + index}`),
];
const port = Number(process.env.PORT || 3000);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const databaseUrl = process.env.DATABASE_URL;
const adminPassword = process.env.ADMIN_PASSWORD;
const ADMIN_COOKIE = "assadaka_admin";
const ADMIN_SESSION_SECONDS = 12 * 60 * 60;

if (!databaseUrl) {
  console.error("DATABASE_URL is required. Add your Neon connection string in Render environment variables.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
function mergeDefaults(defaults: unknown, saved: unknown): unknown {
  if (isRecord(defaults) && isRecord(saved)) {
    const result: Record<string, unknown> = { ...saved };
    for (const [key, defaultValue] of Object.entries(defaults)) {
      result[key] = key in saved ? mergeDefaults(defaultValue, saved[key]) : defaultValue;
    }
    return result;
  }
  return saved === undefined ? defaults : saved;
}
const isText = (value: unknown, max = 5000): value is string => typeof value === "string" && value.length <= max;
const isBi = (value: unknown): value is { ar: string; en: string } =>
  isRecord(value) && isText(value.ar) && isText(value.en);

function signAdminToken(payload: string): string {
  return createHmac("sha256", adminPassword ?? "").update(payload).digest("hex");
}

function isAdminRequest(req: Request): boolean {
  if (!adminPassword || adminPassword.length < 16) return false;
  const cookieHeader = req.headers.cookie ?? "";
  const raw = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${ADMIN_COOKIE}=`));
  if (!raw) return false;
  let token: string;
  try { token = decodeURIComponent(raw.slice(ADMIN_COOKIE.length + 1)); } catch { return false; }
  const [expiresAt, nonce, signature, extra] = token.split(".");
  if (!expiresAt || !nonce || !signature || extra || !/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) < Math.floor(Date.now() / 1000)) return false;
  const expected = Buffer.from(signAdminToken(`${expiresAt}.${nonce}`), "hex");
  const received = Buffer.from(signature, "hex");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!isAdminRequest(req)) {
    res.status(401).json({ error: "Admin authentication required" });
    return;
  }
  next();
}

function validProduct(value: unknown): value is Product {
  if (!isRecord(value)) return false;
  const nonnegative = (v: unknown) => typeof v === "number" && Number.isFinite(v) && v >= 0;
  const valid = typeof value.id === "string" && /^[A-Za-z0-9_-]{3,40}$/.test(value.id)
    && isText(value.cat, 80) && !!value.cat
    && isBi(value.name) && Boolean(value.name.ar.trim() || value.name.en.trim())
    && isBi(value.desc) && isBi(value.origin) && isBi(value.mat)
    && (value.price === null || nonnegative(value.price))
    && (value.old === undefined || nonnegative(value.old))
    && Number.isInteger(value.img) && Number(value.img) > 0
    && (value.rating === null || (typeof value.rating === "number" && value.rating >= 0 && value.rating <= 5))
    && Number.isInteger(value.reviews) && Number(value.reviews) >= 0
    && (value.stock === null || (Number.isInteger(value.stock) && Number(value.stock) >= 0))
    && isText(value.dim, 160)
    && (value.warranty === null || nonnegative(value.warranty))
    && (value.badge === undefined || value.badge === "" || ["new", "offer", "best", "import"].includes(String(value.badge)));
  if (valid && value.badge === "") value.badge = undefined;
  return valid;
}

function validSiteContent(value: unknown): value is SiteContent {
  if (!isRecord(value) || !isRecord(value.dictionaries) || !isRecord(value.config)) return false;
  const dictionaries = value.dictionaries;
  const config = value.config;
  const validDictionary = (dict: unknown) => isRecord(dict) && Object.values(dict).every((entry) => isText(entry));
  const validHttpUrl = (raw: unknown) => {
    if (!isText(raw, 1000)) return false;
    try { const url = new URL(raw); return url.protocol === "https:" || url.protocol === "http:"; } catch { return false; }
  };
  const validImage = (raw: unknown) => Number.isInteger(raw) && Number(raw) > 0;
  const validCategory = (row: unknown) => isRecord(row) && isText(row.id, 80) && isBi(row.name) && isBi(row.tagline) && validImage(row.img) && isText(row.accent, 40);
  const validRoom = (row: unknown) => isRecord(row) && isText(row.id, 80) && isBi(row.title) && isBi(row.sub) && validImage(row.img) && isText(row.cat, 80);
  const validStory = (row: unknown) => isRecord(row) && isText(row.id, 80) && isBi(row.tag) && isBi(row.title) && isBi(row.text) && validImage(row.img);
  const validBrand = (row: unknown) => isRecord(row) && isText(row.name, 120) && isBi(row.sub);
  const validStat = (row: unknown) => isRecord(row) && isBi(row.value) && isText(row.key, 160);
  const heroImages = isRecord(config.heroImages) ? config.heroImages : null;
  return validDictionary(dictionaries.ar) && validDictionary(dictionaries.en)
    && isBi(config.companyDisplay) && isBi(config.seoTitle) && isBi(config.seoDescription)
    && validHttpUrl(config.facebookPageUrl) && validHttpUrl(config.mapUrl)
    && isText(config.whatsappNumber, 30) && /^[0-9]*$/.test(config.whatsappNumber)
    && !!heroImages && validImage(heroImages.main) && validImage(heroImages.detailA) && validImage(heroImages.detailB)
    && validImage(config.serviceImage) && validImage(config.showroomImage)
    && Array.isArray(value.categories) && value.categories.length <= 50 && value.categories.every(validCategory)
    && Array.isArray(value.rooms) && value.rooms.length <= 100 && value.rooms.every(validRoom)
    && Array.isArray(value.stories) && value.stories.length <= 100 && value.stories.every(validStory)
    && Array.isArray(value.steps) && value.steps.length <= 30 && value.steps.every(isBi)
    && Array.isArray(value.brands) && value.brands.length <= 50 && value.brands.every(validBrand)
    && Array.isArray(value.heroStats) && value.heroStats.length <= 20 && value.heroStats.every(validStat)
    && Array.isArray(value.tickerKeys) && value.tickerKeys.every((key) => isText(key, 160))
    && Array.isArray(value.faqKeys) && value.faqKeys.every((key) => isText(key, 160));
}

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https://images.pexels.com"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
}));
app.use(express.json({ limit: "1mb" }));
app.use("/api/orders", rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false }));

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "error", message: "Database unavailable" });
  }
});

app.get("/api/site-content", async (_req, res) => {
  try {
    const { rows } = await pool.query<{ value: string }>("SELECT value FROM app_settings WHERE key = 'site_content'");
    res.set("Cache-Control", "no-store").json(rows[0] ? mergeDefaults(DEFAULT_SITE_CONTENT, JSON.parse(rows[0].value)) : DEFAULT_SITE_CONTENT);
  } catch (error) {
    console.error("Site content query failed", error);
    res.status(500).json({ error: "Could not load site content" });
  }
});

app.get("/api/admin/session", (req, res) => {
  res.set("Cache-Control", "no-store").json({ enabled: Boolean(adminPassword && adminPassword.length >= 16), authenticated: isAdminRequest(req) });
});

app.post("/api/admin/login", rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: "draft-8", legacyHeaders: false }), (req, res) => {
  if (!adminPassword || adminPassword.length < 16) {
    res.status(503).json({ error: "Admin access is not configured. Set an ADMIN_PASSWORD of at least 16 characters in Render." });
    return;
  }
  const suppliedPassword = typeof req.body?.password === "string" ? req.body.password : "";
  const expected = createHash("sha256").update(adminPassword).digest();
  const supplied = createHash("sha256").update(suppliedPassword).digest();
  if (!timingSafeEqual(expected, supplied)) {
    res.status(401).json({ error: "Incorrect password" });
    return;
  }
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_SECONDS;
  const payload = `${expiresAt}.${randomBytes(24).toString("hex")}`;
  const token = `${payload}.${signAdminToken(payload)}`;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${ADMIN_COOKIE}=${encodeURIComponent(token)}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${ADMIN_SESSION_SECONDS}${secure}`);
  res.json({ authenticated: true });
});

app.post("/api/admin/logout", (_req, res) => {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${ADMIN_COOKIE}=; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=0${secure}`);
  res.json({ authenticated: false });
});

app.put("/api/admin/site-content", requireAdmin, async (req, res) => {
  if (!validSiteContent(req.body)) {
    res.status(400).json({ error: "Invalid site content" });
    return;
  }
  try {
    await pool.query(
      `INSERT INTO app_settings (key, value) VALUES ('site_content', $1)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [JSON.stringify(req.body)],
    );
    res.json({ saved: true });
  } catch (error) {
    console.error("Site content save failed", error);
    res.status(500).json({ error: "Could not save site content" });
  }
});

app.get("/api/admin/products", requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query<{ id: string; active: boolean; sort_order: number; data: Product }>(
      "SELECT id, active, sort_order, data FROM products ORDER BY sort_order, id",
    );
    res.set("Cache-Control", "no-store").json(rows.map((row) => ({ ...row.data, old: row.data.old ?? null, active: row.active, sortOrder: row.sort_order })));
  } catch (error) {
    console.error("Admin products query failed", error);
    res.status(500).json({ error: "Could not load admin products" });
  }
});

app.post("/api/admin/products", requireAdmin, async (req, res) => {
  const { product, active = true, sortOrder = 0 } = req.body ?? {};
  if (!validProduct(product) || typeof active !== "boolean" || !Number.isInteger(sortOrder) || sortOrder < 0) {
    res.status(400).json({ error: "Invalid product data" });
    return;
  }
  try {
    await pool.query(
      "INSERT INTO products (id, active, sort_order, data) VALUES ($1, $2, $3, $4::jsonb)",
      [product.id, active, sortOrder, JSON.stringify(product)],
    );
    res.status(201).json({ saved: true });
  } catch (error) {
    if (isRecord(error) && error.code === "23505") {
      res.status(409).json({ error: "A product with this ID already exists" });
      return;
    }
    console.error("Admin product creation failed", error);
    res.status(500).json({ error: "Could not create product" });
  }
});

app.put("/api/admin/products/:id", requireAdmin, async (req, res) => {
  const { product, active, sortOrder } = req.body ?? {};
  if (!validProduct(product) || product.id !== req.params.id || typeof active !== "boolean" || !Number.isInteger(sortOrder) || sortOrder < 0) {
    res.status(400).json({ error: "Invalid product data" });
    return;
  }
  try {
    const { rowCount } = await pool.query(
      "UPDATE products SET active = $2, sort_order = $3, data = $4::jsonb, updated_at = NOW() WHERE id = $1",
      [product.id, active, sortOrder, JSON.stringify(product)],
    );
    if (!rowCount) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json({ saved: true });
  } catch (error) {
    console.error("Admin product update failed", error);
    res.status(500).json({ error: "Could not update product" });
  }
});

app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const { rowCount } = await pool.query("UPDATE products SET active = FALSE, updated_at = NOW() WHERE id = $1", [req.params.id]);
    if (!rowCount) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json({ saved: true });
  } catch (error) {
    console.error("Admin product archive failed", error);
    res.status(500).json({ error: "Could not archive product" });
  }
});

app.get("/api/admin/orders", requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT order_no, customer, items, subtotal, collection_mode, status, created_at FROM orders ORDER BY created_at DESC LIMIT 100",
    );
    res.set("Cache-Control", "no-store").json(rows);
  } catch (error) {
    console.error("Admin orders query failed", error);
    res.status(500).json({ error: "Could not load enquiries" });
  }
});

app.patch("/api/admin/orders/:orderNo", requireAdmin, async (req, res) => {
  const allowedStatuses = ["new", "contacted", "completed", "cancelled"];
  const status = req.body?.status;
  if (!allowedStatuses.includes(status)) {
    res.status(400).json({ error: "Invalid enquiry status" });
    return;
  }
  try {
    const { rowCount } = await pool.query("UPDATE orders SET status = $2 WHERE order_no = $1", [req.params.orderNo, status]);
    if (!rowCount) {
      res.status(404).json({ error: "Enquiry not found" });
      return;
    }
    res.json({ saved: true });
  } catch (error) {
    console.error("Admin enquiry update failed", error);
    res.status(500).json({ error: "Could not update enquiry" });
  }
});

app.get("/api/products", async (_req, res) => {
  try {
    const { rows } = await pool.query<{ data: Product }>(
      "SELECT data FROM products WHERE active = TRUE ORDER BY sort_order ASC, id ASC",
    );
    res.set("Cache-Control", "no-store").json(rows.map((row) => row.data));
  } catch (error) {
    console.error("Product query failed", error);
    res.status(500).json({ error: "Could not load products" });
  }
});

app.post("/api/orders", async (req, res) => {
  const customer = req.body?.customer;
  const rawItems = req.body?.items;
  const name = typeof customer?.name === "string" ? customer.name.trim() : "";
  const phone = typeof customer?.phone === "string" ? customer.phone.trim() : "";
  const city = typeof customer?.city === "string" ? customer.city.trim() : "";
  const note = typeof customer?.note === "string" ? customer.note.trim() : "";
  const mode = customer?.mode;

  if (!name || name.length > 120 || !phone || phone.length > 40) {
    res.status(400).json({ error: "Please provide a valid name and phone number" });
    return;
  }
  if (city.length > 240 || note.length > 1000 || !["deliver", "pickup"].includes(mode)) {
    res.status(400).json({ error: "Invalid delivery details" });
    return;
  }
  if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 30) {
    res.status(400).json({ error: "Your order must contain between 1 and 30 products" });
    return;
  }

  const quantities = new Map<string, number>();
  for (const item of rawItems) {
    if (typeof item?.productId !== "string" || !Number.isInteger(item.qty) || item.qty < 1 || item.qty > 99) {
      res.status(400).json({ error: "Invalid product or quantity" });
      return;
    }
    const totalQty = (quantities.get(item.productId) ?? 0) + item.qty;
    if (totalQty > 99) {
      res.status(400).json({ error: "Maximum quantity per product is 99" });
      return;
    }
    quantities.set(item.productId, totalQty);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const productIds = [...quantities.keys()];
    const { rows } = await client.query<{ data: Product }>(
      "SELECT data FROM products WHERE active = TRUE AND id = ANY($1::text[]) FOR SHARE",
      [productIds],
    );
    const productMap = new Map(rows.map(({ data }) => [data.id, data]));
    if (productMap.size !== productIds.length) {
      await client.query("ROLLBACK");
      res.status(409).json({ error: "One or more products are no longer available" });
      return;
    }

    const orderLines = productIds.map((id) => {
      const product = productMap.get(id)!;
      const qty = quantities.get(id)!;
      return { product, qty };
    });
    const unavailableLine = orderLines.find(({ product, qty }) => product.stock !== null && qty > product.stock);
    if (unavailableLine) {
      await client.query("ROLLBACK");
      res.status(409).json({ error: `Only ${unavailableLine.product.stock} item(s) remain for ${unavailableLine.product.id}` });
      return;
    }
    const subtotal = orderLines.reduce((sum, line) => sum + (line.product.price ?? 0) * line.qty, 0);
    const orderNo = `AS-${new Date().getFullYear()}-${randomBytes(4).toString("hex").toUpperCase()}`;
    await client.query(
      `INSERT INTO orders (order_no, customer, items, subtotal, collection_mode)
       VALUES ($1, $2::jsonb, $3::jsonb, $4, $5)`,
      [
        orderNo,
        JSON.stringify({ name, phone, city, note }),
        JSON.stringify(orderLines.map(({ product, qty }) => ({ product, qty }))),
        subtotal,
        mode,
      ],
    );
    await client.query("COMMIT");
    res.status(201).json({ orderNo, subtotal, lines: orderLines });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("Order save failed", error);
    res.status(500).json({ error: "Could not save order. Please try again." });
  } finally {
    client.release();
  }
});

app.use(express.static(path.join(root, "dist"), { maxAge: "1h", index: false }));
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.sendFile(path.join(root, "dist", "index.html"), (error) => {
    if (error) next(error);
  });
});

async function start() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id BIGSERIAL PRIMARY KEY,
      order_no TEXT NOT NULL UNIQUE,
      customer JSONB NOT NULL,
      items JSONB NOT NULL,
      subtotal NUMERIC(12, 2) NOT NULL,
      collection_mode TEXT NOT NULL CHECK (collection_mode IN ('deliver', 'pickup')),
      status TEXT NOT NULL DEFAULT 'new',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(
    "INSERT INTO app_settings (key, value) VALUES ('site_content', $1) ON CONFLICT (key) DO NOTHING",
    [JSON.stringify(DEFAULT_SITE_CONTENT)],
  );

  const { rows: existingProducts } = await pool.query<{ id: string }>("SELECT id FROM products");
  const { rows: settingRows } = await pool.query<{ value: string }>(
    "SELECT value FROM app_settings WHERE key = 'catalog_revision'",
  );
  const catalogRevision = "assadaka-sanitary-v1";
  const hasAppliedAssadakaCatalog = settingRows[0]?.value === catalogRevision;
  const legacyTemplateIds = existingProducts
    .map(({ id }) => id)
    .filter((id) => LEGACY_TEMPLATE_IDS.includes(id));
  const shouldReplaceTemplateCatalog = !hasAppliedAssadakaCatalog && legacyTemplateIds.length > 0;
  const shouldSeedCatalog = existingProducts.length === 0;

  if (shouldReplaceTemplateCatalog || shouldSeedCatalog) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      if (shouldReplaceTemplateCatalog) {
        await client.query("DELETE FROM products WHERE id = ANY($1::text[])", [legacyTemplateIds]);
        console.info(`Replaced ${legacyTemplateIds.length} starter template products with the Assadaka catalogue.`);
      }
      for (const [index, product] of PRODUCTS.entries()) {
        await client.query(
          "INSERT INTO products (id, sort_order, data) VALUES ($1, $2, $3::jsonb) ON CONFLICT (id) DO NOTHING",
          [product.id, index, JSON.stringify(product)],
        );
      }
      await client.query(
        `INSERT INTO app_settings (key, value) VALUES ('catalog_revision', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [catalogRevision],
      );
      await client.query("COMMIT");
      console.info(`Seeded ${PRODUCTS.length} Assadaka sanitary/building catalogue examples into Neon.`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } else if (!hasAppliedAssadakaCatalog) {
    await pool.query(
      "INSERT INTO app_settings (key, value) VALUES ('catalog_revision', $1) ON CONFLICT (key) DO NOTHING",
      [catalogRevision],
    );
  }

  const server = app.listen(port, "0.0.0.0", () => console.info(`Assadaka shop server listening on port ${port}`));
  const shutdown = (signal: NodeJS.Signals) => {
    console.info(`Received ${signal}; closing the HTTP server.`);
    const timeout = setTimeout(() => {
      console.error("Graceful shutdown timed out; exiting.");
      process.exit(1);
    }, 10_000);
    timeout.unref();
    server.close((error) => {
      clearTimeout(timeout);
      if (error) {
        console.error("HTTP server shutdown failed", error);
        process.exit(1);
        return;
      }
      void pool.end().then(() => process.exit(0)).catch((poolError) => {
        console.error("Database pool shutdown failed", poolError);
        process.exit(1);
      });
    });
  };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
}

start().catch((error) => {
  console.error("Server startup failed", error);
  process.exit(1);
});
