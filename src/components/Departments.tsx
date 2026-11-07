import { CATEGORIES, PRODUCTS, px } from "../data/catalog";
import { useStore } from "../store";
import { SectionHead } from "./Bits";
import { IconArrow } from "./Icons";
import Reveal from "./Reveal";

export default function Departments() {
  const { t, lang, setCat, setQuery } = useStore();

  const go = (id: string) => {
    setCat(id);
    setQuery("");
    window.setTimeout(() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  const span = ["md:col-span-2 md:row-span-2", "md:col-span-2", "", "", "", "", "", ""];

  return (
    <section id="departments" className="relative mx-auto max-w-[1440px] scroll-mt-24 px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      <SectionHead
        kicker={lang === "ar" ? "الأقسام" : "Departments"}
        title={t("cat.title")}
        text={t("cat.text")}
        action={
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3">
            <span className="font-display text-[26px] font-black leading-none text-ikea tabular">{PRODUCTS.length}</span>
            <span className="text-[12px] leading-tight text-ink-soft">
              {lang === "ar" ? "منتج متوفر الآن في مخزن طرابلس" : "products in stock at the Tripoli warehouse"}
            </span>
          </div>
        }
      />

      <div className="grid auto-rows-[minmax(190px,auto)] grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        {CATEGORIES.map((c, i) => {
          const count = PRODUCTS.filter((p) => p.cat === c.id).length;
          const big = span[i] === "md:col-span-2 md:row-span-2";
          return (
            <Reveal key={c.id} delay={i * 60} className={span[i]}>
              <button
                type="button"
                onClick={() => go(c.id)}
                className="group relative flex h-full w-full flex-col justify-end overflow-hidden rounded-[22px] border border-line bg-ink text-start"
              >
                <img
                  src={px(c.img, big ? 1000 : 700, big ? 1000 : 520)}
                  alt={c.name[lang]}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/45 to-transparent transition-opacity duration-500 group-hover:from-ikea-deep/95" />
                <span
                  className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 rtl:origin-right"
                  style={{ background: c.accent }}
                />
                <span className="relative flex items-end justify-between gap-3 p-4 sm:p-5">
                  <span className="min-w-0">
                    <span className="mb-1.5 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: c.accent }} />
                      <span className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
                        {count} {t("cat.count")}
                      </span>
                    </span>
                    <span
                      className={`block font-display font-black leading-tight text-white ${
                        big ? "text-[clamp(1.5rem,3vw,2.4rem)]" : "text-[clamp(1.05rem,1.8vw,1.35rem)]"
                      }`}
                    >
                      {c.name[lang]}
                    </span>
                    <span className={`mt-1 block text-white/60 ${big ? "text-[14px]" : "text-[12px]"}`}>{c.tagline[lang]}</span>
                  </span>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/25 text-white transition-all duration-300 group-hover:border-sun group-hover:bg-sun group-hover:text-ink">
                    <IconArrow className="h-4 w-4 rtl:rotate-180" />
                  </span>
                </span>
              </button>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
