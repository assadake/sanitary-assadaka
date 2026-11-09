/**
 * Minimal hash router. The whole shop is a single HTML file (vite-plugin-singlefile),
 * so a hash route is the safest way to add a real, bookmarkable "page" without
 * relying on server-side rewrites. Anchors such as #catalog keep working as-is.
 */

export const TOUR_HASH = "#/showroom";
export const HOME_HASH = "#/";

/** Real URL of the standalone /visite landing page (SPA pathname route). */
export const VISITE_PATH = "/visite";
/**
 * `dist/visite/index.html` is a real file generated at build time so static
 * hosts (Render, Netlify, S3...) can serve /visite without any rewrite. Some
 * of them redirect /visite → /visite/ or expose /visite/index.html, hence the
 * accepted aliases below.
 */
export function isVisiteRoute(pathname: string) {
  const p = pathname.replace(/\/+$/, "");
  return p === VISITE_PATH || p === `${VISITE_PATH}/index.html` || p === `${VISITE_PATH}/index`;
}

const TOUR_ALIASES = [
  "#/showroom",
  "#/showroom360",
  "#/visite-360",
  "#/visite360",
  "#/tour",
];

export function isTourRoute(hash: string) {
  return TOUR_ALIASES.some((a) => hash === a || hash.startsWith(`${a}/`) || hash.startsWith(`${a}?`));
}

/** Leave the tour, optionally scrolling to a section of the home page. */
export function goHome(section?: string) {
  window.location.hash = HOME_HASH;
  if (section) {
    const id = section.replace(/^#/, "");
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 140);
  } else {
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 40);
  }
}
