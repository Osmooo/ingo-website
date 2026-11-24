/**
 * Storefront content: everything a marketer changes (messages, banners, offers, badges, trust details).
 * Code reads this file only; change the content here, not in the components.
 *
 * Built to move into Odoo 1:1 (see reports/Saudi roasters ecommerce patterns.md):
 *   slides        → Odoo "Carousel" block, one slide per entry, text kept as real text (translatable)
 *   values        → Odoo "Cards Grid" / icon features block
 *   ribbons       → Odoo product ribbons (New / Sale / Sold out…)
 *   promotions    → Odoo Discount & Loyalty programs (codes, buy X get Y, free shipping), with dates
 *   trust         → Odoo footer (company VAT / CR fields)
 *
 * Dates: every message, slide and banner can have `start` / `end` (YYYY-MM-DD, inclusive). Outside those
 * dates it hides by itself, so seasonal offers (Ramadan, Founding Day, National Day, White Friday) can be
 * prepared in advance and never stay up by mistake.
 */
import type { Text } from "./products";
import { asset } from "@/lib/asset";

export interface Dated {
  /** first day it shows (YYYY-MM-DD); empty = from now */
  start?: string;
  /** last day it shows (YYYY-MM-DD); empty = no end */
  end?: string;
  /** switch off without deleting */
  hidden?: boolean;
}

/** Is this item live today? */
export function isLive(item: Dated, today = new Date()) {
  if (item.hidden) return false;
  const day = today.toISOString().slice(0, 10);
  if (item.start && day < item.start) return false;
  if (item.end && day > item.end) return false;
  return true;
}

/* ---------------- shop banner slider ---------------- */

export type SlideTheme = "cream" | "orange" | "dark";

export interface Slide extends Dated {
  id: string;
  eyebrow?: Text;
  title: Text;
  body?: Text;
  cta: { label: Text; to: string };
  /** photo behind/next to the text; if empty, the `art` drawing is used */
  image?: string;
  /** product drawing when there is no photo */
  art?: "bags" | "instant";
  theme: SlideTheme;
}

export const slides: Slide[] = [
  {
    id: "roastery",
    eyebrow: { ar: "من محمصتنا", en: "From our roastery" },
    title: { ar: "حبوب مختصة من محمصتنا", en: "Specialty beans from our roastery" },
    body: { ar: "حبوب مختصة نحمّصها ونغلّفها بأنفسنا، بثلاثة أحجام.", en: "Specialty beans we roast and pack ourselves, in three sizes." },
    cta: { label: { ar: "تسوّق الحبوب", en: "Shop beans" }, to: "/shop?cat=beans#products" },
    image: asset("img/roastery/pour-cooling-tray.webp"),
    theme: "dark",
  },
  {
    id: "instant",
    eyebrow: { ar: "سريعة التحضير", en: "Instant range" },
    title: { ar: "قهوة مختصة جاهزة في ثوانٍ", en: "Specialty coffee, ready in seconds" },
    body: { ar: "أعواد وأكياس تقطير، تحضّرها في البيت أو الدوام.", en: "Sticks and drip bags to make at home or at work." },
    cta: { label: { ar: "تسوّق المنتجات السريعة", en: "Shop instant" }, to: "/shop?cat=instant#products" },
    art: "instant",
    theme: "orange",
  },
  {
    id: "bnpl",
    eyebrow: { ar: "ادفع براحتك", en: "Pay your way" },
    title: { ar: "قسّمها على 4 دفعات بدون فوائد", en: "Split it into 4 interest-free payments" },
    body: { ar: "مع تابي وتمارا، أو ادفع بمدى وفيزا وماستركارد.", en: "With Tabby or Tamara, or pay with mada, Visa and Mastercard." },
    cta: { label: { ar: "ابدأ التسوق", en: "Start shopping" }, to: "/shop#products" },
    art: "bags",
    theme: "cream",
  },
  // seasonal template: fill in the offer, set the dates, and it appears on its own during that window
  {
    id: "white-friday",
    eyebrow: { ar: "الجمعة البيضاء", en: "White Friday" },
    title: { ar: "عروض الجمعة البيضاء", en: "White Friday offers" },
    body: { ar: "اكتب تفاصيل العرض هنا.", en: "Write the offer details here." },
    cta: { label: { ar: "تسوّق العروض", en: "Shop the offers" }, to: "/shop#products" },
    image: asset("img/roastery/beans-in-bag.webp"),
    theme: "dark",
    hidden: true,
  },
];

/* ---------------- value strip under the banners ---------------- */

export type ValueIcon = "roast" | "saudi" | "truck" | "split" | "secure";

export const values: { icon: ValueIcon; title: Text; body: Text }[] = [
  { icon: "roast", title: { ar: "نحمّص بأنفسنا", en: "Roasted in-house" }, body: { ar: "في محمصة إن قو", en: "At the INGO roastery" } },
  { icon: "saudi", title: { ar: "صناعة سعودية", en: "Saudi made" }, body: { ar: "علامة قهوة سعودية", en: "A Saudi coffee brand" } },
  { icon: "truck", title: { ar: "توصيل 2–5 أيام عمل", en: "Delivery in 2–5 days" }, body: { ar: "لجميع مناطق المملكة", en: "Across Saudi Arabia" } },
  { icon: "split", title: { ar: "4 دفعات بدون فوائد", en: "4 interest-free payments" }, body: { ar: "مع تابي وتمارا", en: "With Tabby and Tamara" } },
  { icon: "secure", title: { ar: "دفع آمن", en: "Secure payment" }, body: { ar: "مدى، فيزا، ماستركارد", en: "mada, Visa, Mastercard" } },
];

/* ---------------- product ribbons (badges on product cards) ---------------- */

export type RibbonTone = "new" | "sale" | "best" | "soldout";

/** product id → ribbon. Empty until you decide which products get one. */
export const ribbons: Record<string, { label: Text; tone: RibbonTone } | undefined> = {
  // example: "black-mountain": { label: { ar: "الأكثر مبيعاً", en: "Best seller" }, tone: "best" },
};

/* ---------------- trust details for the footer ---------------- */

/** Shown in the footer only when filled in. */
export const trust = {
  vatNumber: "",
  crNumber: "",
  whatsapp: "", // international format without +, e.g. 9665XXXXXXXX
};
