/**
 * Coordonnées de la page /visite — une seule source de vérité, partagée avec
 * `vite.config.ts` pour générer la version statique de /visite (SEO inclus).
 *
 * Valeurs reprises de `src/site-content.ts` de la branche « Assadaka » : nom de
 * société, ville, numéro WhatsApp et lien Google Maps. Aucune base de données,
 * aucune migration, aucune variable d'environnement.
 *
 * Le site est bilingue **arabe / anglais** : tous les textes visibles de /visite
 * viennent de `./i18n.ts`, et le SEO est fourni dans les deux langues. La
 * page n'impose plus `lang="fr" dir="ltr"` ; elle suit `assadaka.lang`.
 */

export const SHOP_NAME = "Assadaka Alraqia";
export const CITY = "Tripoli";
export const WHATSAPP_NUMBER = "218913150095";
export const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Assadaka%20Alraqia%20sanitary%20ware%20Tripoli%20Libya";

/** Horaires non figés dans le dépôt : on renvoie vers WhatsApp plutôt que d'inventer. */
export const OPENING_HOURS = [
  {
    days: { ar: "مواعيد العمل", en: "Opening hours" },
    hours: { ar: "تُأكَّد عبر واتساب", en: "Confirm on WhatsApp" },
  },
  {
    days: { ar: "زيارة المعرض", en: "Showroom visit" },
    hours: { ar: "بموعد مسبق", en: "By appointment" },
  },
] as const;

export type VisiteLang = "ar" | "en";

export const VISITE_SEO: Record<VisiteLang, { title: string; description: string }> = {
  ar: {
    title: `الزيارة الافتراضية 360° — شركة الصداقة الراقية · طرابلس`,
    description:
      "جولة افتراضية بـ 360° داخل معرض الصداقة الراقية بطرابلس: ثماني محطات بانورامية مع تعليق صوتي بالعربية والإنجليزية للمغاسل والخلاطات والواجهة والاستقبال وأحواض الاستحمام.",
  },
  en: {
    title: `Virtual 360° tour — ${SHOP_NAME}, Tripoli`,
    description:
      "A 360° virtual walk through the Assadaka Alraqia showroom in Tripoli: eight panoramic stops with audio commentary in Arabic and English, covering basins, taps, displays, reception and baths.",
  },
};

/** Mots-clés statiques pour `dist/visite/index.html` (aucun français). */
export const VISITE_KEYWORDS =
  "الصداقة الراقية, زيارة افتراضية, جولة 360, معرض صحي, مغاسل, خلاطات, احواض استحمام, طرابلس, ليبيا, Assadaka Alraqia, virtual tour, 360 showroom, sanitary ware, basins, taps, bathtubs, Tripoli, Libya";

/** Messages WhatsApp prêts à l'emploi, dans les deux langues du site. */
export const VISITE_WA_MESSAGE: Record<VisiteLang, string> = {
  ar: `السلام عليكم، أود حجز موعد لزيارة معرض ${SHOP_NAME} في طرابلس بعد مشاهدة الجولة الافتراضية 360°.`,
  en: `Hello, I'd like to book a visit to the ${SHOP_NAME} showroom in Tripoli after taking the virtual 360° tour.`,
};
