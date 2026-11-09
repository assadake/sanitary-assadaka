import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { type Lang } from "./i18n";
import { PRODUCTS, type Product } from "./data/catalog";
import { DEFAULT_SITE_CONTENT, type SiteContent } from "./site-content";

export type CartLine = { id: string; qty: number };

type Store = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: string) => string;
  dir: "rtl" | "ltr";
  products: Product[];
  siteContent: SiteContent;
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
  contactLink: (text?: string) => string;
};

const Ctx = createContext<Store | null>(null);

const load = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => load<Lang>("tolin.lang", "ar"));
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [cart, setCart] = useState<CartLine[]>(() => load<CartLine[]>("tolin.cart", []));
  const [favs, setFavs] = useState<string[]>(() => load<string[]>("tolin.favs", []));
  const [cartOpen, setCartOpen] = useState(false);
  const [quick, setQuick] = useState<Product | null>(null);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState<"featured" | "low" | "high">("featured");
  const [toast, setToast] = useState<string | null>(null);

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/site-content", { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("Could not load site content"); return response.json() as Promise<SiteContent>; })
      .then((content) => { if (content && content.dictionaries && content.config) setSiteContent(content); })
      .catch((error: unknown) => { if (error instanceof Error && error.name !== "AbortError") console.error("Using default site content", error); });
    fetch("/api/products", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load products");
        return response.json() as Promise<Product[]>;
      })
      .then((items) => { if (Array.isArray(items)) setProducts(items); })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name !== "AbortError") console.error("Product catalogue is using its offline fallback", error);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;
    document.title = siteContent.config.seoTitle[lang];
    document.querySelector('meta[name="description"]')?.setAttribute("content", siteContent.config.seoDescription[lang]);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", siteContent.config.seoTitle[lang]);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", siteContent.config.seoDescription[lang]);
    document.querySelector('meta[property="og:site_name"]')?.setAttribute("content", siteContent.config.companyDisplay[lang]);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", siteContent.config.seoTitle[lang]);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", siteContent.config.seoDescription[lang]);
    try {
      localStorage.setItem("tolin.lang", JSON.stringify(lang));
    } catch {
      /* ignore */
    }
  }, [lang, dir, siteContent]);

  useEffect(() => {
    try {
      localStorage.setItem("tolin.cart", JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem("tolin.favs", JSON.stringify(favs));
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
  const t = useCallback((k: string) => siteContent.dictionaries[lang][k] ?? siteContent.dictionaries.ar[k] ?? k, [lang, siteContent]);

  const add = useCallback(
    (id: string, qty = 1) => {
      setCart((prev) => {
        const found = prev.find((l) => l.id === id);
        if (found) return prev.map((l) => (l.id === id ? { ...l, qty: Math.min(99, l.qty + qty) } : l));
        return [...prev, { id, qty }];
      });
      const p = products.find((x) => x.id === id);
      if (p) setToast(`${siteContent.dictionaries[lang]["cart.added"]} · ${p.name[lang]}`);
    },
    [lang, products, siteContent],
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

  const contactLink = useCallback((text?: string) => {
    const number = siteContent.config.whatsappNumber.replace(/\D/g, "");
    if (!number) return siteContent.config.facebookPageUrl;
    return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  }, [siteContent.config.whatsappNumber, siteContent.config.facebookPageUrl]);

  const value: Store = {
    lang,
    setLang,
    products,
    siteContent,
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
    contactLink,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
