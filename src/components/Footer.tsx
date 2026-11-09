import { useStore } from "../store";
import { LangSwitch, Logo } from "./Bits";
import {
  IconArrow,
  IconFacebook,
  IconPin,
} from "./Icons";

export default function Footer() {
  const { t, lang, setCat, setQuery, contactLink, siteContent } = useStore();

  const goCat = (id: string) => {
    setCat(id);
    setQuery("");
    window.setTimeout(() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }), 60);
  };
  const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const pageLink = contactLink();

  const columns: { title: string; links: { label: string; onClick?: () => void; href?: string }[] }[] = [
    {
      title: t("footer.shop"),
      links: siteContent.categories.slice(0, 6).map((c) => ({ label: c.name[lang], onClick: () => goCat(c.id) })),
    },
    {
      title: t("footer.help"),
      links: [
        { label: t("faq.title"), onClick: () => goTo("showroom") },
        { label: t("ui.footer.askDelivery"), onClick: () => goTo("services") },
        { label: t("ui.footer.askWarranty"), onClick: () => goTo("showroom") },
        { label: t("ui.footer.askPayment"), onClick: () => goTo("showroom") },
        {
          label: t("ui.footer.contact"),
          href: pageLink,
        },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { label: t("nav.stories"), onClick: () => goTo("stories") },
        { label: t("nav.rooms"), onClick: () => goTo("rooms") },
        { label: t("nav.services"), onClick: () => goTo("services") },
        { label: t("nav.showroom"), onClick: () => goTo("showroom") },
        { label: t("nav.offers"), onClick: () => goTo("offers") },
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-[6vw] start-1/2 -translate-x-1/2 font-display text-[24vw] font-black leading-none tracking-tighter text-white/[0.04] select-none"
      >
        {t("ui.footer.watermark")}
      </span>

      <div className="relative mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Logo onDark />
            <p className="mt-5 max-w-sm text-[13.5px] leading-relaxed text-white/55">{t("footer.aboutText")}</p>

            <ul className="mt-6 space-y-2.5 text-[13px] text-white/65">
              <li className="flex items-start gap-2.5">
                <IconPin className="mt-0.5 h-4 w-4 shrink-0 text-sun" />
                {t("showroom.addressVal")}
              </li>
              <li>
                <a
                  href={siteContent.config.facebookPageUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-2.5 transition-colors hover:text-sun"
                >
                  <IconFacebook className="h-4 w-4 shrink-0 text-sun" />
                  {siteContent.config.companyDisplay[lang]}
                </a>
              </li>
            </ul>

            <div className="mt-6 flex items-center gap-2">
              {[
                { icon: <IconFacebook className="h-4.5 w-4.5" />, label: "Facebook", href: siteContent.config.facebookPageUrl },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={s.label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-sun hover:bg-sun hover:text-ink"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <nav key={col.title} className="lg:col-span-2">
              <h3 className="font-display text-[12px] font-black uppercase tracking-[0.18em] text-sun">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.href ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="link-sweep inline-block text-[13.5px] text-white/60 transition-colors hover:text-white"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={l.onClick}
                        className="link-sweep inline-block text-start text-[13.5px] text-white/60 transition-colors hover:text-white"
                      >
                        {l.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="lg:col-span-2">
            <h3 className="font-display text-[12px] font-black uppercase tracking-[0.18em] text-sun">{t("footer.lang")}</h3>
            <div className="mt-4 rounded-2xl border border-white/12 bg-white/[0.06] p-3">
              <LangSwitch dark />
              <p className="mt-2 px-1 text-[11.5px] leading-relaxed text-white/45">
                {t("footer.payNote")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="group mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 font-display text-[12.5px] font-bold text-white/75 transition-colors hover:border-sun hover:text-sun"
            >
              <IconArrow className="h-4 w-4 -rotate-90 rtl:rotate-90 transition-transform group-hover:-translate-y-0.5" />
              {t("ui.footer.top")}
            </button>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-[12px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p className="tabular">
            © {new Date().getFullYear()} {t("brand.full")}. {t("footer.rights")}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {["footer.privacy", "footer.terms", "footer.cookies"].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => goTo("showroom")}
                className="link-sweep transition-colors hover:text-white"
              >
                {t(k)}
              </button>
            ))}
            <span className="hidden h-3 w-px bg-white/15 sm:block" />
            <span>{t("footer.payNote")}</span>
          </div>
          <p className="text-white/60">{t("footer.made")}</p>
        </div>
      </div>
    </footer>
  );
}
