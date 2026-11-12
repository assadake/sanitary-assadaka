import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { hasAdminSession, signInAdmin, signOutAdmin, uploadAdminImage } from "../supabase";
import { px, type Bi, type Category, type Product, type Room, type Story } from "../data/catalog";
import { dictionaries } from "../i18n";
import { useStore } from "../store";
import type { SiteContent } from "../admin-types";

type Section = "overview" | "products" | "categories" | "texts" | "rooms" | "stories" | "settings" | "data";
type Draft = SiteContent;

const NAV: { id: Section; label: string; icon: string }[] = [
  { id: "overview", label: "Vue d’ensemble", icon: "▦" },
  { id: "products", label: "Articles", icon: "▤" },
  { id: "categories", label: "Catégories", icon: "◫" },
  { id: "texts", label: "Textes du site", icon: "Aa" },
  { id: "rooms", label: "Inspirations", icon: "▧" },
  { id: "stories", label: "Conseils & articles", icon: "✎" },
  { id: "settings", label: "Coordonnées", icon: "⚙" },
  { id: "data", label: "Sauvegarde & données", icon: "⇅" },
];

const blankBi: Bi = { ar: "", en: "" };
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function Field({ label, value, onChange, textarea = false, dir, placeholder, type = "text", hint }: {
  label: string; value: string | number; onChange: (value: string) => void; textarea?: boolean;
  dir?: "rtl" | "ltr"; placeholder?: string; type?: string; hint?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span>
      {textarea ? (
        <textarea dir={dir} rows={4} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
          className="admin-input min-h-24 resize-y" />
      ) : (
        <input dir={dir} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
          className="admin-input" />
      )}
      {hint && <span className="mt-1 block text-[11px] leading-relaxed text-slate-400">{hint}</span>}
    </label>
  );
}

function BiFields({ label, value, onChange, textarea = false }: { label: string; value: Bi; onChange: (value: Bi) => void; textarea?: boolean }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label={`${label} — العربية`} dir="rtl" value={value.ar} textarea={textarea} onChange={(ar) => onChange({ ...value, ar })} />
      <Field label={`${label} — English`} value={value.en} textarea={textarea} onChange={(en) => onChange({ ...value, en })} />
    </div>
  );
}

function NullableNumber({ label, value, onChange }: { label: string; value: number | null | undefined; onChange: (value: number | null) => void }) {
  return <Field label={label} type="number" value={value ?? ""} onChange={(v) => onChange(v === "" ? null : Number(v))} />;
}

function ImageField({ value, onChange, remote }: { value: number | string; onChange: (value: number | string) => void; remote: boolean }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true); setError("");
    try { onChange(await uploadAdminImage(file)); }
    catch { setError("Téléversement impossible. Vérifiez le bucket Supabase et vos droits administrateur."); }
    finally { setUploading(false); }
  };
  return <div className="grid gap-4 sm:grid-cols-[1fr_180px]"><div><Field label="Image — URL complète ou identifiant Pexels" value={value} onChange={(v) => onChange(/^\d+$/.test(v) ? Number(v) : v)} hint="Ex. 11701114 ou https://…" />{remote && <label className="admin-secondary mt-3 inline-block cursor-pointer">{uploading ? "Téléversement…" : "Téléverser une image"}<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={uploading} onChange={(e) => void upload(e.target.files?.[0])} /></label>}{error && <p className="mt-2 text-xs text-red-600">{error}</p>}</div><img src={px(value, 300, 220)} alt="Aperçu" className="h-32 w-full rounded-xl bg-slate-100 object-cover" /></div>;
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,.03)] ${className}`}>{children}</div>;
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">{text}</div>;
}

export default function Admin() {
  const { content, saveContent, resetContent, contentReady, contentError, remoteEnabled } = useStore();
  const [authenticated, setAuthenticated] = useState(() => !remoteEnabled && sessionStorage.getItem("assadaka.admin.session") === "yes");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [section, setSection] = useState<Section>("overview");
  const [draft, setDraft] = useState<Draft>(() => clone(content));
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(content.products[0]?.id ?? "");
  const [selectedCategory, setSelectedCategory] = useState(content.categories[0]?.id ?? "");
  const [textQuery, setTextQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(content.rooms[0]?.id ?? "");
  const [selectedStory, setSelectedStory] = useState(content.stories[0]?.id ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (remoteEnabled) void hasAdminSession().then(setAuthenticated);
  }, [remoteEnabled]);

  useEffect(() => {
    if (contentReady && !dirty) setDraft(clone(content));
  }, [content, contentReady, dirty]);

  const update = (next: Draft) => { setDraft(next); setDirty(true); setNotice(""); };
  const save = async () => {
    const invalid = draft.products.find((p) => !p.id.trim() || !p.name.ar.trim() || !p.name.en.trim());
    const ids = new Set(draft.products.map((p) => p.id));
    if (invalid || ids.size !== draft.products.length) {
      setNotice("Chaque article doit avoir une référence unique et un nom dans les deux langues.");
      return;
    }
    setSaving(true);
    const saved = await saveContent(draft);
    setSaving(false);
    if (saved) {
      setDirty(false);
      setNotice(remoteEnabled ? "Modifications publiées en ligne pour tous les visiteurs." : "Modifications enregistrées sur ce navigateur.");
    } else setNotice(remoteEnabled ? "Publication refusée. Vérifiez votre connexion, votre session admin et les politiques Supabase." : "Espace de stockage insuffisant. Exportez vos données puis réduisez les contenus.");
  };

  const login = async () => {
    try {
      if (remoteEnabled) await signInAdmin(email, pin);
      else {
        const configured = localStorage.getItem("assadaka.admin.pin") || "admin2026";
        if (pin !== configured) throw new Error("invalid");
        sessionStorage.setItem("assadaka.admin.session", "yes");
      }
      setAuthenticated(true);
      setLoginError(false);
    } catch { setLoginError(true); }
  };

  if (!authenticated) {
    return (
      <main dir="ltr" className="grid min-h-screen place-items-center bg-[#eef2f6] p-5 text-slate-900">
        <Card className="w-full max-w-md overflow-hidden">
          <div className="bg-[#102a43] p-8 text-white">
            <a href="/" className="text-xs font-bold text-sky-300 hover:text-white">← Retour au site</a>
            <div className="mt-8 grid h-12 w-12 place-items-center rounded-xl bg-amber-400 text-xl font-black text-slate-950">A</div>
            <h1 className="mt-5 text-2xl font-black">Administration Assadaka</h1>
            <p className="mt-2 text-sm text-slate-300">Gestion du catalogue et des contenus du site.</p>
          </div>
          <form className="p-8" onSubmit={(e) => { e.preventDefault(); void login(); }}>
            {remoteEnabled && <div className="mb-4"><Field label="E-mail administrateur" type="email" value={email} onChange={setEmail} placeholder="admin@exemple.com" /></div>}
            <Field label={remoteEnabled ? "Mot de passe" : "Code d’accès administrateur"} type="password" value={pin} onChange={setPin} placeholder={remoteEnabled ? "Votre mot de passe Supabase" : "Saisissez votre code"} />
            {loginError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700">Identifiants incorrects ou accès refusé. Réessayez.</p>}
            <button className="mt-5 w-full rounded-xl bg-[#145da0] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#0c4a80]">Ouvrir le panneau</button>
            <p className="mt-5 rounded-xl bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-800">
              {remoteEnabled ? <>Connexion sécurisée par <strong>Supabase Auth</strong>. Utilisez le compte créé dans votre projet.</> : <>Accès local initial : <strong>admin2026</strong>. Configurez Supabase pour activer l’authentification serveur.</>}
            </p>
          </form>
        </Card>
      </main>
    );
  }

  if (!contentReady) return <main className="grid min-h-screen place-items-center bg-[#f3f6f9] text-sm font-bold text-slate-600">Chargement du contenu Supabase…</main>;

  const product = draft.products.find((p) => p.id === selectedProduct);
  const category = draft.categories.find((c) => c.id === selectedCategory);
  const room = draft.rooms.find((r) => r.id === selectedRoom);
  const story = draft.stories.find((s) => s.id === selectedStory);
  const filteredProducts = draft.products.filter((p) => `${p.id} ${p.name.ar} ${p.name.en}`.toLowerCase().includes(productQuery.toLowerCase()));
  const textKeys = Array.from(new Set([...Object.keys(dictionaries.ar), ...Object.keys(draft.texts.ar), ...Object.keys(draft.texts.en)]))
    .filter((key) => key.toLowerCase().includes(textQuery.toLowerCase()) || draft.texts.ar[key]?.includes(textQuery) || draft.texts.en[key]?.toLowerCase().includes(textQuery.toLowerCase()));

  const patchProduct = (patch: Partial<Product>) => product && update({ ...draft, products: draft.products.map((p) => p.id === product.id ? { ...p, ...patch } : p) });
  const patchCategory = (patch: Partial<Category>) => category && update({ ...draft, categories: draft.categories.map((c) => c.id === category.id ? { ...c, ...patch } : c) });
  const patchRoom = (patch: Partial<Room>) => room && update({ ...draft, rooms: draft.rooms.map((r) => r.id === room.id ? { ...r, ...patch } : r) });
  const patchStory = (patch: Partial<Story>) => story && update({ ...draft, stories: draft.stories.map((s) => s.id === story.id ? { ...s, ...patch } : s) });

  const addProduct = () => {
    let n = draft.products.length + 1;
    while (draft.products.some((p) => p.id === `AS-${String(n).padStart(4, "0")}`)) n++;
    const id = `AS-${String(n).padStart(4, "0")}`;
    const item: Product = { id, cat: draft.categories[0]?.id || "", name: { ar: "منتج جديد", en: "New product" }, desc: clone(blankBi), price: null, img: 11701114, origin: clone(blankBi), rating: null, reviews: 0, stock: null, dim: "", mat: clone(blankBi), warranty: null };
    update({ ...draft, products: [item, ...draft.products] }); setSelectedProduct(id); setSection("products");
  };

  const exportData = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = `assadaka-contenu-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url);
  };

  const importData = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const imported = JSON.parse(await file.text()) as SiteContent;
      if (imported.version !== 1 || !Array.isArray(imported.products) || !imported.texts || !imported.settings) throw new Error("invalid");
      update({ ...clone(content), ...imported }); setNotice("Sauvegarde importée. Cliquez sur Enregistrer pour l’appliquer.");
    } catch { setNotice("Fichier invalide. Utilisez une sauvegarde JSON exportée par ce panneau."); }
    e.target.value = "";
  };

  const navTo = (next: Section) => { setSection(next); setNotice(""); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div dir="ltr" className="min-h-screen bg-[#f3f6f9] font-sans text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#102a43] text-white lg:flex">
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400 font-black text-slate-950">A</span><div><strong className="block text-sm">ASSADAKA</strong><span className="text-[11px] text-slate-400">Centre d’administration</span></div></div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {NAV.map((n) => <button key={n.id} onClick={() => navTo(n.id)} className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[13px] font-semibold transition ${section === n.id ? "bg-sky-500/20 text-sky-300" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}><span className="w-5 text-center text-base">{n.icon}</span>{n.label}</button>)}
        </nav>
        <div className="border-t border-white/10 p-4 text-xs"><a href="/" className="block rounded-lg px-3 py-2.5 text-slate-300 hover:bg-white/5">↗ Voir le site</a><button onClick={() => { sessionStorage.removeItem("assadaka.admin.session"); void signOutAdmin(); setAuthenticated(false); }} className="w-full rounded-lg px-3 py-2.5 text-left text-slate-400 hover:bg-white/5 hover:text-white">Se déconnecter</button></div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-[72px] items-center justify-between gap-3 px-4 sm:px-7">
            <div><h1 className="text-lg font-black sm:text-xl">{NAV.find((n) => n.id === section)?.label}</h1><p className="hidden text-xs text-slate-500 sm:block">Administration bilingue du site Assadaka</p></div>
            <div className="flex items-center gap-2">
              <span className={`hidden rounded-full px-3 py-1.5 text-[11px] font-bold sm:block ${dirty ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700"}`}>{dirty ? "● Modifications non enregistrées" : "✓ Contenu synchronisé"}</span>
              <a href="/" className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 lg:hidden">Site</a>
              <button onClick={() => void save()} disabled={saving} className="rounded-xl bg-[#145da0] disabled:opacity-60 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0c4a80] sm:px-5">{saving ? "Publication…" : remoteEnabled ? "Publier" : "Enregistrer"}</button>
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto px-3 pb-3 lg:hidden">{NAV.map((n) => <button key={n.id} onClick={() => navTo(n.id)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold ${section === n.id ? "bg-[#102a43] text-white" : "bg-slate-100 text-slate-600"}`}>{n.label}</button>)}</div>
        </header>

        <main className="mx-auto max-w-[1500px] p-4 sm:p-7">
          {(notice || contentError) && <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-900"><span>{notice || contentError}</span><button onClick={() => setNotice("")} aria-label="Fermer">×</button></div>}

          {section === "overview" && <>
            <div className="mb-7 rounded-2xl bg-gradient-to-br from-[#102a43] to-[#174f78] p-6 text-white sm:p-8"><p className="text-xs font-bold uppercase tracking-[.16em] text-sky-300">Panneau de contrôle</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">Tout votre contenu, au même endroit.</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">Modifiez les articles et les textes en arabe et en anglais. Enregistrez pour appliquer immédiatement les changements sur ce navigateur.</p><div className="mt-5 flex flex-wrap gap-3"><button onClick={addProduct} className="rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-black text-slate-950">+ Nouvel article</button><button onClick={() => navTo("texts")} className="rounded-xl border border-white/25 px-4 py-2.5 text-xs font-bold">Modifier les textes</button></div></div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Articles", draft.products.length, "products"], ["Catégories", draft.categories.length, "categories"], ["Textes bilingues", textKeys.length, "texts"], ["Conseils publiés", draft.stories.length, "stories"]].map(([label, value, target]) => <button key={String(label)} onClick={() => navTo(target as Section)}><Card className="p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"><span className="text-xs font-bold text-slate-500">{label}</span><strong className="mt-2 block text-3xl font-black text-[#145da0]">{value}</strong><span className="mt-3 block text-xs font-semibold text-slate-400">Gérer →</span></Card></button>)}</div>
            <Card className="mt-6 p-5 sm:p-6"><h3 className="font-black">Derniers articles du catalogue</h3><div className="mt-4 divide-y divide-slate-100">{draft.products.slice(0, 5).map((p) => <button key={p.id} onClick={() => { setSelectedProduct(p.id); navTo("products"); }} className="flex w-full items-center gap-4 py-3 text-left"><img src={px(p.img, 100, 100)} alt="" className="h-11 w-11 rounded-lg object-cover" /><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{p.name.en || p.name.ar}</strong><span className="text-xs text-slate-400">{p.id} · {p.cat}</span></span><span className="text-slate-400">›</span></button>)}</div></Card>
          </>}

          {section === "products" && <div className="grid items-start gap-5 xl:grid-cols-[330px_1fr]">
            <Card className="overflow-hidden xl:sticky xl:top-24"><div className="border-b border-slate-100 p-4"><div className="flex gap-2"><input value={productQuery} onChange={(e) => setProductQuery(e.target.value)} placeholder="Référence ou nom…" className="admin-input" /><button onClick={addProduct} title="Nouvel article" className="shrink-0 rounded-xl bg-[#145da0] px-4 text-xl text-white">+</button></div><p className="mt-2 text-[11px] text-slate-400">{filteredProducts.length} article(s)</p></div><div className="max-h-[65vh] overflow-y-auto p-2">{filteredProducts.map((p) => <button key={p.id} onClick={() => setSelectedProduct(p.id)} className={`mb-1 flex w-full items-center gap-3 rounded-xl p-2.5 text-left ${p.id === selectedProduct ? "bg-sky-50 ring-1 ring-sky-200" : "hover:bg-slate-50"}`}><img src={px(p.img, 100, 100)} alt="" className="h-11 w-11 shrink-0 rounded-lg bg-slate-100 object-cover" /><span className="min-w-0"><strong className="block truncate text-xs">{p.name.en || p.name.ar}</strong><span className="text-[11px] text-slate-400">{p.id}</span></span></button>)}</div></Card>
            {product ? <Card className="p-5 sm:p-6"><div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5"><div><span className="text-xs font-bold text-sky-600">{product.id}</span><h2 className="mt-1 text-xl font-black">{product.name.en || product.name.ar}</h2></div><div className="flex gap-2"><button onClick={() => { const copy = { ...clone(product), id: `${product.id}-COPY`, name: { ar: `${product.name.ar} — نسخة`, en: `${product.name.en} — copy` } }; update({ ...draft, products: [copy, ...draft.products] }); setSelectedProduct(copy.id); }} className="admin-secondary">Dupliquer</button><button onClick={() => { if (!confirm(`Supprimer ${product.id} ?`)) return; const rest = draft.products.filter((p) => p.id !== product.id); update({ ...draft, products: rest }); setSelectedProduct(rest[0]?.id || ""); }} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">Supprimer</button></div></div>
              <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-3"><Field label="Référence / SKU" value={product.id} onChange={(id) => { const old = product.id; update({ ...draft, products: draft.products.map((p) => p.id === old ? { ...p, id } : p) }); setSelectedProduct(id); }} /><label><span className="mb-1.5 block text-xs font-bold text-slate-600">Catégorie</span><select className="admin-input" value={product.cat} onChange={(e) => patchProduct({ cat: e.target.value })}>{draft.categories.map((c) => <option key={c.id} value={c.id}>{c.name.en} / {c.name.ar}</option>)}</select></label><label><span className="mb-1.5 block text-xs font-bold text-slate-600">Badge</span><select className="admin-input" value={product.badge || ""} onChange={(e) => patchProduct({ badge: (e.target.value || undefined) as Product["badge"] })}><option value="">Aucun</option><option value="new">Nouveau</option><option value="offer">Offre</option><option value="best">Meilleure vente</option><option value="import">Importation</option></select></label></div>
                <BiFields label="Nom de l’article" value={product.name} onChange={(name) => patchProduct({ name })} /><BiFields label="Description" textarea value={product.desc} onChange={(desc) => patchProduct({ desc })} />
                <ImageField remote={remoteEnabled} value={product.img} onChange={(img) => patchProduct({ img })} />
                <BiFields label="Marque / origine" value={product.origin} onChange={(origin) => patchProduct({ origin })} /><BiFields label="Matière" value={product.mat} onChange={(mat) => patchProduct({ mat })} />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><NullableNumber label="Prix (vide = sur demande)" value={product.price} onChange={(price) => patchProduct({ price })} /><NullableNumber label="Ancien prix" value={product.old} onChange={(old) => patchProduct({ old: old ?? undefined })} /><Field label="Dimensions" value={product.dim} onChange={(dim) => patchProduct({ dim })} /><NullableNumber label="Note (0–5)" value={product.rating} onChange={(rating) => patchProduct({ rating })} /><Field label="Nombre d’avis" type="number" value={product.reviews} onChange={(v) => patchProduct({ reviews: Number(v) })} /><NullableNumber label="Stock (vide = à confirmer)" value={product.stock} onChange={(stock) => patchProduct({ stock })} /><NullableNumber label="Garantie en mois" value={product.warranty} onChange={(warranty) => patchProduct({ warranty })} /></div>
              </div></Card> : <Empty text="Aucun article sélectionné." />}
          </div>}

          {section === "categories" && <div className="grid items-start gap-5 lg:grid-cols-[280px_1fr]"><Card className="p-3"><button onClick={() => { const id = `category-${Date.now()}`; update({ ...draft, categories: [...draft.categories, { id, name: clone(blankBi), tagline: clone(blankBi), img: 11701114, accent: "#145da0" }] }); setSelectedCategory(id); }} className="mb-2 w-full rounded-xl bg-[#145da0] p-3 text-xs font-bold text-white">+ Nouvelle catégorie</button>{draft.categories.map((c) => <button key={c.id} onClick={() => setSelectedCategory(c.id)} className={`mb-1 flex w-full items-center gap-3 rounded-xl p-3 text-left text-xs font-bold ${c.id === selectedCategory ? "bg-sky-50 text-sky-800" : "hover:bg-slate-50"}`}><span className="h-3 w-3 rounded-full" style={{ background: c.accent }} />{c.name.en || c.name.ar || c.id}</button>)}</Card>{category ? <Card className="space-y-6 p-5 sm:p-6"><div className="flex justify-between gap-3"><h2 className="text-xl font-black">Modifier la catégorie</h2><button onClick={() => { if (draft.products.some((p) => p.cat === category.id)) { setNotice("Réaffectez d’abord les articles de cette catégorie."); return; } if (confirm("Supprimer cette catégorie ?")) update({ ...draft, categories: draft.categories.filter((c) => c.id !== category.id) }); }} className="text-xs font-bold text-red-600">Supprimer</button></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Identifiant" value={category.id} onChange={(id) => { const old = category.id; update({ ...draft, categories: draft.categories.map((c) => c.id === old ? { ...c, id } : c), products: draft.products.map((p) => p.cat === old ? { ...p, cat: id } : p) }); setSelectedCategory(id); }} /><Field label="Couleur" type="color" value={category.accent} onChange={(accent) => patchCategory({ accent })} /></div><BiFields label="Nom" value={category.name} onChange={(name) => patchCategory({ name })} /><BiFields label="Sous-titre" value={category.tagline} onChange={(tagline) => patchCategory({ tagline })} /><ImageField remote={remoteEnabled} value={category.img} onChange={(img) => patchCategory({ img })} /><img src={px(category.img, 1000, 300)} alt="Aperçu" className="h-44 w-full rounded-xl object-cover" /></Card> : <Empty text="Aucune catégorie." />}</div>}

          {section === "texts" && <Card className="overflow-hidden"><div className="border-b border-slate-100 p-5"><h2 className="font-black">Tous les textes de l’interface</h2><p className="mt-1 text-xs text-slate-500">Recherchez par clé ou par contenu. Les champs vides affichent la clé technique sur le site.</p><input className="admin-input mt-4 max-w-xl" value={textQuery} onChange={(e) => setTextQuery(e.target.value)} placeholder="Ex. hero, footer, catalogue…" /></div><div className="divide-y divide-slate-100">{textKeys.map((key) => <div key={key} className="grid gap-4 p-5 hover:bg-slate-50/60 lg:grid-cols-[190px_1fr_1fr]"><code className="break-all pt-2 text-[11px] font-bold text-sky-700">{key}</code><Field label="العربية" dir="rtl" textarea={key.endsWith("text") || key.endsWith("Text") || key.endsWith(".d") || key.endsWith(".a")} value={draft.texts.ar[key] ?? ""} onChange={(value) => update({ ...draft, texts: { ...draft.texts, ar: { ...draft.texts.ar, [key]: value } } })} /><Field label="English" textarea={key.endsWith("text") || key.endsWith("Text") || key.endsWith(".d") || key.endsWith(".a")} value={draft.texts.en[key] ?? ""} onChange={(value) => update({ ...draft, texts: { ...draft.texts, en: { ...draft.texts.en, [key]: value } } })} /></div>)}{textKeys.length === 0 && <Empty text="Aucun texte ne correspond à cette recherche." />}</div></Card>}

          {section === "rooms" && <CollectionEditor title="Inspirations salle de bain" items={draft.rooms} selected={selectedRoom} onSelect={setSelectedRoom} onAdd={() => { const id = `room-${Date.now()}`; update({ ...draft, rooms: [...draft.rooms, { id, title: clone(blankBi), sub: clone(blankBi), img: 11701114, cat: draft.categories[0]?.id || "" }] }); setSelectedRoom(id); }}>{room && <Card className="space-y-6 p-6"><div className="flex justify-between"><h2 className="text-xl font-black">Modifier l’inspiration</h2><button className="text-xs font-bold text-red-600" onClick={() => { if (confirm("Supprimer ?")) { update({ ...draft, rooms: draft.rooms.filter((r) => r.id !== room.id) }); setSelectedRoom(""); } }}>Supprimer</button></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Identifiant" value={room.id} onChange={(id) => { patchRoom({ id }); setSelectedRoom(id); }} /><label><span className="mb-1.5 block text-xs font-bold text-slate-600">Catégorie liée</span><select className="admin-input" value={room.cat} onChange={(e) => patchRoom({ cat: e.target.value })}>{draft.categories.map((c) => <option key={c.id} value={c.id}>{c.name.en}</option>)}</select></label></div><BiFields label="Titre" value={room.title} onChange={(title) => patchRoom({ title })} /><BiFields label="Description" textarea value={room.sub} onChange={(sub) => patchRoom({ sub })} /><ImageField remote={remoteEnabled} value={room.img} onChange={(img) => patchRoom({ img })} /></Card>}</CollectionEditor>}

          {section === "stories" && <CollectionEditor title="Conseils et articles de fond" items={draft.stories} selected={selectedStory} onSelect={setSelectedStory} onAdd={() => { const id = `story-${Date.now()}`; update({ ...draft, stories: [...draft.stories, { id, tag: clone(blankBi), title: clone(blankBi), text: clone(blankBi), img: 11701114 }] }); setSelectedStory(id); }}>{story && <Card className="space-y-6 p-6"><div className="flex justify-between"><h2 className="text-xl font-black">Modifier le conseil</h2><button className="text-xs font-bold text-red-600" onClick={() => { if (confirm("Supprimer ?")) { update({ ...draft, stories: draft.stories.filter((s) => s.id !== story.id) }); setSelectedStory(""); } }}>Supprimer</button></div><Field label="Identifiant" value={story.id} onChange={(id) => { patchStory({ id }); setSelectedStory(id); }} /><BiFields label="Étiquette" value={story.tag} onChange={(tag) => patchStory({ tag })} /><BiFields label="Titre" value={story.title} onChange={(title) => patchStory({ title })} /><BiFields label="Texte" textarea value={story.text} onChange={(text) => patchStory({ text })} /><ImageField remote={remoteEnabled} value={story.img} onChange={(img) => patchStory({ img })} /></Card>}</CollectionEditor>}

          {section === "settings" && <Card className="max-w-3xl space-y-6 p-6"><div><h2 className="text-xl font-black">Coordonnées et liens</h2><p className="mt-1 text-sm text-slate-500">Ces réglages alimentent les boutons de contact du site.</p></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Numéro WhatsApp international" value={draft.settings.whatsappNumber} onChange={(whatsappNumber) => update({ ...draft, settings: { ...draft.settings, whatsappNumber } })} hint="Chiffres uniquement recommandés, sans +" /><Field label="Numéro affiché" value={draft.settings.whatsappDisplay} onChange={(whatsappDisplay) => update({ ...draft, settings: { ...draft.settings, whatsappDisplay } })} /></div><Field label="Page Facebook" value={draft.settings.facebookUrl} onChange={(facebookUrl) => update({ ...draft, settings: { ...draft.settings, facebookUrl } })} /><Field label="Lien Google Maps" value={draft.settings.mapsUrl} onChange={(mapsUrl) => update({ ...draft, settings: { ...draft.settings, mapsUrl } })} /><div className="rounded-xl bg-sky-50 p-4 text-xs leading-relaxed text-sky-900">Les adresses, horaires et messages de contact se modifient dans <button className="font-bold underline" onClick={() => navTo("texts")}>Textes du site</button>, notamment les clés <code>showroom.*</code>.</div></Card>}

          {section === "data" && <div className="grid gap-5 lg:grid-cols-2"><Card className="p-6"><span className="text-2xl">⇩</span><h2 className="mt-3 text-lg font-black">Exporter une sauvegarde</h2><p className="mt-2 text-sm leading-relaxed text-slate-500">Téléchargez tous les articles, textes et réglages dans un fichier JSON. Conservez ce fichier avant de nettoyer votre navigateur ou de changer d’appareil.</p><button onClick={exportData} className="admin-primary mt-5">Télécharger la sauvegarde</button></Card><Card className="p-6"><span className="text-2xl">⇧</span><h2 className="mt-3 text-lg font-black">Importer une sauvegarde</h2><p className="mt-2 text-sm leading-relaxed text-slate-500">Restaurez une exportation précédente. Vérifiez l’aperçu puis cliquez sur Enregistrer pour appliquer les données.</p><input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={importData} /><button onClick={() => fileRef.current?.click()} className="admin-secondary mt-5">Choisir un fichier JSON</button></Card><Card className="p-6 lg:col-span-2"><h2 className="text-lg font-black">Fonctionnement de la sauvegarde</h2><p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">{remoteEnabled ? <>La base <strong>Supabase</strong> est connectée. Le bouton Publier enregistre le contenu en ligne et le rend visible pour tous les visiteurs et sur tous les appareils. Les images téléversées sont conservées dans Supabase Storage.</> : <>Le site fonctionne actuellement en mode local : les modifications sont enregistrées dans <strong>localStorage</strong>, sur ce navigateur uniquement. Configurez les variables Supabase pour activer la publication en ligne et l’authentification sécurisée.</>}</p><div className="mt-5 border-t border-red-100 pt-5"><h3 className="text-sm font-bold text-red-700">Zone de réinitialisation</h3><p className="mt-1 text-xs text-slate-500">Restaure le contenu livré avec le code et efface les changements de ce navigateur.</p><button onClick={() => { if (confirm("Effacer toutes les modifications locales et restaurer le contenu initial ?")) { void resetContent().then((ok) => { if (ok) { setDraft(clone(content)); window.location.reload(); } else setNotice("Réinitialisation impossible. Vérifiez votre session administrateur."); }); } }} className="mt-3 rounded-xl border border-red-200 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50">Restaurer le contenu initial</button></div></Card></div>}
        </main>
      </div>
    </div>
  );
}

function CollectionEditor({ title, items, selected, onSelect, onAdd, children }: { title: string; items: { id: string; title: Bi }[]; selected: string; onSelect: (id: string) => void; onAdd: () => void; children: ReactNode }) {
  return <div className="grid items-start gap-5 lg:grid-cols-[280px_1fr]"><Card className="p-3"><h2 className="p-3 text-xs font-black uppercase tracking-wide text-slate-500">{title}</h2><button onClick={onAdd} className="admin-primary mb-2 w-full">+ Ajouter</button>{items.map((item) => <button key={item.id} onClick={() => onSelect(item.id)} className={`mb-1 block w-full rounded-xl p-3 text-left text-xs font-bold ${item.id === selected ? "bg-sky-50 text-sky-800" : "hover:bg-slate-50"}`}>{item.title.en || item.title.ar || item.id}</button>)}</Card>{children || <Empty text="Sélectionnez un élément." />}</div>;
}
