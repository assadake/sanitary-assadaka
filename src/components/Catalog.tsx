import { useMemo, useState } from "react";
import { CATEGORIES, PRODUCTS, px, type Product } from "../data/catalog";
import { WHATSAPP_NUMBER, formatPrice } from "../i18n";
import { useStore } from "../store";
import { SectionHead, Stars } from "./Bits";
import {
  IconArrow,
  IconBag,
  IconCheck,
  IconHeart,
  IconMinus,
  IconPlus,
  IconSearch,
  IconShield,
  IconTruck,
  IconWhatsApp,
  IconX,
} from "./Icons";
import Reveal from "./Reveal";

const BADGES: Record<string, { ar: string; en: string; cls: string }> = {
  new: { ar: "جديد", en: "New", cls: "bg-leaf text-white" },
  offer: { ar: "عرض", en: "Offer", cls: "bg-brick text-white" },
  best: { ar: "الأكثر طلباً", en: "Best seller", cls: "bg-ink text-sun" },
  import: { ar: "استيراد خاص", en: "Special import", cls: "bg-ikea text-white" },
};

function ProductCard({ p, index }: { p: Product; index: number }) {
  const { t, lang, add, favs, toggleFav, setQuick } = useStore();
  const [added, setAdded] = useState(false);
  const cat = CATEGORIES.find((c) => c.id === p.cat);
  const off = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;

  const onAdd = () => {
    add(p.id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <Reveal delay={(index % 4) * 70}>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-line bg-white transition-all duration-400 hover:-translate-y-1.5 hover:border-ikea/40 hover:shadow-[0_28px_50px_-30px_rgba(0,88,163,0.75)]">
        <div className="relative aspect-square overflow-hidden bg-mist">
          <img
            src={px(p.img, 700, 700)}
            alt={p.name[lang]}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
            <div className="flex flex-col gap-1.5">
              {p.badge && (
                <span className={`rounded-full px-2.5 py-1 font-display text-[10px] font-bold tracking-wide ${BADGES[p.badge].cls}`}>
                  {BADGES[p.badge][lang]}
                </span>
              )}
              {off > 0 && (
                <span className="rounded-full bg-sun px-2.5 py-1 font-display text-[10px] font-black text-ink tabular">
                  −{off}%
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => toggleFav(p.id)}
              aria-label={t("fav.title")}
              className={`grid h-9 w-9 place-items-center rounded-full backdrop-blur transition-all duration-300 active:scale-90 ${
                favs.includes(p.id) ? "bg-brick text-white" : "bg-white/85 text-ink-soft hover:bg-white hover:text-brick"
              }`}
            >
              <IconHeart className="h-4.5 w-4.5" filled={favs.includes(p.id)} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setQuick(p)}
            className="absolute inset-x-3 bottom-3 translate-y-[130%] rounded-full bg-ink/90 py-2.5 font-display text-[12px] font-bold text-white opacity-0 backdrop-blur transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100"
          >
            {t("product.quick")}
          </button>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-ikea">
              {cat?.name[lang]}
            </span>
            <span className="text-[10px] text-ink-soft/70 tabular">{p.id}</span>
          </div>
          <h3 className="mt-1.5 font-display text-[15px] font-bold leading-snug text-ink">
            <button type="button" onClick={() => setQuick(p)} className="link-sweep text-start">
              {p.name[lang]}
            </button>
          </h3>
          <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-ink-soft">{p.desc[lang]}</p>

          <div className="mt-2.5 flex items-center gap-1.5">
            <Stars rating={p.rating} />
            <span className="text-[11px] text-ink-soft tabular">
              {p.rating.toFixed(1)} · {p.reviews}
            </span>
            <span className="mx-1 h-3 w-px bg-line" />
            <span className={`text-[11px] font-semibold ${p.stock <= 5 ? "text-brick" : "text-leaf"}`}>
              {p.stock <= 5 ? t("product.lowStock") : t("product.inStock")}
            </span>
          </div>

          <div className="mt-auto flex items-end justify-between gap-2 pt-4">
            <div className="flex flex-col">
              {p.old && (
                <span className="text-[12px] text-ink-soft/60 line-through tabular">{formatPrice(p.old, lang)}</span>
              )}
              <span className="font-display text-[19px] font-black leading-none tabular text-ink">
                {formatPrice(p.price, lang)}
              </span>
            </div>
            <button
              type="button"
              onClick={onAdd}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2.5 font-display text-[12px] font-bold transition-all duration-300 active:scale-95 ${
                added ? "bg-leaf text-white" : "bg-ikea text-white hover:bg-ikea-deep hover:shadow-[0_10px_22px_-12px_rgba(0,88,163,1)]"
              }`}
            >
              {added ? <IconCheck className="h-4 w-4" /> : <IconBag className="h-4 w-4" />}
              {added ? t("product.added") : t("product.addToCart")}
            </button>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

/* ───────────────────────── Quick view ───────────────────────── */
function QuickView() {
  const { quick, setQuick, t, lang, add, favs, toggleFav } = useStore();
  const [qty, setQty] = useState(1);
  if (!quick) return null;
  const p = quick;
  const cat = CATEGORIES.find((c) => c.id === p.cat);

  const specs = [
    { k: t("product.origin"), v: p.origin[lang] },
    { k: lang === "ar" ? "الأبعاد" : "Dimensions", v: p.dim },
    { k: lang === "ar" ? "المادة" : "Material", v: p.mat[lang] },
    { k: t("product.warranty"), v: `${p.warranty} ${lang === "ar" ? "شهر" : "months"}` },
    { k: t("product.sku"), v: p.id },
    { k: lang === "ar" ? "القسم" : "Department", v: cat?.name[lang] ?? "" },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-ink/65 backdrop-blur-sm" onClick={() => setQuick(null)} />
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-[26px] bg-white shadow-2xl sm:rounded-[26px]">
        <button
          type="button"
          onClick={() => setQuick(null)}
          aria-label={t("close")}
          className="absolute end-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow transition-colors hover:bg-brick hover:text-white"
        >
          <IconX className="h-4.5 w-4.5" />
        </button>
        <div className="grid gap-0 sm:grid-cols-2">
          <div className="relative aspect-square overflow-hidden bg-mist sm:rounded-s-[26px]">
            <img src={px(p.img, 900, 900)} alt={p.name[lang]} className="h-full w-full object-cover" />
            {p.badge && (
              <span className={`absolute start-4 top-4 rounded-full px-3 py-1.5 font-display text-[11px] font-bold ${BADGES[p.badge].cls}`}>
                {BADGES[p.badge][lang]}
              </span>
            )}
          </div>
          <div className="flex flex-col p-5 sm:p-7">
            <span className="font-display text-[10.5px] font-bold uppercase tracking-[0.18em] text-ikea">
              {cat?.name[lang]} · {p.id}
            </span>
            <h3 className="mt-2 font-display text-[clamp(1.3rem,2.6vw,1.9rem)] font-black leading-tight">{p.name[lang]}</h3>
            <div className="mt-2 flex items-center gap-2">
              <Stars rating={p.rating} className="h-4 w-4" />
              <span className="text-[12.5px] text-ink-soft tabular">
                {p.rating.toFixed(1)} · {p.reviews} {lang === "ar" ? "تقييم" : "reviews"}
              </span>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">{p.desc[lang]}</p>

            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5 border-y border-line py-4">
              {specs.map((s) => (
                <div key={s.k}>
                  <p className="text-[10.5px] uppercase tracking-wide text-ink-soft/60">{s.k}</p>
                  <p className="text-[13px] font-semibold text-ink">{s.v}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-end gap-3">
              <div className="flex flex-col">
                {p.old && <span className="text-[13px] text-ink-soft/60 line-through tabular">{formatPrice(p.old, lang)}</span>}
                <span className="font-display text-[26px] font-black leading-none tabular">{formatPrice(p.price, lang)}</span>
              </div>
              <div className="ms-auto flex items-center gap-1 rounded-full border border-line bg-mist p-1">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-8 w-8 place-items-center rounded-full bg-white transition-colors hover:bg-ikea hover:text-white" aria-label="-">
                  <IconMinus />
                </button>
                <span className="w-7 text-center font-display text-[14px] font-bold tabular">{qty}</span>
                <button type="button" onClick={() => setQty((q) => Math.min(99, q + 1))} className="grid h-8 w-8 place-items-center rounded-full bg-white transition-colors hover:bg-ikea hover:text-white" aria-label="+">
                  <IconPlus />
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  add(p.id, qty);
                  setQuick(null);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-ikea px-5 py-3.5 font-display text-[14px] font-bold text-white transition-colors hover:bg-ikea-deep active:scale-95"
              >
                <IconBag className="h-5 w-5" />
                {t("product.addToCart")}
              </button>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  lang === "ar"
                    ? `السلام عليكم، نبي نسأل عن المنتج:\n${p.name.ar} (${p.id})\nالسعر المعروض: ${formatPrice(p.price, "ar")}`
                    : `Hello, I'd like to ask about:\n${p.name.en} (${p.id})\nListed price: ${formatPrice(p.price, "en")}`,
                )}`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-leaf px-5 py-3.5 font-display text-[14px] font-bold text-white transition-colors hover:brightness-110 active:scale-95"
              >
                <IconWhatsApp className="h-5 w-5" />
                {t("product.askWhatsapp")}
              </a>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <IconTruck className="h-4 w-4 text-ikea" /> {lang === "ar" ? "توصيل وتركيب في طرابلس" : "Delivery & fitting in Tripoli"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <IconShield className="h-4 w-4 text-ikea" /> {t("product.warranty")} {p.warranty} {lang === "ar" ? "شهر" : "mo"}
              </span>
              <button
                type="button"
                onClick={() => toggleFav(p.id)}
                className={`inline-flex items-center gap-1.5 transition-colors ${favs.includes(p.id) ? "text-brick" : "hover:text-brick"}`}
              >
                <IconHeart className="h-4 w-4" filled={favs.includes(p.id)} />
                {t("fav.title")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Catalog ───────────────────────── */
export default function Catalog() {
  const { t, lang, query, setQuery, cat, setCat, sort, setSort } = useStore();
  const [visible, setVisible] = useState(8);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = PRODUCTS.filter((p) => {
      const okCat = cat === "all" || p.cat === cat;
      const hay = `${p.name.ar} ${p.name.en} ${p.desc.ar} ${p.desc.en} ${p.id} ${p.origin.ar} ${p.origin.en} ${p.cat}`.toLowerCase();
      return okCat && (!q || hay.includes(q));
    });
    if (sort === "low") out = [...out].sort((a, b) => a.price - b.price);
    if (sort === "high") out = [...out].sort((a, b) => b.price - a.price);
    if (sort === "featured") out = [...out].sort((a, b) => Number(Boolean(b.badge)) - Number(Boolean(a.badge)) || b.rating - a.rating);
    return out;
  }, [query, cat, sort]);

  const shown = list.slice(0, visible);

  return (
    <section id="catalog" className="relative scroll-mt-24 bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHead
          kicker={lang === "ar" ? "الكتالوج" : "Catalogue"}
          title={t("grid.title")}
          text={t("grid.text")}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 rounded-full border border-line bg-mist px-3.5 py-2.5 focus-within:border-ikea">
                <IconSearch className="h-4 w-4 text-ink-soft" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setVisible(8);
                  }}
                  placeholder={t("search.placeholder")}
                  className="w-44 bg-transparent text-[13px] outline-none placeholder:text-ink-soft/55 sm:w-56"
                />
                {query && (
                  <button type="button" onClick={() => setQuery("")} className="text-ink-soft hover:text-brick" aria-label={t("close")}>
                    <IconX className="h-3.5 w-3.5" />
                  </button>
                )}
              </label>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className="appearance-none rounded-full border border-line bg-white px-4 py-2.5 pe-9 font-display text-[12.5px] font-bold text-ink outline-none transition-colors hover:border-ikea focus:border-ikea"
                >
                  <option value="featured">{t("product.sortFeatured")}</option>
                  <option value="low">{t("product.sortLowHigh")}</option>
                  <option value="high">{t("product.sortHighLow")}</option>
                </select>
                <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-ink-soft">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </div>
            </div>
          }
        />

        {/* category chips */}
        <div className="no-bar -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {[{ id: "all", name: { ar: t("product.all"), en: t("product.all") } }, ...CATEGORIES].map((c) => {
            const active = cat === c.id;
            const n = c.id === "all" ? PRODUCTS.length : PRODUCTS.filter((p) => p.cat === c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCat(c.id);
                  setVisible(8);
                }}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 font-display text-[12.5px] font-bold transition-all duration-300 active:scale-95 ${
                  active
                    ? "border-ikea bg-ikea text-white shadow-[0_10px_22px_-14px_rgba(0,88,163,1)]"
                    : "border-line bg-white text-ink-soft hover:border-ikea/50 hover:text-ikea"
                }`}
              >
                {c.name[lang]}
                <span className={`text-[10.5px] tabular ${active ? "text-white/70" : "text-ink-soft/55"}`}>{n}</span>
              </button>
            );
          })}
        </div>

        <p className="mb-6 text-[12.5px] text-ink-soft tabular">
          {list.length} {t("search.results")}
          {query && (
            <>
              {" · "}
              <button type="button" onClick={() => setQuery("")} className="link-sweep font-semibold text-ikea">
                {lang === "ar" ? "مسح البحث" : "clear search"}
              </button>
            </>
          )}
        </p>

        {list.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-[24px] border border-dashed border-line bg-mist px-6 py-20 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-ink-soft">
              <IconSearch className="h-6 w-6" />
            </span>
            <p className="font-display text-[18px] font-bold">{t("search.none")}</p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                lang === "ar" ? `السلام عليكم، نبي نسأل عن منتج: ${query}` : `Hello, I'm looking for: ${query}`,
              )}`}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-full bg-leaf px-5 py-3 font-display text-[13.5px] font-bold text-white"
            >
              <IconWhatsApp className="h-4.5 w-4.5" />
              {lang === "ar" ? "اسألنا على واتساب" : "Ask us on WhatsApp"}
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {shown.map((p, i) => (
                <ProductCard key={p.id} p={p} index={i} />
              ))}
            </div>

            {visible < list.length && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + 8)}
                  className="group inline-flex items-center gap-2 rounded-full border-2 border-ink px-7 py-3.5 font-display text-[14px] font-bold transition-all duration-300 hover:bg-ink hover:text-white active:scale-95"
                >
                  {t("grid.more")}
                  <span className="text-[12px] text-ink-soft tabular group-hover:text-white/70">
                    ({list.length - visible})
                  </span>
                  <IconArrow className="h-4 w-4 rotate-90 rtl:-rotate-90" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <QuickView />
    </section>
  );
}
