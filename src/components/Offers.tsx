import { useEffect, useMemo, useState } from "react";
import { PRODUCTS, px } from "../data/catalog";
import { WHATSAPP_NUMBER, formatPrice } from "../i18n";
import { useStore } from "../store";
import { IconArrow, IconBag, IconTag, IconWhatsApp } from "./Icons";
import Reveal from "./Reveal";

function nextDeadline() {
  const now = new Date();
  const d = new Date(now);
  d.setHours(21, 0, 0, 0);
  // next Friday 21:00 (Libyan weekend deal)
  const delta = (5 - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + delta);
  if (d.getTime() <= now.getTime()) d.setDate(d.getDate() + 7);
  return d.getTime();
}

function useCountdown(target: number) {
  const [left, setLeft] = useState(() => Math.max(0, target - Date.now()));
  useEffect(() => {
    const id = window.setInterval(() => setLeft(Math.max(0, target - Date.now())), 1000);
    return () => window.clearInterval(id);
  }, [target]);
  const s = Math.floor(left / 1000);
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

export default function Offers() {
  const { t, lang, add, setCat } = useStore();
  const target = useMemo(nextDeadline, []);
  const c = useCountdown(target);

  const deals = PRODUCTS.filter((p) => p.old).slice(0, 6);
  const pad = (n: number) => String(n).padStart(2, "0");

  const cells = [
    { v: pad(c.d), l: t("day") },
    { v: pad(c.h), l: t("hour") },
    { v: pad(c.m), l: t("min") },
    { v: pad(c.s), l: t("sec") },
  ];

  return (
    <section id="offers" className="relative scroll-mt-24 overflow-hidden bg-ikea-deep py-16 text-white lg:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(40rem 26rem at 90% 0%, rgba(255,219,0,0.35), transparent 60%), radial-gradient(36rem 24rem at 0% 100%, rgba(255,255,255,0.16), transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-sun px-3.5 py-1.5 font-display text-[11px] font-black uppercase tracking-[0.18em] text-ink">
              <IconTag className="h-4 w-4" />
              {lang === "ar" ? "خصومات حتى 20%" : "Up to 20% off"}
            </span>
            <h2 className="mt-4 font-display text-[clamp(1.8rem,4.4vw,3.2rem)] font-black leading-[1.05] tracking-tight">
              {t("offers.title")}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/70">{t("offers.text")}</p>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
              <p className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-sun">
                {t("offers.ends")}
              </p>
              <div className="flex items-center gap-2">
                {cells.map((cell, i) => (
                  <div key={cell.l} className="flex items-center gap-2">
                    <div className="flex w-[62px] flex-col items-center rounded-xl bg-ink/60 py-2.5">
                      <span key={cell.v} className="animate-pop font-display text-[26px] font-black leading-none tabular text-white">
                        {cell.v}
                      </span>
                      <span className="mt-1 text-[10px] uppercase tracking-wider text-white/50">{cell.l}</span>
                    </div>
                    {i < cells.length - 1 && <span className="font-display text-[20px] font-black text-sun/70">:</span>}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((p, i) => {
            const off = Math.round((1 - p.price / (p.old ?? p.price)) * 100);
            return (
              <Reveal key={p.id} delay={i * 70}>
                <article className="group flex h-full gap-4 overflow-hidden rounded-[20px] border border-white/12 bg-white/[0.06] p-3 transition-all duration-400 hover:-translate-y-1 hover:border-sun/60 hover:bg-white/[0.11]">
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl sm:h-32 sm:w-32">
                    <img
                      src={px(p.img, 320, 320)}
                      alt={p.name[lang]}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <span className="absolute start-0 top-0 rounded-ee-xl bg-sun px-2 py-1 font-display text-[11px] font-black text-ink tabular">
                      −{off}%
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <h3 className="font-display text-[14.5px] font-bold leading-snug">{p.name[lang]}</h3>
                    <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-white/55">{p.desc[lang]}</p>
                    <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                      <div className="flex flex-col leading-none">
                        <span className="text-[11.5px] text-white/45 line-through tabular">{formatPrice(p.old ?? 0, lang)}</span>
                        <span className="mt-1 font-display text-[17px] font-black tabular text-sun">{formatPrice(p.price, lang)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => add(p.id)}
                        className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink transition-all duration-300 hover:bg-sun active:scale-90"
                        aria-label={t("product.addToCart")}
                      >
                        <IconBag className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={120}>
          <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-[22px] border border-white/12 bg-white/[0.06] p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <p className="font-display text-[16px] font-bold">
                {lang === "ar" ? "ما لقيتش اللي تدور عليه؟" : "Can't find what you're after?"}
              </p>
              <p className="mt-1 text-[13px] text-white/60">
                {lang === "ar"
                  ? "نبعتولك قائمة الشحنات الجديدة كل أسبوع على واتساب."
                  : "We send the new shipment list every week on WhatsApp."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setCat("all");
                  document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-display text-[13px] font-bold text-ink transition-colors hover:bg-sun"
              >
                {t("cart.browse")}
                <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </button>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  lang === "ar"
                    ? "السلام عليكم، نبي نشترك في قائمة العروض الأسبوعية."
                    : "Hello, I'd like to join the weekly offers list.",
                )}`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 font-display text-[13px] font-bold text-white transition-colors hover:border-sun hover:text-sun"
              >
                <IconWhatsApp className="h-4.5 w-4.5" />
                <span className="tabular">+{WHATSAPP_NUMBER}</span>
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
