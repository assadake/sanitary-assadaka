import { dictionaries, type Lang } from "./i18n";
import {
  CATEGORIES,
  FAQ_KEYS,
  HERO_STATS,
  ROOMS,
  STORIES,
  TICKER_KEYS,
  type Bi,
} from "./data/catalog";

export type SiteContent = {
  dictionaries: Record<Lang, Record<string, string>>;
  config: {
    companyDisplay: Bi;
    seoTitle: Bi;
    seoDescription: Bi;
    facebookPageUrl: string;
    whatsappNumber: string;
    heroImages: { main: number; detailA: number; detailB: number };
    mapUrl: string;
    serviceImage: number;
    showroomImage: number;
  };
  categories: typeof CATEGORIES;
  rooms: typeof ROOMS;
  stories: typeof STORIES;
  steps: Bi[];
  brands: { name: string; sub: Bi }[];
  heroStats: typeof HERO_STATS;
  tickerKeys: string[];
  faqKeys: readonly string[];
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  dictionaries,
  config: {
    companyDisplay: {
      ar: "الصداقة للمواد الصحية والسيراميك",
      en: "Assadaka Sanitary Ware & Ceramics",
    },
    seoTitle: {
      ar: "الصداقة الراقية | مواد صحية وسيراميك — طرابلس، ليبيا",
      en: "Assadaka Alraqia | Sanitary Ware & Ceramics — Tripoli, Libya",
    },
    seoDescription: {
      ar: "مواد صحية وسيراميك ومواد بناء من شركة الصداقة الراقية في طرابلس. استفسر عن الموديلات والأسعار والتوفر عبر واتساب.",
      en: "Sanitary ware, ceramics and building materials from Assadaka Alraqia in Tripoli. Ask about models, prices and availability on WhatsApp.",
    },
    facebookPageUrl: "https://www.facebook.com/AssadakaARAQIA/",
    whatsappNumber: "218913150095",
    heroImages: { main: 11701114, detailA: 8135115, detailB: 12340558 },
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Assadaka%20Alraqia%20sanitary%20ware%20Tripoli%20Libya",
    serviceImage: 12340558,
    showroomImage: 11701114,
  },
  categories: CATEGORIES,
  rooms: ROOMS,
  stories: STORIES,
  steps: [
    { ar: "أرسل مقاسات المكان أو مساحة المشروع.", en: "Share the space measurements or project area." },
    { ar: "حدد الموديل أو اللون أو نوع التشطيب الذي تفضله.", en: "Specify the model, colour or finish you prefer." },
    { ar: "تحقق من السعر والتوفر والضمان مع الشركة قبل الشراء.", en: "Confirm price, availability and warranty with the company before buying." },
  ],
  brands: [
    { name: "IDEAL", sub: { ar: "أدوات صحية", en: "Sanitary ware" } },
    { name: "TURKUAZ", sub: { ar: "حلول الحمام", en: "Bathroom solutions" } },
    { name: "CeraStyle", sub: { ar: "سيراميك صحي", en: "Ceramics" } },
  ],
  heroStats: HERO_STATS,
  tickerKeys: TICKER_KEYS,
  faqKeys: FAQ_KEYS,
};
