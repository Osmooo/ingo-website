import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { PackArt } from "@/components/brand/pack-art";
import { PaymentBadges, SplitNote } from "@/components/site/payment-badges";
import { RevealHeading } from "@/components/store/reveal-heading";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { CONFIG } from "@/lib/config";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n";
import { findProduct, priceOf } from "@/lib/products";
import { usePageTitle } from "@/lib/use-title";

/** Block 11 — full cart review with a free-shipping progress bar (GSAP scaleX, transform only). */
export default function CartPage() {
  const { t, L, money, dir, sz, count, num } = useI18n();
  usePageTitle(t("title.cart"));
  const cart = useCart();
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const toFree = Math.max(0, CONFIG.freeShippingOver - cart.subtotal);
  const progress = Math.min(1, cart.subtotal / CONFIG.freeShippingOver);
  const Back = dir === "rtl" ? ArrowRight : ArrowLeft;

  useGSAP(() => {
    if (!bar.current) return;
    gsap.to(bar.current, { scaleX: progress, duration: prefersReducedMotion() ? 0 : 0.9 });
  }, { scope: root, dependencies: [progress] });

  useGSAP(() => {
    if (prefersReducedMotion() || !root.current?.querySelector(".cart-row")) return;
    gsap.from(".cart-row", { autoAlpha: 0, y: 20, stagger: 0.06, duration: 0.6 });
  }, { scope: root });

  const { contextSafe } = useGSAP({ scope: root });
  const remove = contextSafe((id: string, w: string, el: HTMLElement | null) => {
    if (!el || prefersReducedMotion()) return cart.setQty(id, w, 0);
    gsap.to(el, { autoAlpha: 0, x: dir === "rtl" ? 40 : -40, duration: 0.3, onComplete: () => cart.setQty(id, w, 0) });
  });

  return (
    <div ref={root}>
      <section className="relative -mt-18 bg-background pt-18">
        <div className="container-ingo py-12 md:py-16">
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-semibold hover:underline">
            <Back aria-hidden className="size-4" /> {t("cartp.continue")}
          </Link>
          <RevealHeading as="h1" onScroll={false} text={t("cartp.title")} className="mt-4 text-5xl leading-[1.15] md:text-6xl lg:text-7xl" />
          {cart.lines.length > 0 && <p className="mt-3 text-muted-foreground tabular-nums">{count(cart.count, "piece")}</p>}
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-ingo">
          {cart.lines.length === 0 ? (
            <div className="flex flex-col items-center gap-5 rounded-[2rem] border bg-card py-20 text-center">
              <div className="grid size-20 place-items-center rounded-full bg-secondary text-flame-ink"><ShoppingBag aria-hidden className="size-9" /></div>
              <p className="text-xl font-light">{t("cart.empty")}</p>
              <Button asChild className="rounded-full px-6"><Link to="/shop">{t("cart.emptyCta")}</Link></Button>
            </div>
          ) : (
            <div className="grid items-start gap-8 lg:grid-cols-[1.4fr_.6fr]">
              <div>
                <div className="mb-6 rounded-2xl border bg-card p-5">
                  <p className="mb-3 flex items-center gap-2 font-medium">
                    <Truck aria-hidden className="size-5 text-flame-ink" />
                    {toFree > 0 ? t("cart.toFree", { x: money(toFree) }) : t("cart.gotFree")}
                  </p>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuemin={0} aria-valuemax={CONFIG.freeShippingOver} aria-valuenow={Math.min(cart.subtotal, CONFIG.freeShippingOver)} aria-label={t("cart.shipping")}>
                    <div ref={bar} className="h-full w-full rounded-full bg-orange" style={{ transform: "scaleX(0)", transformOrigin: dir === "rtl" ? "right" : "left" }} />
                  </div>
                </div>

                <ul className="divide-y rounded-[1.75rem] border bg-card">
                  {cart.lines.map((l) => {
                    const p = findProduct(l.id)!;
                    const price = priceOf(p, l.w);
                    return (
                      <li key={l.id + l.w} className="cart-row flex flex-wrap items-center gap-5 p-5 md:flex-nowrap">
                        <Link to={`/shop/${p.id}`} className="grid size-24 shrink-0 place-items-center rounded-2xl bg-secondary p-2" aria-label={L(p.name)}>
                          <PackArt kind={p.art} size={l.w} />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link to={`/shop/${p.id}`} className="text-xl font-light hover:underline">{L(p.name)}</Link>
                          <p className="text-sm text-muted-foreground tabular-nums">{L(p.tagline)} · {sz(l.w)} · {money(price)}</p>
                        </div>
                        <div className="inline-flex items-center rounded-full border bg-background">
                          <button className="grid size-10 place-items-center rounded-full hover:bg-secondary" aria-label={`${t("cart.less")} — ${L(p.name)} ${sz(l.w)}`} onClick={() => l.qty === 1 ? remove(l.id, l.w, null) : cart.setQty(l.id, l.w, l.qty - 1)}>
                            <Minus aria-hidden className="size-4" />
                          </button>
                          <span className="w-8 text-center font-bold tabular-nums" aria-live="polite">{num(l.qty)}</span>
                          <button className="grid size-10 place-items-center rounded-full hover:bg-secondary" aria-label={`${t("cart.more")} — ${L(p.name)} ${sz(l.w)}`} onClick={() => cart.setQty(l.id, l.w, l.qty + 1)}>
                            <Plus aria-hidden className="size-4" />
                          </button>
                        </div>
                        <span className="w-24 text-end text-lg font-extrabold tabular-nums">{money(price * l.qty)}</span>
                        <button
                          className="grid size-10 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                          aria-label={`${t("cart.remove")} — ${L(p.name)} ${sz(l.w)}`}
                          onClick={(e) => remove(l.id, l.w, (e.currentTarget as HTMLElement).closest("li"))}
                        >
                          <Trash2 aria-hidden className="size-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <aside className="rounded-[1.75rem] border bg-card p-6 lg:sticky lg:top-28">
                <h2 className="text-2xl font-light">{t("cartp.summary")}</h2>
                <dl className="mt-5 grid gap-2.5">
                  <div className="flex justify-between"><dt>{t("cart.subtotal")}</dt><dd className="tabular-nums">{money(cart.subtotal)}</dd></div>
                  <div className="flex justify-between"><dt>{t("cart.shipping")}</dt><dd>{cart.shipping ? money(cart.shipping) : t("cart.free")}</dd></div>
                  <div className="flex justify-between border-t pt-3 text-xl font-bold"><dt>{t("cart.total")}</dt><dd className="tabular-nums">{money(cart.total)}</dd></div>
                </dl>
                <p className="mt-2 text-xs text-muted-foreground">{t("cartp.vat")} · {t("ship.time")}</p>
                <SplitNote amount={cart.total} className="mt-3 text-muted-foreground" />
                <Button asChild size="lg" className="mt-6 h-14 w-full rounded-full bg-orange text-base font-bold text-foreground hover:bg-flame">
                  <Link to="/checkout">{t("cart.checkout")}</Link>
                </Button>
                <p className="mt-5 mb-2 text-xs font-medium text-muted-foreground">{t("pay.accepted")}</p>
                <PaymentBadges />
              </aside>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
