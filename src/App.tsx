import { useEffect, useState } from "react";
import VisitePage from "../app/visite/page";
import Catalog from "./components/Catalog";
import CartDrawer from "./components/CartDrawer";
import Departments from "./components/Departments";
import { Toast, WhatsAppFloat } from "./components/Floating";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Offers from "./components/Offers";
import Rooms from "./components/Rooms";
import Services from "./components/Services";
import Showroom from "./components/Showroom";
import Showroom360 from "./components/Showroom360";
import Stories from "./components/Stories";
import { Ticker } from "./components/Bits";
import { isAdminRoute, isTourRoute, isVisiteRoute } from "./router";
import Admin from "./components/Admin";
import { StoreProvider, useStore } from "./store";

const FOCUS = [
  { glyph: "🚿", ar: "الأدوات الصحية", en: "Sanitary ware" },
  { glyph: "🧱", ar: "السيراميك والبلاط", en: "Ceramics & tiles" },
  { glyph: "🚰", ar: "الحنفيات والخلاطات", en: "Faucets & mixers" },
  { glyph: "🛁", ar: "الدش والاستحمام", en: "Showers & baths" },
  { glyph: "🪞", ar: "أثاث الحمام", en: "Bathroom furniture" },
  { glyph: "🔧", ar: "السباكة والتمديدات", en: "Plumbing" },
  { glyph: "🏗️", ar: "مواد البناء والتشطيب", en: "Building materials" },
  { glyph: "✨", ar: "إكسسوارات الحمام", en: "Bathroom accessories" },
];

function OriginStrip() {
  const { lang } = useStore();
  const items = [...FOCUS, ...FOCUS];
  return (
    <div className="relative flex items-center gap-4 overflow-hidden border-b border-line bg-surface py-3.5">
      <span className="z-10 hidden shrink-0 items-center gap-2 bg-surface ps-4 pe-6 font-display text-[11px] font-black uppercase tracking-[0.2em] text-ink sm:ps-6 md:flex lg:ps-10">
        <span className="h-2 w-2 rounded-full bg-sun" />
        {lang === "ar" ? "تشكيلة تهم مشروعك" : "Range for your project"}
      </span>
      <div className="flex w-max shrink-0 animate-marquee-rev items-center gap-8 whitespace-nowrap will-change-transform">
        {items.map((o, i) => (
          <span key={i} className="flex items-center gap-2 text-[13px] font-semibold text-ink-soft">
            <span className="text-base leading-none">{o.glyph}</span>
            {o[lang]}
            <span className="ms-6 h-1 w-1 rounded-full bg-line" />
          </span>
        ))}
      </div>
      <span className="pointer-events-none absolute inset-y-0 end-0 w-24 bg-gradient-to-l from-surface to-transparent rtl:bg-gradient-to-r" />
    </div>
  );
}

function Shell() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const isTour = isTourRoute(hash);

  // Anchors coming from another route (e.g. the tour page → #catalog) need a
  // nudge: the target section does not exist until the home page is mounted.
  useEffect(() => {
    if (isTour) {
      window.scrollTo({ top: 0 });
      return;
    }
    const id = decodeURIComponent(hash.replace(/^#/, ""));
    if (!id || id.startsWith("/")) return;
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => window.clearTimeout(timer);
  }, [hash, isTour]);

  if (isTour) {
    return (
      <div className="relative min-h-screen">
        <Showroom360 />
        <CartDrawer />
        <Toast />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="ambient" aria-hidden />
      <div className="relative z-10">
        <Header />
        <main>
          <Hero />
          <Ticker />
          <OriginStrip />
          <Departments />
          <Catalog />
          <Offers />
          <Rooms />
          <Stories />
          <Services />
          <Showroom />
        </main>
        <Footer />
        <WhatsAppFloat />
        <Toast />
      </div>
      <CartDrawer />
    </div>
  );
}

export default function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // /visite is a standalone page (no shop header), but it is bilingual AR/EN:
  // it reads the same `assadaka.lang` as the shop and follows its RTL/LTR dir.
  // Rendering it outside StoreProvider keeps its own document title/SEO.
  if (isVisiteRoute(pathname)) return <VisitePage />;

  return (
    <StoreProvider>
      {isAdminRoute(pathname) ? <Admin /> : <Shell />}
    </StoreProvider>
  );
}
