import { useEffect, useRef, useState } from "react";
import { useTheme, type ThemeId, type ThemeMode } from "../theme";

type Lang = "ar" | "en" | "fr";
type Variant = "header" | "mobile" | "visite" | "tour";

const LABELS: Record<
  Lang,
  {
    trigger: string;
    colors: string;
    mode: string;
    light: string;
    dark: string;
    current: (name: string, mode: ThemeMode) => string;
  }
> = {
  ar: {
    trigger: "تخصيص المظهر",
    colors: "الألوان",
    mode: "المظهر",
    light: "فاتح",
    dark: "داكن",
    current: (name, mode) => `اللون: ${name} · ${mode === "dark" ? "داكن" : "فاتح"}`,
  },
  en: {
    trigger: "Customise appearance",
    colors: "Colours",
    mode: "Mode",
    light: "Light",
    dark: "Dark",
    current: (name, mode) => `Colour: ${name} · ${mode === "dark" ? "Dark" : "Light"}`,
  },
  fr: {
    trigger: "Personnaliser l’apparence",
    colors: "Couleurs",
    mode: "Mode",
    light: "Clair",
    dark: "Sombre",
    current: (name, mode) => `Couleur : ${name} · ${mode === "dark" ? "Sombre" : "Clair"}`,
  },
};

function ModeGlyph({ mode }: { mode: ThemeMode }) {
  return <span aria-hidden="true">{mode === "dark" ? "☾" : "☀"}</span>;
}

export default function ThemeControls({
  lang = "ar",
  variant = "header",
  placement = "down",
}: {
  lang?: Lang;
  variant?: Variant;
  placement?: "down" | "up";
}) {
  const { theme, mode, palette, themes, setTheme, setMode } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const L = LABELS[lang];
  const name = palette.name[lang];

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className={`theme-controls theme-controls--${variant}${variant === "header" ? " theme-controls--on-dark" : ""}`}
    >
      <button
        type="button"
        className="theme-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`${L.trigger} — ${L.current(name, mode)}`}
        title={L.current(name, mode)}
      >
        <span className="theme-trigger-dot" style={{ background: palette.highlight }} aria-hidden="true" />
        <ModeGlyph mode={mode} />
        <span className="theme-trigger-label">{L.colors}</span>
      </button>

      {open && (
        <div
          className={`theme-popover${placement === "up" ? " is-up" : ""}`}
          role="dialog"
          aria-label={L.trigger}
        >
          <p className="theme-popover-title">{L.colors} · 8</p>
          <div className="theme-swatches" role="group" aria-label={L.colors}>
            {themes.map((item) => {
              const active = item.id === theme;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`theme-swatch${active ? " is-active" : ""}`}
                  onClick={() => setTheme(item.id as ThemeId)}
                  aria-pressed={active}
                  aria-label={item.name[lang]}
                  title={item.name[lang]}
                >
                  <span className="theme-swatch-dot" style={{ background: item.highlight }} aria-hidden="true" />
                  <span className="theme-swatch-label">{item.name[lang]}</span>
                </button>
              );
            })}
          </div>

          <p className="theme-popover-title theme-popover-title--mode">{L.mode}</p>
          <div className="theme-modes" role="group" aria-label={L.mode}>
            {(["light", "dark"] as ThemeMode[]).map((value) => (
              <button
                key={value}
                type="button"
                className={`theme-mode${mode === value ? " is-active" : ""}`}
                onClick={() => setMode(value)}
                aria-pressed={mode === value}
              >
                <ModeGlyph mode={value} />
                {value === "light" ? L.light : L.dark}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
