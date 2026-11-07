import { useEffect, useState } from "react";
import { px } from "../data/catalog";
import { WHATSAPP_DISPLAY, formatPrice } from "../i18n";
import { buildOrderMessage, useStore } from "../store";
import { IconBag, IconCheck, IconMinus, IconPlus, IconTrash, IconTruck, IconWhatsApp, IconX } from "./Icons";

export default function CartDrawer() {
  const { t, lang, cartOpen, setCartOpen, lines, count, subtotal, setQty, remove, clear, setCat } = useStore();
  const [form, setForm] = useState({ name: "", phone: "", city: "", note: "", mode: "deliver" as "deliver" | "pickup" });
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [cartOpen, setCartOpen]);

  const submit = () => {
    const order = buildOrderMessage({ ...form, lines, subtotal, lang });
    window.open(order.href, "_blank", "noopener,noreferrer");
    setSent(order.orderNo);
  };

  return (
    <div className={`fixed inset-0 z-[80] ${cartOpen ? "" : "pointer-events-none"}`} aria-hidden={!cartOpen}>
      <div
        onClick={() => setCartOpen(false)}
        className={`absolute inset-0 bg-ink/60 backdrop-blur-[3px] transition-opacity duration-400 ${
          cartOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t("cart.title")}
        className={`absolute inset-y-0 end-0 flex w-full max-w-[27rem] flex-col bg-mist shadow-[0_0_80px_rgba(0,0,0,0.45)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          cartOpen ? "translate-x-0" : "ltr:translate-x-full rtl:-translate-x-full"
        }`}
      >
        {/* header */}
        <div className="flex items-center justify-between gap-3 border-b border-line bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-ikea text-white">
              <IconBag className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-[16px] font-black leading-none">{t("cart.title")}</h2>
              <p className="mt-1.5 text-[11.5px] text-ink-soft tabular">
                {count} {t("cart.items")} · {formatPrice(subtotal, lang)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            aria-label={t("close")}
            className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-mist hover:text-brick"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="grid h-16 w-16 animate-pop place-items-center rounded-full bg-leaf text-white">
              <IconCheck className="h-8 w-8" />
            </span>
            <h3 className="font-display text-[19px] font-black leading-tight">
              {lang === "ar" ? "تحوّلت لواتساب ✓" : "Sent to WhatsApp ✓"}
            </h3>
            <p className="text-[13.5px] leading-relaxed text-ink-soft">
              {lang === "ar"
                ? `افتحنا محادثة مع ${WHATSAPP_DISPLAY} وطلبك مكتوب فيها. اضغط إرسال في واتساب لتأكيد الطلب.`
                : `We opened a chat with ${WHATSAPP_DISPLAY} with your order written in it. Press send inside WhatsApp to confirm.`}
            </p>
            <p className="rounded-full bg-white px-4 py-2 font-display text-[13px] font-bold tabular text-ikea">
              {t("cart.orderNum")}: {sent}
            </p>
            <button
              type="button"
              onClick={() => {
                setSent(null);
                clear();
                setCartOpen(false);
              }}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-display text-[13.5px] font-bold text-white transition-colors hover:bg-ikea"
            >
              {lang === "ar" ? "تمام، أغلق السلة" : "Done, close the bag"}
            </button>
          </div>
        ) : lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="relative grid h-20 w-20 place-items-center rounded-full bg-white text-ink-soft">
              <IconBag className="h-8 w-8" />
              <span className="absolute -bottom-1 -end-1 grid h-8 w-8 animate-float place-items-center rounded-full bg-sun text-[15px]">
                🛍️
              </span>
            </span>
            <h3 className="font-display text-[18px] font-black leading-tight">{t("cart.empty")}</h3>
            <p className="max-w-xs text-[13px] leading-relaxed text-ink-soft">{t("cart.emptyText")}</p>
            <button
              type="button"
              onClick={() => {
                setCartOpen(false);
                setCat("all");
                window.setTimeout(() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }), 120);
              }}
              className="mt-1 inline-flex items-center gap-2 rounded-full bg-ikea px-6 py-3 font-display text-[13.5px] font-bold text-white transition-colors hover:bg-ikea-deep"
            >
              {t("cart.browse")}
            </button>
          </div>
        ) : (
          <>
            {/* lines */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <ul className="space-y-3">
                {lines.map(({ product: p, qty }) => (
                  <li key={p.id} className="group flex gap-3 rounded-2xl border border-line bg-white p-3">
                    <img
                      src={px(p.img, 200, 200)}
                      alt={p.name[lang]}
                      loading="lazy"
                      className="h-20 w-20 shrink-0 rounded-xl object-cover"
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-display text-[13.5px] font-bold leading-snug">{p.name[lang]}</p>
                          <p className="mt-0.5 text-[11px] text-ink-soft tabular">
                            {p.id} · {p.origin[lang]}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(p.id)}
                          aria-label={t("cart.remove")}
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-soft/60 transition-colors hover:bg-brick/10 hover:text-brick"
                        >
                          <IconTrash className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                        <div className="flex items-center gap-0.5 rounded-full border border-line bg-mist p-0.5">
                          <button
                            type="button"
                            onClick={() => setQty(p.id, qty - 1)}
                            className="grid h-7 w-7 place-items-center rounded-full bg-white transition-colors hover:bg-ikea hover:text-white"
                            aria-label="-"
                          >
                            <IconMinus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center font-display text-[13px] font-bold tabular">{qty}</span>
                          <button
                            type="button"
                            onClick={() => setQty(p.id, qty + 1)}
                            className="grid h-7 w-7 place-items-center rounded-full bg-white transition-colors hover:bg-ikea hover:text-white"
                            aria-label="+"
                          >
                            <IconPlus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="font-display text-[14.5px] font-black tabular">
                          {formatPrice(p.price * qty, lang)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* customer details */}
              <div className="mt-5 rounded-2xl border border-line bg-white p-4">
                <p className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-ink-soft/70">
                  {lang === "ar" ? "بيانات التوصيل" : "Delivery details"}
                </p>

                <div className="mb-3 grid grid-cols-2 gap-1 rounded-full bg-mist p-1">
                  {(["deliver", "pickup"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, mode: m }))}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 font-display text-[12px] font-bold transition-all duration-300 ${
                        form.mode === m ? "bg-ikea text-white shadow" : "text-ink-soft hover:text-ikea"
                      }`}
                    >
                      {m === "deliver" ? <IconTruck className="h-4 w-4" /> : null}
                      {m === "deliver" ? t("cart.deliver") : t("cart.pickup")}
                    </button>
                  ))}
                </div>

                <div className="grid gap-2.5">
                  {(
                    [
                      ["name", t("cart.name"), t("cart.namePh")],
                      ["phone", t("cart.phone"), t("cart.phonePh")],
                      ["city", t("cart.city"), t("cart.cityPh")],
                      ["note", t("cart.note"), t("cart.notePh")],
                    ] as const
                  ).map(([key, label, ph]) => (
                    <label key={key} className="block">
                      <span className="mb-1 block text-[11px] font-semibold text-ink-soft">{label}</span>
                      {key === "note" ? (
                        <textarea
                          rows={2}
                          value={form[key]}
                          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                          placeholder={ph}
                          className="w-full resize-none rounded-xl border border-line bg-mist px-3.5 py-2.5 text-[13px] outline-none transition-all placeholder:text-ink-soft/50 focus:border-ikea focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,88,163,0.12)]"
                        />
                      ) : (
                        <input
                          type={key === "phone" ? "tel" : "text"}
                          value={form[key]}
                          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                          placeholder={ph}
                          className="w-full rounded-xl border border-line bg-mist px-3.5 py-2.5 text-[13px] outline-none transition-all placeholder:text-ink-soft/50 focus:border-ikea focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,88,163,0.12)]"
                        />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* footer */}
            <div className="border-t border-line bg-white px-5 py-4">
              <dl className="space-y-1.5 text-[13px]">
                <div className="flex items-center justify-between">
                  <dt className="text-ink-soft">{t("cart.subtotal")}</dt>
                  <dd className="font-semibold tabular">{formatPrice(subtotal, lang)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-soft">{t("cart.delivery")}</dt>
                  <dd className="font-semibold text-leaf">
                    {form.mode === "pickup" ? (lang === "ar" ? "مجاني" : "Free") : lang === "ar" ? "عند التأكيد" : "On confirmation"}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-line pt-2">
                  <dt className="font-display text-[14px] font-black">{t("cart.total")}</dt>
                  <dd className="font-display text-[19px] font-black tabular text-ikea">{formatPrice(subtotal, lang)}</dd>
                </div>
              </dl>
              <p className="mt-2 text-[11px] leading-relaxed text-ink-soft/75">{t("cart.deliveryNote")}</p>

              <button
                type="button"
                onClick={submit}
                className="group mt-3 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-leaf px-5 py-4 font-display text-[15px] font-black text-white transition-all duration-300 hover:brightness-110 hover:shadow-[0_16px_36px_-16px_rgba(31,122,77,1)] active:scale-[0.98]"
              >
                <IconWhatsApp className="h-5.5 w-5.5 transition-transform duration-300 group-hover:scale-110" />
                {t("cart.checkout")}
              </button>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-ink-soft/70">
                <span>{t("cart.checkoutNote")}</span>
                <button type="button" onClick={clear} className="shrink-0 ps-3 font-semibold text-brick hover:underline">
                  {lang === "ar" ? "إفراغ" : "Clear"}
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
