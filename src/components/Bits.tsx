import { useEffect, useRef, useState } from "react";
import { LANGS, type Lang } from "../i18n";
import { useStore } from "../store";
import { IconChevron, IconGlobe, IconStar } from "./Icons";

/* ─────────────────────────── Logo ─────────────────────────── */
export function Logo({
  compact = false,
  compactOnMobile = false,
  onDark = false,
}: {
  compact?: boolean;
  compactOnMobile?: boolean;
  onDark?: boolean;
}) {
  const { lang, t } = useStore();
  return (
    <a
      href="#top"
      className="group inline-flex max-w-full flex-wrap items-center gap-2.5"
      aria-label={t("brand.full")}
    >
      <span className="relative inline-flex items-center rounded-[7px] bg-ikea p-[3px] shadow-[0_2px_0_0_var(--color-ikea-deep)] transition-transform duration-300 group-hover:-rotate-2 group-hover:scale-105">
        <span
          className={`inline-flex items-center rounded-[50%] bg-sun py-[5px] font-display font-black leading-none tracking-tight text-ikea-deep sm:px-3.5 sm:text-[19px] ${
            compactOnMobile ? "px-1.5 text-[12px] min-[380px]:px-2.5 min-[380px]:text-[15px]" : "px-2.5 text-[15px]"
          }`}
        >
          {lang === "ar" ? "الصداقة" : "ASSADAKA"}
        </span>
      </span>
      {!compact && (
        <span className={`${compactOnMobile ? "hidden md:flex" : "flex"} min-w-0 flex-col leading-none`}>
          <span className={`font-display text-[11px] font-bold tracking-tight sm:text-[13px] ${onDark ? "text-white" : "text-ink"}`}>
            {t("brand.full")}
          </span>
          <span className={`mt-0.5 text-[9px] font-medium uppercase tracking-[0.18em] sm:text-[10px] ${onDark ? "text-sun" : "text-ikea"}`}>
            {lang === "ar" ? "مواد صحية وسيراميك" : "Sanitary · Ceramics"}
          </span>
        </span>
      )}
    </a>
  );
}

/* ─────────────────────────── Stars ─────────────────────────── */
export function Stars({ rating, className = "h-3.5 w-3.5" }: { rating: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-[1px] text-sun-deep" aria-label={`${rating}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <IconStar key={i} className={className} filled={i <= Math.round(rating)} />
      ))}
    </span>
  );
}

/* ─────────────────────── Section heading ─────────────────────── */
export function SectionHead({
  kicker,
  title,
  text,
  dark = false,
  action,
}: {
  kicker?: string;
  title: string;
  text?: string;
  dark?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {kicker && (
          <span
            className={`mb-3 inline-flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.22em] ${
              dark ? "text-sun" : "text-ikea"
            }`}
          >
            <span className={`h-px w-8 ${dark ? "bg-sun/70" : "bg-ikea/50"}`} />
            {kicker}
          </span>
        )}
        <h2
          className={`font-display text-[clamp(1.7rem,4vw,3rem)] font-black leading-[1.08] tracking-tight ${
            dark ? "text-white" : "text-ink"
          }`}
        >
          {title}
        </h2>
        {text && (
          <p className={`mt-3 text-[15px] leading-relaxed ${dark ? "text-white/65" : "text-ink-soft"}`}>{text}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ─────────────────────── Language switch ─────────────────────── */
export function LangSwitch({
  dark = false,
  inline = false,
  compactOnMobile = false,
}: {
  dark?: boolean;
  inline?: boolean;
  compactOnMobile?: boolean;
}) {
  const { lang, setLang, t } = useStore();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const current = LANGS.find((l) => l.id === lang)!;

  return (
    <div className="relative" ref={box}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={t("top.lang")}
        className={`inline-flex items-center gap-1.5 rounded-full py-1.5 text-[12px] font-semibold transition-colors ${
          compactOnMobile ? "px-1.5 min-[380px]:px-2.5" : "px-2.5"
        } ${
          dark
            ? "text-white/80 hover:bg-white/10 hover:text-white"
            : "text-ink-soft hover:bg-ikea-soft hover:text-ikea"
        }`}
      >
        <IconGlobe className="h-4 w-4" />
        <span className={inline ? "inline" : "hidden sm:inline"}>{current.id === "ar" ? "العربية" : "English"}</span>
        <span className={`${inline ? "inline" : "hidden sm:inline"} ${dark ? "text-white/40" : "text-ink/30"}`}>|</span>
        <span className={`${compactOnMobile ? "hidden min-[380px]:inline" : ""} ${dark ? "text-white/70" : "text-ink-soft/70"}`}>LY</span>
        <IconChevron className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      {(open || !inline) && (
        <div
          aria-hidden={!open}
          inert={!open}
          className={`lang-switch-popover ${inline ? "relative mt-2 w-full" : "absolute end-0 top-[calc(100%+8px)] z-50 w-60 origin-top"} overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-[0_24px_60px_-12px_rgba(17,17,20,0.35)] transition-all duration-200 ${
            open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
          }`}
        >
          <p className="px-3 py-2 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-ink-soft/70">
            {t("top.lang")}
          </p>
          {LANGS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => {
                setLang(l.id as Lang);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-start transition-colors ${
                l.id === lang ? "bg-ikea-soft text-ikea" : "text-ink hover:bg-mist"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className="text-base leading-none">{l.flag}</span>
                <span className="flex flex-col">
                  <span className="text-[13px] font-semibold leading-tight">{l.native}</span>
                  <span className="text-[11px] text-ink-soft/70">{l.label} · Libya</span>
                </span>
              </span>
              {l.id === lang && <span className="h-2 w-2 rounded-full bg-ikea" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Brand logo marquee ─────────────────── */
const PARTNER_BRANDS = [
  { name: "Bocchi", src: "/brands/bocchi.jpg", className: "w-40 sm:w-48" },
  { name: "CAPA", src: "/brands/capa.jpg", className: "w-[5.5rem] sm:w-24" },
  { name: "CeraStyle", src: "/brands/cerastyle.png", className: "w-40 sm:w-48" },
  { name: "SOPAL", src: "/brands/sopal.png", className: "w-40 sm:w-48" },
  { name: "SERICO", src: "/brands/serico.jpg", className: "w-40 sm:w-48" },
  { name: "Turavit Seramik", src: "/brands/turavit.jpg", className: "w-40 sm:w-48" },
  { name: "Turkuaz Seramik", src: "/brands/turkuaz.png", className: "w-40 sm:w-48" },
];

export function Ticker() {
  const [repeatCount, setRepeatCount] = useState(2);
  const [duration, setDuration] = useState(40);
  const marqueeRef = useRef<HTMLElement>(null);
  const sequenceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marquee = marqueeRef.current;
    const sequence = sequenceRef.current;
    if (!marquee || !sequence) return;

    const update = () => {
      const sequenceWidth = sequence.getBoundingClientRect().width;
      if (!sequenceWidth) return;
      // Make each half of the belt wider than the viewport before it loops.
      const count = Math.max(2, Math.ceil(marquee.clientWidth / sequenceWidth) + 1);
      setRepeatCount(count);
      setDuration(Math.max(30, Math.round((sequenceWidth * count) / 50)));
    };

    const observer = new ResizeObserver(update);
    observer.observe(marquee);
    update();
    return () => observer.disconnect();
  }, []);

  const brandSet = (copy: "primary" | "duplicate") => (
    <div className="brand-marquee-group" aria-hidden={copy === "duplicate"}>
      {Array.from({ length: repeatCount }, (_, sequenceIndex) => (
        <div
          key={`${copy}-sequence-${sequenceIndex}`}
          ref={copy === "primary" && sequenceIndex === 0 ? sequenceRef : undefined}
          className="brand-marquee-sequence"
          aria-hidden={sequenceIndex > 0}
        >
          {PARTNER_BRANDS.map((brand) => (
            <img
              key={`${copy}-${sequenceIndex}-${brand.name}`}
              className={`brand-marquee-logo ${brand.className}`}
              src={brand.src}
              alt={copy === "primary" && sequenceIndex === 0 ? brand.name : ""}
              loading="eager"
              draggable={false}
            />
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <section ref={marqueeRef} className="brand-marquee" aria-label="Our brands">
      <div className="brand-marquee-track" style={{ animationDuration: `${duration}s` }}>
        {brandSet("primary")}
        {brandSet("duplicate")}
      </div>
    </section>
  );
}
