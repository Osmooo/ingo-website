/**
 * INGO catalog. Names, notes and prices are PLACEHOLDERS until the real list arrives.
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
}

export const PRODUCTS: Product[] = [
  {
    id: "signature", cat: "beans", art: "bag", accent: "#E4601F", featured: "1kg",
    name: { ar: "سيقنتشر بلند", en: "Signature Blend" },
    tagline: { ar: "إسبريسو", en: "Espresso" },
    lines: { ar: ["سيقنتشر", "بلند"], en: ["Signature", "Blend"] },
    notes: { ar: "شوكولاتة · كراميل · مكسرات", en: "Chocolate · Caramel · Nuts" },
    description: {
      ar: "خلطتنا الأساسية للإسبريسو، قوامها كثيف وفيها نكهات شوكولاتة وكراميل. تنفع مع الحليب أو بدونه.",
      en: "Our core espresso blend, full bodied with chocolate and caramel. Works with or without milk.",
    },
    sizes: [ { w: "250g", price: 49 }, { w: "500g", price: 89 }, { w: "1kg", price: 165 } ],
  },
  {
    id: "daily", cat: "beans", art: "bag", accent: "#F29A3C", featured: "500g",
    name: { ar: "ديلي بلند", en: "Daily Blend" },
    tagline: { ar: "فلتر", en: "Filter" },
    lines: { ar: ["ديلي", "بلند"], en: ["Daily", "Blend"] },
    notes: { ar: "حمضيات · عسل · كاكاو", en: "Citrus · Honey · Cocoa" },
    description: {
      ar: "قهوة يومية متوازنة للتقطير والفرنش برس. حمضية لطيفة مع حلاوة العسل.",
      en: "A balanced everyday coffee for pour-over and French press. Gentle citrus, honey sweetness.",
    },
    sizes: [ { w: "250g", price: 45 }, { w: "500g", price: 85 }, { w: "1kg", price: 155 } ],
  },
  {
    id: "ethiopia", cat: "beans", art: "bag", accent: "#F4B88A", featured: "250g",
    name: { ar: "إثيوبيا", en: "Ethiopia" },
    tagline: { ar: "محصول مختص", en: "Single origin" },
    lines: { ar: ["إثيوبيا", "محصول مختص"], en: ["Ethiopia", "Single origin"] },
    notes: { ar: "زهري · توت · شاي أسود", en: "Floral · Berries · Black tea" },
    description: {
      ar: "محصول إثيوبي مختص بنكهات زهرية وتوت. لعشاق القهوة المقطرة.",
      en: "An Ethiopian specialty lot with floral and berry notes. For filter lovers.",
    },
    sizes: [ { w: "250g", price: 59 }, { w: "500g", price: 109 }, { w: "1kg", price: 199 } ],
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
