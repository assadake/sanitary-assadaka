import { px } from "../data/catalog";
import { formatPrice } from "../i18n";
import { useStore } from "../store";
import { IconArrow, IconFacebook, IconTag } from "./Icons";
import Reveal from "./Reveal";

export default function Offers() {
  const { t, lang, products, contactLink } = useStore();
  const featured = products.slice(0, 6);

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
              {lang === "ar" ? "الأسعار حسب الموديل" : "Model-based pricing"}
            </span>
            <h2 className="mt-4 font-display text-[clamp(1.8rem,4.4vw,3.2rem)] font-black leading-[1.05] tracking-tight">
              {t("offers.title")}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/70">{t("offers.text")}</p>
          </Reveal>

          <Reveal delay={120}>
            <a
              href={contactLink()}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-full bg-leaf px-6 py-4 font-display text-[14px] font-bold text-white transition-transform hover:scale-[1.02]"
            >
              <IconFacebook className="h-5 w-5" />
              {t("showroom.wa")}
              <IconArrow className="h-4 w-4 rtl:rotate-180" />
            </a>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product, index) => (
            <Reveal key={product.id} delay={index * 70}>
              <article className="group flex h-full gap-4 overflow-hidden rounded-[20px] border border-white/12 bg-white/[0.06] p-3 transition-all duration-400 hover:-translate-y-1 hover:border-sun/60 hover:bg-white/[0.11]">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl sm:h-32 sm:w-32">
                  <img
                    src={px(product.img, 320, 320)}
                    alt={product.name[lang]}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <span className="absolute start-0 top-0 rounded-ee-xl bg-sun px-2 py-1 font-display text-[10px] font-black text-ink">
                    {lang === "ar" ? "استفسر" : "Enquire"}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="font-display text-[14.5px] font-bold leading-snug">{product.name[lang]}</h3>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-white/55">{product.desc[lang]}</p>
                  <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                    <span className="font-display text-[14px] font-black tabular text-sun">{formatPrice(product.price, lang)}</span>
                    <a
                      href={contactLink()}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-sun hover:text-ink"
                    >
                      <IconFacebook className="h-4 w-4" />
                      {lang === "ar" ? "اسأل" : "Ask"}
                    </a>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
