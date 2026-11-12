import { px } from "../data/catalog";
import { formatPrice } from "../i18n";
import { useStore } from "../store";
import { IconArrow, IconTag, IconWhatsApp } from "./Icons";
import Reveal from "./Reveal";

/**
 * « Offres » devenues « demande de prix » : le catalogue Assadaka ne publie pas
 * de prix ni de remises (les modèles, prix et disponibilités se confirment avec
 * la société). Aucun compte à rebours ni pourcentage inventé.
 */
export default function Offers() {
  const { t, lang, setCat, waLink, products, settings } = useStore();
  const featured = products.slice(0, 6);

  const enquiryLink = waLink(
    lang === "ar"
      ? "السلام عليكم، نبي نستفسر عن الموديلات والأسعار والتوفر."
      : "Hello, I'd like to enquire about models, prices and availability.",
  );

  return (
    <section id="offers" className="relative scroll-mt-24 overflow-hidden bg-ikea-deep py-16 text-white lg:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(40rem 26rem at 90% 0%, rgba(var(--color-sun-rgb),0.35), transparent 60%), radial-gradient(36rem 24rem at 0% 100%, rgba(255,255,255,0.16), transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-sun px-3.5 py-1.5 font-display text-[11px] font-black uppercase tracking-[0.18em] text-on-accent">
              <IconTag className="h-4 w-4" />
              {t("ui.offers.pricing")}
            </span>
            <h2 className="mt-4 font-display text-[clamp(1.8rem,4.4vw,3.2rem)] font-black leading-[1.05] tracking-tight">
              {t("offers.title")}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/70">{t("offers.text")}</p>
          </Reveal>

          <Reveal delay={120}>
            <a
              href={enquiryLink}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-full bg-leaf px-6 py-4 font-display text-[14px] font-bold text-white transition-transform hover:scale-[1.02]"
            >
              <IconWhatsApp className="h-5 w-5" />
              {t("showroom.wa")}
              <IconArrow className="h-4 w-4 rtl:rotate-180" />
            </a>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={i * 70}>
              <article className="group flex h-full gap-4 overflow-hidden rounded-[20px] border border-white/12 bg-white/[0.06] p-3 transition-all duration-400 hover:-translate-y-1 hover:border-sun/60 hover:bg-white/[0.11]">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl sm:h-32 sm:w-32">
                  <img
                    src={px(p.img, 320, 320)}
                    alt={p.name[lang]}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <span className="absolute start-0 top-0 rounded-ee-xl bg-sun px-2 py-1 font-display text-[10px] font-black text-on-accent">
                    {t("ui.offers.enquire")}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="font-display text-[14.5px] font-bold leading-snug">{p.name[lang]}</h3>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-white/55">{p.desc[lang]}</p>
                  <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                    <span className="font-display text-[14px] font-black tabular text-sun">
                      {formatPrice(p.price, lang)}
                    </span>
                    <a
                      href={enquiryLink}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-sun hover:text-on-accent"
                    >
                      <IconWhatsApp className="h-4 w-4" />
                      {t("ui.offers.ask")}
                    </a>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-[22px] border border-white/12 bg-white/[0.06] p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <p className="font-display text-[16px] font-bold">
                {lang === "ar" ? "ما لقيتش اللي تدور عليه؟" : "Can't find what you're after?"}
              </p>
              <p className="mt-1 text-[13px] text-white/60">
                {lang === "ar"
                  ? "أرسل مقاسات مشروعك وصور المكان والموديل المطلوب ليسهل علينا مساعدتك."
                  : "Send your project measurements, site photos and the model you need so we can help."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setCat("all");
                  document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group inline-flex items-center gap-2 rounded-full bg-surface px-5 py-3 font-display text-[13px] font-bold text-ink transition-colors hover:bg-sun"
              >
                {t("cart.browse")}
                <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </button>
              <a
                href={`https://wa.me/${settings.whatsappNumber}`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 font-display text-[13px] font-bold text-white transition-colors hover:border-sun hover:text-sun"
              >
                <IconWhatsApp className="h-4.5 w-4.5" />
                <span className="tabular">{settings.whatsappDisplay}</span>
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
