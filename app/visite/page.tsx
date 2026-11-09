import { useEffect, useRef, useState } from "react";

/* -------------------------------------------------------------------------- */
/* ⚠️ VALEURS GÉNÉRIQUES — le seul endroit à personnaliser avant production.  */
/* [NOM MAGASIN] → SHOP_NAME   ·  [VILLE] → CITY                              */
/* [TON_NUMERO]  → WHATSAPP_NUMBER (chiffres uniquement, sans + ni espaces)    */
/* [TON_LIEN]    → MAPS_URL     ·  [HORAIRES] → OPENING_HOURS                  */
/* -------------------------------------------------------------------------- */
const SHOP_NAME = "Votre Showroom";
const CITY = "Votre Ville";
const WHATSAPP_NUMBER = "000000000000";
const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=showroom+sanitaire";
const OPENING_HOURS = [
  { days: "Lundi – Samedi", hours: "09:00 – 19:00" },
  { days: "Dimanche", hours: "Sur rendez-vous" },
];

/** SEO de la page (aussi appliqué à <head> au montage, voir l'effet plus bas). */
export const metadata = {
  title: `Visite 360° Showroom Sanitaire ${CITY} | ${SHOP_NAME}`,
  description:
    "Visitez en 360° notre showroom : vasques, robinetterie, douche, WC, baignoires...",
};

/** Le viewer Pannellum d'origine n'est ni modifié, ni déplacé, ni recompressé. */
const VIEWER_SRC = "/visite-360/index.html";

const SPACES = [
  "1. Accueil / Caisse",
  "2. Vasques",
  "3. Robinetterie",
  "4. Vitrine",
  "5. Douche & WC",
  "6. Baignoires",
  "7. Espace 7",
  "8. Espace 8",
];

const WHATSAPP_DIRECT = `https://wa.me/${WHATSAPP_NUMBER}`;
const WHATSAPP_RDV = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  `Bonjour, je souhaite prendre rendez-vous pour visiter le showroom ${SHOP_NAME} à ${CITY}.`,
)}`;

/** Le viewer expose ces globales ; on les utilise sans jamais le modifier. */
type ViewerGlobals = Window & {
  startGuided?: () => void;
  stopGuided?: () => void;
  viewer?: { loadScene?: (sceneId: string) => void; toggleFullscreen?: () => void };
};

type IconName = "play" | "expand" | "arrow" | "pin" | "back" | "close" | "whats" | "map";

const ICON_PATHS: Record<IconName, string> = {
  play: "M8 5.5 19 12 8 18.5z",
  expand: "M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5",
  arrow: "M7 17 17 7M9 7h8v8",
  pin: "M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11zM12 10.2a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4z",
  back: "M20 12H4M10 6l-6 6 6 6",
  close: "M6 6l12 12M18 6 6 18",
  whats: "M4 20l1.4-4.1A8 8 0 1 1 8.2 18.7L4 20zM9 9.5c0 3 2.2 5.2 5.2 5.2",
  map: "M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11zM12 10.2a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4z",
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

export default function VisitePage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [active, setActive] = useState(0);
  const [fallbackFs, setFallbackFs] = useState(false);

  /* SEO + sens de lecture : cette page est française / LTR dans un site ar RTL. */
  useEffect(() => {
    const prevTitle = document.title;
    const prevLang = document.documentElement.lang;
    const prevDir = document.documentElement.dir;
    document.title = metadata.title;
    document.documentElement.lang = "fr";
    document.documentElement.dir = "ltr";

    const entries: Array<[string, string]> = [
      ['meta[name="description"]', metadata.description],
      ['meta[property="og:title"]', metadata.title],
      ['meta[property="og:description"]', metadata.description],
      ['meta[name="twitter:title"]', metadata.title],
      ['meta[name="twitter:description"]', metadata.description],
    ];
    const restore: Array<() => void> = [];
    for (const [selector, value] of entries) {
      const el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) continue;
      const previous = el.getAttribute("content");
      el.setAttribute("content", value);
      restore.push(() => {
        if (previous === null) el.removeAttribute("content");
        else el.setAttribute("content", previous);
      });
    }

    return () => {
      document.title = prevTitle;
      document.documentElement.lang = prevLang;
      document.documentElement.dir = prevDir;
      restore.forEach((fn) => fn());
    };
  }, []);

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
        { source: "visite-360-page", type, ...payload },
        window.location.origin,
      );
    } catch {
      /* iframe pas encore chargée ou origine différente : on ignore. */
    }
  };

  const scrollToViewer = () => {
    document.getElementById("viewer")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const reloadViewer = () => {
    const frame = iframeRef.current;
    if (!frame) return;
    try {
      frame.contentWindow?.location.reload();
    } catch {
      frame.src = frame.src;
    }
  };

  const launchVisit = () => {
    setActive(0);
    scrollToViewer();
    postToViewer("START_GUIDED");
    const win = viewerWindow();
    if (win && typeof win.startGuided === "function") {
      try {
        win.startGuided();
        return;
      } catch {
        /* Pannellum pas encore initialisé : on recharge simplement l'iframe. */
      }
    }
    reloadViewer();
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
    setActive(index);
    scrollToViewer();
    const sceneId = `s${index + 1}`;
    postToViewer("GOTO_SCENE", { index, sceneId });
    const win = viewerWindow();
    if (win) {
      try {
        win.stopGuided?.();
        win.viewer?.loadScene?.(sceneId);
      } catch {
        /* Le viewer n'est pas prêt : le scroll vers le viewer suffit. */
      }
    }
  };

  return (
    <div className="visite-page" dir="ltr" lang="fr">
      <header className="visite-topbar">
        <div className="visite-topbar-inner">
          <a href="/" className="visite-brand">
            <span className="visite-brand-mark" aria-hidden="true">360°</span>
            <span className="visite-brand-text">
              {SHOP_NAME}
              <small>Showroom sanitaire</small>
            </span>
          </a>
          <nav className="visite-topnav" aria-label="Navigation de la page">
            <a href="/">Retour au site</a>
            <a href="#viewer" className="is-active">Visite virtuelle 360°</a>
            <a href="#infos">Informations</a>
          </nav>
          <a href={WHATSAPP_DIRECT} target="_blank" rel="noreferrer noopener" className="visite-top-cta">
            Nous contacter
          </a>
        </div>
      </header>

      <main>
        <section className="visite-hero">
          <div className="visite-hero-inner">
            <span className="visite-badge">
              <span className="visite-badge-dot" aria-hidden="true" />
              8 espaces
            </span>
            <p className="visite-eyebrow">Showroom · Visite immersive</p>
            <h1 className="visite-title">
              Visite Virtuelle 360° - {SHOP_NAME} {CITY}
            </h1>
            <p className="visite-sub">
              Huit espaces à explorer à 360°, comme si vous étiez dans le showroom.
            </p>
            <div className="visite-hero-meta">
              <span><strong>08</strong><small>panoramas</small></span>
              <span><strong>360°</strong><small>degrés de vue</small></span>
              <span><strong>24/7</strong><small>sans rendez-vous</small></span>
            </div>
          </div>
        </section>

        <section id="viewer" className="visite-section">
          <div className="visite-section-head">
            <span className="visite-kicker">Le viewer</span>
            <h2>Explorez le showroom</h2>
            <p>
              Faites glisser l’image pour regarder autour de vous, puis utilisez les flèches ou les
              miniatures du viewer pour changer d’espace.
            </p>
          </div>

          <div className={`visite-frame${fallbackFs ? " is-fs" : ""}`}>
            <iframe
              ref={iframeRef}
              src={VIEWER_SRC}
              title="Visite virtuelle 360° du showroom"
              className="visite-iframe"
              allow="gyroscope; accelerometer; fullscreen; vr"
              allowFullScreen
            />
            {fallbackFs && (
              <button
                type="button"
                className="visite-fs-close"
                onClick={() => setFallbackFs(false)}
                aria-label="Quitter le plein écran"
              >
                <Icon name="close" />
              </button>
            )}
          </div>

          <div className="visite-actions">
            <button type="button" className="visite-btn visite-btn--gold" onClick={launchVisit}>
              <Icon name="play" />
              Lancer la visite
            </button>
            <button type="button" className="visite-btn visite-btn--ghost" onClick={openFullscreen}>
              <Icon name="expand" />
              Plein écran
            </button>
            <a
              className="visite-btn visite-btn--wa"
              href={WHATSAPP_RDV}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Icon name="whats" />
              Prendre RDV WhatsApp
            </a>
          </div>
          <p className="visite-hint">
            Le viewer possède aussi ses propres commandes : visite guidée, miniatures et plein écran.
          </p>
        </section>

        <section className="visite-section visite-spaces-section">
          <div className="visite-section-head">
            <span className="visite-kicker">Parcours</span>
            <h2>Les 8 espaces</h2>
            <p>Choisissez un espace : la vue se recentre sur le viewer et charge le panorama correspondant.</p>
          </div>

          <div className="visite-grid">
            {SPACES.map((title, index) => (
              <button
                key={title}
                type="button"
                className={`visite-card${active === index ? " is-active" : ""}`}
                onClick={() => goToSpace(index)}
                aria-label={`Voir ${title} dans le viewer`}
              >
                <span className="visite-card-img">
                  <img
                    src={`/visite-360/pano${index + 1}.jpg`}
                    alt={`Panorama de l’espace : ${title}`}
                    loading="lazy"
                    decoding="async"
                    width={6485}
                    height={1100}
                  />
                  <span className="visite-card-num">{String(index + 1).padStart(2, "0")}</span>
                </span>
                <span className="visite-card-foot">
                  <span>{title}</span>
                  <span className="visite-card-arrow"><Icon name="arrow" /></span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section id="infos" className="visite-section">
          <div className="visite-section-head">
            <span className="visite-kicker">Avant de venir</span>
            <h2>Informations pratiques</h2>
          </div>
          <div className="visite-info-grid">
            <div className="visite-info-card">
              <h2>Horaires &amp; adresse</h2>
              <p>
                La visite virtuelle est disponible à tout moment. Pour essayer les produits en vrai,
                retrouvez-nous pendant les horaires d’ouverture.
              </p>
              <div className="visite-hours">
                {OPENING_HOURS.map((line) => (
                  <div key={line.days}>
                    <span>{line.days}</span>
                    <strong>{line.hours}</strong>
                  </div>
                ))}
              </div>
              <div className="visite-info-line">
                <Icon name="pin" />
                {CITY} · adresse exacte à préciser
              </div>
            </div>

            <div className="visite-cta-card">
              <span className="visite-kicker">On vous attend</span>
              <h2>Envie de voir les produits en vrai&nbsp;?</h2>
              <p>Réservez un créneau sur WhatsApp ou calculez votre itinéraire en un clic.</p>
              <div className="visite-cta-buttons">
                <a href={WHATSAPP_DIRECT} target="_blank" rel="noreferrer noopener">
                  <Icon name="whats" />
                  WhatsApp
                </a>
                <a href={MAPS_URL} target="_blank" rel="noreferrer noopener">
                  <Icon name="map" />
                  Itinéraire Google Maps
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
          Retour au site
        </a>
      </footer>
    </div>
  );
}
