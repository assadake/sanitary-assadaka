import { useState } from "react";
import { FAQ_KEYS } from "../data/catalog";
import { TOUR_SCENES, thumbPosition, tourSrc } from "../data/tour";
import { WHATSAPP_DISPLAY } from "../i18n";
import { TOUR_HASH } from "../router";
import { useStore } from "../store";
import { IconCube } from "./tour/TourIcons";
import { SectionHead } from "./Bits";
import { IconArrow, IconCheck, IconChevron, IconClock, IconPhone, IconPin, IconWhatsApp } from "./Icons";
import Reveal from "./Reveal";

const MAPS = "https://www.google.com/maps/search/?api=1&query=Assadaka%20Alraqia%20sanitary%20ware%20Tripoli%20Libya";

export default function Showroom() {
  const { t, lang, waLink } = useStore();
  const [openFaq, setOpenFaq] = useState<string | null>("faq1");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const facts = [
    { icon: <IconPin className="h-5 w-5" />, k: t("showroom.address"), v: t("showroom.addressVal") },
    { icon: <IconClock className="h-5 w-5" />, k: t("showroom.hours"), v: t("showroom.hoursVal") },
    { icon: <IconPhone className="h-5 w-5" />, k: t("showroom.phone"), v: WHATSAPP_DISPLAY },
  ];

  return (
    <section id="showroom" className="relative scroll-mt-24 py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* copy + facts */}
          <div className="lg:col-span-5">
            <SectionHead
              kicker={lang === "ar" ? "زورنا" : "Visit us"}
              title={t("showroom.title")}
              text={t("showroom.text")}
            />
            <ul className="space-y-3">
              {facts.map((f, i) => (
                <Reveal as="li" key={f.k} delay={i * 80}>
                  <div className="group flex items-start gap-4 rounded-2xl border border-line bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-ikea/45 hover:shadow-[0_20px_40px_-28px_rgba(122,92,46,0.9)]">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ikea-soft text-ikea transition-colors duration-300 group-hover:bg-ikea group-hover:text-white">
                      {f.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-[10.5px] font-bold uppercase tracking-[0.18em] text-ink-soft/60">
                        {f.k}
                      </span>
                      <span className="mt-1 block text-[14px] font-semibold leading-relaxed text-ink tabular">{f.v}</span>
                    </span>
                  </div>
                </Reveal>
              ))}
            </ul>
            <Reveal delay={220}>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <a
                  href={MAPS}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3.5 font-display text-[13.5px] font-bold text-white transition-colors hover:bg-ikea"
                >
                  <IconPin className="h-4.5 w-4.5" />
                  {t("showroom.call")}
                  <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </a>
                <a
                  href={waLink(
                    lang === "ar"
                      ? "السلام عليكم، نبي نحجز موعد زيارة للمعرض في طرابلس."
                      : "Hello, I'd like to book a visit to the Tripoli showroom.",
                  )}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-full bg-leaf px-5 py-3.5 font-display text-[13.5px] font-bold text-white transition-transform hover:scale-[1.02] active:scale-95"
                >
                  <IconWhatsApp className="h-4.5 w-4.5" />
                  {t("showroom.wa")}
                </a>
              </div>
            </Reveal>
          </div>

          {/* stylised map */}
          <Reveal delay={120} className="lg:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[26px] border border-line bg-ikea-soft sm:aspect-[16/11]">
              <img
                src="https://images.pexels.com/photos/21999720/pexels-photo-21999720.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1400&h=1000"
                alt={lang === "ar" ? "وسط مدينة طرابلس قرب البحر" : "Tripoli city centre by the sea"}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-55 saturate-[0.65]"
              />
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 550" preserveAspectRatio="none" aria-hidden>
                <defs>
                  <pattern id="streets" width="70" height="70" patternUnits="userSpaceOnUse">
                    <path d="M0 0H70M0 0V70" stroke="rgba(79,58,28,0.22)" strokeWidth="1.5" fill="none" />
                  </pattern>
                </defs>
                <rect width="800" height="550" fill="url(#streets)" />
                <path d="M0 150 H800" stroke="#7a5c2e" strokeWidth="7" opacity="0.65" />
                <path d="M0 168 H800" stroke="#ffffff" strokeWidth="2" strokeDasharray="14 12" opacity="0.9" />
                <path d="M240 0 V550" stroke="#7a5c2e" strokeWidth="4" opacity="0.35" />
                <path d="M560 0 V550" stroke="#7a5c2e" strokeWidth="4" opacity="0.35" />
                <path d="M0 60 H800 V0 H0Z" fill="#7a5c2e" opacity="0.22" />
              </svg>

              <span className="absolute start-6 top-5 rounded-full bg-white/90 px-3 py-1.5 font-display text-[10.5px] font-black uppercase tracking-[0.18em] text-ikea backdrop-blur">
                {lang === "ar" ? "البحر المتوسط" : "Mediterranean Sea"}
              </span>
              <span className="absolute inset-x-6 top-[27%] text-center font-display text-[11px] font-bold uppercase tracking-[0.3em] text-ikea-deep/70">
                {lang === "ar" ? "طرابلس، ليبيا" : "Tripoli, Libya"}
              </span>

              {/* pin */}
              <div className="absolute start-1/2 top-[38%] -translate-x-1/2">
                <span className="relative flex h-5 w-5 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sun/70" />
                  <span className="relative inline-flex h-5 w-5 rounded-full border-2 border-white bg-ikea shadow-lg" />
                </span>
                <span className="absolute start-1/2 top-6 h-6 w-px -translate-x-1/2 bg-ikea/50" />
              </div>

              <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-end justify-between gap-3 sm:inset-x-6 sm:bottom-6">
                <div className="max-w-sm rounded-2xl border border-white/60 bg-white/92 p-4 backdrop-blur">
                  <p className="font-display text-[11px] font-black uppercase tracking-[0.18em] text-ikea">ASSADAKA · Tripoli</p>
                  <p className="mt-1.5 font-display text-[15px] font-bold leading-snug text-ink">{t("showroom.addressVal")}</p>
                  <a
                    href={MAPS}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-2.5 inline-flex items-center gap-1.5 font-display text-[12.5px] font-bold text-ikea hover:text-ikea-deep"
                  >
                    <span className="link-sweep">{lang === "ar" ? "افتح في الخرائط" : "Open in maps"}</span>
                    <IconArrow className="h-3.5 w-3.5 rtl:rotate-180" />
                  </a>
                </div>
                <div className="rounded-2xl bg-ink px-4 py-3 text-white">
                  <p className="text-[10.5px] uppercase tracking-[0.18em] text-white/50">{lang === "ar" ? "اليوم" : "Today"}</p>
                  <p className="mt-1 font-display text-[15px] font-black tabular text-sun">
                    {new Date().toLocaleTimeString(lang === "ar" ? "ar-LY-u-nu-latn" : "en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* FAQ + newsletter */}
        <div className="mt-16 grid gap-10 lg:mt-24 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <SectionHead kicker={lang === "ar" ? "مساعدة" : "Help"} title={t("faq.title")} />
            <div className="divide-y divide-line overflow-hidden rounded-[22px] border border-line bg-white">
              {FAQ_KEYS.map((k, i) => {
                const open = openFaq === k;
                return (
                  <div key={k}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : k)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-start transition-colors hover:bg-mist"
                    >
                      <span className="flex items-center gap-4">
                        <span className="font-display text-[11px] font-black tabular text-ikea">0{i + 1}</span>
                        <span className="font-display text-[15px] font-bold text-ink">{t(`${k}.q`)}</span>
                      </span>
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-all duration-300 ${
                          open ? "rotate-180 bg-ikea text-white" : "bg-mist text-ink-soft"
                        }`}
                      >
                        <IconChevron className="h-4 w-4" />
                      </span>
                    </button>
                    <div
                      className={`grid overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <p className="min-h-0 px-5 pb-5 text-[13.5px] leading-relaxed text-ink-soft ps-[3.4rem]">{t(`${k}.a`)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5">
            <Reveal>
              <div className="relative overflow-hidden rounded-[26px] bg-sun p-6 sm:p-8">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -end-8 -top-10 font-display text-[9rem] font-black leading-none text-ink/[0.07]"
                >
                  %
                </span>
                <h3 className="relative font-display text-[clamp(1.3rem,2.6vw,1.8rem)] font-black leading-tight text-ink">
                  {t("newsletter.title")}
                </h3>
                <p className="relative mt-2 max-w-sm text-[13.5px] leading-relaxed text-ink/70">{t("newsletter.text")}</p>
                <form
                  className="relative mt-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!email.trim()) return;
                    setDone(true);
                    setEmail("");
                    window.setTimeout(() => setDone(false), 4000);
                  }}
                >
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("newsletter.ph")}
                      className="w-full rounded-full border border-ink/15 bg-white px-4 py-3 text-[13.5px] outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(122,92,46,0.25)]"
                    />
                    <button
                      type="submit"
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 font-display text-[13.5px] font-bold text-white transition-transform hover:scale-[1.03] active:scale-95"
                    >
                      {done ? <IconCheck className="h-4 w-4 text-sun" /> : null}
                      {done ? t("newsletter.done") : t("newsletter.cta")}
                    </button>
                  </div>
                </form>
                <p className="relative mt-4 flex items-center gap-2 text-[12px] font-semibold text-ink/70">
                  <IconWhatsApp className="h-4 w-4 text-leaf" />
                  <span className="tabular">{WHATSAPP_DISPLAY}</span>
                </p>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-[22px] border border-line bg-white p-5">
                  <p className="font-display text-[34px] font-black leading-none text-ikea tabular">35</p>
                  <p className="mt-2 text-[12.5px] leading-snug text-ink-soft">
                    {lang === "ar" ? "صنف ضمن التشكيلة" : "Items in the range"}
                  </p>
                </div>
                <div className="rounded-[22px] border border-line bg-white p-5">
                  <p className="font-display text-[34px] font-black leading-none text-ikea tabular">8</p>
                  <p className="mt-2 text-[12.5px] leading-snug text-ink-soft">
                    {lang === "ar" ? "أقسام للمواد الصحية" : "Sanitary departments"}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* 360° tour entry banner — deux accès distincts : ancienne visite guidée + page /visite */}
        <Reveal>
          <div
            className="group relative mt-14 block overflow-hidden rounded-[26px] border border-ikea/15 bg-ink sm:mt-20"
          >
            <img
              src={tourSrc(TOUR_SCENES[0].file)}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-75 transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
              style={{ objectPosition: thumbPosition(TOUR_SCENES[0].facing) }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/25 rtl:bg-gradient-to-l" />
            <div className="relative flex flex-col gap-6 p-6 sm:p-9 lg:flex-row lg:items-center lg:justify-between lg:p-10">
              <a href={TOUR_HASH} className="max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-sun px-3 py-1.5 font-display text-[10.5px] font-black uppercase tracking-[0.18em] text-ink">
                  <IconCube className="h-3.5 w-3.5" />
                  {t("tour.bannerKicker")}
                </span>
                <h3 className="mt-4 font-display text-[clamp(1.3rem,2.8vw,2.1rem)] font-black leading-tight text-white">
                  {t("tour.bannerTitle")}
                </h3>
                <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-white/65">{t("tour.bannerText")}</p>
              </a>
              <div className="flex shrink-0 flex-wrap items-center gap-3">
                <span className="hidden rounded-2xl border border-white/20 px-4 py-3 text-center sm:block">
                  <span className="block font-display text-[24px] font-black leading-none tabular text-sun">08</span>
                  <span className="mt-1 block font-display text-[9.5px] font-bold uppercase tracking-[0.16em] text-white/55">
                    360°
                  </span>
                </span>
                <a
                  href={TOUR_HASH}
                  className="inline-flex items-center gap-2 rounded-full bg-sun px-5 py-3.5 font-display text-[13px] font-black text-ink transition-transform duration-300 hover:scale-[1.04]"
                >
                  {t("tour.bannerCta")}
                  <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </a>
                {/* Nouvelle page vitrine autour du viewer Pannellum d'origine */}
                <a
                  href="/visite"
                  className="inline-flex items-center gap-2 rounded-full border border-[#c9a86a] bg-[#c9a86a] px-5 py-3.5 font-display text-[13px] font-black text-black transition-transform duration-300 hover:scale-[1.04]"
                >
                  <IconCube className="h-4 w-4" />
                  Visite virtuelle 360°
                  <span className="rounded-full bg-black/15 px-2 py-0.5 text-[10px]">/visite</span>
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
