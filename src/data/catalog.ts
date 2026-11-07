import type { Lang } from "../i18n";

/** Pexels image helper (a handful of assets are served as .png) */
const PNG_IDS = new Set([27569266, 33948970]);
export const px = (id: number, w: number, h: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${PNG_IDS.has(id) ? "png" : "jpeg"}?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

export type Bi = { ar: string; en: string };
export const bi = (b: Bi, lang: Lang) => b[lang];

export type Category = {
  id: string;
  name: Bi;
  tagline: Bi;
  img: number;
  accent: string;
};

export const CATEGORIES: Category[] = [
  { id: "sanitary", name: { ar: "الأدوات الصحية", en: "Sanitary ware" }, tagline: { ar: "مراحيض، مغاسل وأطقم حمام", en: "Toilets, basins & bathroom sets" }, img: 6492398, accent: "#0058a3" },
  { id: "faucets", name: { ar: "الحنفيات والخلاطات", en: "Faucets & mixers" }, tagline: { ar: "خلاطات مغاسل ومطابخ", en: "Basin and kitchen mixers" }, img: 8135115, accent: "#0f7d8c" },
  { id: "showers", name: { ar: "الدش والاستحمام", en: "Showers" }, tagline: { ar: "أنظمة دش، كبائن وإكسسوارات", en: "Shower systems, enclosures & fittings" }, img: 11701114, accent: "#1f7a4d" },
  { id: "tiles", name: { ar: "السيراميك والبورسلان", en: "Ceramic & porcelain tiles" }, tagline: { ar: "بلاط للأرضيات والجدران", en: "Floor and wall tiles" }, img: 12340558, accent: "#8a5a2b" },
  { id: "vanities", name: { ar: "أثاث الحمام", en: "Bathroom furniture" }, tagline: { ar: "خزائن، مرايا ووحدات مغاسل", en: "Vanities, mirrors & storage" }, img: 7587747, accent: "#5b6b8c" },
  { id: "plumbing", name: { ar: "السباكة والتمديدات", en: "Plumbing & fittings" }, tagline: { ar: "مستلزمات تأسيس وتمديد الحمام", en: "Bathroom installation essentials" }, img: 8135115, accent: "#1f7a4d" },
  { id: "building", name: { ar: "مواد البناء والتشطيب", en: "Building & finishing" }, tagline: { ar: "مواد مساعدة لأعمال التشطيب", en: "Materials for finishing work" }, img: 12340558, accent: "#c0392b" },
  { id: "accessories", name: { ar: "إكسسوارات الحمام", en: "Bathroom accessories" }, tagline: { ar: "حاملات، رفوف وملحقات عملية", en: "Practical rails, shelves & fittings" }, img: 6394610, accent: "#e6a700" },
];

export type Product = {
  id: string;
  cat: string;
  name: Bi;
  desc: Bi;
  /** Null means price is quoted after confirming the model and availability. */
  price: number | null;
  old?: number;
  img: number;
  /** Product maker/brand, when known. */
  origin: Bi;
  rating: number | null;
  reviews: number;
  stock: number | null;
  dim: string;
  mat: Bi;
  warranty: number | null;
  badge?: "new" | "offer" | "best" | "import";
};

/** Starter examples only: confirm actual models, availability and prices with the shop. */
export const PRODUCTS: Product[] = [
  { id: "AS-1001", cat: "sanitary", name: { ar: "مرحاض أرضي بتصميم عصري", en: "Modern close-coupled toilet" }, desc: { ar: "تصميم عملي بخطوط بسيطة؛ الموديل واللون حسب المتوفر.", en: "A practical, clean-lined design; model and colour subject to availability." }, price: null, img: 6492398, origin: { ar: "حسب الموديل", en: "Model dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب الموديل", mat: { ar: "سيراميك صحي", en: "Vitreous china" }, warranty: null },
  { id: "AS-1002", cat: "sanitary", name: { ar: "مرحاض معلّق", en: "Wall-hung toilet" }, desc: { ar: "حل أنيق يسهل تنظيف الأرضية؛ يتطلب صندوق طرد مخفي مناسب.", en: "A streamlined option for easier floor cleaning; requires a compatible concealed cistern." }, price: null, img: 11701114, origin: { ar: "حسب الموديل", en: "Model dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب الموديل", mat: { ar: "سيراميك صحي", en: "Vitreous china" }, warranty: null },
  { id: "AS-1003", cat: "sanitary", name: { ar: "مغسلة سيراميك للحمام", en: "Ceramic bathroom basin" }, desc: { ar: "أشكال وأحجام متعددة للتركيب فوق الرخام أو على قاعدة.", en: "Multiple shapes and sizes for countertop or pedestal installation." }, price: null, img: 8135115, origin: { ar: "حسب الموديل", en: "Model dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب الموديل", mat: { ar: "سيراميك صحي", en: "Vitreous china" }, warranty: null },
  { id: "AS-1004", cat: "sanitary", name: { ar: "حوض غسيل يدين صغير", en: "Compact hand-wash basin" }, desc: { ar: "مقاس مناسب للحمامات الصغيرة ودورات المياه.", en: "A space-conscious size for smaller bathrooms and guest WCs." }, price: null, img: 6394610, origin: { ar: "حسب الموديل", en: "Model dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب الموديل", mat: { ar: "سيراميك صحي", en: "Vitreous china" }, warranty: null },
  { id: "AS-1005", cat: "sanitary", name: { ar: "طقم صحي متناسق", en: "Coordinated sanitary set" }, desc: { ar: "اختيارات متناسقة للمرحاض والمغسلة حسب الموديلات المتاحة.", en: "Matching toilet and basin options, subject to current models." }, price: null, img: 7587747, origin: { ar: "حسب الموديل", en: "Model dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب التشكيلة", mat: { ar: "سيراميك صحي", en: "Vitreous china" }, warranty: null },

  { id: "AS-2001", cat: "faucets", name: { ar: "خلاط مغسلة كروم", en: "Chrome basin mixer" }, desc: { ar: "خلاط للمغسلة بتصميم عملي؛ التشطيب والمقاس حسب الموديل.", en: "A practical basin mixer; finish and size vary by model." }, price: null, img: 8135115, origin: { ar: "حسب الموديل", en: "Model dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب الموديل", mat: { ar: "معدن مطلي", en: "Plated metal" }, warranty: null },
  { id: "AS-2002", cat: "faucets", name: { ar: "خلاط مغسلة مرتفع", en: "Tall basin mixer" }, desc: { ar: "مناسب لبعض الأحواض السطحية؛ يرجى مطابقة الارتفاع قبل الطلب.", en: "Designed for selected vessel basins; confirm height before ordering." }, price: null, img: 6394610, origin: { ar: "حسب الموديل", en: "Model dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب الموديل", mat: { ar: "معدن", en: "Metal" }, warranty: null },
  { id: "AS-2003", cat: "faucets", name: { ar: "خلاط مطبخ برقبة متحركة", en: "Swivel-spout kitchen mixer" }, desc: { ar: "خلاط حوض مطبخ برقبة عملية؛ الألوان والموديلات حسب المتوفر.", en: "A practical swivel-spout mixer; finishes and models vary by availability." }, price: null, img: 8135115, origin: { ar: "حسب الموديل", en: "Model dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب الموديل", mat: { ar: "معدن مطلي", en: "Plated metal" }, warranty: null },
  { id: "AS-2004", cat: "faucets", name: { ar: "خلاط دش", en: "Shower mixer" }, desc: { ar: "خلاط جداري للاستحمام؛ تحقق من نوع التوصيلات قبل الشراء.", en: "Wall-mounted shower mixer; check the connection type before purchase." }, price: null, img: 11701114, origin: { ar: "حسب الموديل", en: "Model dependent" }, rating: null, reviews: 0, stock: null, dim: "جداري", mat: { ar: "معدن", en: "Metal" }, warranty: null },
  { id: "AS-2005", cat: "faucets", name: { ar: "مجموعة حنفيات للحمام", en: "Bathroom tap set" }, desc: { ar: "مجموعة متناسقة للحمام؛ محتوياتها تختلف باختلاف الطقم.", en: "A coordinated bathroom set; included pieces depend on the selected set." }, price: null, img: 6394610, origin: { ar: "حسب الموديل", en: "Model dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب الطقم", mat: { ar: "معدن مطلي", en: "Plated metal" }, warranty: null },

  { id: "AS-3001", cat: "showers", name: { ar: "طقم دش يدوي", en: "Hand-shower set" }, desc: { ar: "دش يدوي مع خرطوم وحامل؛ تأكد من تفاصيل المكونات.", en: "Hand shower with hose and holder; confirm included fittings." }, price: null, img: 11701114, origin: { ar: "حسب الموديل", en: "Model dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب الموديل", mat: { ar: "معدن + مواد مركبة", en: "Metal + composite" }, warranty: null },
  { id: "AS-3002", cat: "showers", name: { ar: "نظام دش مطري", en: "Rain-shower system" }, desc: { ar: "رأس دش علوي مع ملحقات حسب التشكيلة المتاحة.", en: "Overhead shower head with fittings depending on the available set." }, price: null, img: 11701114, origin: { ar: "حسب الموديل", en: "Model dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب الطقم", mat: { ar: "معدن", en: "Metal" }, warranty: null },
  { id: "AS-3003", cat: "showers", name: { ar: "دش مخفي", en: "Concealed shower set" }, desc: { ar: "خلاط وملحقات تركيب مخفي؛ يلزم تحديد القطع قبل تأسيس الجدار.", en: "Concealed mixer and fittings; select components before wall rough-in." }, price: null, img: 8135115, origin: { ar: "حسب الموديل", en: "Model dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب الموديل", mat: { ar: "معدن", en: "Metal" }, warranty: null },
  { id: "AS-3004", cat: "showers", name: { ar: "كابينة دش زجاجية", en: "Glass shower enclosure" }, desc: { ar: "مقاسات وتصاميم مختلفة؛ القياس الدقيق للمكان مطلوب.", en: "Different configurations; accurate site measurements are required." }, price: null, img: 7587747, origin: { ar: "حسب الموديل", en: "Model dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب القياس", mat: { ar: "زجاج + معدن", en: "Glass + metal" }, warranty: null },

  { id: "AS-4001", cat: "tiles", name: { ar: "سيراميك أرضيات", en: "Ceramic floor tiles" }, desc: { ar: "ألوان ونقوش متنوعة؛ السعر والتوفر حسب المقاس والفرز.", en: "Multiple colours and patterns; price and availability depend on size and grade." }, price: null, img: 12340558, origin: { ar: "حسب التشكيلة", en: "Range dependent" }, rating: null, reviews: 0, stock: null, dim: "مقاسات متعددة", mat: { ar: "سيراميك", en: "Ceramic" }, warranty: null },
  { id: "AS-4002", cat: "tiles", name: { ar: "بورسلان للأرضيات", en: "Porcelain floor tiles" }, desc: { ar: "بلاط بورسلان للأرضيات؛ خيارات التشطيب والمقاس حسب المتوفر.", en: "Porcelain flooring; finishes and sizes vary with availability." }, price: null, img: 12340558, origin: { ar: "حسب التشكيلة", en: "Range dependent" }, rating: null, reviews: 0, stock: null, dim: "مقاسات متعددة", mat: { ar: "بورسلان", en: "Porcelain" }, warranty: null },
  { id: "AS-4003", cat: "tiles", name: { ar: "سيراميك حوائط", en: "Ceramic wall tiles" }, desc: { ar: "تصاميم للجدران الداخلية؛ نسّق اللون مع أرضية الحمام.", en: "Interior wall designs; coordinate the colour with your bathroom floor." }, price: null, img: 12340558, origin: { ar: "حسب التشكيلة", en: "Range dependent" }, rating: null, reviews: 0, stock: null, dim: "مقاسات متعددة", mat: { ar: "سيراميك", en: "Ceramic" }, warranty: null },
  { id: "AS-4004", cat: "tiles", name: { ar: "بلاط بتأثير الرخام", en: "Marble-look tiles" }, desc: { ar: "مظهر رخامي بتشكيلات متعددة؛ يرجى تأكيد المقاس والكمية.", en: "Marble-inspired designs; confirm size and required quantity." }, price: null, img: 6394610, origin: { ar: "حسب التشكيلة", en: "Range dependent" }, rating: null, reviews: 0, stock: null, dim: "مقاسات متعددة", mat: { ar: "سيراميك / بورسلان", en: "Ceramic / porcelain" }, warranty: null },
  { id: "AS-4005", cat: "tiles", name: { ar: "بلاط خارجي مانع للانزلاق", en: "Outdoor anti-slip tiles" }, desc: { ar: "خيارات للأسطح والممرات الخارجية؛ الاستخدام المناسب حسب المواصفات.", en: "Options for patios and outdoor paths; suitability depends on product specifications." }, price: null, img: 12340558, origin: { ar: "حسب التشكيلة", en: "Range dependent" }, rating: null, reviews: 0, stock: null, dim: "مقاسات متعددة", mat: { ar: "حسب الموديل", en: "Model dependent" }, warranty: null },

  { id: "AS-5001", cat: "vanities", name: { ar: "خزانة مغسلة معلقة", en: "Wall-mounted vanity unit" }, desc: { ar: "وحدة تخزين أسفل المغسلة؛ الأبعاد والتشطيب حسب الموديل.", en: "Storage beneath the basin; dimensions and finish depend on the model." }, price: null, img: 7587747, origin: { ar: "حسب الموديل", en: "Model dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب الموديل", mat: { ar: "حسب التشكيلة", en: "Range dependent" }, warranty: null },
  { id: "AS-5002", cat: "vanities", name: { ar: "مرآة حمام", en: "Bathroom mirror" }, desc: { ar: "مرايا بأحجام وتصاميم مختلفة؛ الإضاءة حسب الموديل.", en: "Mirrors in several sizes and styles; lighting varies by model." }, price: null, img: 6394610, origin: { ar: "حسب الموديل", en: "Model dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب الموديل", mat: { ar: "زجاج", en: "Glass" }, warranty: null },
  { id: "AS-5003", cat: "vanities", name: { ar: "وحدة مغسلة مع مرآة", en: "Vanity and mirror set" }, desc: { ar: "طقم متناسق للحمام؛ اسأل عن المقاسات والألوان المتوفرة.", en: "A coordinated bathroom set; ask about available sizes and colours." }, price: null, img: 7587747, origin: { ar: "حسب الموديل", en: "Model dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب الموديل", mat: { ar: "حسب التشكيلة", en: "Range dependent" }, warranty: null },
  { id: "AS-5004", cat: "vanities", name: { ar: "رفوف تخزين للحمام", en: "Bathroom storage shelves" }, desc: { ar: "حل عملي لترتيب مستلزمات الحمام؛ خيارات جدارية وأرضية.", en: "A practical way to organise bathroom essentials; wall and floor options." }, price: null, img: 6394610, origin: { ar: "حسب الموديل", en: "Model dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب الموديل", mat: { ar: "معدن / مواد مركبة", en: "Metal / composite" }, warranty: null },

  { id: "AS-6001", cat: "plumbing", name: { ar: "صندوق طرد مخفي", en: "Concealed cistern" }, desc: { ar: "يتوافق مع بعض المراحيض المعلقة؛ طابق رقم الموديل قبل الطلب.", en: "Compatible with selected wall-hung toilets; match model numbers before ordering." }, price: null, img: 11701114, origin: { ar: "حسب الموديل", en: "Model dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب الموديل", mat: { ar: "مواد مركبة + معدن", en: "Composite + metal" }, warranty: null },
  { id: "AS-6002", cat: "plumbing", name: { ar: "مصرف أرضي للحمام", en: "Bathroom floor drain" }, desc: { ar: "مصارف بأشكال ومقاسات مختلفة؛ اختر النوع قبل العزل والبلاط.", en: "Drains in different styles and sizes; select before waterproofing and tiling." }, price: null, img: 8135115, origin: { ar: "حسب الموديل", en: "Model dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب الموديل", mat: { ar: "معدن / مواد مركبة", en: "Metal / composite" }, warranty: null },
  { id: "AS-6003", cat: "plumbing", name: { ar: "سيفون وملحقات مغسلة", en: "Basin trap and fittings" }, desc: { ar: "ملحقات توصيل للمغسلة؛ تحقق من القطر وطريقة التركيب.", en: "Basin connection fittings; confirm diameter and installation type." }, price: null, img: 8135115, origin: { ar: "حسب الموديل", en: "Model dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب الموديل", mat: { ar: "معدن / مواد مركبة", en: "Metal / composite" }, warranty: null },
  { id: "AS-6004", cat: "plumbing", name: { ar: "محابس وزوايا توصيل", en: "Valves and angle fittings" }, desc: { ar: "قطع تأسيس وتوصيل للحمامات؛ المقاسات حسب نوع الشبكة.", en: "Bathroom installation fittings; sizes depend on the plumbing system." }, price: null, img: 8135115, origin: { ar: "حسب الموديل", en: "Model dependent" }, rating: null, reviews: 0, stock: null, dim: "مقاسات متعددة", mat: { ar: "معدن", en: "Metal" }, warranty: null },

  { id: "AS-7001", cat: "building", name: { ar: "لاصق بلاط", en: "Tile adhesive" }, desc: { ar: "مادة تركيب للبلاط؛ نوع اللاصق يحدد حسب السطح ومكان الاستخدام.", en: "Tile-setting adhesive; choose the type for the substrate and application." }, price: null, img: 12340558, origin: { ar: "حسب التوفر", en: "Availability dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب العبوة", mat: { ar: "خلطة إسمنتية", en: "Cement-based mix" }, warranty: null },
  { id: "AS-7002", cat: "building", name: { ar: "جراوت وفواصل بلاط", en: "Tile grout" }, desc: { ar: "مواد تعبئة للفواصل؛ الألوان والاستخدامات حسب المنتج.", en: "Grouting compounds; colour and application depend on the product." }, price: null, img: 12340558, origin: { ar: "حسب التوفر", en: "Availability dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب العبوة", mat: { ar: "خلطة إسمنتية / راتنجية", en: "Cement / resin-based mix" }, warranty: null },
  { id: "AS-7003", cat: "building", name: { ar: "عازل مائي للحمام", en: "Bathroom waterproofing" }, desc: { ar: "حلول عزل لمناطق البلل؛ اتبع دليل المنتج واستشر الفني.", en: "Waterproofing options for wet areas; follow the product guide and consult an installer." }, price: null, img: 11701114, origin: { ar: "حسب التوفر", en: "Availability dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب العبوة", mat: { ar: "حسب المنتج", en: "Product dependent" }, warranty: null },
  { id: "AS-7004", cat: "building", name: { ar: "مواد تشطيب للبلاط", en: "Tile finishing materials" }, desc: { ar: "ملحقات ومواد مساعدة لأعمال تركيب وتشطيب البلاط.", en: "Accessories and materials for tile installation and finishing." }, price: null, img: 12340558, origin: { ar: "حسب التوفر", en: "Availability dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب المنتج", mat: { ar: "حسب المنتج", en: "Product dependent" }, warranty: null },

  { id: "AS-8001", cat: "accessories", name: { ar: "حامل مناشف جداري", en: "Wall-mounted towel rail" }, desc: { ar: "إكسسوار جداري للحمام؛ التشطيب والطول حسب الموديل.", en: "A wall-mounted bathroom fitting; finish and length vary by model." }, price: null, img: 6394610, origin: { ar: "حسب الموديل", en: "Model dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب الموديل", mat: { ar: "معدن", en: "Metal" }, warranty: null },
  { id: "AS-8002", cat: "accessories", name: { ar: "رف زاوية للاستحمام", en: "Shower corner shelf" }, desc: { ar: "رف لحفظ مستلزمات الاستحمام؛ خيارات تثبيت مختلفة.", en: "A shelf for shower essentials; mounting options vary." }, price: null, img: 11701114, origin: { ar: "حسب الموديل", en: "Model dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب الموديل", mat: { ar: "معدن / مواد مركبة", en: "Metal / composite" }, warranty: null },
  { id: "AS-8003", cat: "accessories", name: { ar: "حامل ورق وملحقات", en: "Paper holder and fittings" }, desc: { ar: "إكسسوارات حمام بتشطيبات متناسقة؛ اسأل عن الطقم المتوفر.", en: "Coordinated bathroom fittings; ask about available sets." }, price: null, img: 6394610, origin: { ar: "حسب الموديل", en: "Model dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب الموديل", mat: { ar: "معدن", en: "Metal" }, warranty: null },
  { id: "AS-8004", cat: "accessories", name: { ar: "سلة مهملات وفرشاة مرحاض", en: "Bin and toilet brush set" }, desc: { ar: "ملحقات عملية للحمام؛ الألوان والخامات حسب التشكيلة.", en: "Practical bathroom accessories; colours and materials vary by range." }, price: null, img: 6492398, origin: { ar: "حسب الموديل", en: "Model dependent" }, rating: null, reviews: 0, stock: null, dim: "حسب الطقم", mat: { ar: "مواد مركبة / معدن", en: "Composite / metal" }, warranty: null },
];

export type Room = { id: string; title: Bi; sub: Bi; img: number; cat: string };

export const ROOMS: Room[] = [
  { id: "r1", title: { ar: "حمام بطابع هادئ", en: "A calm bathroom" }, sub: { ar: "تنسيق السيراميك والمغسلة والخلاطات في مساحة متوازنة.", en: "Coordinate tiles, basin and mixers for a balanced space." }, img: 11701114, cat: "sanitary" },
  { id: "r2", title: { ar: "اختيار سيراميك الأرضية", en: "Choosing floor tiles" }, sub: { ar: "قارن المقاس والتشطيب قبل حساب الكمية المطلوبة.", en: "Compare sizes and finishes before estimating quantities." }, img: 12340558, cat: "tiles" },
  { id: "r3", title: { ar: "تجهيز منطقة المغسلة", en: "Planning the vanity area" }, sub: { ar: "تأكد من توافق الخلاط والمغسلة ووحدة التخزين.", en: "Check that the mixer, basin and storage unit work together." }, img: 7587747, cat: "vanities" },
  { id: "r4", title: { ar: "دش بتفاصيل عملية", en: "A practical shower" }, sub: { ar: "اختيار الخلاط والتصريف والكابينة يبدأ من قياسات المكان.", en: "Choose the mixer, drain and enclosure based on site measurements." }, img: 6492398, cat: "showers" },
  { id: "r5", title: { ar: "تفاصيل الحنفيات", en: "Mixer and tap details" }, sub: { ar: "التشطيب وطريقة التركيب والتوافق مع التمديدات مهمة.", en: "Finish, installation type and plumbing compatibility matter." }, img: 8135115, cat: "faucets" },
  { id: "r6", title: { ar: "تأسيس قبل التشطيب", en: "Plan before finishing" }, sub: { ar: "حدد مواقع الصرف والتوصيلات قبل البلاط والعزل.", en: "Plan drains and connections before waterproofing and tiling." }, img: 6394610, cat: "plumbing" },
  { id: "r7", title: { ar: "لمسات الحمام الأخيرة", en: "Finishing touches" }, sub: { ar: "إكسسوارات عملية تكمل الاستخدام اليومي.", en: "Practical accessories for everyday use." }, img: 6394610, cat: "accessories" },
];

export type Story = { id: string; tag: Bi; title: Bi; text: Bi; img: number };

export const STORIES: Story[] = [
  { id: "s1", tag: { ar: "اختيار المنتج", en: "Product selection" }, title: { ar: "كيف تختار المرحاض المناسب؟", en: "Choosing the right toilet" }, text: { ar: "قارن شكل التصريف، طريقة التركيب، المساحة المتاحة وتوافق صندوق الطرد قبل الشراء.", en: "Compare the outlet, installation type, available space and cistern compatibility before buying." }, img: 6492398 },
  { id: "s2", tag: { ar: "السيراميك", en: "Tiles" }, title: { ar: "احسب كمية البلاط بدقة", en: "Estimate tile quantities carefully" }, text: { ar: "قِس المساحة وأضف نسبة احتياط مناسبة للقص والهدر، واستشر فني التركيب للمقاسات المعقدة.", en: "Measure the area, allow for cuts and waste, and ask your installer about complex layouts." }, img: 12340558 },
  { id: "s3", tag: { ar: "الخلاطات", en: "Mixers" }, title: { ar: "طابق الخلاط مع المغسلة", en: "Match the mixer to the basin" }, text: { ar: "ارتفاع الخلاط ومدى وصول الماء مهمان؛ راجع مواصفات المغسلة قبل اختيار الموديل.", en: "Mixer height and reach matter; check the basin specifications before selecting a model." }, img: 8135115 },
  { id: "s4", tag: { ar: "الدش", en: "Showers" }, title: { ar: "جهّز الدش قبل إغلاق الجدار", en: "Plan a concealed shower before closing the wall" }, text: { ar: "حدد الخلاط والمخارج والملحقات المطلوبة مبكراً، وتأكد من تعليمات التركيب.", en: "Select the mixer, outlets and fittings early, and follow the installation instructions." }, img: 11701114 },
  { id: "s5", tag: { ar: "التشطيب", en: "Finishing" }, title: { ar: "اختر مواد التركيب حسب السطح", en: "Choose installation materials for the surface" }, text: { ar: "لاصق البلاط ومواد الفواصل والعزل تختلف حسب نوع السطح ومكان الاستخدام.", en: "Tile adhesive, grout and waterproofing products vary with the substrate and application." }, img: 12340558 },
  { id: "s6", tag: { ar: "المساعدة", en: "Get help" }, title: { ar: "أرسل قياسات مشروعك", en: "Share your project measurements" }, text: { ar: "جهّز المقاسات وصور المكان والموديلات المطلوبة ليسهل على فريق الصداقة مساعدتك في الاستفسار.", en: "Have measurements, site photos and preferred models ready so the Assadaka team can help with your enquiry." }, img: 7587747 },
];

export const FAQ_KEYS = ["faq1", "faq2", "faq3", "faq4"] as const;

export const HERO_STATS = [
  { value: "IDEAL", key: "hero.stat1" },
  { value: "TURKUAZ", key: "hero.stat2" },
  { value: "CeraStyle", key: "hero.stat3" },
  { value: "LY", key: "hero.stat4" },
];

export const TICKER_KEYS = ["ticker.brands", "ticker.original", "ticker.warranty", "ticker.delivery", "ticker.new", "ticker.contact"];
