import { ROOMS, px } from "../data/catalog";
import { useStore } from "../store";
import { SectionHead } from "./Bits";
import { RailArrows, RailProgress, useRail } from "./Carousel";
import { IconArrow } from "./Icons";
import Reveal from "./Reveal";

export default function Rooms() {
  const { t, lang, setCat, setQuery } = useStore();
  const rail = useRail();

  const open = (cat: string) => {
    setCat(cat);
    setQuery("");
    window.setTimeout(() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  return (
    <section id="rooms" className="relative scroll-mt-24 py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHead
          kicker={lang === "ar" ? "أفكار وإلهام" : "Ideas & inspiration"}
          title={t("rooms.title")}
          text={t("rooms.text")}
          action={
            <RailArrows
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
        className="no-bar snap-x-mand flex gap-4 overflow-x-auto scroll-smooth px-4 pb-2 sm:px-6 lg:px-10"
      >
        {ROOMS.map((r, i) => (
          <Reveal
            key={r.id}
            delay={i * 55}
            className="snap-start-i w-[78vw] shrink-0 sm:w-[46vw] lg:w-[30vw] xl:w-[24vw]"
          >
            <article className="group relative overflow-hidden rounded-[22px] border border-line bg-white">
              <div className="relative aspect-[4/5] overflow-hidden bg-mist">
                <img
                  src={px(r.img, 700, 875)}
                  alt={r.title[lang]}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.09]"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/5 to-transparent" />
                <span className="absolute start-4 top-4 rounded-full bg-white/90 px-3 py-1 font-display text-[10.5px] font-black uppercase tracking-[0.14em] text-ikea tabular backdrop-blur">
                  {r.pieces} {t("rooms.pieces")}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="font-display text-[19px] font-black leading-tight text-white">{r.title[lang]}</h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/70">{r.sub[lang]}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <button
                  type="button"
                  onClick={() => open(r.cat)}
                  className="group/btn inline-flex items-center gap-2 font-display text-[13px] font-bold text-ikea transition-colors hover:text-ikea-deep"
                >
                  <span className="link-sweep">{t("rooms.shop")}</span>
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-ikea-soft transition-all duration-300 group-hover/btn:bg-ikea group-hover/btn:text-white">
                    <IconArrow className="h-3.5 w-3.5 rtl:rotate-180" />
                  </span>
                </button>
                <span className="text-[11px] text-ink-soft/55 tabular">0{i + 1}</span>
              </div>
            </article>
          </Reveal>
        ))}
        <div className="w-2 shrink-0 lg:w-6" aria-hidden />
      </div>

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <RailProgress progress={rail.progress} />
      </div>
    </section>
  );
}
