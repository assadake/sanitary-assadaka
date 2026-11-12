import type { Category, Product, Room, Story } from "./data/catalog";
import type { Lang } from "./i18n";

export type SiteSettings = {
  whatsappNumber: string;
  whatsappDisplay: string;
  facebookUrl: string;
  mapsUrl: string;
};

export type SiteContent = {
  version: 1;
  products: Product[];
  categories: Category[];
  rooms: Room[];
  stories: Story[];
  texts: Record<Lang, Record<string, string>>;
  settings: SiteSettings;
};
