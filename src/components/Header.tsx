import { useEffect, useState } from "react";
import { WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from "../i18n";
import { useStore } from "../store";
import { LangSwitch, Logo } from "./Bits";
import {
  IconArrow,
  IconBag,
  IconChevron,
  IconHeart,
  IconMenu,
  IconPhone,
  IconPin,
  IconSearch,
  IconTruck,
  IconWhatsApp,
  IconX,
} from "./Icons";
import { CATEGORIES, PRODUCTS, px } from "../data/catalog";

const NAV = [
  { key: "nav.products", href: "#catalog" },
  { key: "nav.rooms", href: "#rooms" },
  { key: "nav.appliances", href: "#departments" },
  { key: "nav.diy", href: "#departments" },
  { key: "nav.offers", href: "#offers" },
  { key: "nav.services", href: "#services" },
  { key: "nav.stories", href: "#stories" },
  { key: "nav.showroom", href: "#showroom" },
];

export default function Header() {
  const { t, count, favs, setCartOpen, query, setQuery, lang, setCat } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mobile, setMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mega, setMega] = useState(false);

  const goCat = (id: string) => {
    setCat(id);
    setQuery("");
    setMega(false);
    window.setTimeout(() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(100, (y / h) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobile && !mega) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMobile(false);
      setMega(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobile, mega]);

  const waGeneral = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    lang === "ar" ? "السلام عليكم، عندي سؤال بخصوص منتجات تولين." : "Hello, I have a question about TOLIN products.",
  )}`;

  return (
    <header id="top" className="sticky top-0 z-40">
      {/* utility bar */}
      <div className="relative z-40 hidden bg-ink text-white md:block">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-6 py-2 text-[12px] lg:px-10">
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5 text-white/85">
              <IconPin className="h-4 w-4 text-sun" />
              {t("top.location")}
            </span>
            <span className="hidden items-center gap-1.5 text-white/55 lg:inline-flex">
              <IconTruck className="h-4 w-4" />
              {t("top.shipping")}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <a
              href={`tel:+${WHATSAPP_NUMBER}`}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-white/75 transition-colors hover:bg-white/10 hover:text-white"
            >
              <IconPhone className="h-3.5 w-3.5" />
              <span className="tabular">{WHATSAPP_DISPLAY}</span>
            </a>
            <a
              href={waGeneral}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-white/75 transition-colors hover:bg-white/10 hover:text-white"
            >
              <IconWhatsApp className="h-4 w-4" />
              {t("top.help")}
            </a>
            <span className="mx-1 h-4 w-px bg-white/15" />
            <LangSwitch dark />
          </div>
        </div>
      </div>

      {/* main bar */}
      <div
        className={`relative border-b transition-all duration-300 ${
          scrolled ? "border-line bg-white/95 shadow-[0_10px_30px_-18px_rgba(17,17,20,0.6)] backdrop-blur" : "border-transparent bg-white"
        }`}
      >
        <div className="relative z-40 mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-10">
          <button
            type="button"
            onClick={() => setMobile(true)}
            className="-ms-1 inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist lg:hidden"
            aria-label={t("nav.menu")}
          >
            <IconMenu />
          </button>

          <Logo />

          <nav className="mx-auto hidden items-center gap-1 lg:flex" onMouseLeave={() => setMega(false)}>
            <button
              type="button"
              onMouseEnter={() => setMega(true)}
              onClick={() => setMega((v) => !v)}
              aria-expanded={mega}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-display text-[13px] font-medium transition-colors ${
                mega ? "bg-ikea-soft text-ikea" : "text-ink-soft hover:bg-ikea-soft hover:text-ikea"
              }`}
            >
              {t("nav.products")}
              <IconChevron className={`h-3.5 w-3.5 transition-transform duration-300 ${mega ? "rotate-180" : ""}`} />
            </button>
            {NAV.slice(1, 6).map((n) => (
              <a
                key={n.key + n.href}
                href={n.href}
                onMouseEnter={() => setMega(false)}
                className="rounded-full px-3 py-2 font-display text-[13px] font-medium text-ink-soft transition-colors hover:bg-ikea-soft hover:text-ikea"
              >
                {t(n.key)}
              </a>
            ))}
          </nav>

          <div className="ms-auto flex items-center gap-1 lg:ms-0">
            {/* desktop search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="hidden items-center xl:flex"
            >
              <label className="group flex items-center gap-2 rounded-full border border-line bg-mist px-3.5 py-2 transition-all duration-300 focus-within:border-ikea focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(0,88,163,0.12)]">
                <IconSearch className="h-4 w-4 text-ink-soft transition-colors group-focus-within:text-ikea" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("search.placeholder")}
                  className="w-52 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-soft/55 2xl:w-72"
                  aria-label={t("search.placeholder")}
                />
                {query && (
                  <button type="button" onClick={() => setQuery("")} className="text-ink-soft hover:text-brick" aria-label={t("close")}>
                    <IconX className="h-3.5 w-3.5" />
                  </button>
                )}
              </label>
            </form>

            <button
              type="button"
              onClick={() => {
                setSearchOpen((v) => !v);
                setQuery(query);
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist xl:hidden"
              aria-label={t("search.placeholder")}
            >
              {searchOpen ? <IconX /> : <IconSearch />}
            </button>

            <a
              href="#catalog"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist"
              aria-label={t("fav.title")}
            >
              <IconHeart className="h-5 w-5" filled={favs.length > 0} />
              {favs.length > 0 && (
                <span className="absolute -top-0.5 end-0 grid h-4 min-w-4 place-items-center rounded-full bg-brick px-1 text-[10px] font-bold text-white">
                  {favs.length}
                </span>
              )}
            </a>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="group relative ms-1 inline-flex items-center gap-2 rounded-full bg-ikea px-4 py-2.5 font-display text-[13px] font-bold text-white transition-all duration-300 hover:bg-ikea-deep hover:shadow-[0_10px_24px_-10px_rgba(0,88,163,0.9)] active:scale-95"
            >
              <IconBag className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-6" />
              <span className="hidden sm:inline">{t("cart.button")}</span>
              <span
                key={count}
                className="grid h-5 min-w-5 animate-pop place-items-center rounded-full bg-sun px-1 text-[11px] font-black tabular text-ink"
              >
                {count}
              </span>
            </button>
          </div>
        </div>

        {/* mobile search */}
        <div
          className={`overflow-hidden border-t border-line bg-white transition-all duration-300 xl:hidden ${
            searchOpen ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <label className="mx-4 my-3 flex items-center gap-2 rounded-full border border-line bg-mist px-3.5 py-2.5 focus-within:border-ikea sm:mx-6">
            <IconSearch className="h-4 w-4 text-ink-soft" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-ink-soft/55"
            />
          </label>
        </div>

        {/* mega menu — departments */}
        <div
          onMouseEnter={() => setMega(true)}
          className={`absolute inset-x-0 top-full z-40 hidden origin-top transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block ${
            mega ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
          }`}
        >
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <div className="overflow-hidden rounded-b-[26px] border border-t-0 border-line bg-white shadow-[0_44px_80px_-42px_rgba(17,17,20,0.7)]">
              <div className="grid gap-7 p-5 sm:p-6 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  <p className="mb-4 font-display text-[10.5px] font-black uppercase tracking-[0.2em] text-ink-soft/60">
                    {lang === "ar" ? "كل الأقسام" : "All departments"}
                  </p>
                  <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => goCat(c.id)}
                        className="group flex items-center gap-3 rounded-2xl border border-transparent p-2 text-start transition-all duration-300 hover:border-line hover:bg-mist"
                      >
                        <img
                          src={px(c.img, 140, 140)}
                          alt={c.name[lang]}
                          loading="lazy"
                          className="h-13 w-13 shrink-0 rounded-xl object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-display text-[13px] font-bold text-ink">{c.name[lang]}</span>
                          <span className="mt-0.5 block text-[11px] text-ink-soft tabular">
                            {PRODUCTS.filter((p) => p.cat === c.id).length} {t("cat.count")}
                          </span>
                        </span>
                        <IconArrow className="h-4 w-4 shrink-0 text-ink-soft/35 transition-all duration-300 group-hover:translate-x-1 group-hover:text-ikea rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4">
                  <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[20px] bg-ikea p-5 text-white">
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -end-6 -top-8 font-display text-[7rem] font-black leading-none text-white/[0.07]"
                    >
                      EU
                    </span>
                    <div className="relative">
                      <span className="inline-flex items-center gap-2 rounded-full bg-sun px-3 py-1 font-display text-[10px] font-black uppercase tracking-[0.16em] text-ink">
                        <IconTruck className="h-3.5 w-3.5" />
                        {lang === "ar" ? "شحنة جديدة" : "New shipment"}
                      </span>
                      <p className="mt-3 font-display text-[17px] font-black leading-snug">
                        {lang === "ar" ? "حاوية ميلانو وصلت المخزن" : "The Milan container just landed"}
                      </p>
                      <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/65">
                        {lang === "ar"
                          ? "أجهزة مطبخ وأثاث بكميات محدودة — احجز قطعتك قبل ما تخلص."
                          : "Kitchen appliances and furniture in limited quantities — reserve yours before it's gone."}
                      </p>
                    </div>
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                        lang === "ar"
                          ? "السلام عليكم، نبي نشوف منتجات شحنة ميلانو الجديدة."
                          : "Hello, I'd like to see the new Milan shipment.",
                      )}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="relative mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 font-display text-[13px] font-bold text-ink transition-colors hover:bg-sun"
                    >
                      <IconWhatsApp className="h-4.5 w-4.5 text-leaf" />
                      {lang === "ar" ? "احجز على واتساب" : "Reserve on WhatsApp"}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* mega menu backdrop */}
        <div
          onClick={() => setMega(false)}
          className={`fixed inset-0 top-0 z-30 hidden bg-ink/25 transition-opacity duration-300 lg:block ${
            mega ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
        />

        {/* scroll progress */}
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-transparent">
          <div
            className="h-full bg-gradient-to-r from-ikea via-sun to-ikea transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* mobile menu */}
      <div className={`fixed inset-0 z-50 lg:hidden ${mobile ? "" : "pointer-events-none"}`}>
        <div
          onClick={() => setMobile(false)}
          className={`absolute inset-0 bg-ink/55 backdrop-blur-sm transition-opacity duration-300 ${
            mobile ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute inset-y-0 start-0 flex w-[86%] max-w-sm flex-col bg-white transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            mobile ? "translate-x-0" : "ltr:-translate-x-full rtl:translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <Logo />
            <button
              type="button"
              onClick={() => setMobile(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-mist"
              aria-label={t("close")}
            >
              <IconX />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {NAV.map((n, i) => (
              <a
                key={n.key + i}
                href={n.href}
                onClick={() => setMobile(false)}
                className="flex items-center justify-between border-b border-line/70 px-3 py-4 font-display text-[16px] font-bold text-ink transition-colors hover:text-ikea"
              >
                {t(n.key)}
                <span className="text-[11px] font-medium text-ink-soft/50 tabular">0{i + 1}</span>
              </a>
            ))}
          </nav>
          <div className="space-y-3 border-t border-line bg-mist px-5 py-5">
            <LangSwitch />
            <div className="flex items-center gap-2 text-[13px] text-ink-soft">
              <IconPin className="h-4 w-4 text-ikea" />
              {t("top.location")}
            </div>
            <a
              href={waGeneral}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center justify-center gap-2 rounded-full bg-leaf px-4 py-3 font-display text-[14px] font-bold text-white"
            >
              <IconWhatsApp className="h-5 w-5" />
              <span className="tabular">{WHATSAPP_DISPLAY}</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
