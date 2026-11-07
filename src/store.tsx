import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dictionaries, WHATSAPP_NUMBER, formatPrice, type Lang } from "./i18n";
import { PRODUCTS, type Product } from "./data/catalog";

export type CartLine = { id: string; qty: number };

type Store = {
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
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;
    try {
      localStorage.setItem("tolin.lang", JSON.stringify(lang));
    } catch {
      /* ignore */
    }
  }, [lang, dir]);

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
  const t = useCallback((k: string) => dictionaries[lang][k] ?? dictionaries.ar[k] ?? k, [lang]);

  const add = useCallback(
    (id: string, qty = 1) => {
      setCart((prev) => {
        const found = prev.find((l) => l.id === id);
        if (found) return prev.map((l) => (l.id === id ? { ...l, qty: Math.min(99, l.qty + qty) } : l));
        return [...prev, { id, qty }];
      });
      const p = PRODUCTS.find((x) => x.id === id);
      if (p) setToast(`${dictionaries[lang]["cart.added"]} · ${p.name[lang]}`);
    },
    [lang],
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
        .map((l) => ({ product: PRODUCTS.find((p) => p.id === l.id)!, qty: l.qty }))
        .filter((l) => Boolean(l.product)),
    [cart],
  );

  const count = useMemo(() => cart.reduce((s, l) => s + l.qty, 0), [cart]);
  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.product.price * l.qty, 0), [lines]);

  const waLink = useCallback(
    (text: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,
    [],
  );

  const value: Store = {
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
}) {
  const { lang, lines, subtotal, name, phone, city, note, mode } = opts;
  const orderNo = `TL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const L = (a: string, b: string) => (lang === "ar" ? a : b);

  const rows = lines
    .map(
      (l) =>
        `• ${l.product.id} — ${l.product.name[lang]} × ${l.qty} = ${formatPrice(l.product.price * l.qty, lang)}`,
    )
    .join("\n");

  const text = [
    L(`*طلب جديد من موقع تولين للبضائع الأروبية*`, `*New order from the TOLIN European Goods website*`),
    `${L("رقم الطلب", "Order no.")}: ${orderNo}`,
    `${L("التاريخ", "Date")}: ${new Date().toLocaleString(lang === "ar" ? "ar-LY-u-nu-latn" : "en-GB")}`,
    "",
    L("*المنتجات:*", "*Items:*"),
    rows,
    "",
    `${L("الإجمالي التقديري", "Estimated total")}: ${formatPrice(subtotal, lang)}`,
    `${L("طريقة الاستلام", "Collection")}: ${mode === "deliver" ? L("توصيل للمنزل 🚚", "Home delivery 🚚") : L("استلام من المعرض 🏬", "Showroom pick-up 🏬")}`,
    "",
    L("*بيانات العميل:*", "*Customer details:*"),
    `${L("الاسم", "Name")}: ${name || "-"}`,
    `${L("الهاتف", "Phone")}: ${phone || "-"}`,
    `${L("العنوان", "Address")}: ${city || "Tripoli, Libya"}`,
    note ? `${L("ملاحظة", "Note")}: ${note}` : "",
    "",
    L("شكراً — ننتظر تأكيدكم.", "Thank you — waiting for your confirmation."),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    text,
    orderNo,
    href: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,
  };
}
