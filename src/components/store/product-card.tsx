import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ProductVisual } from "@/components/store/product-visual";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n";
import { ProductRibbon } from "@/components/store/storefront-blocks";
import { priceOf, type Product } from "@/lib/products";
import { cn } from "@/lib/utils";

/**
 * Shop card: size swatches (bag colour follows the size, block 3), quick-add per size on the image (block 9),
 * link to the product page, GSAP size-change and fly-to-cart.
 */
export function ProductCard({ p }: { p: Product }) {
  const { t, L, money, sz } = useI18n();
  const cart = useCart();
  const [size, setSize] = useState(p.sizes[0].w);
  const artRef = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);

  const { contextSafe } = useGSAP({ scope: root });

  const pickSize = contextSafe((w: string) => {
    if (w === size) return;
    setSize(w);
    if (!prefersReducedMotion() && artRef.current) {
      gsap.fromTo(artRef.current, { y: 14, autoAlpha: 0, rotation: -3 }, { y: 0, autoAlpha: 1, rotation: 0, duration: 0.5 });
    }
  });

  const add = (w: string) => {
    cart.add(p.id, w);
    toast.success(t("shop.added"), {
      description: `${L(p.name)} · ${sz(w)}`,
      action: { label: t("shop.view"), onClick: () => cart.setOpen(true) },
    });
  };

  return (
    <article ref={root} className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border bg-card transition-shadow duration-300 hover:shadow-[0_30px_60px_-30px_rgba(150,70,20,.45)]">
      <div className={cn("relative grid aspect-[5/4] place-items-center overflow-hidden p-8", p.cat === "beans" ? "bg-secondary" : "bg-secondary")}>
        <Link to={`/shop/${p.id}`} aria-label={`${t("store.details")} — ${L(p.name)}`} className="grid h-full w-full place-items-center outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl">
          <div ref={artRef} className="h-full transition-transform duration-500 group-hover:scale-[1.04] group-hover:-rotate-2">
            <ProductVisual p={p} size={size} className={p.image ? undefined : "drop-shadow-[0_22px_20px_rgba(150,70,20,.25)]"} />
          </div>
        </Link>
        <span className="pointer-events-none absolute top-4 start-4 rounded-full bg-card/90 px-3 py-1 text-xs font-bold text-flame-ink shadow-sm">{L(p.tagline)}</span>
        {/* badge from lib/storefront.ts (New / Best seller / Sale / Sold out); nothing shows until one is set */}
        <ProductRibbon id={p.id} className="pointer-events-none absolute top-4 end-4 shadow-sm" />

        {/* quick add: one tap per size, revealed on hover / keyboard focus; not on phones, where the sizes and add button under the image already do this and the panel would cover the label */}
        <div
          className="absolute inset-x-4 bottom-4 hidden translate-y-0 flex-wrap [@media(hover:hover)]:flex items-center justify-center gap-2 rounded-2xl bg-card/95 p-2 shadow-lg backdrop-blur transition-[opacity,transform] duration-300 [@media(hover:hover)]:translate-y-3 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-within:translate-y-0 [@media(hover:hover)]:focus-within:opacity-100"
          role="group"
          aria-label={`${t("store.quick")} — ${L(p.name)}`}
        >
          <span className="px-1 text-xs font-semibold text-muted-foreground">{t("store.quick")}</span>
          {p.sizes.map((s) => (
            <button
              key={s.w}
              type="button"
              onClick={() => add(s.w)}
              aria-label={`${t("shop.add")} ${L(p.name)} ${sz(s.w)}`}
              className="inline-flex h-8 items-center gap-1 rounded-full bg-foreground px-3 text-xs font-bold text-background outline-none transition-colors hover:bg-black focus-visible:ring-2 focus-visible:ring-orange"
            >
              <Plus aria-hidden className="size-3" /> {sz(s.w)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div>
          <h3 className="text-2xl font-light">
            <Link to={`/shop/${p.id}`} className="outline-none hover:underline focus-visible:underline">{L(p.name)}</Link>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{L(p.notes)}</p>
        </div>

        {p.sizes.length > 1 && (
          <div className="flex gap-2" role="group" aria-label={`${t("shop.size")} — ${L(p.name)}`}>
            {p.sizes.map((s) => (
              <button
                key={s.w}
                type="button"
                aria-pressed={size === s.w}
                onClick={() => pickSize(s.w)}
                className={cn(
                  "h-9 rounded-xl border px-3.5 text-sm font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  size === s.w ? "border-orange bg-orange text-foreground" : "bg-background hover:border-apricot",
                )}
              >
                {sz(s.w)}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div>
            <p className="text-2xl font-extrabold tabular-nums">{money(priceOf(p, size))}</p>
            <p className="text-xs text-muted-foreground">{t("shop.vat")}</p>
          </div>
          <Button onClick={() => add(size)} className="h-11 rounded-full px-5 font-bold">
            <Plus className="size-4" /> {t("shop.add")}
          </Button>
        </div>
      </div>
    </article>
  );
}
