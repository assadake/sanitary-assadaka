/**
 * Coordonnées de la page /visite — une seule source de vérité, partagée avec
 * `vite.config.ts` pour générer la version statique de /visite (SEO inclus).
 *
 * Valeurs reprises de `src/site-content.ts` de la branche « Assadaka »
 * (`arena/a85f3eea-sanitary-assadaka`) : nom de société, ville, numéro
 * WhatsApp et lien Google Maps. Aucune lecture de la base Neon, aucune
 * migration, aucune variable d'environnement.
 *
 * [NOM MAGASIN] → SHOP_NAME
 * [VILLE]       → CITY
 * [TON_NUMERO]  → WHATSAPP_NUMBER (chiffres uniquement, sans + ni espaces)
 * [TON_LIEN]    → MAPS_URL
 * [HORAIRES]    → OPENING_HOURS
 */
export const SHOP_NAME = "Assadaka Alraqia";
export const CITY = "Tripoli";
export const WHATSAPP_NUMBER = "218913150095";
export const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Assadaka%20Alraqia%20sanitary%20ware%20Tripoli%20Libya";

/** Horaires non figés dans le dépôt : on renvoie vers WhatsApp plutôt que d'inventer. */
export const OPENING_HOURS = [
  { days: "Lundi – Samedi", hours: "À confirmer sur WhatsApp" },
  { days: "Dimanche", hours: "Sur rendez-vous" },
] as const;

export const VISITE_SEO = {
  title: `Visite 360° Showroom Sanitaire ${CITY} | ${SHOP_NAME}`,
  description:
    "Visitez en 360° notre showroom : vasques, robinetterie, douche, WC, baignoires...",
} as const;
