import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { Product } from "../data/catalog";
import type { SiteContent } from "../site-content";

type AdminProduct = Omit<Product, "old"> & { old: number | null; active: boolean; sortOrder: number };
type Enquiry = {
  order_no: string;
  customer: { name: string; phone: string; city?: string; note?: string };
  items: { product: Product; qty: number }[];
  subtotal: number;
  collection_mode: "deliver" | "pickup";
  status: string;
  created_at: string;
};
type Tab = "products" | "content" | "orders";

const card = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";
const field = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100";
const button = "rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50";
const secondary = "rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50";

function setPath(root: unknown, path: (string | number)[], value: unknown): unknown {
  if (!path.length) return value;
  const [head, ...tail] = path;
  if (Array.isArray(root)) {
    const next = [...root];
    next[Number(head)] = setPath(next[Number(head)], tail, value);
    return next;
  }
  const source = root && typeof root === "object" ? root as Record<string, unknown> : {};
  return { ...source, [String(head)]: setPath(source[String(head)], tail, value) };
}

function blankArrayItem(path: (string | number)[]): unknown {
  switch (String(path[path.length - 1] ?? "")) {
    case "categories": return { id: "new-category", name: { ar: "", en: "" }, tagline: { ar: "", en: "" }, img: 6492398, accent: "#0058a3" };
    case "rooms": return { id: "new-room", title: { ar: "", en: "" }, sub: { ar: "", en: "" }, img: 6492398, cat: "sanitary" };
    case "stories": return { id: "new-story", tag: { ar: "", en: "" }, title: { ar: "", en: "" }, text: { ar: "", en: "" }, img: 6492398 };
    case "steps": return { ar: "", en: "" };
    case "brands": return { name: "New brand", sub: { ar: "", en: "" } };
    case "heroStats": return { value: { ar: "", en: "" }, key: "hero.stat1" };
    case "tickerKeys":
    case "faqKeys": return "";
    default: return {};
  }
}

function matches(value: unknown, query: string): boolean {
  if (!query) return true;
  if (typeof value === "string" || typeof value === "number") return String(value).toLowerCase().includes(query.toLowerCase());
  if (Array.isArray(value)) return value.some((item) => matches(item, query));
  if (value && typeof value === "object") return Object.entries(value).some(([key, item]) => key.toLowerCase().includes(query.toLowerCase()) || matches(item, query));
  return false;
}

function JsonField({
  label,
  value,
  path,
  onChange,
  query = "",
  lockId = false,
}: {
  label: string;
  value: unknown;
  path: (string | number)[];
  onChange: (path: (string | number)[], value: unknown) => void;
  query?: string;
  lockId?: boolean;
}) {
  if (Array.isArray(value)) {
    return (
      <details className="rounded-xl border border-slate-200 bg-slate-50 p-3" open={path.length === 0}>
        <summary className="cursor-pointer select-none font-semibold text-slate-800">{label} <span className="text-xs font-normal text-slate-500">({value.length})</span></summary>
        <div className="mt-3 space-y-3">
          {value.map((item, index) => matches(item, query) || !query ? (
            <div key={index} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-500">{label} #{index + 1}</span>
                <button type="button" className="text-xs font-semibold text-rose-700 hover:underline" onClick={() => onChange(path, value.filter((_, itemIndex) => itemIndex !== index))}>Supprimer</button>
              </div>
              <JsonField label={`${label} #${index + 1}`} value={item} path={[...path, index]} onChange={onChange} query={query} lockId={lockId} />
            </div>
          ) : null)}
          <button type="button" className={secondary} onClick={() => onChange(path, [...value, value.length ? structuredClone(value[0]) : blankArrayItem(path)])}>Ajouter un élément</button>
        </div>
      </details>
    );
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(([key, item]) => !query || key.toLowerCase().includes(query.toLowerCase()) || matches(item, query));
    return (
      <details className="rounded-xl border border-slate-200 bg-slate-50 p-3" open={path.length === 0}>
        <summary className="cursor-pointer select-none font-semibold text-slate-800">{label}</summary>
        <div className="mt-3 space-y-2.5">
          {entries.map(([key, item]) => (
            <JsonField key={key} label={key} value={item} path={[...path, key]} onChange={onChange} query={query} lockId={lockId} />
          ))}
          {entries.length === 0 && <p className="text-xs text-slate-500">Aucun champ ne correspond à cette recherche.</p>}
        </div>
      </details>
    );
  }

  const key = String(path[path.length - 1] ?? "");
  if (lockId && key === "id") {
    return <label className="block text-xs font-semibold text-slate-600"><span className="mb-1 block">{label} (identifiant fixe)</span><input className={field} value={String(value ?? "")} disabled /></label>;
  }
  const numberField = typeof value === "number" || (value === null && ["price", "old", "rating", "reviews", "stock", "warranty", "img", "sortOrder"].includes(key));
  if (typeof value === "boolean") {
    return <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><span className="break-all font-medium text-slate-700">{label}</span><input type="checkbox" checked={value} onChange={(event) => onChange(path, event.target.checked)} className="h-4 w-4 accent-sky-700" /></label>;
  }
  if (numberField) {
    return (
      <label className="block text-xs font-semibold text-slate-600">
        <span className="mb-1 block break-all">{label} {value === null && <span className="font-normal text-slate-400">(laisser vide = à confirmer)</span>}</span>
        <input className={field} type="number" step={key === "rating" ? "0.1" : "1"} value={value === null ? "" : String(value)} onChange={(event) => onChange(path, event.target.value === "" ? null : Number(event.target.value))} />
      </label>
    );
  }
  if (typeof value === "string" || value === null) {
    const textValue = value ?? "";
    return (
      <label className="block text-xs font-semibold text-slate-600">
        <span className="mb-1 block break-all">{key === "whatsappNumber" ? `${label} (chiffres internationaux seulement, sans +)` : label}</span>
        {textValue.length > 90 || textValue.includes("\n") ? (
          <textarea className={`${field} min-h-20 resize-y`} value={textValue} onChange={(event) => onChange(path, event.target.value)} />
        ) : (
          <input className={field} value={textValue} onChange={(event) => onChange(path, event.target.value)} />
        )}
      </label>
    );
  }
  return <p className="text-xs text-rose-700">Champ non modifiable : {label}</p>;
}

function emptyProduct(id: string): AdminProduct {
  return {
    id, cat: "sanitary",
    name: { ar: "", en: "" }, desc: { ar: "", en: "" },
    price: null, old: null, img: 6492398,
    origin: { ar: "حسب الموديل", en: "Model dependent" },
    rating: null, reviews: 0, stock: null, dim: "حسب الموديل",
    mat: { ar: "حسب الموديل", en: "Model dependent" }, warranty: null,
    badge: "new", active: true, sortOrder: 0,
  };
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers } });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `Request failed (${response.status})`);
  return result as T;
}

export default function AdminPage() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [orders, setOrders] = useState<Enquiry[]>([]);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAdminData = async () => {
    setBusy(true);
    setError("");
    try {
      const [productRows, siteContent, orderRows] = await Promise.all([
        api<AdminProduct[]>("/api/admin/products"),
        api<SiteContent>("/api/site-content"),
        api<Enquiry[]>("/api/admin/orders"),
      ]);
      setProducts(productRows);
      setContent(siteContent);
      setOrders(orderRows);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Chargement impossible.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    api<{ enabled: boolean; authenticated: boolean }>("/api/admin/session")
      .then(async (session) => {
        setEnabled(session.enabled);
        setAuthenticated(session.authenticated);
        if (session.authenticated) await loadAdminData();
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Connexion au serveur impossible."));
  }, []);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) });
      setPassword("");
      setAuthenticated(true);
      await loadAdminData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Connexion impossible.");
    } finally {
      setBusy(false);
    }
  };

  const saveProduct = async () => {
    if (!editing) return;
    setBusy(true);
    setError("");
    try {
      const { active, sortOrder, old, ...product } = editing;
      const payload = { product: { ...product, ...(old === null ? {} : { old }) }, active, sortOrder };
      await api(isNew ? "/api/admin/products" : `/api/admin/products/${encodeURIComponent(editing.id)}`, {
        method: isNew ? "POST" : "PUT",
        body: JSON.stringify(payload),
      });
      setEditing(null);
      await loadAdminData();
      setMessage("Produit enregistré.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  };

  const archiveProduct = async (product: AdminProduct) => {
    if (!window.confirm(`Masquer « ${product.name.ar || product.id} » du catalogue ?`)) return;
    setBusy(true);
    try {
      await api(`/api/admin/products/${encodeURIComponent(product.id)}`, { method: "DELETE" });
      await loadAdminData();
      setMessage("Produit masqué du catalogue.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Modification impossible.");
    } finally {
      setBusy(false);
    }
  };

  const setProductActive = async (product: AdminProduct) => {
    setBusy(true);
    setError("");
    try {
      const { active: _current, sortOrder, old, ...data } = product;
      await api(`/api/admin/products/${encodeURIComponent(product.id)}`, {
        method: "PUT",
        body: JSON.stringify({ product: { ...data, ...(old === null ? {} : { old }) }, active: true, sortOrder }),
      });
      await loadAdminData();
      setMessage("Produit réactivé.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Réactivation impossible.");
    } finally {
      setBusy(false);
    }
  };

  const saveContent = async () => {
    if (!content) return;
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/site-content", { method: "PUT", body: JSON.stringify(content) });
      setMessage("Contenu du site enregistré. Recharge le site pour afficher les changements.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  };

  const changeOrderStatus = async (orderNo: string, status: string) => {
    try {
      await api(`/api/admin/orders/${encodeURIComponent(orderNo)}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setOrders((current) => current.map((order) => order.order_no === orderNo ? { ...order, status } : order));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Modification impossible.");
    }
  };

  const logout = async () => {
    await api("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    setAuthenticated(false);
    setProducts([]);
    setContent(null);
    setOrders([]);
  };

  const openNewProduct = () => {
    const ids = products.map((product) => Number(product.id.match(/(\d+)$/)?.[1] ?? 0));
    setEditing(emptyProduct(`AS-${String(Math.max(9000, ...ids) + 1)}`));
    setIsNew(true);
  };

  const filteredProducts = products.filter((product) => `${product.id} ${product.name.ar} ${product.name.en}`.toLowerCase().includes(search.toLowerCase()));

  if (enabled === null) {
    return <AdminFrame><p className="text-sm text-slate-600">Connexion au panneau…</p></AdminFrame>;
  }

  if (!enabled) {
    return <AdminFrame><div className={card}><h1 className="text-xl font-black">Panneau admin non configuré</h1><p className="mt-2 text-sm leading-relaxed text-slate-600">Ajoute une variable secrète <code>ADMIN_PASSWORD</code> d’au moins 16 caractères dans Render (Environment), puis redémarre le service. Choisis un mot de passe long et unique; ne le mets pas dans le code et ne le partage pas.</p></div></AdminFrame>;
  }

  if (!authenticated) {
    return (
      <AdminFrame>
        <form onSubmit={login} className={`${card} mx-auto max-w-md`}>
          <p className="text-xs font-bold uppercase tracking-widest text-sky-700">Assadaka · Administration</p>
          <h1 className="mt-2 text-2xl font-black text-slate-900">Connexion admin</h1>
          <label className="mt-6 block text-sm font-semibold text-slate-700">Mot de passe
            <input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className={`${field} mt-2`} required />
          </label>
          {error && <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
          <button className={`${button} mt-5 w-full`} disabled={busy}>Se connecter</button>
        </form>
      </AdminFrame>
    );
  }

  return (
    <AdminFrame>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-widest text-sky-700">Assadaka</p><h1 className="text-2xl font-black text-slate-900">Administration de la boutique</h1></div>
        <div className="flex gap-2"><a href="/" className={secondary}>Voir le site</a><button type="button" className={secondary} onClick={logout}>Déconnexion</button></div>
      </header>
      <nav className="mb-5 flex flex-wrap gap-2">
        {([ ["products", "Produits"], ["content", "Interface & textes"], ["orders", "Demandes"] ] as [Tab, string][]).map(([id, label]) => <button key={id} type="button" onClick={() => setTab(id)} className={tab === id ? button : secondary}>{label}</button>)}
      </nav>
      {(error || message) && <div className={`mb-4 rounded-xl p-3 text-sm ${error ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}>{error || message}<button className="float-end font-bold" onClick={() => { setError(""); setMessage(""); }}>×</button></div>}
      {busy && <p className="mb-3 text-xs text-slate-500">Chargement…</p>}

      {tab === "products" && (
        <section className={card}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-black">Catalogue</h2><p className="text-sm text-slate-500">Prix, stocks, descriptions, images, garanties et visibilité.</p></div><button className={button} onClick={openNewProduct}>Ajouter un produit</button></div>
          <input className={`${field} mb-4`} placeholder="Rechercher un produit…" value={search} onChange={(event) => setSearch(event.target.value)} />
          <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead><tr className="border-b text-xs uppercase text-slate-500"><th className="p-2">ID</th><th className="p-2">Nom</th><th className="p-2">Prix</th><th className="p-2">Stock</th><th className="p-2">État</th><th className="p-2">Actions</th></tr></thead><tbody>
            {filteredProducts.map((product) => <tr key={product.id} className="border-b border-slate-100"><td className="p-2 font-mono text-xs">{product.id}</td><td className="p-2">{product.name.ar || product.name.en}</td><td className="p-2">{product.price ?? "À confirmer"}</td><td className="p-2">{product.stock ?? "À confirmer"}</td><td className="p-2">{product.active ? "Visible" : "Masqué"}</td><td className="p-2"><div className="flex gap-2"><button className="font-semibold text-sky-700" onClick={() => { setEditing(structuredClone(product)); setIsNew(false); }}>Modifier</button>{product.active ? <button className="font-semibold text-rose-700" onClick={() => void archiveProduct(product)}>Masquer</button> : <button className="font-semibold text-emerald-700" onClick={() => void setProductActive(product)}>Réactiver</button>}</div></td></tr>)}
          </tbody></table></div>
        </section>
      )}

      {tab === "content" && content && (
        <section className={card}>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-black">Textes et contenu de l’interface</h2><p className="max-w-3xl text-sm text-slate-500">Modifie les champs arabe/anglais, coordonnées WhatsApp/Facebook, sections, catégories, inspirations, marques et questions fréquentes. Les changements apparaissent après rechargement du site.</p></div><button className={button} disabled={busy} onClick={() => void saveContent()}>Enregistrer le contenu</button></div>
          <input className={`${field} mb-4`} placeholder="Filtrer les champs par nom ou texte…" value={search} onChange={(event) => setSearch(event.target.value)} />
          <div className="space-y-3">{Object.entries(content).map(([key, value]) => matches(value, search) || !search ? <JsonField key={key} label={key} value={value} path={[key]} onChange={(path, next) => setContent((current) => current ? setPath(current, path, next) as SiteContent : current)} query={search} /> : null)}</div>
        </section>
      )}

      {tab === "orders" && (
        <section className={card}>
          <div className="mb-4 flex items-center justify-between gap-2"><div><h2 className="text-lg font-black">Demandes reçues</h2><p className="text-sm text-slate-500">Les coordonnées des clients sont privées.</p></div><button className={secondary} onClick={() => void loadAdminData()}>Actualiser</button></div>
          <div className="space-y-3">{orders.map((order) => <article key={order.order_no} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold">{order.order_no}</p><p className="text-sm text-slate-600">{order.customer.name} · {order.customer.phone}{order.customer.city ? ` · ${order.customer.city}` : ""}</p><p className="mt-1 text-xs text-slate-500">{new Date(order.created_at).toLocaleString()}</p></div><select className={field + " w-auto"} value={order.status} onChange={(event) => void changeOrderStatus(order.order_no, event.target.value)}><option value="new">Nouvelle</option><option value="contacted">Contactée</option><option value="completed">Terminée</option><option value="cancelled">Annulée</option></select></div><ul className="mt-3 list-inside list-disc text-sm text-slate-700">{order.items.map((line, index) => <li key={index}>{line.product.name.ar} × {line.qty}</li>)}</ul>{order.customer.note && <p className="mt-2 text-sm text-slate-600">Note : {order.customer.note}</p>}</article>)}{!orders.length && <p className="py-8 text-center text-sm text-slate-500">Aucune demande pour le moment.</p>}</div>
        </section>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-3 sm:p-8">
          <section className="mx-auto max-w-4xl rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
            <header className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-xl font-black">{isNew ? "Nouveau produit" : `Modifier ${editing.id}`}</h2><p className="text-sm text-slate-500">Tous les champs du produit; laisse prix, stock ou garantie vide s’ils sont à confirmer.</p></div><button className={secondary} onClick={() => setEditing(null)}>Fermer</button></header>
            <div className="mb-5 space-y-2"><JsonField label="Produit" value={editing} path={[]} lockId={!isNew} onChange={(_path, next) => setEditing(next as AdminProduct)} /></div>
            <div className="flex flex-wrap justify-end gap-2"><button className={secondary} onClick={() => setEditing(null)}>Annuler</button><button className={button} disabled={busy} onClick={() => void saveProduct()}>Enregistrer le produit</button></div>
          </section>
        </div>
      )}
    </AdminFrame>
  );
}

function AdminFrame({ children }: { children: ReactNode }) {
  return <main dir="ltr" className="min-h-screen bg-slate-100 px-3 py-6 font-sans text-slate-900 sm:px-6"><div className="mx-auto max-w-6xl">{children}</div></main>;
}
