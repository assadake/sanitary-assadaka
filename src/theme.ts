import { useSyncExternalStore } from "react";

export type ThemeId =
  | "or"
  | "ceramique"
  | "sauge"
  | "terre"
  | "ardoise"
  | "sable"
  | "cuivre"
  | "lavande";

export type ThemeMode = "light" | "dark";

export type ThemePalette = {
  id: ThemeId;
  name: { ar: string; en: string; fr: string };
  /** Couleur principale : badges, boutons, liens actifs. */
  accent: string;
  /** Reflet clair de l'accent : CTA, surlignages, or de /visite. */
  highlight: string;
};

/** 8 palettes inspirées du sanitaire, de la céramique et des matériaux. */
export const THEMES: ThemePalette[] = [
  { id: "or", name: { ar: "ذهب الصداقة", en: "Assadaka gold", fr: "Or Assadaka" }, accent: "#7a5c2e", highlight: "#c9a86a" },
  { id: "ceramique", name: { ar: "أزرق سيراميك", en: "Ceramic blue", fr: "Bleu céramique" }, accent: "#1f5d7a", highlight: "#68a9c6" },
  { id: "sauge", name: { ar: "أخضر زيتوني", en: "Sage green", fr: "Vert sauge" }, accent: "#3d6a55", highlight: "#8fbd9d" },
  { id: "terre", name: { ar: "طيني", en: "Terracotta", fr: "Terre cuite" }, accent: "#94513d", highlight: "#d59a7b" },
  { id: "ardoise", name: { ar: "أردوازي", en: "Slate", fr: "Ardoise" }, accent: "#46525f", highlight: "#93a3b1" },
  { id: "sable", name: { ar: "رملي", en: "Sand", fr: "Sable" }, accent: "#77603c", highlight: "#d2b47c" },
  { id: "cuivre", name: { ar: "نحاسي", en: "Copper", fr: "Cuivre" }, accent: "#9a5234", highlight: "#d9956b" },
  { id: "lavande", name: { ar: "لافندر", en: "Lavender", fr: "Lavande" }, accent: "#5d5278", highlight: "#ab9cc7" },
];

const THEME_KEY = "assadaka.theme";
const MODE_KEY = "assadaka.mode";
const DEFAULT_THEME: ThemeId = "ceramique";
const DEFAULT_MODE: ThemeMode = "light";
const DEFAULT_PALETTE = THEMES.find((theme) => theme.id === DEFAULT_THEME)!;

type ThemeState = {
  theme: ThemeId;
  mode: ThemeMode;
};

type Listener = () => void;
const listeners = new Set<Listener>();

const isThemeId = (value: unknown): value is ThemeId =>
  typeof value === "string" && THEMES.some((x) => x.id === value);

const isMode = (value: unknown): value is ThemeMode => value === "light" || value === "dark";

function readStored(): ThemeState {
  if (typeof window === "undefined") return { theme: DEFAULT_THEME, mode: DEFAULT_MODE };
  try {
    const theme = window.localStorage.getItem(THEME_KEY);
    const mode = window.localStorage.getItem(MODE_KEY);
    return {
      theme: isThemeId(theme) ? theme : DEFAULT_THEME,
      mode: isMode(mode) ? mode : DEFAULT_MODE,
    };
  } catch {
    return { theme: DEFAULT_THEME, mode: DEFAULT_MODE };
  }
}

let state: ThemeState = readStored();

function persist(next: ThemeState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_KEY, next.theme);
    window.localStorage.setItem(MODE_KEY, next.mode);
  } catch {
    /* stockage indisponible : le thème reste actif pour la session */
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

/* ─────────────────────────── helpers couleur ─────────────────────────── */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbToHex(rgb: [number, number, number]): string {
  return `#${rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;
}

/** Mélange deux couleurs ; `t` est la part de `b`. */
function mix(a: string, b: string, t: number): string {
  const ar = hexToRgb(a);
  const br = hexToRgb(b);
  return rgbToHex([
    ar[0] + (br[0] - ar[0]) * t,
    ar[1] + (br[1] - ar[1]) * t,
    ar[2] + (br[2] - ar[2]) * t,
  ]);
}

function rgbString(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  return `${r}, ${g}, ${b}`;
}

/* ─────────────────────────── application CSS ─────────────────────────── */

const LIGHT_SURFACE = "#ffffff";
const LIGHT_SURFACE_2 = "#f4f4f2";
const DARK_SURFACE = "#17191e";
const DARK_SURFACE_2 = "#0f1013";
const DARK_PANEL = "#0b0c0f";

export function applyTheme(themeId: ThemeId, mode: ThemeMode): void {
  if (typeof document === "undefined") return;
  const palette = THEMES.find((x) => x.id === themeId) ?? DEFAULT_PALETTE;
  const root = document.documentElement;
  const dark = mode === "dark";

  const accent = palette.accent;
  const accentDeep = mix(accent, "#000000", 0.32);
  const highlight = palette.highlight;
  const highlightDeep = mix(highlight, "#000000", 0.18);
  const accentSoft = dark ? mix(accent, DARK_SURFACE, 0.82) : mix(accent, "#ffffff", 0.88);
  const sunSoft = dark ? mix(highlight, "#ffffff", 0.3) : accentDeep;
  const sunOnDark = mix(highlight, "#ffffff", 0.28);
  const accentText = dark ? highlight : accent;

  root.dataset.theme = palette.id;
  root.dataset.mode = mode;
  root.style.setProperty("color-scheme", mode);

  const set = (name: string, value: string) => root.style.setProperty(name, value);
  set("--color-ikea", accent);
  set("--color-ikea-deep", accentDeep);
  set("--color-ikea-soft", accentSoft);
  set("--color-sun", highlight);
  set("--color-sun-deep", highlightDeep);
  set("--color-sun-soft", sunSoft);
  set("--color-sun-on-dark", sunOnDark);
  set("--color-accent-text", accentText);
  set("--color-ikea-rgb", rgbString(accent));
  set("--color-sun-rgb", rgbString(highlight));

  set("--color-surface", dark ? DARK_SURFACE : LIGHT_SURFACE);
  set("--color-surface-2", dark ? DARK_SURFACE_2 : LIGHT_SURFACE_2);
  set("--color-dark-panel", dark ? DARK_PANEL : "#111114");
  set("--color-ink", dark ? "#f4f1e9" : "#111114");
  set("--color-ink-soft", dark ? "#b8b5ad" : "#4a4a52");
  set("--color-mist", dark ? DARK_SURFACE_2 : LIGHT_SURFACE_2);
  set("--color-line", dark ? "#34363d" : "#dcdcd8");
  set("--color-on-accent", "#111114");

  /* /visite : page autonome, mais elle suit exactement le même sélecteur. */
  const vGold = dark ? highlight : accent;
  const vGoldSoft = dark ? mix(highlight, "#ffffff", 0.25) : accentDeep;
  const vInk = dark ? "#08090b" : "#f7f4ec";
  const vPanel = dark ? "#101216" : "#ffffff";
  const vText = dark ? "#f4f1e9" : "#17181c";
  const vMuted = dark ? "#a5a29b" : "#5c5a55";
  set("--v-gold", vGold);
  set("--v-gold-soft", vGoldSoft);
  set("--v-gold-rgb", rgbString(vGold));
  set("--v-ink", vInk);
  set("--v-panel", vPanel);
  set("--v-text", vText);
  set("--v-muted", vMuted);
  set("--v-on-gold", dark ? "#111114" : "#ffffff");
  set("--v-line", `rgba(${rgbString(vGold)}, ${dark ? 0.24 : 0.34})`);
  set("--v-topbar", dark ? "rgba(8, 9, 11, 0.88)" : "rgba(247, 244, 236, 0.92)");
  set("--v-overlay", dark ? "rgba(8, 9, 11, 0.72)" : "rgba(247, 244, 236, 0.78)");

  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = dark ? DARK_PANEL : accent;
}

function commit(next: ThemeState): void {
  state = next;
  persist(next);
  applyTheme(next.theme, next.mode);
  emit();
}

export function setTheme(theme: ThemeId): void {
  commit({ ...state, theme });
}

export function setMode(mode: ThemeMode): void {
  commit({ ...state, mode });
}

export function getThemeState(): ThemeState {
  return state;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

if (typeof window !== "undefined") {
  applyTheme(state.theme, state.mode);
  window.addEventListener("storage", (event) => {
    if (event.key !== null && event.key !== THEME_KEY && event.key !== MODE_KEY) return;
    const next = readStored();
    state = next;
    applyTheme(next.theme, next.mode);
    emit();
  });
}

export function useTheme() {
  const snapshot = useSyncExternalStore(subscribe, getThemeState, getThemeState);
  const palette = THEMES.find((x) => x.id === snapshot.theme) ?? DEFAULT_PALETTE;
  return {
    ...snapshot,
    palette,
    themes: THEMES,
    setTheme,
    setMode,
  };
}
