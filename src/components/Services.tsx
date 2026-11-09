import { px } from "../data/catalog";
import { useStore } from "../store";
import { SectionHead } from "./Bits";
import { IconChat, IconShield, IconTag, IconTruck, IconWrench } from "./Icons";
import Reveal from "./Reveal";

export default function Services() {
  const { t, contactLink, siteContent } = useStore();

  const items = [
    { icon: <IconTag className="h-6 w-6" />, t: t("srv1.t"), d: t("srv1.d") },
    { icon: <IconTruck className="h-6 w-6" />, t: t("srv2.t"), d: t("srv2.d") },
    { icon: <IconShield className="h-6 w-6" />, t: t("srv3.t"), d: t("srv3.d") },
    { icon: <IconTag className="h-6 w-6" />, t: t("srv4.t"), d: t("srv4.d") },
    { icon: <IconWrench className="h-6 w-6" />, t: t("srv5.t"), d: t("srv5.d") },
    { icon: <IconChat className="h-6 w-6" />, t: t("srv6.t"), d: t("srv6.d") },
  ];

  return (
    <section id="services" className="relative scroll-mt-24 bg-white py-16 lg:py-24">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-14 lg:px-10">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <SectionHead
              kicker={t("ui.services.kicker")}
              title={t("services.title")}
              text={t("services.text")}
            />
            <Reveal delay={120}>
              <div className="overflow-hidden rounded-[22px] border border-line">
                <div className="relative aspect-[4/3]">
                  <img
                    src={px(siteContent.config.serviceImage, 800, 600)}
                    alt={t("ui.services.imageAlt")}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-ikea-deep/85 to-transparent" />
                  <p className="absolute inset-x-4 bottom-4 font-display text-[14px] font-bold leading-snug text-white">
                    {t("ui.services.message")}
                  </p>
                </div>
              </div>
              <a
                href={contactLink()}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink px-5 py-3.5 font-display text-[14px] font-bold transition-colors hover:bg-ink hover:text-white"
              >
                {t("ui.services.request")}
              </a>
            </Reveal>
          </div>
        </div>

        <div className="lg:col-span-8">
          <ul className="border-t border-line">
            {items.map((s, i) => (
              <Reveal as="li" key={s.t} delay={i * 60} className="border-b border-line">
                <div className="group relative flex items-start gap-4 overflow-hidden px-1 py-6 transition-colors duration-400 sm:gap-7 sm:py-8">
                  <span className="absolute inset-0 -z-0 translate-y-full bg-ikea transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" />
                  <span className="relative z-10 font-display text-[13px] font-black tabular text-ink-soft/45 transition-colors duration-400 group-hover:text-sun sm:text-[15px]">
                    0{i + 1}
                  </span>
                  <span className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-line bg-mist text-ikea transition-all duration-400 group-hover:border-white/25 group-hover:bg-white/10 group-hover:text-sun">
                    {s.icon}
                  </span>
                  <span className="relative z-10 min-w-0 flex-1">
                    <span className="block font-display text-[clamp(1.05rem,2vw,1.4rem)] font-black leading-tight transition-colors duration-400 group-hover:text-white">
                      {s.t}
                    </span>
                    <span className="mt-1.5 block max-w-xl text-[13.5px] leading-relaxed text-ink-soft transition-colors duration-400 group-hover:text-white/70">
                      {s.d}
                    </span>
                  </span>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
