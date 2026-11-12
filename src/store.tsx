import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dictionaries, formatPrice, type Lang } from "./i18n";
import { CATEGORIES, PRODUCTS, ROOMS, STORIES, type Category, type Product, type Room, type Story } from "./data/catalog";
import type { SiteContent, SiteSettings } from "./admin-types";
import { isSupabaseConfigured, loadRemoteContent, saveRemoteContent } from "./supabase";

export const CONTENT_STORAGE_KEY = "assadaka.admin.content.v1";

export const DEFAULT_CONTENT: SiteContent = {
  version: 1,
  products: PRODUCTS,
  categories: CATEGORIES,
  rooms: ROOMS,
  stories: STORIES,
  texts: dictionaries,
  settings: {
    whatsappNumber: "218913150095",
    whatsappDisplay: "+218 91-3150095",
    facebookUrl: "https://www.facebook.com/AssadakaARAQIA/",
    mapsUrl: "https://maps.google.com/?q=Tripoli+Libya",
  },
};

export type CartLine = { id: string; qty: number };

type Store = {
  content: SiteContent;
  products: Product[];
  categories: Category[];
  rooms: Room[];
  stories: Story[];
  settings: SiteSettings;
  saveContent: (content: SiteContent) => Promise<boolean>;
  resetContent: () => Promise<boolean>;
  contentReady: boolean;
  contentError: string | null;
  remoteEnabled: boolean;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: string) => string;
  dir: "rtl" | "ltr";
  cart: CartLine[];
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  lines: { product: Product; qty: number }[];
  favs: string[];
  toggleFav: (id: string) => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  quick: Product | null;
  setQuick: (p: Product | null) => void;
  query: string;
  setQuery: (q: string) => void;
  cat: string;
  setCat: (c: string) => void;
  sort: "featured" | "low" | "high";
  setSort: (s: "featured" | "low" | "high") => void;
  toast: string | null;
  notify: (msg: string) => void;
  waLink: (text: string) => string;
};

const Ctx = createContext<Store | null>(null);

const cloneContent = (value: SiteContent): SiteContent => JSON.parse(JSON.stringify(value)) as SiteContent;

const load = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(() => {
    const saved = isSupabaseConfigured ? null : load<SiteContent | null>(CONTENT_STORAGE_KEY, null);
    if (!saved || saved.version !== 1 || !Array.isArray(saved.products)) return DEFAULT_CONTENT;
    return {
      ...DEFAULT_CONTENT,
      ...saved,
      texts: {
        ar: { ...dictionaries.ar, ...saved.texts?.ar },
        en: { ...dictionaries.en, ...saved.texts?.en },
      },
      settings: { ...DEFAULT_CONTENT.settings, ...saved.settings },
    };
  });
  const [contentReady, setContentReady] = useState(!isSupabaseConfigured);
  const [contentError, setContentError] = useState<string | null>(null);
  const products = content.products;
  const categories = content.categories;
  const rooms = content.rooms;
  const stories = content.stories;
  const settings = content.settings;
  const [lang, setLangState] = useState<Lang>(() => load<Lang>("assadaka.lang", "ar"));
  const [cart, setCart] = useState<CartLine[]>(() => load<CartLine[]>("assadaka.cart", []));
  const [favs, setFavs] = useState<string[]>(() => load<string[]>("assadaka.favs", []));
  const [cartOpen, setCartOpen] = useState(false);
  const [quick, setQuick] = useState<Product | null>(null);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState<"featured" | "low" | "high">("featured");
  const [toast, setToast] = useState<string | null>(null);

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    loadRemoteContent()
      .then((remote) => {
        if (!active) return;
        if (remote) setContent({
          ...DEFAULT_CONTENT,
          ...remote,
          texts: {
            ar: { ...dictionaries.ar, ...remote.texts?.ar },
            en: { ...dictionaries.en, ...remote.texts?.en },
          },
          settings: { ...DEFAULT_CONTENT.settings, ...remote.settings },
        });
        setContentReady(true);
      })
      .catch(() => {
        if (!active) return;
        setContentError("Impossible de charger le contenu Supabase. Le contenu local de secours est affiché.");
        setContentReady(true);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;
    document.title = lang === "ar"
      ? "الصداقة الراقية | مواد صحية وسيراميك — طرابلس، ليبيا"
      : "Assadaka Alraqia | Sanitary Ware & Ceramics — Tripoli, Libya";
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (meta) {
      meta.content = lang === "ar"
        ? "شركة الصداقة الراقية لاستيراد مواد البناء والمواد الصحية وملحقاتها. استفسر عن الأدوات الصحية والسيراميك والموديلات المتوفرة في طرابلس، ليبيا."
        : "Sanitary ware, ceramics and building materials from Assadaka Alraqia in Tripoli. Ask about models, prices and availability on WhatsApp.";
    }
    try {
      localStorage.setItem("assadaka.lang", JSON.stringify(lang));
    } catch {
      /* ignore */
    }
  }, [lang, dir]);

  useEffect(() => {
    try {
      localStorage.setItem("assadaka.cart", JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem("assadaka.favs", JSON.stringify(favs));
    } catch {
      /* ignore */
    }
  }, [favs]);

  useEffect(() => {
    document.body.style.overflow = cartOpen || quick ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, quick]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(id);
  }, [toast]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const t = useCallback((k: string) => content.texts[lang][k] ?? content.texts.ar[k] ?? k, [content.texts, lang]);
  const saveContent = useCallback(async (next: SiteContent) => {
    try {
      if (isSupabaseConfigured) await saveRemoteContent(next);
      else localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(next));
      setContent(next);
      setContentError(null);
      return true;
    } catch {
      return false;
    }
  }, []);
  const resetContent = useCallback(async () => {
    const initial = cloneContent(DEFAULT_CONTENT);
    const saved = await saveContent(initial);
    if (saved && !isSupabaseConfigured) {
      try { localStorage.removeItem(CONTENT_STORAGE_KEY); } catch { /* ignore */ }
    }
    return saved;
  }, [saveContent]);

  const add = useCallback(
    (id: string, qty = 1) => {
      setCart((prev) => {
        const found = prev.find((l) => l.id === id);
        if (found) return prev.map((l) => (l.id === id ? { ...l, qty: Math.min(99, l.qty + qty) } : l));
        return [...prev, { id, qty }];
      });
      const p = products.find((x) => x.id === id);
      if (p) setToast(`${content.texts[lang]["cart.added"]} · ${p.name[lang]}`);
    },
    [content.texts, lang, products],
  );

  const setQty = useCallback((id: string, qty: number) => {
    setCart((prev) => (qty <= 0 ? prev.filter((l) => l.id !== id) : prev.map((l) => (l.id === id ? { ...l, qty } : l))));
  }, []);

  const remove = useCallback((id: string) => setCart((prev) => prev.filter((l) => l.id !== id)), []);
  const clear = useCallback(() => setCart([]), []);

  const toggleFav = useCallback((id: string) => {
    setFavs((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  }, []);

  const notify = useCallback((msg: string) => setToast(msg), []);

  const lines = useMemo(
    () =>
      cart
        .map((l) => ({ product: products.find((p) => p.id === l.id)!, qty: l.qty }))
        .filter((l) => Boolean(l.product)),
    [cart, products],
  );

  const count = useMemo(() => cart.reduce((s, l) => s + l.qty, 0), [cart]);
  const subtotal = useMemo(() => lines.reduce((s, l) => s + (l.product.price ?? 0) * l.qty, 0), [lines]);

  const waLink = useCallback(
    (text: string) => `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`,
    [settings.whatsappNumber],
  );

  const value: Store = {
    content,
    products,
    categories,
    rooms,
    stories,
    settings,
    saveContent,
    resetContent,
    contentReady,
    contentError,
    remoteEnabled: isSupabaseConfigured,
    lang,
    setLang,
    t,
    dir,
    cart,
    add,
    setQty,
    remove,
    clear,
    count,
    subtotal,
    lines,
    favs,
    toggleFav,
    cartOpen,
    setCartOpen,
    quick,
    setQuick,
    query,
    setQuery,
    cat,
    setCat,
    sort,
    setSort,
    toast,
    notify,
    waLink,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

/** Builds the itemised WhatsApp order message. */
export function buildOrderMessage(opts: {
  lang: Lang;
  lines: { product: Product; qty: number }[];
  subtotal: number;
  name: string;
  phone: string;
  city: string;
  note: string;
  mode: "deliver" | "pickup";
  whatsappNumber?: string;
}) {
  const { lang, lines, subtotal, name, phone, city, note, mode } = opts;
  const orderNo = `AS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const L = (a: string, b: string) => (lang === "ar" ? a : b);

  const rows = lines
    .map(
      (l) =>
        `• ${l.product.id} — ${l.product.name[lang]} × ${l.qty} = ${formatPrice(l.product.price === null ? null : l.product.price * l.qty, lang)}`,
    )
    .join("\n");
  const hasPricedItem = lines.some((l) => l.product.price !== null);
  const subtotalText = hasPricedItem
    ? formatPrice(subtotal, lang)
    : dictionaries[lang]["product.priceOnRequest"];

  const text = [
    L(`*استفسار جديد من موقع شركة الصداقة الراقية*`, `*New enquiry from the Assadaka Alraqia website*`),
    `${L("رقم الطلب", "Order no.")}: ${orderNo}`,
    `${L("التاريخ", "Date")}: ${new Date().toLocaleString(lang === "ar" ? "ar-LY-u-nu-latn" : "en-GB")}`,
    "",
    L("*المنتجات:*", "*Items:*"),
    rows,
    "",
    `${L("إجمالي الأسعار المعلنة", "Listed-price subtotal")}: ${subtotalText}`,
    `${L("طريقة الاستلام", "Collection")}: ${mode === "deliver" ? L("توصيل للمنزل 🚚", "Home delivery 🚚") : L("استلام من المعرض 🏬", "Showroom pick-up 🏬")}`,
    "",
    L("*بيانات العميل:*", "*Customer details:*"),
    `${L("الاسم", "Name")}: ${name || "-"}`,
    `${L("الهاتف", "Phone")}: ${phone || "-"}`,
    `${L("العنوان", "Address")}: ${city || "Tripoli, Libya"}`,
    note ? `${L("ملاحظة", "Note")}: ${note}` : "",
    "",
    L("شكراً — ننتظر تأكيد الموديلات والأسعار والتوفر.", "Thank you — please confirm models, prices and availability."),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    text,
    orderNo,
    href: `https://wa.me/${(opts.whatsappNumber || "218913150095").replace(/\D/g, "")}?text=${encodeURIComponent(text)}`,
  };
}
