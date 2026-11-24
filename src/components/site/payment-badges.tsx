import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { asset } from "@/lib/asset";
import { CONFIG } from "@/lib/config";

/**
 * Official acceptance marks in /public/img/pay:
 * Apple Pay, mada, Visa, Mastercard: public-domain SVGs from Wikimedia Commons.
 * Tabby: the badge from Tabby's developer site. Tamara: the badges from Tamara's CDN (Arabic + English).
 * Always shown on a white chip so each brand keeps its own colours on any background.
 */
export const PAY_LOGOS = {
  applepay: { src: asset("img/pay/applepay.svg"), alt: "Apple Pay", h: "h-4" },
  mada: { src: asset("img/pay/mada.svg"), alt: "mada", h: "h-3.5" },
  visa: { src: asset("img/pay/visa.svg"), alt: "Visa", h: "h-3" },
  mastercard: { src: asset("img/pay/mastercard.svg"), alt: "Mastercard", h: "h-5" },
  tabby: { src: asset("img/pay/tabby.svg"), alt: "Tabby", h: "h-5" },
  tamara: { src: asset("img/pay/tamara-en.svg"), alt: "Tamara", h: "h-5" },
} as const;
export type PayLogoId = keyof typeof PAY_LOGOS;

export function PayLogo({ id, className }: { id: PayLogoId; className?: string }) {
  const { lang } = useI18n();
  const l = PAY_LOGOS[id];
  const src = id === "tamara" && lang === "ar" ? asset("img/pay/tamara-ar.svg") : l.src;
  return <img src={src} alt={l.alt} loading="lazy" decoding="async" className={cn("w-auto", l.h, className)} />;
}

const ORDER: PayLogoId[] = [...(CONFIG.applePay ? (["applepay"] as const) : []), "mada", "visa", "mastercard", "tabby", "tamara"];

export function PaymentBadges({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)} aria-label={ORDER.join(", ")}>
      {ORDER.map((id) => (
        <li key={id} className={cn("grid h-8 min-w-12 place-items-center rounded-md bg-white px-2.5", dark ? "" : "ring-1 ring-border")}>
          <PayLogo id={id} />
        </li>
      ))}
    </ul>
  );
}

/** "Or 4 interest-free payments of X with Tabby / Tamara" line for product, cart and checkout. */
export function SplitNote({ amount, className }: { amount: number; className?: string }) {
  const { t, money } = useI18n();
  const part = Math.ceil((amount / 4) * 100) / 100;
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm", className)}>
      <span>{t("bnpl.note", { x: money(part) })}</span>
      <span className="inline-flex items-center gap-1.5">
        <span className="grid h-6 place-items-center rounded bg-white px-1.5 ring-1 ring-border"><PayLogo id="tabby" className="h-3.5" /></span>
        <span className="grid h-6 place-items-center rounded bg-white px-1.5 ring-1 ring-border"><PayLogo id="tamara" className="h-4" /></span>
      </span>
    </p>
  );
}
