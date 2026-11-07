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
  { id: "living", name: { ar: "أثاث المنزل", en: "Home furniture" }, tagline: { ar: "كنب، كراسي وطاولات أوروبية", en: "European sofas, chairs & tables" }, img: 7587779, accent: "#0058a3" },
  { id: "appliances", name: { ar: "الأجهزة الكهربائية", en: "Appliances" }, tagline: { ar: "ثلاجات، غسالات وأفران أصلية", en: "Genuine fridges, washers & ovens" }, img: 12475122, accent: "#111114" },
  { id: "kitchen", name: { ar: "المطبخ والمائدة", en: "Kitchen & table" }, tagline: { ar: "أواني، أطباق وأدوات طهي", en: "Cookware, tableware & utensils" }, img: 10117725, accent: "#c0392b" },
  { id: "diy", name: { ar: "العدة والبريكولاج", en: "Tools & DIY" }, tagline: { ar: "شواحن، طقم عدة ورشة", en: "Drills, tool sets & workshop gear" }, img: 6790036, accent: "#e6a700" },
  { id: "bedroom", name: { ar: "غرف النوم", en: "Bedrooms" }, tagline: { ar: "أسرّة، خزائن وتسريحات", en: "Beds, wardrobes & dressers" }, img: 7587809, accent: "#5b6b8c" },
  { id: "storage", name: { ar: "التخزين والتنظيم", en: "Storage" }, tagline: { ar: "خزائن، رفوف وصناديق", en: "Cabinets, shelving & boxes" }, img: 11112749, accent: "#1f7a4d" },
  { id: "bath", name: { ar: "الحمام والتنظيف", en: "Bath & cleaning" }, tagline: { ar: "وحدات حمام ومستلزمات نظافة", en: "Vanities & cleaning supplies" }, img: 30986990, accent: "#0f7d8c" },
  { id: "decor", name: { ar: "الإضاءة والديكور", en: "Lighting & decor" }, tagline: { ar: "مصابيح، سجاد ومزهريات", en: "Lamps, rugs & vases" }, img: 39340297, accent: "#8a5a2b" },
];

export type Product = {
  id: string;
  cat: string;
  name: Bi;
  desc: Bi;
  price: number;
  old?: number;
  img: number;
  origin: Bi;
  rating: number;
  reviews: number;
  stock: number;
  dim: string;
  mat: Bi;
  warranty: number;
  badge?: "new" | "offer" | "best" | "import";
};

export const PRODUCTS: Product[] = [
  // ── أثاث المنزل ─────────────────────────────────────────────
  { id: "TL-1001", cat: "living", name: { ar: "كنبة نورديك 3 مقاعد", en: "NORDLY 3-seat sofa" }, desc: { ar: "قماش بلجيكي مضاد للبقع وهيكل خشب زان مصمت.", en: "Belgian stain-resistant fabric on a solid beech frame." }, price: 4250, old: 4900, img: 7061396, origin: { ar: "بولندا", en: "Poland" }, rating: 4.8, reviews: 62, stock: 7, dim: "212×92×84 cm", mat: { ar: "قماش + خشب زان", en: "Fabric + beech" }, warranty: 24, badge: "best" },
  { id: "TL-1002", cat: "living", name: { ar: "كرسي جلد طبيعي", en: "BRUNO leather armchair" }, desc: { ar: "جلد إيطالي مدبوغ بأرجل خشب جوز.", en: "Tanned Italian leather with walnut legs." }, price: 1890, img: 11112727, origin: { ar: "إيطاليا", en: "Italy" }, rating: 4.7, reviews: 31, stock: 4, dim: "78×82×90 cm", mat: { ar: "جلد طبيعي", en: "Full grain leather" }, warranty: 24 },
  { id: "TL-1003", cat: "living", name: { ar: "كرسي استرخاء رمادي", en: "GRÅ lounge armchair" }, desc: { ar: "مسند ظهر مائل للراحة مع قاعدة خشبية.", en: "Reclined backrest for comfort on a wooden base." }, price: 980, old: 1180, img: 11112735, origin: { ar: "البرتغال", en: "Portugal" }, rating: 4.5, reviews: 18, stock: 12, dim: "70×76×88 cm", mat: { ar: "قماش كتاني", en: "Linen blend" }, warranty: 12, badge: "offer" },
  { id: "TL-1004", cat: "living", name: { ar: "كرسي طعام خشبي", en: "EKVED dining chair" }, desc: { ar: "مقعد مبطن قابل للغسل، يتحمل حتى 140 كغ.", en: "Washable padded seat, rated up to 140 kg." }, price: 340, img: 11112733, origin: { ar: "ألمانيا", en: "Germany" }, rating: 4.6, reviews: 44, stock: 26, dim: "45×52×94 cm", mat: { ar: "خشب بلوط", en: "Oak" }, warranty: 12, badge: "new" },
  { id: "TL-1005", cat: "living", name: { ar: "ركنة معيشة عصرية", en: "Modern living corner set" }, desc: { ar: "طقم ركنة مع طاولة جانبية وإضاءة أرضية.", en: "Corner set with side table and floor light." }, price: 6400, img: 17264327, origin: { ar: "تركيا", en: "Türkiye" }, rating: 4.9, reviews: 27, stock: 2, dim: "280×170 cm", mat: { ar: "قماش مخملي", en: "Velvet" }, warranty: 24, badge: "import" },
  // ── الأجهزة الكهربائية ─────────────────────────────────────
  { id: "TL-2001", cat: "appliances", name: { ar: "ثلاجة نوفروست 540 لتر", en: "No-frost fridge 540 L" }, desc: { ar: "بابين، نظام تبريد مزدوج وكفاءة طاقة A++.", en: "Double door, twin cooling and A++ efficiency." }, price: 4250, old: 4700, img: 6593607, origin: { ar: "إيطاليا", en: "Italy" }, rating: 4.8, reviews: 53, stock: 5, dim: "70×75×186 cm", mat: { ar: "ستانلس ستيل", en: "Stainless steel" }, warranty: 24, badge: "best" },
  { id: "TL-2002", cat: "appliances", name: { ar: "غسالة أوتوماتيك 8 كغ", en: "Automatic washer 8 kg" }, desc: { ar: "1400 لفة، 15 برنامج غسيل ومحرك إنفرتر هادئ.", en: "1400 rpm, 15 programs and a quiet inverter motor." }, price: 2890, img: 5816934, origin: { ar: "بولندا", en: "Poland" }, rating: 4.6, reviews: 39, stock: 8, dim: "60×58×85 cm", mat: { ar: "ستانلس + بلاستيك ABS", en: "Steel + ABS" }, warranty: 24 },
  { id: "TL-2003", cat: "appliances", name: { ar: "فرن بلت-إن كهربائي", en: "Built-in electric oven" }, desc: { ar: "8 وظائف، شواية كهربائية وزجاج ثلاثي عازل.", en: "8 functions, electric grill and triple insulated glass." }, price: 2450, img: 28463547, origin: { ar: "إسبانيا", en: "Spain" }, rating: 4.5, reviews: 21, stock: 6, dim: "60×57×60 cm", mat: { ar: "ستانلس ستيل", en: "Stainless steel" }, warranty: 24 },
  { id: "TL-2004", cat: "appliances", name: { ar: "ميكروويف 25 لتر", en: "Microwave 25 L" }, desc: { ar: "قدرة 900 واط مع 5 مستويات وشواية.", en: "900 W output, 5 levels and grill function." }, price: 690, old: 820, img: 16927363, origin: { ar: "ألمانيا", en: "Germany" }, rating: 4.3, reviews: 47, stock: 19, dim: "48×38×29 cm", mat: { ar: "مطلي أمان", en: "Enamel coated" }, warranty: 12, badge: "offer" },
  { id: "TL-2005", cat: "appliances", name: { ar: "آلة إسبريسو احترافية", en: "Professional espresso machine" }, desc: { ar: "ضغط 20 بار مع بخار للحليب وهيكل ستانلس.", en: "20-bar pressure, milk steam wand, steel body." }, price: 1290, img: 36573009, origin: { ar: "إيطاليا", en: "Italy" }, rating: 4.9, reviews: 35, stock: 9, dim: "33×28×31 cm", mat: { ar: "ستانلس ستيل", en: "Stainless steel" }, warranty: 24, badge: "new" },
  { id: "TL-2006", cat: "appliances", name: { ar: "إبريق قهوة بالتنقيط", en: "Filter coffee brewer" }, desc: { ar: "12 فنجان مع قاعدة تسخين تحافظ على الحرارة.", en: "12 cups with a keep-warm heating plate." }, price: 380, img: 37552794, origin: { ar: "هولندا", en: "Netherlands" }, rating: 4.4, reviews: 26, stock: 22, dim: "24×17×34 cm", mat: { ar: "زجاج + ستانلس", en: "Glass + steel" }, warranty: 12 },
  { id: "TL-2007", cat: "appliances", name: { ar: "باقة مطبخ متكاملة", en: "Complete kitchen package" }, desc: { ar: "فرن + شفاط + طباخ غاز — تركيب مجاني في طرابلس.", en: "Oven + hood + gas cooker, free fitting in Tripoli." }, price: 7900, old: 9100, img: 30554290, origin: { ar: "إيطاليا", en: "Italy" }, rating: 4.7, reviews: 14, stock: 3, dim: "حسب المخطط", mat: { ar: "ستانلس ستيل", en: "Stainless steel" }, warranty: 24, badge: "offer" },
  // ── المطبخ والمائدة ────────────────────────────────────────
  { id: "TL-3001", cat: "kitchen", name: { ar: "طقم أواني طهي 12 قطعة", en: "12-piece cookware set" }, desc: { ar: "قاعدة ثلاثية الطبقات تناسب كل أنواع المواقد.", en: "Tri-ply base suited to all hob types." }, price: 890, old: 1050, img: 16927367, origin: { ar: "إيطاليا", en: "Italy" }, rating: 4.7, reviews: 58, stock: 14, dim: "ø16–24 cm", mat: { ar: "ستانلس 18/10", en: "18/10 stainless" }, warranty: 12, badge: "best" },
  { id: "TL-3002", cat: "kitchen", name: { ar: "طقم سلطانيات سيراميك", en: "Ceramic bowl set" }, desc: { ar: "3 قطع بأحجام مختلفة، آمنة في غسالة الصحون.", en: "Three sizes, dishwasher safe." }, price: 180, img: 6246099, origin: { ar: "البرتغال", en: "Portugal" }, rating: 4.5, reviews: 33, stock: 40, dim: "ø14/18/22 cm", mat: { ar: "سيراميك مزجج", en: "Glazed stoneware" }, warranty: 6 },
  { id: "TL-3003", cat: "kitchen", name: { ar: "طقم شاي مزخرف", en: "Decorated tea set" }, desc: { ar: "إبريق مع 6 فناجين وصحن تقديم.", en: "Pot with 6 cups and a serving plate." }, price: 260, img: 18273385, origin: { ar: "تركيا", en: "Türkiye" }, rating: 4.6, reviews: 19, stock: 25, dim: "1.4 لتر", mat: { ar: "بورسلين", en: "Porcelain" }, warranty: 6, badge: "new" },
  { id: "TL-3004", cat: "kitchen", name: { ar: "طقم أطباق وزجاجيات 24 قطعة", en: "24-piece plate & glass set" }, desc: { ar: "أطباق مقسّاة وكؤوس كريستال شفافة.", en: "Tempered plates and clear crystal glasses." }, price: 420, img: 5556176, origin: { ar: "فرنسا", en: "France" }, rating: 4.4, reviews: 22, stock: 17, dim: "24 قطعة", mat: { ar: "زجاج مقسى", en: "Tempered glass" }, warranty: 6 },
  { id: "TL-3005", cat: "kitchen", name: { ar: "صواني تقديم سيراميك", en: "Ceramic serving trays" }, desc: { ar: "3 صواني بيضاء بتصميم إسكندنافي بسيط.", en: "Three white trays in a simple Nordic shape." }, price: 150, img: 3756655, origin: { ar: "الدنمارك", en: "Denmark" }, rating: 4.2, reviews: 12, stock: 31, dim: "ø20–30 cm", mat: { ar: "سيراميك", en: "Ceramic" }, warranty: 6 },
  { id: "TL-3006", cat: "kitchen", name: { ar: "قدر طهي سيراميك", en: "Ceramic cooking pot" }, desc: { ar: "يحتفظ بالحرارة طويلاً — مناسب للطبخ البطيء.", en: "Holds heat for long, ideal for slow cooking." }, price: 210, img: 27569266, origin: { ar: "إسبانيا", en: "Spain" }, rating: 4.5, reviews: 16, stock: 20, dim: "3.5 لتر", mat: { ar: "سيراميك مطلي", en: "Coated ceramic" }, warranty: 6 },
  // ── العدة والبريكولاج ──────────────────────────────────────
  { id: "TL-4001", cat: "diy", name: { ar: "شاحن لاسلكي 18 فولت", en: "18 V cordless drill" }, desc: { ar: "بطاريتان ليثيوم + حقيبة عدة وشاحن سريع.", en: "Two lithium batteries, case and fast charger." }, price: 780, old: 940, img: 5974048, origin: { ar: "ألمانيا", en: "Germany" }, rating: 4.8, reviews: 71, stock: 15, dim: "22×8×24 cm", mat: { ar: "ABS + فولاذ", en: "ABS + steel" }, warranty: 24, badge: "best" },
  { id: "TL-4002", cat: "diy", name: { ar: "طقم عدة 108 قطعة", en: "108-piece tool set" }, desc: { ar: "مفكات، مفاتيح ربط، كماشة وقطع في حقيبة.", en: "Screwdrivers, wrenches, pliers in a carry case." }, price: 540, img: 4889065, origin: { ar: "تركيا", en: "Türkiye" }, rating: 4.6, reviews: 49, stock: 18, dim: "108 قطعة", mat: { ar: "كروم-فاناديوم", en: "Chrome vanadium" }, warranty: 12 },
  { id: "TL-4003", cat: "diy", name: { ar: "طقم ريش مثقاب", en: "Drill bit set" }, desc: { ar: "ريش خشب وحديد وخرسانة في منظم خشبي.", en: "Wood, metal and masonry bits in a wooden organiser." }, price: 190, img: 6790036, origin: { ar: "بولندا", en: "Poland" }, rating: 4.4, reviews: 28, stock: 34, dim: "42 قطعة", mat: { ar: "HSS مطلي تيتانيوم", en: "Titanium HSS" }, warranty: 6, badge: "new" },
  { id: "TL-4004", cat: "diy", name: { ar: "مثقاب مطرقة لاسلكي", en: "Cordless hammer driver" }, desc: { ar: "عزم دوران 60 نيوتن مع ضوء LED مدمج.", en: "60 Nm torque with a built-in LED light." }, price: 620, img: 8130011, origin: { ar: "ألمانيا", en: "Germany" }, rating: 4.5, reviews: 24, stock: 11, dim: "24×9×26 cm", mat: { ar: "ألمنيوم + مطاط", en: "Aluminium + rubber" }, warranty: 24 },
  { id: "TL-4005", cat: "diy", name: { ar: "حقيبة ورشة منزلية", en: "Home workshop kit" }, desc: { ar: "كل ما يلزم لتركيب الأثاث والصيانة المنزلية.", en: "Everything for furniture assembly and home repairs." }, price: 1350, old: 1580, img: 6920105, origin: { ar: "إيطاليا", en: "Italy" }, rating: 4.7, reviews: 17, stock: 6, dim: "طقم كامل", mat: { ar: "عدة مواد", en: "Mixed" }, warranty: 12, badge: "offer" },
  // ── غرف النوم ──────────────────────────────────────────────
  { id: "TL-5001", cat: "bedroom", name: { ar: "طقم غرفة نوم أوروبي", en: "European bedroom set" }, desc: { ar: "سرير + خزانة + تسريحة + طاولتان جانبيتان.", en: "Bed, wardrobe, dresser and two nightstands." }, price: 8900, old: 10200, img: 6920444, origin: { ar: "بولندا", en: "Poland" }, rating: 4.9, reviews: 23, stock: 2, dim: "180×200 cm", mat: { ar: "MDF مطلي + خشب", en: "Lacquered MDF + wood" }, warranty: 24, badge: "import" },
  { id: "TL-5002", cat: "bedroom", name: { ar: "خزانة ملابس 4 أبواب", en: "4-door wardrobe" }, desc: { ar: "مرايا داخلية وقضبان تعليق مزدوجة.", en: "Internal mirrors and double hanging rails." }, price: 3600, img: 6489100, origin: { ar: "ألمانيا", en: "Germany" }, rating: 4.6, reviews: 19, stock: 4, dim: "240×60×220 cm", mat: { ar: "خشب مضغوط", en: "Engineered wood" }, warranty: 24 },
  { id: "TL-5003", cat: "bedroom", name: { ar: "تسريحة بمرايا", en: "Dresser with mirror" }, desc: { ar: "خمسة أدراج مع إضاءة LED حول المرايا.", en: "Five drawers with LED lighting around the mirror." }, price: 1980, img: 6903206, origin: { ar: "إيطاليا", en: "Italy" }, rating: 4.5, reviews: 15, stock: 7, dim: "120×45×160 cm", mat: { ar: "خشب لامع", en: "Glossy wood" }, warranty: 12 },
  { id: "TL-5004", cat: "bedroom", name: { ar: "طقم غرفة بإضاءة دافئة", en: "Warm-light bedroom accent" }, desc: { ar: "كرسي قراءة مع مصباح طاولة بضوء دافئ.", en: "Reading chair with a warm table lamp." }, price: 1240, img: 39584894, origin: { ar: "الدنمارك", en: "Denmark" }, rating: 4.4, reviews: 11, stock: 9, dim: "طقم قطعتين", mat: { ar: "قماش + خشب", en: "Fabric + wood" }, warranty: 12, badge: "new" },
  // ── التخزين ────────────────────────────────────────────────
  { id: "TL-6001", cat: "storage", name: { ar: "خزانة بأدراج قش", en: "Cabinet with wicker drawers" }, desc: { ar: "أبواب شرائح خشبية مع أدراج قش طبيعية.", en: "Slatted wooden doors with natural wicker drawers." }, price: 1480, img: 11112749, origin: { ar: "الدنمارك", en: "Denmark" }, rating: 4.7, reviews: 29, stock: 10, dim: "80×40×120 cm", mat: { ar: "خشب + قش", en: "Wood + rattan" }, warranty: 12, badge: "best" },
  { id: "TL-6002", cat: "storage", name: { ar: "وحدة تخزين مفتوحة", en: "Open storage unit" }, desc: { ar: "رفوف مفتوحة وسلال قابلة للسحب.", en: "Open shelves with pull-out baskets." }, price: 1120, img: 11112750, origin: { ar: "هولندا", en: "Netherlands" }, rating: 4.5, reviews: 18, stock: 13, dim: "70×35×110 cm", mat: { ar: "خشب صنوبر", en: "Pine" }, warranty: 12 },
  { id: "TL-6003", cat: "storage", name: { ar: "صناديق تخزين بأغطية", en: "Storage boxes with lids" }, desc: { ar: "طقم شفاف قابل للتكديس، محكم الإغلاق.", en: "Stackable airtight transparent set." }, price: 95, old: 130, img: 13968282, origin: { ar: "إيطاليا", en: "Italy" }, rating: 4.3, reviews: 64, stock: 55, dim: "طقم 6 قطع", mat: { ar: "بولي بروبيلين", en: "Polypropylene" }, warranty: 6, badge: "offer" },
  { id: "TL-6004", cat: "storage", name: { ar: "سلة تخزين مضفرة", en: "Woven storage basket" }, desc: { ar: "ألياف طبيعية بمقابض — للأدراج والخزائن.", en: "Natural fibre with handles, for drawers and shelves." }, price: 120, img: 10557895, origin: { ar: "إسبانيا", en: "Spain" }, rating: 4.4, reviews: 25, stock: 42, dim: "ø35×25 cm", mat: { ar: "ألياف طبيعية", en: "Natural fibre" }, warranty: 6 },
  { id: "TL-6005", cat: "storage", name: { ar: "مكتب برفوف جدارية", en: "Desk with wall shelving" }, desc: { ar: "ركن عمل مضغوط مع تخزين عمودي.", en: "Compact work corner with vertical storage." }, price: 1150, img: 9646747, origin: { ar: "بولندا", en: "Poland" }, rating: 4.6, reviews: 20, stock: 8, dim: "120×60×180 cm", mat: { ar: "خشب مطلي", en: "Lacquered wood" }, warranty: 12, badge: "new" },
  // ── الحمام والتنظيف ─────────────────────────────────────────
  { id: "TL-7001", cat: "bath", name: { ar: "وحدة حمام رخامية", en: "Marble bathroom vanity" }, desc: { ar: "حوض سيراميك مع خزائن بلمسات ذهبية.", en: "Ceramic basin with gold-accent cabinets." }, price: 2340, img: 30986990, origin: { ar: "إيطاليا", en: "Italy" }, rating: 4.8, reviews: 13, stock: 3, dim: "90×50×85 cm", mat: { ar: "رخام صناعي", en: "Engineered marble" }, warranty: 24, badge: "import" },
  { id: "TL-7002", cat: "bath", name: { ar: "طقم تنظيف المنزل", en: "Home cleaning kit" }, desc: { ar: "بخاخات، فراشي ومناشف ميكروفايبر.", en: "Sprays, brushes and microfibre cloths." }, price: 110, img: 9225633, origin: { ar: "ألمانيا", en: "Germany" }, rating: 4.2, reviews: 38, stock: 60, dim: "طقم 8 قطع", mat: { ar: "بلاستيك + ميكروفايبر", en: "Plastic + microfibre" }, warranty: 6 },
  { id: "TL-7003", cat: "bath", name: { ar: "بخاخ تنظيف متعدد", en: "Multi-purpose spray bottle" }, desc: { ar: "قابل لإعادة التعبئة بفوهة رغوية.", en: "Refillable with a foaming nozzle." }, price: 45, img: 12997254, origin: { ar: "تركيا", en: "Türkiye" }, rating: 4.1, reviews: 52, stock: 88, dim: "750 مل", mat: { ar: "بلاستيك معاد تدويره", en: "Recycled plastic" }, warranty: 6 },
  { id: "TL-7004", cat: "bath", name: { ar: "منظف رغوي مع فرشاة", en: "Foam cleaner with brush" }, desc: { ar: "للأسطح الصعبة والمطابخ والحمامات.", en: "For tough surfaces, kitchens and bathrooms." }, price: 65, img: 9230357, origin: { ar: "إسبانيا", en: "Spain" }, rating: 4.3, reviews: 30, stock: 47, dim: "500 مل", mat: { ar: "منظف + فرشاة", en: "Cleaner + brush" }, warranty: 6 },
  // ── الإضاءة والديكور ───────────────────────────────────────
  { id: "TL-8001", cat: "decor", name: { ar: "مصباح طاولة خشبي", en: "Wooden table lamp" }, desc: { ar: "قاعدة بلوط معتق مع ظِل كتاني دافئ.", en: "Aged oak base with a warm linen shade." }, price: 340, img: 38986381, origin: { ar: "السويد", en: "Sweden" }, rating: 4.7, reviews: 24, stock: 16, dim: "ø22×45 cm", mat: { ar: "بلوط + كتان", en: "Oak + linen" }, warranty: 12, badge: "new" },
  { id: "TL-8002", cat: "decor", name: { ar: "مصباح مكتب موجه", en: "Adjustable desk lamp" }, desc: { ar: "ذراع متحرك وثلاث درجات إضاءة LED.", en: "Movable arm with three LED levels." }, price: 290, old: 350, img: 38986380, origin: { ar: "الدنمارك", en: "Denmark" }, rating: 4.5, reviews: 31, stock: 21, dim: "18×40 cm", mat: { ar: "ألمنيوم", en: "Aluminium" }, warranty: 12, badge: "offer" },
  { id: "TL-8003", cat: "decor", name: { ar: "سجادة صوف منسوجة", en: "Hand-woven wool rug" }, desc: { ar: "نسيج تقليدي بألوان دافئة، 160×230 سم.", en: "Traditional weave in warm tones, 160×230 cm." }, price: 760, img: 38317548, origin: { ar: "تركيا", en: "Türkiye" }, rating: 4.8, reviews: 27, stock: 6, dim: "160×230 cm", mat: { ar: "صوف 100%", en: "100% wool" }, warranty: 12, badge: "best" },
  { id: "TL-8004", cat: "decor", name: { ar: "مزهريات وديكور طاولة", en: "Vases & tabletop decor" }, desc: { ar: "طقم مزهريات سيراميك مع سنابل مجففة.", en: "Ceramic vase set with dried wheat stems." }, price: 230, img: 39340297, origin: { ar: "البرتغال", en: "Portugal" }, rating: 4.4, reviews: 15, stock: 24, dim: "طقم 3 قطع", mat: { ar: "سيراميك", en: "Ceramic" }, warranty: 6 },
  { id: "TL-8005", cat: "decor", name: { ar: "كرسي أصفر بلمسة إسكندنافية", en: "Yellow Nordic accent chair" }, desc: { ar: "قطعة مميزة لغرفة المعيشة أو ركن القراءة.", en: "A statement piece for the living or reading corner." }, price: 870, img: 33948970, origin: { ar: "السويد", en: "Sweden" }, rating: 4.6, reviews: 21, stock: 5, dim: "62×68×80 cm", mat: { ar: "قماش + خشب", en: "Fabric + wood" }, warranty: 12, badge: "import" },
];

export type Room = { id: string; title: Bi; sub: Bi; img: number; pieces: number; cat: string };

export const ROOMS: Room[] = [
  { id: "r1", title: { ar: "الصالون الإسكندنافي", en: "The Scandinavian lounge" }, sub: { ar: "ألوان فاتحة، خشب دافئ وقطعة صفراء واحدة.", en: "Pale colours, warm wood and one yellow piece." }, img: 7614608, pieces: 34, cat: "living" },
  { id: "r2", title: { ar: "المطبخ الأوروبي", en: "The European kitchen" }, sub: { ar: "أجهزة بلت-إن وأسطح عمل عملية.", en: "Built-in appliances and practical worktops." }, img: 37070074, pieces: 48, cat: "appliances" },
  { id: "r3", title: { ar: "غرفة نوم هادئة", en: "A calm bedroom" }, sub: { ar: "تخزين مخفي وإضاءة دافئة للنوم العميق.", en: "Hidden storage and warm light for deep sleep." }, img: 10117732, pieces: 27, cat: "bedroom" },
  { id: "r4", title: { ar: "ركن العمل والدراسة", en: "Work & study corner" }, sub: { ar: "مكتب مضغوط ورفوف جدارية تنظيمية.", en: "A compact desk with organisational wall shelves." }, img: 9646747, pieces: 19, cat: "storage" },
  { id: "r5", title: { ar: "الحمام الفاخر", en: "The luxury bathroom" }, sub: { ar: "رخام، لمسات ذهبية ووحدات تخزين ذكية.", en: "Marble, golden accents and smart storage." }, img: 30986990, pieces: 22, cat: "bath" },
  { id: "r6", title: { ar: "معيشة العائلة", en: "Family living" }, sub: { ar: "مساحة مفتوحة تتحمل الاستعمال اليومي.", en: "An open space built for daily family life." }, img: 6890405, pieces: 41, cat: "living" },
  { id: "r7", title: { ar: "المدخل والتخزين", en: "Entry & storage" }, sub: { ar: "رفوف مفتوحة وسلة لكل شيء.", en: "Open shelving and a basket for everything." }, img: 6487951, pieces: 16, cat: "storage" },
];

export type Story = { id: string; tag: Bi; title: Bi; text: Bi; img: number };

export const STORIES: Story[] = [
  { id: "s1", tag: { ar: "من أوروبا", en: "From Europe" }, title: { ar: "رحلة حاوية من ميناء جنوة", en: "A container's journey from Genoa" }, text: { ar: "40 يوماً من المصنع الإيطالي إلى ميناء طرابلس، كل قطعة موثقة ومفحوصة.", en: "40 days from an Italian factory to Tripoli port, every piece documented and checked." }, img: 19918358 },
  { id: "s2", tag: { ar: "الجودة", en: "Quality" }, title: { ar: "فحص ما قبل الشحن", en: "Pre-shipment inspection" }, text: { ar: "نفحص كل جهاز ونشغّله قبل ما يدخل الحاوية — ما نوصلش بضاعة تالفة.", en: "We test every appliance before it enters the container — no damaged goods arrive." }, img: 4792512 },
  { id: "s3", tag: { ar: "التركيب", en: "Installation" }, title: { ar: "فريق التركيب في طرابلس", en: "The fitting crew in Tripoli" }, text: { ar: "فنيون مدربون يركّبون الأثاث ويوصلون الأجهزة في نفس يوم التسليم.", en: "Trained technicians assemble furniture and connect appliances on delivery day." }, img: 6232443 },
  { id: "s4", tag: { ar: "البريكولاج", en: "DIY" }, title: { ar: "ورشة الحرفي الليبي", en: "The Libyan craftsman's workshop" }, text: { ar: "عدة أوروبية محترفة في يد حرفي محلي — نتائج تدوم سنوات.", en: "Professional European tools in local hands — results that last for years." }, img: 7285926 },
  { id: "s5", tag: { ar: "الأقمشة", en: "Textiles" }, title: { ar: "اختيار الأقمشة بعناية", en: "Choosing fabrics with care" }, text: { ar: "أقمشة تتحمل حرارة الصيف الليبي واستعمال العائلات اليومي.", en: "Fabrics that stand up to Libyan summers and daily family use." }, img: 6480206 },
  { id: "s6", tag: { ar: "المعرض", en: "Showroom" }, title: { ar: "معرضنا قرب البحر", en: "Our showroom by the sea" }, text: { ar: "في قلب طرابلس، على خطوات من شارع الجمهورية — تعالى عاين قبل ما تطلب.", en: "In the heart of Tripoli, steps from Jumhuriya Street — come and see before you order." }, img: 21999720 },
];

export const FAQ_KEYS = ["faq1", "faq2", "faq3", "faq4"] as const;

export const HERO_STATS = [
  { value: "+1,200", key: "hero.stat1" },
  { value: "38", key: "hero.stat2" },
  { value: "11", key: "hero.stat3" },
  { value: "22", key: "hero.stat4" },
];

export const TICKER_KEYS = ["ticker.eu", "ticker.original", "ticker.warranty", "ticker.delivery", "ticker.new", "ticker.whatsapp"];
