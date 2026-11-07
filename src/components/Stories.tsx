import { useState } from "react";
import { STORIES, px, type Bi } from "../data/catalog";
import { WHATSAPP_NUMBER } from "../i18n";
import { useStore } from "../store";
import { SectionHead } from "./Bits";
import { RailArrows, RailProgress, useRail } from "./Carousel";
import { IconCheck, IconWhatsApp, IconX } from "./Icons";
import Reveal from "./Reveal";

const STEPS: Bi[] = [
  { ar: "نختار المورد الأوروبي ونعاين العيّنة قبل الشراء.", en: "We pick the European supplier and inspect the sample before buying." },
  { ar: "الشحنة تُفحص وتُغلَّف وتُوثَّق بالصور في المخزن.", en: "The shipment is tested, packed and photographed at the warehouse." },
  { ar: "توصلك لبيتك مع التركيب والضمان المكتوب.", en: "It reaches your home with installation and a written warranty." },
];

export default function Stories() {
  const { t, lang } = useStore();
  const rail = useRail();
  const [openId, setOpenId] = useState<string | null>(null);
  const story = STORIES.find((s) => s.id === openId) ?? null;

  return (
    <section id="stories" className="relative scroll-mt-24 overflow-hidden bg-ink py-16 text-white lg:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(46rem 28rem at 15% 0%, rgba(0,88,163,0.55), transparent 60%), radial-gradient(34rem 22rem at 92% 88%, rgba(255,219,0,0.16), transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHead
          dark
          kicker={lang === "ar" ? "من المصنع لبيتك" : "Factory to home"}
          title={t("stories.title")}
          text={t("stories.text")}
          action={
            <RailArrows
              dark
              onPrev={() => rail.scrollBy(-1)}
              onNext={() => rail.scrollBy(1)}
              disabledPrev={rail.start}
              disabledNext={rail.end}
            />
          }
        />
      </div>

      <div
        ref={rail.ref}
        className="no-bar snap-x-mand relative flex gap-4 overflow-x-auto scroll-smooth px-4 pb-2 sm:px-6 lg:px-10"
      >
        {STORIES.map((s, i) => (
          <Reveal
            key={s.id}
            delay={i * 60}
            className="snap-start-i w-[82vw] shrink-0 sm:w-[52vw] lg:w-[33vw] xl:w-[26vw]"
          >
            <button
              type="button"
              onClick={() => setOpenId(s.id)}
              className="group flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-white/12 bg-white/[0.05] text-start transition-all duration-400 hover:-translate-y-1.5 hover:border-sun/50 hover:bg-white/[0.09]"
            >
              <span className="relative block aspect-[16/11] overflow-hidden">
                <img
                  src={px(s.img, 760, 520)}
                  alt={s.title[lang]}
                  loading="lazy"
                  className="h-full w-full object-cover grayscale-[35%] transition-all duration-[900ms] group-hover:scale-105 group-hover:grayscale-0"
                />
                <span className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink to-transparent" />
                <span className="absolute start-4 top-4 rounded-full bg-sun px-2.5 py-1 font-display text-[10px] font-black uppercase tracking-[0.14em] text-ink">
                  {s.tag[lang]}
                </span>
              </span>
              <span className="flex flex-1 flex-col p-5">
                <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 tabular">
                  {lang === "ar" ? `قصة 0${i + 1}` : `Story 0${i + 1}`}
                </span>
                <span className="mt-2 block font-display text-[17px] font-black leading-snug text-white">{s.title[lang]}</span>
                <span className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-white/55">{s.text[lang]}</span>
                <span className="mt-auto inline-flex items-center gap-2 pt-5 font-display text-[12.5px] font-bold text-sun">
                  <span className="link-sweep">{t("stories.read")}</span>
                  <span className="h-px w-6 bg-sun transition-all duration-300 group-hover:w-10" />
                </span>
              </span>
            </button>
          </Reveal>
        ))}
        <div className="w-2 shrink-0 lg:w-6" aria-hidden />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <RailProgress dark progress={rail.progress} />
      </div>

      {story && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={() => setOpenId(null)} />
          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[26px] bg-white text-ink shadow-2xl sm:rounded-[26px]">
            <div className="relative aspect-[16/9] overflow-hidden sm:rounded-t-[26px]">
              <img src={px(story.img, 1100, 620)} alt={story.title[lang]} className="h-full w-full object-cover" />
              <span className="absolute inset-0 bg-gradient-to-t from-ink/85 to-transparent" />
              <span className="absolute start-5 top-5 rounded-full bg-sun px-3 py-1.5 font-display text-[11px] font-black uppercase tracking-[0.16em] text-ink">
                {story.tag[lang]}
              </span>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                aria-label={t("close")}
                className="absolute end-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink transition-colors hover:bg-brick hover:text-white"
              >
                <IconX className="h-4.5 w-4.5" />
              </button>
              <h3 className="absolute inset-x-5 bottom-4 font-display text-[clamp(1.2rem,3vw,1.9rem)] font-black leading-tight text-white">
                {story.title[lang]}
              </h3>
            </div>
            <div className="p-5 sm:p-7">
              <p className="text-[14.5px] leading-relaxed text-ink-soft">{story.text[lang]}</p>
              <ol className="mt-6 space-y-3">
                {STEPS.map((s, i) => (
                  <li key={i} className="flex gap-3 rounded-2xl border border-line bg-mist p-4">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ikea text-white">
                      <IconCheck className="h-4 w-4" />
                    </span>
                    <span className="text-[13.5px] leading-relaxed text-ink">{s[lang]}</span>
                  </li>
                ))}
              </ol>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  lang === "ar" ? `قرأت قصة «${story.title.ar}» ونبي تفاصيل أكثر.` : `I read "${story.title.en}" and would like more details.`,
                )}`}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-leaf px-5 py-3.5 font-display text-[14px] font-bold text-white transition-transform hover:scale-[1.01] active:scale-95"
              >
                <IconWhatsApp className="h-5 w-5" />
                {lang === "ar" ? "ناقش معنا على واتساب" : "Discuss with us on WhatsApp"}
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
