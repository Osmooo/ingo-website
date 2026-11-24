import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { PackArt } from "@/components/brand/pack-art";
import { RevealHeading } from "@/components/store/reveal-heading";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n";
import { useMotion } from "@/lib/motion";
import { findProduct, priceOf } from "@/lib/products";
import { cn } from "@/lib/utils";

/** The three bags as they sit together in the hero; each has a hotspot (block 12). */
const SET = [
  { id: "ethiopia", w: "250g", pos: "start-[2%] bottom-[6%] w-[30%] -rotate-6", spot: { top: "38%", start: "50%" } },
  { id: "signature", w: "1kg", pos: "start-[32%] bottom-[10%] z-10 w-[36%]", spot: { top: "30%", start: "50%" } },
  { id: "daily", w: "500g", pos: "end-[2%] bottom-[6%] w-[29%] rotate-6", spot: { top: "36%", start: "50%" } },
] as const;

/** Block 12 — "shop the look": hotspots on the bag trio, a popover card, a synced item list, and add-all. */
export function ShopTheSet() {
  const { t, L, money, sz } = useI18n();
  const { paused } = useMotion();
  const cart = useCart();
  const [active, setActive] = useState(1);
  const root = useRef<HTMLElement>(null);
  const artRefs = useRef<(HTMLDivElement | null)[]>([]);

  const items = SET.map((s) => ({ ...s, p: findProduct(s.id)! }));
  const total = items.reduce((sum, i) => sum + priceOf(i.p, i.w), 0);

  // looping pulse on the hotspot rings: decorative, stops with the page's motion switch / reduced motion
  useGSAP(() => {
    if (paused || prefersReducedMotion()) return;
    gsap.to(".spot-ring", { scale: 1.9, autoAlpha: 0, duration: 1.6, ease: "power2.out", repeat: -1, stagger: { each: 0.35, repeat: -1 } });
  }, { scope: root, dependencies: [paused], revertOnUpdate: true });

  const { contextSafe } = useGSAP({ scope: root });
  const pick = contextSafe((i: number) => {
    setActive(i);
    if (prefersReducedMotion()) return;
    gsap.fromTo(".set-card", { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45 });
    gsap.fromTo(artRefs.current[i], { y: 0 }, { y: -10, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" });
  });

  const addAll = () => {
    items.forEach((i) => cart.add(i.id, i.w));
    toast.success(t("store.set.added"), { action: { label: t("shop.view"), onClick: () => cart.setOpen(true) } });
  };

  const cur = items[active];

  return (
    <section ref={root} className="py-16 md:py-24">
      <div className="container-ingo grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr]">
        {/* the scene */}
        <div className="relative h-[340px] overflow-hidden rounded-[2rem] bg-secondary ring-1 ring-border md:h-[460px]">
          <div aria-hidden className="absolute inset-x-[10%] bottom-[4%] h-8 rounded-[50%] bg-[rgba(150,70,20,.22)] blur-2xl" />
          {items.map((i, n) => (
            <div key={i.id} ref={(el) => { artRefs.current[n] = el; }} className={cn("absolute", i.pos)}>
              <PackArt kind="bag" size={i.w} className="h-auto w-full drop-shadow-[0_24px_24px_rgba(150,70,20,.25)]" />
              <button
                type="button"
                onClick={() => pick(n)}
                aria-pressed={active === n}
                aria-label={t("store.set.open", { x: `${L(i.p.name)} ${sz(i.w)}` })}
                className="absolute grid size-9 -translate-x-1/2 place-items-center rounded-full bg-foreground text-background shadow-lg outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 rtl:translate-x-1/2"
                style={{ top: i.spot.top, insetInlineStart: i.spot.start }}
              >
                <span aria-hidden className="spot-ring absolute inset-0 rounded-full border-2 border-foreground" />
                <Plus aria-hidden className={cn("size-4 transition-transform", active === n && "rotate-45")} />
              </button>
            </div>
          ))}
          {/* popover card for the selected bag */}
          <div className="set-card absolute top-4 end-4 w-56 rounded-2xl bg-card p-4 shadow-xl ring-1 ring-border" aria-live="polite">
            <p className="text-xs font-bold text-flame-ink">{L(cur.p.tagline)} · {sz(cur.w)}</p>
            <p className="mt-1 text-lg font-light leading-snug">{L(cur.p.name)}</p>
            <p className="text-sm text-muted-foreground">{L(cur.p.notes)}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-extrabold tabular-nums">{money(priceOf(cur.p, cur.w))}</span>
              <Link to={`/shop/${cur.id}`} className="text-sm font-bold underline-offset-4 hover:underline">{t("store.details")}</Link>
            </div>
          </div>
        </div>

        {/* synced list + add all */}
        <div>
          <RevealHeading text={t("store.set.title")} className="text-4xl leading-[1.2] md:text-5xl" />
          <p className="mt-3 text-lg font-light text-muted-foreground">{t("store.set.sub")}</p>
          <ul className="mt-6 grid gap-2">
            {items.map((i, n) => (
              <li key={i.id}>
                <button
                  type="button"
                  onClick={() => pick(n)}
                  aria-pressed={active === n}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl border p-3 text-start outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    active === n ? "border-foreground bg-card" : "border-border bg-background hover:bg-card",
                  )}
                >
                  <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-secondary p-1.5" aria-hidden>
                    <PackArt kind="bag" size={i.w} />
                  </span>
                  <span className="flex-1">
                    <span className="block font-bold">{L(i.p.name)}</span>
                    <span className="text-sm text-muted-foreground">{L(i.p.tagline)} · {sz(i.w)}</span>
                  </span>
                  <span className="font-extrabold tabular-nums">{money(priceOf(i.p, i.w))}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-secondary px-5 py-4">
            <span className="font-medium">{t("store.set.total")}</span>
            <span className="text-2xl font-extrabold tabular-nums">{money(total)}</span>
          </div>
          <Button onClick={addAll} size="lg" className="mt-4 h-14 w-full rounded-full bg-orange text-base font-bold text-foreground hover:bg-flame">
            <ShoppingBag aria-hidden className="size-5" /> {t("store.set.addAll")}
          </Button>
        </div>
      </div>
    </section>
  );
}
