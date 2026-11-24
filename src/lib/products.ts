/**
 * INGO catalog. Bean coffees, notes, process, variety, body, roast level and brew methods come from INGO's
 * own labels; descriptions are written from those plus what is known about each origin.
 * PRICES are still placeholders until the real price list arrives.
 * `art` picks the packaging illustration; bean bags change colour by size (1kg = orange, like the real bag).
 */
export type Lang = "ar" | "en";
export type Text = Record<Lang, string>;
export type ArtKind = "bag" | "box" | "drip";

export interface Size {
  w: string;
  price: number;
}

export interface Product {
  id: string;
  cat: "beans" | "instant";
  art: ArtKind;
  name: Text;
  tagline: Text;
  lines: Record<Lang, [string, string]>;
  notes: Text;
  description: Text;
  accent: string;
  sizes: Size[];
  /** size featured in the home showcase */
  featured: string;
  /** label artwork in /public (path without leading slash); products without one use the drawn package */
  image?: string;
  /** coffee details printed on the label */
  specs?: {
    origin: Text;
    process: Text;
    variety: Text;
    body: Text;
    /** roast level on the label's 7-step scale (1 = lightest) */
    roast: number;
    brew: ("filter" | "espresso")[];
  };
}

export const PRODUCTS: Product[] = [
  {
    id: "bella-guji", cat: "beans", art: "bag", accent: "#C9521A", featured: "250g",
    image: "img/products/bella-guji.jpg",
    name: { ar: "بيلا قوجي", en: "Bella Guji" },
    tagline: { ar: "إثيوبيا · مجففة", en: "Ethiopia · Natural" },
    lines: { ar: ["بيلا", "قوجي"], en: ["Bella", "Guji"] },
    notes: { ar: "كرز · خوخ · زهور", en: "Berries · Peach · Floral" },
    description: {
      ar: "من منطقة قوجي في جنوب إثيوبيا، وهي من أشهر مناطق القهوة المختصة. حبوب من سلالات إثيوبية محلية (هيرلوم) مجففة بالطريقة الطبيعية داخل الثمرة، فيطلع طعمها فاكهي حلو: كرز وخوخ مع لمسة زهرية، بقوام متوسط. تحميص فاتح إلى متوسط، وتنفع للتقطير والإسبريسو.",
      en: "From the Guji zone of southern Ethiopia, one of the best-known specialty coffee regions. Local Ethiopian heirloom varieties, dried naturally inside the cherry, give a sweet, fruity cup: berries and peach with a floral touch and a medium body. A light-to-medium roast for filter and espresso.",
    },
    specs: {
      origin: { ar: "إثيوبيا", en: "Ethiopia" },
      process: { ar: "مجففة (طبيعية)", en: "Natural" },
      variety: { ar: "هيرلوم", en: "Heirloom" },
      body: { ar: "قوام متوسط", en: "Medium body" },
      roast: 3,
      brew: ["filter", "espresso"],
    },
    sizes: [ { w: "250g", price: 59 }, { w: "500g", price: 109 }, { w: "1kg", price: 199 } ],
  },
  {
    id: "santa-ana", cat: "beans", art: "bag", accent: "#8A5A2B", featured: "250g",
    image: "img/products/santa-ana.jpg",
    name: { ar: "سانتا آنا", en: "Santa Ana" },
    tagline: { ar: "السلفادور · مغسولة", en: "El Salvador · Washed" },
    lines: { ar: ["سانتا", "آنا"], en: ["Santa", "Ana"] },
    notes: { ar: "شوكولاتة · كرز أحمر · بندق", en: "Chocolate · Red berry · Hazelnut" },
    description: {
      ar: "من السلفادور، تحمل اسم منطقة سانتا آنا وبركانها، من أشهر مناطق زراعة القهوة في البلد. حبوب مغسولة من مزيج سلالات، طعمها نظيف ومتوازن: شوكولاتة وكرز أحمر وبندق، بقوام متوسط. تحميص متوسط يناسب التقطير والإسبريسو.",
      en: "From El Salvador, named after the Santa Ana region and its volcano, one of the country's best-known coffee areas. A washed mix of varieties with a clean, balanced cup: chocolate, red berry and hazelnut with a medium body. A medium roast for filter and espresso.",
    },
    specs: {
      origin: { ar: "السلفادور", en: "El Salvador" },
      process: { ar: "مغسولة", en: "Washed" },
      variety: { ar: "مزيج سلالات", en: "Mixed varieties" },
      body: { ar: "قوام متوسط", en: "Medium body" },
      roast: 4,
      brew: ["filter", "espresso"],
    },
    sizes: [ { w: "250g", price: 49 }, { w: "500g", price: 89 }, { w: "1kg", price: 165 } ],
  },
  {
    id: "black-mountain", cat: "beans", art: "bag", accent: "#1F3A2C", featured: "1kg",
    image: "img/products/black-mountain.jpg",
    name: { ar: "الجبل الأسود", en: "Black Mountain" },
    tagline: { ar: "البرازيل · مجففة", en: "Brazil · Natural" },
    lines: { ar: ["الجبل", "الأسود"], en: ["Black", "Mountain"] },
    notes: { ar: "مكسرات · شوكولاتة داكنة · بندق", en: "Nuts · Dark chocolate · Hazelnut" },
    description: {
      ar: "من منطقة موجيانا في البرازيل، المعروفة بقهوتها الحلوة قليلة الحموضة. حبوب مجففة بالطريقة الطبيعية، طعمها مكسرات وشوكولاتة داكنة وبندق، بقوام غني. تحميص متوسط، وتنفع للتقطير والإسبريسو.",
      en: "From Brazil's Mogiana region, known for sweet, low-acidity coffee. Naturally processed beans with notes of nuts, dark chocolate and hazelnut, and a rich body. A medium roast for filter and espresso.",
    },
    specs: {
      origin: { ar: "البرازيل", en: "Brazil" },
      process: { ar: "مجففة (طبيعية)", en: "Natural" },
      variety: { ar: "موجيانا", en: "Mogiana" },
      body: { ar: "قوام غني", en: "Rich body" },
      roast: 4,
      brew: ["filter", "espresso"],
    },
    sizes: [ { w: "250g", price: 45 }, { w: "500g", price: 85 }, { w: "1kg", price: 155 } ],
  },
  {
    id: "instant", cat: "instant", art: "box", accent: "#EE8A2E", featured: "10×",
    name: { ar: "قهوة مختصة سريعة", en: "Instant Specialty" },
    tagline: { ar: "سريعة التحضير", en: "Instant" },
    lines: { ar: ["قهوة مختصة", "سريعة"], en: ["Instant", "Specialty"] },
    notes: { ar: "10 أعواد · ماء حار أو بارد", en: "10 sticks · hot or cold water" },
    description: {
      ar: "قهوة مختصة في عود واحد. أضف الماء الحار أو البارد وقهوتك جاهزة في ثوانٍ.",
      en: "Specialty coffee in a single stick. Add hot or cold water and it's ready in seconds.",
    },
    sizes: [ { w: "10×", price: 39 } ],
  },
  {
    id: "drip", cat: "instant", art: "drip", accent: "#E86E25", featured: "10×",
    name: { ar: "أكياس التقطير", en: "Drip Bags" },
    tagline: { ar: "أكياس تقطير", en: "Drip bags" },
    lines: { ar: ["أكياس", "التقطير"], en: ["Drip", "Bags"] },
    notes: { ar: "10 أكياس · بدون أدوات", en: "10 bags · no gear needed" },
    description: {
      ar: "كوب قهوة مقطرة مختصة بدون أي أدوات. علّق الكيس على الكوب واسكب الماء.",
      en: "A specialty pour-over cup without any gear. Hang the bag on your cup and pour.",
    },
    sizes: [ { w: "10×", price: 45 } ],
  },
  {
    id: "arabic", cat: "instant", art: "box", accent: "#C9521A", featured: "10×",
    name: { ar: "قهوة عربية سريعة", en: "Instant Arabic Coffee" },
    tagline: { ar: "قهوة عربية", en: "Arabic coffee" },
    lines: { ar: ["قهوة عربية", "سريعة"], en: ["Arabic", "Coffee"] },
    notes: { ar: "10 أعواد · هيل وزعفران", en: "10 sticks · cardamom & saffron" },
    description: {
      ar: "قهوتنا العربية بالهيل والزعفران، جاهزة في أعواد تحضّرها بسرعة للضيوف.",
      en: "Our Arabic coffee with cardamom and saffron, in sticks you can make quickly for guests.",
    },
    sizes: [ { w: "10×", price: 35 } ],
  },
];

export const findProduct = (id: string) => PRODUCTS.find((p) => p.id === id);
export const priceOf = (p: Product, w: string) => p.sizes.find((s) => s.w === w)?.price ?? p.sizes[0].price;
