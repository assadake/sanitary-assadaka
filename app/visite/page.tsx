import { useCallback, useEffect, useRef, useState } from "react";
import ThemeControls from "../../src/components/ThemeControls";
import {
  CITY,
  MAPS_URL,
  OPENING_HOURS,
  SHOP_NAME,
  VISITE_SEO,
  VISITE_WA_MESSAGE,
  WHATSAPP_NUMBER,
  type VisiteLang,
} from "./config";
import { visiteT, type VisiteKey } from "./i18n";
import { TOUR_SCENES, thumbPosition } from "../../src/data/tour";

/** SEO appliqué au montage, et injecté statiquement au build par `vite.config.ts`. */
export const metadata = VISITE_SEO;

/** Viewer Pannellum bilingue AR/EN (les 8 panoramas restent inchangés). */
const VIEWER_BASE = "/visite-360/index.html";
const SPACE_COUNT = 8;

type ViewerGlobals = Window & {
  startGuided?: (withNarration?: boolean) => void;
  stopGuided?: () => void;
  gotoScene?: (index: number) => void;
  setNarration?: (on: boolean) => void;
  viewer?: { loadScene?: (sceneId: string) => void; toggleFullscreen?: () => void };
};

type IconName =
  | "play"
  | "expand"
  | "arrow"
  | "pin"
  | "back"
  | "close"
  | "whats"
  | "map"
  | "volume"
  | "volumeOff";

const ICON_PATHS: Record<IconName, string> = {
  play: "M8 5.5 19 12 8 18.5z",
  expand: "M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5",
  arrow: "M7 17 17 7M9 7h8v8",
  pin: "M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11zM12 10.2a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4z",
  back: "M20 12H4M10 6l-6 6 6 6",
  close: "M6 6l12 12M18 6 6 18",
  whats: "M4 20l1.4-4.1A8 8 0 1 1 8.2 18.7L4 20zM9 9.5c0 3 2.2 5.2 5.2 5.2",
  map: "M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11zM12 10.2a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4z",
  volume: "M4 9.5h3.5L12 5.5v13L7.5 14.5H4zM16 9a4 4 0 0 1 0 6M18.7 6.5a7.5 7.5 0 0 1 0 11",
  volumeOff: "M4 9.5h3.5L12 5.5v13L7.5 14.5H4zM16.5 9.5l5 5M21.5 9.5l-5 5",
};

function Icon({ name }: { name: IconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

const STORAGE_KEY = "assadaka.lang";

function readLang(): VisiteLang {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as VisiteLang;
      if (parsed === "ar" || parsed === "en") return parsed;
    }
  } catch {
    /* ignore */
  }
  return "ar";
}

function writeLang(lang: VisiteLang) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lang));
  } catch {
    /* ignore */
  }
}

function viewerUrl(lang: VisiteLang, sceneNo: number, narration = false, guided = false) {
  const p = new URLSearchParams({ lang, scene: `s${sceneNo}` });
  if (narration) p.set("narration", "1");
  if (guided) p.set("guided", "1");
  return `${VIEWER_BASE}?${p.toString()}`;
}

/** Les 8 cartes suivent l'ordre des fichiers du viewer (pano1 → pano8). */
const SPACES = Array.from({ length: SPACE_COUNT }, (_, i) => {
  const file = `pano${i + 1}.jpg`;
  const scene = TOUR_SCENES.find((s) => s.file === file);
  if (!scene) throw new Error(`Panorama introuvable : ${file}`);
  return { file, scene };
});

const WHATSAPP_DIRECT = `https://wa.me/${WHATSAPP_NUMBER}`;

export default function VisitePage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [lang, setLangState] = useState<VisiteLang>(readLang);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [narrating, setNarrating] = useState(false);
  const narratingRef = useRef(false);
  const [fallbackFs, setFallbackFs] = useState(false);
  const [frameSrc, setFrameSrc] = useState(() => viewerUrl(readLang(), 1));

  const t = useCallback((key: VisiteKey) => visiteT(lang, key), [lang]);
  const soundSupported =
    typeof window !== "undefined" && (typeof Audio !== "undefined" || "speechSynthesis" in window);

  const changeLang = useCallback((next: VisiteLang) => {
    setLangState(next);
    writeLang(next);
  }, []);

  /* Le site est AR/RTL ou EN/LTR : /visite suit la langue commune, plus de français. */
  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = VISITE_SEO[lang].title;
    const meta: Array<[string, string]> = [
      ['meta[name="description"]', VISITE_SEO[lang].description],
      ['meta[property="og:title"]', VISITE_SEO[lang].title],
      ['meta[property="og:description"]', VISITE_SEO[lang].description],
      ['meta[name="twitter:title"]', VISITE_SEO[lang].title],
      ['meta[name="twitter:description"]', VISITE_SEO[lang].description],
    ];
    for (const [selector, value] of meta) {
      document.querySelector<HTMLMetaElement>(selector)?.setAttribute("content", value);
    }
    document.querySelector<HTMLMetaElement>('meta[property="og:locale"]')?.setAttribute(
      "content",
      lang === "ar" ? "ar_LY" : "en_GB",
    );
  }, [lang]);

  /* Synchronisation avec les autres onglets / le reste du site. */
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        const next = JSON.parse(e.newValue) as VisiteLang;
        if (next === "ar" || next === "en") setLangState(next);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /* Changer la langue recharge le viewer avec la même scène (et l'audio si actif). */
  useEffect(() => {
    setFrameSrc(viewerUrl(lang, activeRef.current + 1, narratingRef.current));
    // `active` / `narrating` sont lus via des refs : un clic sur une carte ne doit
    // pas recharger l'iframe, seule la langue le doit.
  }, [lang]);

  /* Messages du viewer : scène courante, état du son, demande de langue. */
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const d = e.data;
      if (!d || typeof d !== "object" || d.source !== "assadaka-viewer") return;
      if (d.type === "SCENE_CHANGE" && Number.isInteger(d.index)) {
        const i = Math.max(0, Math.min(SPACE_COUNT - 1, Number(d.index)));
        activeRef.current = i;
        setActive(i);
      } else if (d.type === "NARRATION_STATE" && typeof d.on === "boolean") {
        narratingRef.current = d.on;
        setNarrating(d.on);
      } else if (d.type === "REQUEST_LANG" && (d.lang === "ar" || d.lang === "en")) {
        changeLang(d.lang);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [changeLang]);

  /* Sortie du plein écran (API native ou repli CSS) avec Échap. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setFallbackFs(false);
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const viewerWindow = (): ViewerGlobals | null => {
    try {
      return (iframeRef.current?.contentWindow as ViewerGlobals | undefined) ?? null;
    } catch {
      return null;
    }
  };

  const postToViewer = (type: string, payload: Record<string, unknown> = {}) => {
    try {
      viewerWindow()?.postMessage(
        { source: "assadaka-visite", type, ...payload },
        window.location.origin,
      );
    } catch {
      /* iframe pas encore chargée : on ignore. */
    }
  };

  const scrollToViewer = () => {
    document.getElementById("viewer")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sendNarration = (on: boolean) => {
    narratingRef.current = on;
    setNarrating(on);
    let sent = false;
    try {
      const win = viewerWindow();
      if (win && typeof win.setNarration === "function") {
        win.setNarration(on);
        sent = true;
      }
    } catch {
      /* viewer pas encore prêt. */
    }
    if (!sent) postToViewer("SET_NARRATION", { on });
  };

  const launchVisit = () => {
    activeRef.current = 0;
    setActive(0);
    narratingRef.current = true;
    setNarrating(true);
    scrollToViewer();
    const win = viewerWindow();
    try {
      if (win && typeof win.startGuided === "function") {
        win.startGuided(true); // démarre la visite AVEC le commentaire audio
        return;
      }
    } catch {
      /* Pannellum pas encore initialisé. */
    }
    // Repli : recharger le viewer avec les paramètres guidé + audio.
    setFrameSrc(viewerUrl(lang, 1, true, true));
  };

  const openFullscreen = async () => {
    const frame = iframeRef.current;
    if (!frame) return;
    postToViewer("FULLSCREEN");
    try {
      if (typeof frame.requestFullscreen === "function") {
        await frame.requestFullscreen();
        return;
      }
    } catch {
      /* Repli CSS ci-dessous si le navigateur refuse l'API Fullscreen. */
    }
    setFallbackFs(true);
  };

  const goToSpace = (index: number) => {
    activeRef.current = index;
    setActive(index);
    scrollToViewer();
    let sent = false;
    try {
      const win = viewerWindow();
      if (win && typeof win.gotoScene === "function") {
        win.gotoScene(index);
        sent = true;
      }
    } catch {
      /* Le viewer n'est pas prêt. */
    }
    if (!sent) postToViewer("GOTO_SCENE", { index, sceneId: `s${index + 1}` });
  };

  const waRdv = `${WHATSAPP_DIRECT}?text=${encodeURIComponent(VISITE_WA_MESSAGE[lang])}`;

  return (
    <div className="visite-page" dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
      <header className="visite-topbar">
        <div className="visite-topbar-inner">
          <a href="/" className="visite-brand">
            <span className="visite-brand-mark" aria-hidden="true">360°</span>
            <span className="visite-brand-text">
              {SHOP_NAME}
              <small>{t("brandSub")}</small>
            </span>
          </a>
          <nav className="visite-topnav" aria-label={t("navTour")}>
            <a href="/">{t("back")}</a>
            <a href="#viewer" className="is-active">{t("navTour")}</a>
            <a href="#infos">{t("navInfo")}</a>
          </nav>
          <div className="visite-lang" role="group" aria-label={t("langLabel")}>
            <button
              type="button"
              className={lang === "ar" ? "is-active" : ""}
              onClick={() => changeLang("ar")}
              aria-pressed={lang === "ar"}
            >
              العربية
            </button>
            <button
              type="button"
              className={lang === "en" ? "is-active" : ""}
              onClick={() => changeLang("en")}
              aria-pressed={lang === "en"}
            >
              English
            </button>
          </div>
          <ThemeControls lang={lang} variant="visite" />
          <a href={WHATSAPP_DIRECT} target="_blank" rel="noreferrer noopener" className="visite-top-cta">
            {t("contact")}
          </a>
        </div>
      </header>

      <main>
        <section className="visite-hero">
          <div className="visite-hero-inner">
            <span className="visite-badge">
              <span className="visite-badge-dot" aria-hidden="true" />
              {t("badge")}
            </span>
            <p className="visite-eyebrow">{t("eyebrow")}</p>
            <h1 className="visite-title">
              {t("title")} — {SHOP_NAME} {t("city")}
            </h1>
            <p className="visite-sub">{t("sub")}</p>
            <div className="visite-hero-meta">
              <span><strong>08</strong><small>{t("meta1")}</small></span>
              <span><strong>360°</strong><small>{t("meta2")}</small></span>
              <span><strong>24/7</strong><small>{t("meta3")}</small></span>
            </div>
          </div>
        </section>

        <section id="viewer" className="visite-section">
          <div className="visite-section-head">
            <span className="visite-kicker">{t("viewerKicker")}</span>
            <h2>{t("viewerTitle")}</h2>
            <p>{t("viewerText")}</p>
          </div>

          <div className={`visite-frame${fallbackFs ? " is-fs" : ""}`}>
            <iframe
              ref={iframeRef}
              src={frameSrc}
              title={t("frameTitle")}
              className="visite-iframe"
              allow="autoplay; gyroscope; accelerometer; fullscreen; vr"
              allowFullScreen
            />
            {fallbackFs && (
              <button
                type="button"
                className="visite-fs-close"
                onClick={() => setFallbackFs(false)}
                aria-label={t("exitFull")}
              >
                <Icon name="close" />
              </button>
            )}
          </div>

          <div className="visite-actions">
            <button type="button" className="visite-btn visite-btn--gold" onClick={launchVisit}>
              <Icon name="play" />
              {t("launch")}
            </button>
            <button type="button" className="visite-btn visite-btn--ghost" onClick={openFullscreen}>
              <Icon name="expand" />
              {t("fullscreen")}
            </button>
            <a
              className="visite-btn visite-btn--wa"
              href={waRdv}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Icon name="whats" />
              {t("rdv")}
            </a>
          </div>

          {/* Contrôle bien visible du commentaire audio AR / EN. */}
          <div className="visite-sound">
            <div className="visite-sound-copy">
              <span className="visite-kicker">{t("soundKicker")}</span>
              <h3>{t("soundTitle")}</h3>
              <p>{t("soundText")}</p>
              <div className="visite-sound-meta">
                <span className="visite-sound-lang">
                  {t("soundLang")}: {lang === "ar" ? "العربية" : "English"}
                </span>
                <span className={`visite-sound-state${narrating ? " is-on" : ""}`}>
                  <span className="visite-sound-wave" aria-hidden="true" />
                  {narrating ? t("soundPlaying") : t("soundPaused")}
                </span>
              </div>
            </div>
            <button
              type="button"
              className={`visite-sound-btn${narrating ? " is-on" : ""}`}
              onClick={() => sendNarration(!narrating)}
              disabled={!soundSupported}
              aria-pressed={narrating}
            >
              <Icon name={narrating ? "volumeOff" : "volume"} />
              <span>
                {!soundSupported
                  ? t("soundUnsupported")
                  : narrating
                    ? t("soundOff")
                    : t("soundOn")}
              </span>
            </button>
          </div>
          <p className="visite-hint">{t("viewerHint")}</p>
        </section>

        <section className="visite-section visite-spaces-section">
          <div className="visite-section-head">
            <span className="visite-kicker">{t("spacesKicker")}</span>
            <h2>{t("spacesTitle")}</h2>
            <p>{t("spacesText")}</p>
          </div>

          <div className="visite-grid">
            {SPACES.map(({ file, scene }, index) => {
              const title = scene.title[lang];
              return (
                <button
                  key={file}
                  type="button"
                  className={`visite-card${active === index ? " is-active" : ""}`}
                  onClick={() => goToSpace(index)}
                  aria-label={`${t("cardAria")} ${title}`}
                >
                  <span className="visite-card-img">
                    <img
                      src={`/visite-360/${file}`}
                      alt={`${t("cardAlt")} ${title}`}
                      loading="lazy"
                      decoding="async"
                      width={scene.width}
                      height={scene.height}
                      style={{ objectPosition: thumbPosition(scene.facing) }}
                    />
                    <span className="visite-card-num">{String(index + 1).padStart(2, "0")}</span>
                  </span>
                  <span className="visite-card-foot">
                    <span className="visite-card-copy">
                      <span className="visite-card-title">{title}</span>
                      <span className="visite-card-sub">{scene.subtitle[lang]}</span>
                    </span>
                    <span className="visite-card-arrow"><Icon name="arrow" /></span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section id="infos" className="visite-section">
          <div className="visite-section-head">
            <span className="visite-kicker">{t("infoKicker")}</span>
            <h2>{t("infoTitle")}</h2>
          </div>
          <div className="visite-info-grid">
            <div className="visite-info-card">
              <h2>{t("hoursTitle")}</h2>
              <p>{t("hoursText")}</p>
              <div className="visite-hours">
                {OPENING_HOURS.map((line) => (
                  <div key={line.days.en}>
                    <span>{line.days[lang]}</span>
                    <strong>{line.hours[lang]}</strong>
                  </div>
                ))}
              </div>
              <div className="visite-info-line">
                <Icon name="pin" />
                {t("address")}
              </div>
            </div>

            <div className="visite-cta-card">
              <span className="visite-kicker">{t("ctaKicker")}</span>
              <h2>{t("ctaTitle")}</h2>
              <p>{t("ctaText")}</p>
              <div className="visite-cta-buttons">
                <a href={WHATSAPP_DIRECT} target="_blank" rel="noreferrer noopener">
                  <Icon name="whats" />
                  {t("whatsapp")}
                </a>
                <a href={MAPS_URL} target="_blank" rel="noreferrer noopener">
                  <Icon name="map" />
                  {t("maps")}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="visite-footer">
        <span>© {new Date().getFullYear()} {SHOP_NAME} — {CITY}</span>
        <a href="/">
          <Icon name="back" />
          {t("footerBack")}
        </a>
      </footer>
    </div>
  );
}
