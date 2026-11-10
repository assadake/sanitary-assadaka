/**
 * ⚠️ VALEURS GÉNÉRIQUES — le seul endroit à personnaliser avant production.
 * Ce fichier est aussi importé par `vite.config.ts` pour générer la version
 * statique de /visite : une seule source de vérité pour le SEO et les textes.
 *
 * [NOM MAGASIN] → SHOP_NAME
 * [VILLE]       → CITY
 * [TON_NUMERO]  → WHATSAPP_NUMBER (chiffres uniquement, sans + ni espaces)
 * [TON_LIEN]    → MAPS_URL
 * [HORAIRES]    → OPENING_HOURS
 */
export const SHOP_NAME = "Votre Showroom";
export const CITY = "Votre Ville";
export const WHATSAPP_NUMBER = "000000000000";
export const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=showroom+sanitaire";
export const OPENING_HOURS = [
  { days: "Lundi – Samedi", hours: "09:00 – 19:00" },
  { days: "Dimanche", hours: "Sur rendez-vous" },
] as const;

export const VISITE_SEO = {
  title: `Visite 360° Showroom Sanitaire ${CITY} | ${SHOP_NAME}`,
  description:
    "Visitez en 360° notre showroom : vasques, robinetterie, douche, WC, baignoires...",
} as const;
