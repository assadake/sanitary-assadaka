import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { Pool } from "pg";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRODUCTS, type Product } from "../src/data/catalog.ts";

const app = express();
const port = Number(process.env.PORT || 3000);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const databaseUrl = process.env.DATABASE_URL;

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
app.use(express.json({ limit: "32kb" }));
app.use("/api/orders", rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false }));

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "error", message: "Database unavailable" });
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

  const { rows: existingProducts } = await pool.query<{ id: string }>("SELECT id FROM products");
  const { rows: settingRows } = await pool.query<{ value: string }>(
    "SELECT value FROM app_settings WHERE key = 'catalog_revision'",
  );
  const catalogRevision = "assadaka-sanitary-v1";
  const hasAppliedAssadakaCatalog = settingRows[0]?.value === catalogRevision;
  const legacyTemplateIds = existingProducts
    .map(({ id }) => id)
    .filter((id) => /^TL-\d{4}$/.test(id));
  const shouldReplaceTemplateCatalog = !hasAppliedAssadakaCatalog && legacyTemplateIds.length > 0;
  const shouldSeedCatalog = existingProducts.length === 0;

  if (shouldReplaceTemplateCatalog || shouldSeedCatalog) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      if (shouldReplaceTemplateCatalog) {
        await client.query("DELETE FROM products WHERE id ~ '^TL-[0-9]{4}$'");
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

  app.listen(port, "0.0.0.0", () => console.info(`Assadaka shop server listening on port ${port}`));
}

start().catch((error) => {
  console.error("Server startup failed", error);
  process.exit(1);
});
