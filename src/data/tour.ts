/**
 * Data for the 360° guided showroom tour.
 *
 * The photographs in /public/visite360 are cylindrical strips: 360° horizontally
 * and ~60° vertically (not full 180° equirectangular images). `vaov` is derived
 * from the real pixel ratio, so every scene is projected at its correct scale.
 *
 * Angles (`deg`) are measured on the source strip, left edge = 0°, right edge = 360°.
 * Interactive points are kept within ~35° of `facing` so they are visible as soon
 * as a scene opens, while dragging still reveals the full 360° around the camera.
 */

export type L10n = { ar: string; en: string };

export type TourPoint = {
  id: string;
  /** Position on the panorama strip, 0–360. */
  deg: number;
  /** Vertical angle in degrees, 0 = horizon. */
  pitch: number;
  title: L10n;
  text: L10n;
};

export type TourScene = {
  id: string;
  file: string;
  width: number;
  height: number;
  /** Angle the camera looks at when the scene opens. */
  facing: number;
  title: L10n;
  subtitle: L10n;
  text: L10n;
  tags: [string, string];
  tagsEn: [string, string];
  /** Where the "continue" and "go back" 3D arrows live. */
  nextDeg: number;
  prevDeg: number;
  points: TourPoint[];
};

export const tourSrc = (file: string) => `/visite360/${file}`;

/** Vertical angle of view of the strip, in degrees. */
export const vaovOf = (s: TourScene) => (360 * s.height) / s.width;

/** Convert a strip degree to a camera yaw in radians. */
export const degToYaw = (deg: number) => ((deg - 180) * Math.PI) / 180;

/** Wrap any angle into 0–360. */
export const wrapDeg = (d: number) => ((d % 360) + 360) % 360;

/**
 * CSS `object-position` percentage that centres a 16:9 thumbnail on a given
 * strip degree (the strips are ~6:1, so only ~30% of the photo is visible).
 */
export const thumbPosition = (deg: number) => {
  const f = wrapDeg(deg) / 360;
  const p = (f - 0.148) / 0.703;
  return `${Math.round(Math.max(0, Math.min(1, p)) * 100)}% center`;
};

export const TOUR_SCENES: TourScene[] = [
  {
    id: "entree",
    file: "pano1.jpg",
    width: 6485,
    height: 1066,
    facing: 62,
    title: { ar: "المدخل ومنصّة المغاسل", en: "Entrance & basin display" },
    subtitle: { ar: "أهلاً بك في المعرض", en: "Welcome to the showroom" },
    text: {
      ar: "أول ما تدخل، تستقبلك منصّات العرض بالمغاسل الفوقية والمرايا، والإضاءة معلّقة فوق كل قطعة باش تشوف الخامات بوضوح. لفّ يمين ويسار وتعرّف على ترتيب المعرض قبل ما نتحرك للمحطة اللي بعدها.",
      en: "Right at the entrance, vessel basins and mirrors sit on lit display plinths so you can see every finish clearly. Look left and right to get your bearings before we move to the next stop.",
    },
    tags: ["مغاسل فوقية", "مرايا وإضاءة"],
    tagsEn: ["Vessel basins", "Mirrors & lighting"],
    nextDeg: 96,
    prevDeg: 28,
    points: [
      {
        id: "p1-basins",
        deg: 48,
        pitch: -7,
        title: { ar: "مغاسل فوقية", en: "Vessel basins" },
        text: { ar: "موديلات بأشكال وأحجام مختلفة معروضة على منصّة خضراء — تقدر تقارن بينها من قريب.", en: "Shapes and sizes side by side on a green plinth — easy to compare up close." },
      },
      {
        id: "p1-mirror",
        deg: 78,
        pitch: -4,
        title: { ar: "مرايا ومغاسل معلّقة", en: "Mirrors & wall basins" },
        text: { ar: "مرايا دائرية ومغاسل مثبّتة على الجدار مع إضاءة علوية.", en: "Round mirrors and wall-mounted basins under overhead lighting." },
      },
    ],
  },
  {
    id: "rakh-am",
    file: "pano2.jpg",
    width: 6485,
    height: 1131,
    facing: 46,
    title: { ar: "ركن الرخام والمغاسل", en: "Marble & basin corner" },
    subtitle: { ar: "خامات وملامس", en: "Materials & finishes" },
    text: {
      ar: "هنا تبان الخامات: جدار رخام داكن، مغسلة معلّقة، ومرايا بإطارات مختلفة. المساحة مصمّمة باش تتخيّل القطعة داخل حمّامك مو بس على الرف.",
      en: "This corner is all about material: a dark marble wall, wall-hung basins and framed mirrors. The setting helps you picture the piece in your own bathroom, not just on a shelf.",
    },
    tags: ["رخام طبيعي", "مغاسل معلّقة"],
    tagsEn: ["Natural marble", "Wall-hung basins"],
    nextDeg: 80,
    prevDeg: 12,
    points: [
      {
        id: "p2-marble",
        deg: 32,
        pitch: -5,
        title: { ar: "جدار رخام", en: "Marble wall" },
        text: { ar: "تشطيب داكن مع إضاءة دافئة — فكرة جاهزة لجدار الحمّام.", en: "A dark finish with warm lighting — a ready-made idea for a feature wall." },
      },
      {
        id: "p2-basin",
        deg: 60,
        pitch: -3,
        title: { ar: "مغسلة معلّقة", en: "Wall-hung basin" },
        text: { ar: "وحدة مدمجة مع مراية ورفّ تخزين — مناسبة للمساحات الصغيرة.", en: "A compact unit with mirror and storage — made for smaller spaces." },
      },
    ],
  },
  {
    id: "accessoires",
    file: "pano3.jpg",
    width: 6413,
    height: 1070,
    facing: 218,
    title: { ar: "الخلاطات والإكسسوارات", en: "Taps & accessories" },
    subtitle: { ar: "التفاصيل تصنع الفرق", en: "The details matter" },
    text: {
      ar: "منصات العرض المائلة تعرض الخلاطات، الدشّات اليدوية، وقطع الإكسسوار جنب بعض. تقدر تقرّب الصورة وتشوف التشطيب كروم، أسود، أو ذهبي.",
      en: "Angled display stands line up mixers, hand showers and small fittings next to each other. Zoom in to compare chrome, black and brushed finishes.",
    },
    tags: ["خلاطات", "إكسسوارات"],
    tagsEn: ["Mixers", "Accessories"],
    nextDeg: 252,
    prevDeg: 184,
    points: [
      {
        id: "p3-stands",
        deg: 204,
        pitch: -8,
        title: { ar: "منصّات العرض", en: "Display stands" },
        text: { ar: "كل رف يحمل مجموعة كاملة: خلاط، دشّ، وقطع مكمّلة.", en: "Each shelf carries a complete set: mixer, shower and matching pieces." },
      },
      {
        id: "p3-sets",
        deg: 234,
        pitch: -5,
        title: { ar: "أطقم كاملة", en: "Complete sets" },
        text: { ar: "تشطيبات مختلفة مرتّبة جنب بعض للمقارنة السريعة.", en: "Different finishes lined up for a quick side-by-side comparison." },
      },
    ],
  },
  {
    id: "vitrine",
    file: "pano4.jpg",
    width: 6485,
    height: 1138,
    facing: 178,
    title: { ar: "الواجهة الزجاجية", en: "The window front" },
    subtitle: { ar: "المعرض على الشارع", en: "Open to the street" },
    text: {
      ar: "نقطة مشرقة في المنتصف: الواجهة الزجاجية المطلة على الشارع. حولها تجد كبائن الدشّ ووحدات المراحيض المعلّقة — تقدر تلفّ 360 درجة كاملة وتشوف كل الزوايا.",
      en: "A bright spot in the middle of the tour: the street-facing glass front. Around it are shower enclosures and wall-hung WC units — turn a full 360° to see every angle.",
    },
    tags: ["كبائن دشّ", "مراحيض معلّقة"],
    tagsEn: ["Shower enclosures", "Wall-hung WCs"],
    nextDeg: 212,
    prevDeg: 144,
    points: [
      {
        id: "p4-racks",
        deg: 162,
        pitch: -4,
        title: { ar: "منصّات العرض", en: "Display racks" },
        text: { ar: "خلاطات وإكسسوارات مرتّبة على رفوف مائلة قبل الواجهة.", en: "Mixers and accessories on angled racks just before the glazed front." },
      },
      {
        id: "p4-window",
        deg: 194,
        pitch: -2,
        title: { ar: "الواجهة الزجاجية", en: "Glazed front" },
        text: { ar: "ضوء النهار الطبيعي يبان على كل التشطيبات المعدنية.", en: "Natural daylight shows off every metal finish." },
      },
    ],
  },
  {
    id: "cerastyle",
    file: "pano5.jpg",
    width: 6485,
    height: 1076,
    facing: 228,
    title: { ar: "ركن CeraStyle", en: "The CeraStyle corner" },
    subtitle: { ar: "علامات مستوردة", en: "Imported brands" },
    text: {
      ar: "جدار مخصّص لمجموعات CeraStyle، بقطع مرتّبة على رفوف رمادية وتغليف أصلي. على اليمين الواجهة الزجاجية، وعلى اليسار باقي أقسام المعرض.",
      en: "A dedicated wall for CeraStyle collections, with pieces laid out on grey shelves in original packaging. The glazed front is to the right, the rest of the showroom to the left.",
    },
    tags: ["CeraStyle", "قطع أصلية"],
    tagsEn: ["CeraStyle", "Genuine pieces"],
    nextDeg: 262,
    prevDeg: 194,
    points: [
      {
        id: "p5-brand",
        deg: 214,
        pitch: -3,
        title: { ar: "CeraStyle", en: "CeraStyle" },
        text: { ar: "مغاسل وقطع صحّية مع بطاقات المواصفات.", en: "Basins and sanitaryware with their spec cards." },
      },
      {
        id: "p5-shelves",
        deg: 244,
        pitch: -6,
        title: { ar: "رفوف الموديلات", en: "Model shelves" },
        text: { ar: "كل رف يعرض موديل مختلف بالتغليف الأصلي.", en: "Each shelf shows a different model in its original packaging." },
      },
    ],
  },
  {
    id: "galerie",
    file: "pano7.jpg",
    width: 6485,
    height: 1112,
    facing: 178,
    title: { ar: "معرض القطع الصحّية", en: "Sanitaryware gallery" },
    subtitle: { ar: "قارن واختار", en: "Compare & choose" },
    text: {
      ar: "صفوف من المراحيض والمغاسل معروضة تحت شعار CeraStyle، ومعها ألواح فيها صور لتركيبات جاهزة. محطة عملية باش تقارن المقاسات قبل ما تطلب.",
      en: "Rows of WCs and basins displayed under the CeraStyle sign, with boards showing installed settings. A practical stop for comparing sizes before you order.",
    },
    tags: ["مراحيض", "مقاسات"],
    tagsEn: ["WCs", "Dimensions"],
    nextDeg: 212,
    prevDeg: 144,
    points: [
      {
        id: "p7-brand",
        deg: 164,
        pitch: -2,
        title: { ar: "CeraStyle", en: "CeraStyle" },
        text: { ar: "جدار العلامة مع وحدات العرض.", en: "The brand wall with its display units." },
      },
      {
        id: "p7-wc",
        deg: 198,
        pitch: -7,
        title: { ar: "وحدات المراحيض", en: "WC units" },
        text: { ar: "موديلات معلّقة وأرضية جنب بعض للمقارنة.", en: "Wall-hung and floor-standing models side by side." },
      },
    ],
  },
  {
    id: "baignoires",
    file: "pano8.jpg",
    width: 6485,
    height: 1140,
    facing: 88,
    title: { ar: "أحواض الاستحمام", en: "Baths & bathroom sets" },
    subtitle: { ar: "مساحات كاملة", en: "Complete settings" },
    text: {
      ar: "هنا المعرض يقدّم حمّامات كاملة مو قطع منفردة: أحواض، جدران رخام، ووحدات مغاسل مجهّزة. المحطة المفضّلة للي يخطّط لتجديد كامل.",
      en: "Here the showroom presents whole bathrooms rather than single pieces: baths, marble walls and fitted vanity units. A favourite stop if you are planning a full renovation.",
    },
    tags: ["أحواض", "تجديد كامل"],
    tagsEn: ["Bathtubs", "Full renovation"],
    nextDeg: 122,
    prevDeg: 54,
    points: [
      {
        id: "p8-bath",
        deg: 74,
        pitch: -7,
        title: { ar: "حوض استحمام", en: "Bathtub" },
        text: { ar: "حوض مستقل مع واجهة عرض مكمّلة.", en: "A freestanding bath with its own display setting." },
      },
      {
        id: "p8-wall",
        deg: 104,
        pitch: -3,
        title: { ar: "جدار تشطيبات", en: "Finish wall" },
        text: { ar: "ألواح جدارية وأفكار تنسيق للحمّام الكامل.", en: "Wall panels and coordination ideas for a full bathroom." },
      },
    ],
  },
  {
    id: "reception",
    file: "pano6.jpg",
    width: 6485,
    height: 1129,
    facing: 145,
    title: { ar: "الاستقبال ونهاية الجولة", en: "Reception & end of tour" },
    subtitle: { ar: "نكمّلوا معاك", en: "Let's finish together" },
    text: {
      ar: "وصلنا للاستقبال: مكتب الاستقبال بواجهة رخامية، برج المغاسل، ومدخل الأقسام الداخلية. هنا تقدر تحجز زيارة للمعرض أو تطلب قطعة مباشرة على واتساب — وفريقنا يجاوبك.",
      en: "We end at the reception desk: a marble-fronted counter, the basin tower and the entrance to the inner departments. From here you can book a real visit or ask about any piece on WhatsApp — our team will answer.",
    },
    tags: ["استقبال", "واتساب"],
    tagsEn: ["Reception", "WhatsApp"],
    nextDeg: 179,
    prevDeg: 111,
    points: [
      {
        id: "p6-desk",
        deg: 131,
        pitch: -6,
        title: { ar: "مكتب الاستقبال", en: "Reception desk" },
        text: { ar: "اسأل عن المقاسات، التوفر، أو التوصيل والتركيب.", en: "Ask about sizes, availability, delivery and fitting." },
      },
      {
        id: "p6-brand",
        deg: 163,
        pitch: -3,
        title: { ar: "جدار العلامات", en: "Brand wall" },
        text: { ar: "واجهة الاستقبال مع شعارات العلامات المستوردة.", en: "The reception backdrop with the imported brand logos." },
      },
    ],
  },
];

/** Duration of each stop in the auto-played guided tour (ms). */
export const SCENE_DURATION = 9500;
