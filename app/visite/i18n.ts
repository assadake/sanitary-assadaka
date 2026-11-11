/**
 * Textes de la page autonome `/visite` (arabe / anglais uniquement).
 *
 * La page est rendue hors `StoreProvider` (comme dans le brief d'origine), mais
 * elle lit et écrit la même clé `localStorage["assadaka.lang"]` que le reste du
 * site : changer la langue ici change aussi la langue du magasin, du viewer
 * Pannellum et du commentaire audio.
 *
 * Les deux dictionnaires doivent contenir **exactement les mêmes clés**.
 */

import type { VisiteLang } from "./config";

export const VISITE_TEXT = {
  ar: {
    brandSub: "مواد صحية وسيراميك",
    back: "الرجوع إلى الموقع",
    navTour: "الجولة 360°",
    navInfo: "معلومات الزيارة",
    contact: "راسلنا",
    badge: "8 محطات",
    eyebrow: "معرض · زيارة غامرة",
    title: "الزيارة الافتراضية 360°",
    city: "طرابلس",
    sub: "ثماني محطات بانورامية داخل معرضنا، استكشفها بزاوية 360° وكأنك في المكان، مع تعليق صوتي يرافقك في كل محطة.",
    meta1: "مشاهد",
    meta2: "درجة رؤية",
    meta3: "في أي وقت",
    viewerKicker: "المشاهد",
    viewerTitle: "استكشف المعرض",
    viewerText: "اسحب الصورة للالتفات، ثم استخدم الأسهم أو المصغّرات لتغيير المحطة. شغّل التعليق الصوتي لتسمع شرح كل محطة بلغة الموقع.",
    frameTitle: "الزيارة الافتراضية 360° للمعرض",
    launch: "ابدأ الجولة المرشدة",
    fullscreen: "ملء الشاشة",
    rdv: "احجز زيارة عبر واتساب",
    viewerHint: "الأزرار أدناه تتحكم في المشاهد: الجولة المرشدة، ملء الشاشة، والتعليق الصوتي بالعربية أو الإنجليزية.",
    soundKicker: "تعليق صوتي",
    soundTitle: "اسمع شرح كل محطة",
    soundText: "تسجيل صوتي بالعربية والإنجليزية يتبع لغة الموقع، وينتقل تلقائياً معك من محطة إلى أخرى أثناء الجولة المرشدة.",
    soundOn: "تشغيل التعليق الصوتي",
    soundOff: "إيقاف التعليق الصوتي",
    soundPlaying: "التعليق الصوتي قيد التشغيل",
    soundPaused: "التعليق الصوتي متوقف",
    soundLang: "لغة التعليق",
    soundUnsupported: "التعليق الصوتي غير متاح في هذا المتصفح",
    exitFull: "إغلاق ملء الشاشة",
    spacesKicker: "المسار",
    spacesTitle: "المحطات الثماني",
    spacesText: "اختر محطة: يعود المشاهد إليها ويحمّل صورتها البانورامية مع الجزء المناسب من التعليق الصوتي.",
    cardAria: "عرض المحطة في المشاهد:",
    cardAlt: "صورة بانورامية:",
    infoKicker: "قبل الزيارة",
    infoTitle: "معلومات عملية",
    hoursTitle: "المواعيد والعنوان",
    hoursText: "الزيارة الافتراضية متاحة في أي وقت. لمعاينة المنتجات عن قرب، راسلنا لتأكيد مواعيد العمل والعنوان.",
    address: "طرابلس، ليبيا · العنوان الدقيق يُأكَّد عبر واتساب",
    ctaKicker: "ننتظرك",
    ctaTitle: "تحب تشوف المنتجات عن قرب؟",
    ctaText: "احجز موعداً على واتساب أو افتح الاتجاهات على الخرائط بضغطة واحدة.",
    whatsapp: "واتساب",
    maps: "الاتجاهات على الخرائط",
    langLabel: "اللغة",
    footerBack: "الرجوع إلى الموقع",
    sceneWord: "محطة",
  },
  en: {
    brandSub: "Sanitary ware & ceramics",
    back: "Back to website",
    navTour: "360° tour",
    navInfo: "Visit information",
    contact: "Contact us",
    badge: "8 stops",
    eyebrow: "Showroom · immersive visit",
    title: "Virtual 360° tour",
    city: "Tripoli",
    sub: "Eight panoramic stops inside our showroom. Explore them in 360° as if you were there, with an audio commentary guiding you through every stop.",
    meta1: "panoramas",
    meta2: "degrees of view",
    meta3: "anytime",
    viewerKicker: "The viewer",
    viewerTitle: "Explore the showroom",
    viewerText: "Drag to look around, then use the arrows or thumbnails to change stops. Turn on the audio commentary to hear each stop in the site language.",
    frameTitle: "360° virtual showroom tour",
    launch: "Start guided tour",
    fullscreen: "Fullscreen",
    rdv: "Book a visit on WhatsApp",
    viewerHint: "The controls below drive the viewer: guided tour, fullscreen, and audio commentary in Arabic or English.",
    soundKicker: "Audio commentary",
    soundTitle: "Hear every stop explained",
    soundText: "A recorded commentary in Arabic and English that follows the site language and automatically moves with you from one stop to the next during the guided tour.",
    soundOn: "Turn on voice narration",
    soundOff: "Turn off voice narration",
    soundPlaying: "Audio commentary playing",
    soundPaused: "Audio commentary paused",
    soundLang: "Commentary language",
    soundUnsupported: "Audio commentary is not available in this browser",
    exitFull: "Exit fullscreen",
    spacesKicker: "The route",
    spacesTitle: "The eight stops",
    spacesText: "Pick a stop: the viewer returns to it, loads its panorama and jumps to the matching part of the audio commentary.",
    cardAria: "Show this stop in the viewer:",
    cardAlt: "Panorama:",
    infoKicker: "Before you visit",
    infoTitle: "Practical information",
    hoursTitle: "Hours & address",
    hoursText: "The virtual tour is available anytime. To see the products in person, message us to confirm opening hours and the address.",
    address: "Tripoli, Libya · exact address confirmed on WhatsApp",
    ctaKicker: "We look forward to seeing you",
    ctaTitle: "Want to see the products in person?",
    ctaText: "Book a time on WhatsApp or open directions on maps in one tap.",
    whatsapp: "WhatsApp",
    maps: "Directions on maps",
    langLabel: "Language",
    footerBack: "Back to website",
    sceneWord: "Stop",
  },
} as const;

export type VisiteKey = keyof typeof VISITE_TEXT.ar;

/* Compile-time guard: the two dictionaries must expose exactly the same keys. */
type _MissingInEn = Exclude<VisiteKey, keyof typeof VISITE_TEXT.en>;
type _ExtraInEn = Exclude<keyof typeof VISITE_TEXT.en, VisiteKey>;
const _parityOk: [_MissingInEn, _ExtraInEn] extends [never, never] ? true : never = true;
void _parityOk;

export function visiteT(lang: VisiteLang, key: VisiteKey): string {
  return VISITE_TEXT[lang][key] ?? VISITE_TEXT.ar[key] ?? key;
}
