import Catalog from "./components/Catalog";
import CartDrawer from "./components/CartDrawer";
import Departments from "./components/Departments";
import { ContactFloat, Toast } from "./components/Floating";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Offers from "./components/Offers";
import Rooms from "./components/Rooms";
import Services from "./components/Services";
import Showroom from "./components/Showroom";
import Stories from "./components/Stories";
import { Ticker } from "./components/Bits";
import { StoreProvider, useStore } from "./store";

const BRANDS = [
  { name: "IDEAL", sub: { ar: "أدوات صحية", en: "Sanitary ware" } },
  { name: "TURKUAZ", sub: { ar: "حلول الحمام", en: "Bathroom solutions" } },
  { name: "CeraStyle", sub: { ar: "سيراميك صحي", en: "Ceramics" } },
];

function OriginStrip() {
  const { lang } = useStore();
  const items = [...BRANDS, ...BRANDS];
  return (
    <div className="relative flex items-center gap-4 overflow-hidden border-b border-line bg-white py-3.5">
      <span className="z-10 hidden shrink-0 items-center gap-2 bg-white ps-4 pe-6 font-display text-[11px] font-black uppercase tracking-[0.2em] text-ink sm:ps-6 md:flex lg:ps-10">
        <span className="h-2 w-2 rounded-full bg-brick" />
        {lang === "ar" ? "ماركات متوفرة" : "Brands featured"}
      </span>
      <div className="flex w-max shrink-0 animate-marquee-rev items-center gap-8 whitespace-nowrap will-change-transform">
        {items.map((o, i) => (
          <span key={i} className="flex items-center gap-2 text-[12px] font-semibold text-ink-soft">
            <span className="text-base leading-none"><span className="h-2 w-2 rounded-full bg-ikea" /></span>
            {o.name} · {o.sub[lang]}
            <span className="ms-6 h-1 w-1 rounded-full bg-line" />
          </span>
        ))}
      </div>
      <span className="pointer-events-none absolute inset-y-0 end-0 w-24 bg-gradient-to-l from-white to-transparent rtl:bg-gradient-to-r" />
    </div>
  );
}

function Shell() {
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
      </div>
      <CartDrawer />
      <ContactFloat />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
