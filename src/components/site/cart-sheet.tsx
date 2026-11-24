import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { PackArt } from "@/components/brand/pack-art";
import { PaymentBadges } from "@/components/site/payment-badges";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { CONFIG } from "@/lib/config";
import { useI18n } from "@/lib/i18n";
import { findProduct, priceOf } from "@/lib/products";

export function CartSheet() {
  const { t, L, money, dir, sz, num } = useI18n();
  const cart = useCart();
  const toFree = Math.max(0, CONFIG.freeShippingOver - cart.subtotal);
  const progress = Math.min(100, (cart.subtotal / CONFIG.freeShippingOver) * 100);

  return (
    <Sheet open={cart.open} onOpenChange={cart.setOpen}>
      <SheetContent side={dir === "rtl" ? "left" : "right"} className="flex w-full flex-col gap-0 bg-background p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="text-xl font-bold">{t("cart.title")}</SheetTitle>
          <SheetDescription className="sr-only">{t("cart.title")}</SheetDescription>
        </SheetHeader>

        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="grid size-20 place-items-center rounded-full bg-secondary text-flame-ink">
              <ShoppingBag className="size-9" />
            </div>
            <p className="text-lg text-muted-foreground">{t("cart.empty")}</p>
            <Button asChild className="rounded-full px-6" onClick={() => cart.setOpen(false)}>
              <Link to="/shop">{t("cart.emptyCta")}</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="border-b px-6 py-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Truck className="size-4 text-flame-ink" />
                {toFree > 0 ? t("cart.toFree", { x: money(toFree) }) : t("cart.gotFree")}
              </p>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-orange transition-[width] duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <ul className="flex-1 divide-y overflow-y-auto px-6">
              {cart.lines.map((l) => {
                const p = findProduct(l.id)!;
                const price = priceOf(p, l.w);
                return (
                  <li key={l.id + l.w} className="flex items-center gap-4 py-4">
                    <div className="grid size-18 shrink-0 place-items-center rounded-2xl bg-card p-2 ring-1 ring-border">
                      <PackArt kind={p.art} size={l.w} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{L(p.name)}</p>
                      <p className="text-sm text-muted-foreground tabular-nums">{sz(l.w)} · {money(price)}</p>
                      <div className="mt-2 inline-flex items-center rounded-full border bg-card">
                        <button className="grid size-8 place-items-center rounded-full hover:bg-secondary" aria-label={`${l.qty === 1 ? t("cart.remove") : t("cart.less")} — ${L(p.name)} ${sz(l.w)}`} onClick={() => cart.setQty(l.id, l.w, l.qty - 1)}>
                          {l.qty === 1 ? <Trash2 aria-hidden className="size-3.5" /> : <Minus aria-hidden className="size-3.5" />}
                        </button>
                        <span className="w-7 text-center text-sm font-bold tabular-nums" aria-live="polite">{num(l.qty)}</span>
                        <button className="grid size-8 place-items-center rounded-full hover:bg-secondary" aria-label={`${t("cart.more")} — ${L(p.name)} ${sz(l.w)}`} onClick={() => cart.setQty(l.id, l.w, l.qty + 1)}>
                          <Plus aria-hidden className="size-3.5" />
                        </button>
                      </div>
                    </div>
                    <span className="font-bold tabular-nums">{money(price * l.qty)}</span>
                  </li>
                );
              })}
            </ul>

            <SheetFooter className="gap-3 border-t bg-card px-6 py-5">
              <dl className="grid gap-1.5 text-sm">
                <div className="flex justify-between"><dt>{t("cart.subtotal")}</dt><dd className="tabular-nums">{money(cart.subtotal)}</dd></div>
                <div className="flex justify-between"><dt>{t("cart.shipping")}</dt><dd>{cart.shipping ? money(cart.shipping) : t("cart.free")}</dd></div>
                <div className="flex justify-between pt-1 text-lg font-bold"><dt>{t("cart.total")}</dt><dd className="tabular-nums">{money(cart.total)}</dd></div>
              </dl>
              <p className="text-xs text-muted-foreground">{t("ship.time")}</p>
              <PaymentBadges />
              <Button asChild size="lg" className="h-12 rounded-full bg-orange text-base font-bold text-foreground hover:bg-flame" onClick={() => cart.setOpen(false)}>
                <Link to="/checkout">{t("cart.checkout")}</Link>
              </Button>
              <Button asChild variant="ghost" className="h-10 rounded-full font-semibold" onClick={() => cart.setOpen(false)}>
                <Link to="/cart">{t("cart.page")}</Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
