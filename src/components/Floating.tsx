import { useEffect, useState } from "react";
import { WHATSAPP_DISPLAY } from "../i18n";
import { useStore } from "../store";
import { IconArrow, IconBag, IconCheck, IconWhatsApp } from "./Icons";

export function WhatsAppFloat() {
  const { lang, waLink, t } = useStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-5 z-[75] flex flex-col items-end gap-2.5 transition-all duration-500 end-4 sm:bottom-7 sm:end-6 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <a
        href={waLink(
          lang === "ar"
            ? "السلام عليكم، نبي نطلب من تولين للبضائع الأروبية."
            : "Hello, I'd like to order from TOLIN European Goods.",
        )}
        target="_blank"
        rel="noreferrer noopener"
        className="group flex items-center gap-3 rounded-full bg-leaf py-3 pe-5 ps-3 text-white shadow-[0_18px_40px_-14px_rgba(31,122,77,0.9)] transition-transform duration-300 hover:scale-[1.03] active:scale-95"
      >
        <span className="relative grid h-9 w-9 place-items-center rounded-full bg-white/15">
          <span className="absolute inset-0 animate-ping rounded-full bg-white/25" />
          <IconWhatsApp className="relative h-5.5 w-5.5" />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="font-display text-[13.5px] font-bold">{t("wa.float")}</span>
          <span className="text-[11px] text-white/70 tabular">
            {WHATSAPP_DISPLAY} · {t("wa.floatSub")}
          </span>
        </span>
      </a>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label={lang === "ar" ? "الرجوع للأعلى" : "Back to top"}
        className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink shadow-lg transition-colors hover:bg-ink hover:text-white"
      >
        <IconArrow className="h-4 w-4 -rotate-90 rtl:rotate-90" />
      </button>
    </div>
  );
}

export function Toast() {
  const { toast, setCartOpen } = useStore();
  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-6 z-[90] flex justify-center px-4 transition-all duration-400 ${
        toast ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      {toast && (
        <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/10 bg-ink py-2.5 pe-3 ps-4 text-white shadow-[0_24px_50px_-20px_rgba(0,0,0,0.8)]">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-leaf">
            <IconCheck className="h-4 w-4" />
          </span>
          <span className="max-w-[52vw] truncate text-[13px] font-semibold">{toast}</span>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-sun px-3.5 py-1.5 font-display text-[12px] font-bold text-ink transition-transform hover:scale-105"
          >
            <IconBag className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
