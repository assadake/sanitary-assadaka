import { useEffect, useState } from "react";
import { PRODUCTS, px } from "../data/catalog";
import { WHATSAPP_NUMBER, formatPrice } from "../i18n";
import { useStore } from "../store";
import { Stars } from "./Bits";
import { IconArrow, IconBag, IconCheck, IconPin, IconShield, IconTruck, IconWhatsApp } from "./Icons";
import Reveal from "./Reveal";

const HERO_PRODUCT = PRODUCTS.find((p) => p.id === "TL-2001")!;
const HERO_IMG_A = 6585763; // living room
const HERO_IMG_B = 5974048; // tools
const HERO_IMG_C = 36573009; // espresso

const ROTATING = [HERO_PRODUCT, PRODUCTS.find((p) => p.id === "TL-4001")!, PRODUCTS.find((p) => p.id === "TL-1001")!];

export default function Hero() {
  const { t, lang, add, waLink } = useStore();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setIdx((i) => (i + 1) % ROTATING.length), 4200);
    return () => window.clearInterval(id);
  }, []);

  const featured = ROTATING[idx];

  const stats = [
    { v: "+1,200", k: t("hero.stat1") },
    { v: "38", k: t("hero.stat2") },
    { v: "11", k: t("hero.stat3") },
    { v: "22", k: t("hero.stat4") },
  ];

  const perks = [
    { icon: <IconTruck className="h-4 w-4" />, label: lang === "ar" ? "توصيل 24–48 ساعة في طرابلس" : "24–48h delivery in Tripoli" },
    { icon: <IconShield className="h-4 w-4" />, label: lang === "ar" ? "ضمان حتى 24 شهر" : "Warranty up to 24 months" },
    { icon: <IconCheck className="h-4 w-4" />, label: lang === "ar" ? "دفع عند الاستلام" : "Cash on delivery" },
  ];

  return (
    <section className="relative overflow-hidden bg-ink text-white">
      {/* layered ambient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(50rem 30rem at 85% 10%, rgba(0,88,163,0.55), transparent 60%), radial-gradient(38rem 26rem at 10% 90%, rgba(255,219,0,0.22), transparent 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(circle at 30% 40%, black, transparent 75%)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-10 start-1/2 -translate-x-1/2 font-display text-[22vw] font-black leading-none tracking-tighter text-white/[0.035] select-none"
      >
        {lang === "ar" ? "تولين" : "TOLIN"}
      </span>

      <div className="relative mx-auto grid max-w-[1440px] gap-10 px-4 pb-14 pt-12 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:pb-20 lg:pt-16">
        {/* copy */}
        <div className="lg:col-span-6 xl:col-span-6">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 backdrop-blur">
              <IconPin className="h-4 w-4 text-sun" />
              <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-white/85">
                {t("hero.kicker")} {lang === "ar" ? "تولين" : "TOLIN"}
              </span>
            </span>
          </Reveal>

          <Reveal delay={90}>
            <h1 className="mt-6 font-display text-[clamp(2.6rem,7.6vw,5.4rem)] font-black leading-[0.95] tracking-tight">
              <span className="block text-white">{t("hero.title1")}</span>
              <span className="relative mt-1 block text-sun">
                {t("hero.title2")}
                <svg
                  viewBox="0 0 300 12"
                  preserveAspectRatio="none"
                  className="absolute -bottom-2 start-0 h-2.5 w-[62%] text-sun/50"
                  aria-hidden
                >
                  <path d="M2 8C60 3 120 2 180 5c40 2 80 4 118 2" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-8 max-w-xl text-[15.5px] leading-[1.85] text-white/70 sm:text-[17px]">{t("hero.text")}</p>
          </Reveal>

          <Reveal delay={230}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={waLink(
                  lang === "ar"
                    ? "السلام عليكم، نبي نتعرف على المنتجات المتوفرة حالياً في تولين."
                    : "Hello, I'd like to know what's currently available at TOLIN.",
                )}
                target="_blank"
                rel="noreferrer noopener"
                className="group inline-flex items-center gap-2.5 rounded-full bg-sun px-6 py-3.5 font-display text-[15px] font-bold text-ink transition-all duration-300 hover:bg-white hover:shadow-[0_16px_40px_-14px_rgba(255,219,0,0.8)] active:scale-95"
              >
                <IconWhatsApp className="h-5 w-5 text-leaf transition-transform duration-300 group-hover:scale-110" />
                {t("hero.cta1")}
              </a>
              <a
                href="#catalog"
                className="group inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3.5 font-display text-[15px] font-bold text-white transition-all duration-300 hover:border-white hover:bg-white/10"
              >
                {t("hero.cta2")}
                <IconArrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5">
              {perks.map((p) => (
                <li key={p.label} className="inline-flex items-center gap-2 text-[13px] text-white/60">
                  <span className="text-sun">{p.icon}</span>
                  {p.label}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={370}>
            <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.k} className="group bg-ink px-4 py-5 transition-colors duration-300 hover:bg-ikea-deep">
                  <dt className="font-display text-[clamp(1.5rem,3vw,2.1rem)] font-black tabular leading-none text-sun">
                    {s.v}
                  </dt>
                  <dd className="mt-2 text-[11.5px] leading-snug text-white/55">{s.k}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* image collage */}
        <div className="relative lg:col-span-6 xl:col-span-6">
          <Reveal delay={140} className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-white/10 sm:aspect-[16/13] lg:aspect-[4/4.35]">
              <img
                src={px(HERO_IMG_A, 1200, 1300)}
                alt={lang === "ar" ? "صالون أوروبي حديث" : "Modern European living room"}
                className="h-full w-full animate-kenburns object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
                <div>
                  <p className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-sun">
                    {lang === "ar" ? "شحنة هذا الأسبوع" : "This week's shipment"}
                  </p>
                  <p className="mt-1 font-display text-[17px] font-bold leading-tight text-white">
                    {lang === "ar" ? "ميلانو ← طرابلس" : "Milan → Tripoli"}
                  </p>
                </div>
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur">
                  40 {lang === "ar" ? "حاوية/سنة" : "containers/yr"}
                </span>
              </div>
            </div>

            {/* floating mini images */}
            <img
              src={px(HERO_IMG_C, 400, 400)}
              alt=""
              className="absolute -start-3 top-6 hidden h-24 w-24 animate-float rounded-2xl border-4 border-ink object-cover shadow-2xl sm:block lg:h-28 lg:w-28"
              style={{ animationDelay: "0.6s" }}
              loading="lazy"
            />
            <img
              src={px(HERO_IMG_B, 400, 400)}
              alt=""
              className="absolute -end-2 bottom-24 hidden h-20 w-20 animate-float rounded-2xl border-4 border-ink object-cover shadow-2xl lg:block lg:h-24 lg:w-24"
              style={{ animationDelay: "1.4s" }}
              loading="lazy"
            />

            {/* rotating product card */}
            <div className="absolute -bottom-6 start-2 w-[min(20rem,calc(100%-1rem))] rounded-2xl border border-white/12 bg-white p-3 text-ink shadow-[0_30px_60px_-24px_rgba(0,0,0,0.8)] sm:start-5">
              <div className="flex gap-3">
                <img
                  key={featured.id}
                  src={px(featured.img, 240, 240)}
                  alt={featured.name[lang]}
                  className="h-20 w-20 shrink-0 animate-pop rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-ikea">
                    {t("product.imported")}
                  </p>
                  <p className="mt-0.5 truncate font-display text-[13.5px] font-bold leading-tight">
                    {featured.name[lang]}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Stars rating={featured.rating} className="h-3 w-3" />
                    <span className="text-[10.5px] text-ink-soft tabular">({featured.reviews})</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="font-display text-[15px] font-black tabular text-ink">
                      {formatPrice(featured.price, lang)}
                    </span>
                    <button
                      type="button"
                      onClick={() => add(featured.id)}
                      className="inline-flex items-center gap-1 rounded-full bg-ikea px-3 py-1.5 text-[11.5px] font-bold text-white transition-colors hover:bg-ikea-deep active:scale-95"
                    >
                      <IconBag className="h-3.5 w-3.5" />
                      {lang === "ar" ? "أضف" : "Add"}
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-2.5 flex gap-1">
                {ROTATING.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setIdx(i)}
                    aria-label={p.name[lang]}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      i === idx ? "w-8 bg-ikea" : "w-3 bg-line hover:bg-ink-soft/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* bottom bar */}
      <div className="relative border-t border-white/10 bg-ink/60">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-4 text-[12.5px] text-white/55 sm:px-6 lg:px-10">
          <span className="inline-flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-leaf" />
            </span>
            {lang === "ar" ? "المعرض مفتوح الآن — شارع الجمهورية، طرابلس" : "Showroom open now — Jumhuriya St, Tripoli"}
          </span>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer noopener"
            className="link-sweep inline-flex items-center gap-2 font-semibold text-white/80 hover:text-sun"
          >
            <IconWhatsApp className="h-4 w-4" />
            <span className="tabular">+{WHATSAPP_NUMBER}</span>
          </a>
          <span className="hidden items-center gap-2 md:inline-flex">
            {t("hero.scroll")}
            <span className="inline-block h-6 w-px animate-pulse bg-white/30" />
          </span>
        </div>
      </div>
    </section>
  );
}
