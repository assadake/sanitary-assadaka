import { useEffect, useRef, useState } from "react";
import { LANGS, type Lang } from "../i18n";
import { useStore } from "../store";
import { IconChevron, IconGlobe, IconStar } from "./Icons";

/* ─────────────────────────── Logo ─────────────────────────── */
export function Logo({ compact = false, onDark = false }: { compact?: boolean; onDark?: boolean }) {
  const { lang, t } = useStore();
  return (
    <a
      href="#top"
      className="group inline-flex items-center gap-2.5"
      aria-label={t("brand.full")}
    >
      <span className="relative inline-flex items-center rounded-[7px] bg-ikea p-[3px] shadow-[0_2px_0_0_#003f77] transition-transform duration-300 group-hover:-rotate-2 group-hover:scale-105">
        <span className="inline-flex items-center rounded-[50%] bg-sun px-2.5 py-[5px] font-display text-[15px] font-black leading-none tracking-tight text-ikea-deep sm:px-3.5 sm:text-[19px]">
          {lang === "ar" ? "تولين" : "TOLIN"}
        </span>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className={`font-display text-[11px] font-bold tracking-tight sm:text-[13px] ${onDark ? "text-white" : "text-ink"}`}>
            {t("brand.full")}
          </span>
          <span className={`mt-0.5 text-[9px] font-medium uppercase tracking-[0.18em] sm:text-[10px] ${onDark ? "text-sun" : "text-ikea"}`}>
            Tripoli · Libya
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
export function LangSwitch({ dark = false }: { dark?: boolean }) {
  const { lang, setLang, t } = useStore();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
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
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] font-semibold transition-colors ${
          dark
            ? "text-white/80 hover:bg-white/10 hover:text-white"
            : "text-ink-soft hover:bg-ikea-soft hover:text-ikea"
        }`}
      >
        <IconGlobe className="h-4 w-4" />
        <span className="hidden sm:inline">{current.id === "ar" ? "العربية" : "English"}</span>
        <span className={`hidden sm:inline ${dark ? "text-white/40" : "text-ink/30"}`}>|</span>
        <span className={dark ? "text-white/70" : "text-ink-soft/70"}>LY</span>
        <IconChevron className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      <div
        className={`absolute end-0 top-[calc(100%+8px)] z-50 w-60 origin-top overflow-hidden rounded-xl border border-line bg-white p-1.5 shadow-[0_24px_60px_-12px_rgba(17,17,20,0.35)] transition-all duration-200 ${
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
    </div>
  );
}

/* ─────────────────────── Marquee ticker ─────────────────────── */
export function Ticker() {
  const { t } = useStore();
  const keys = ["ticker.eu", "ticker.original", "ticker.warranty", "ticker.delivery", "ticker.new", "ticker.whatsapp"];
  const items = keys.map((k) => t(k));
  return (
    <div className="relative overflow-hidden border-y border-ink/15 bg-sun py-2.5 select-none">
      <div className="flex w-max shrink-0 animate-marquee items-center gap-10 whitespace-nowrap will-change-transform">
        {[...items, ...items, ...items, ...items].map((label, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-[12px] font-bold uppercase tracking-[0.14em] text-ink">
            {label}
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-ikea" aria-hidden>
              <path d="M6 0 7.4 4.6 12 6 7.4 7.4 6 12 4.6 7.4 0 6l4.6-1.4Z" fill="currentColor" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}
