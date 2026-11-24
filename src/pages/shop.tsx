import { useLayoutEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { AboutIngo, RoasteryStory, SloganBand, WhyIngo } from "@/components/site/brand-sections";
import { Display, Eyebrow } from "@/components/site/section-heading";
import { OfferBannerBlock, PromoSlider, ValueStrip } from "@/components/store/storefront-blocks";
import { CategoryTabs, type Filter } from "@/components/store/collection-tiles";
import { CompareTable } from "@/components/store/compare-table";
import { ProductCard } from "@/components/store/product-card";
import { ShopTheSet } from "@/components/store/shop-the-set";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flip, gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n";
import { PRODUCTS } from "@/lib/products";
import { usePageTitle } from "@/lib/use-title";

type Sort = "default" | "low" | "high";
const fromPrice = (id: string) => Math.min(...PRODUCTS.find((p) => p.id === id)!.sizes.map((s) => s.price));

export default function Shop() {
  const { t, count } = useI18n();
  usePageTitle(t("title.shop"));
  const [params, setParams] = useSearchParams();
  const filter = (params.get("cat") as Filter) || "all";
  const sort = (params.get("sort") as Sort) || "default";

  const grid = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  // order: every product is always rendered; filtered-out ones are hidden so Flip can animate them out/in
  const ordered = useMemo(() => {
    const list = [...PRODUCTS];
    if (sort === "low") list.sort((a, b) => fromPrice(a.id) - fromPrice(b.id));
    if (sort === "high") list.sort((a, b) => fromPrice(b.id) - fromPrice(a.id));
    return list;
  }, [sort]);
  const visible = ordered.filter((p) => filter === "all" || p.cat === filter);

  const update = (next: { cat?: Filter; sort?: Sort }) => {
    if (grid.current && !prefersReducedMotion()) flipState.current = Flip.getState(grid.current.querySelectorAll("[data-flip-id]"));
    const cat = next.cat ?? filter;
    const s = next.sort ?? sort;
    const p: Record<string, string> = {};
    if (cat !== "all") p.cat = cat;
    if (s !== "default") p.sort = s;
    setParams(p, { replace: true });
  };

  // Flip: animate cards from their previous layout to the new one (blocks 2 / 6)
  useLayoutEffect(() => {
    const state = flipState.current;
    if (!state) return;
    flipState.current = null;
    Flip.from(state, {
      duration: 0.7, ease: "ingo", absolute: true, nested: true,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.5 }),
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.9, duration: 0.35 }),
      onComplete: () => ScrollTrigger.refresh(),
    });
    // the page gets shorter when fewer cards show; keep the grid in view instead of jumping past it
    const top = grid.current?.getBoundingClientRect().top ?? 0;
    if (top < 80) window.scrollBy({ top: top - 120, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [filter, sort]);

  // first reveal of the grid as it scrolls in (ScrollTrigger.batch)
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.set(".card-in", { autoAlpha: 0, y: 40 });
    ScrollTrigger.batch(".card-in", {
      start: "top 90%", once: true,
      onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, stagger: 0.1, overwrite: true }),
    });
  }, { scope: grid });

  return (
    <>
      {/* the storefront top, laid out like the leading Saudi roaster stores: title, banners, value strip.
          All banner/offer content lives in lib/storefront.ts (one Odoo block per section). */}
      <section className="pt-6 md:pt-10">
        <div className="container-ingo">
          <Eyebrow>{t("shop.eyebrow")}</Eyebrow>
          <h1 className="mt-2 text-3xl leading-[1.2] md:text-5xl"><Display text={t("shop.title")} /></h1>
          <div className="mt-6"><PromoSlider heading={t("shop.offers")} /></div>
          <div className="mt-6"><ValueStrip /></div>
        </div>
      </section>

      <section id="products" className="scroll-mt-21 pt-10 pb-4 md:pt-14" aria-live="polite">
        <div className="container-ingo">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <CategoryTabs value={filter} onChange={(cat) => update({ cat })} />
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground tabular-nums">{count(visible.length, "product")}</span>
              <Select value={sort} onValueChange={(v) => update({ sort: v as Sort })}>
                <SelectTrigger className="h-10 w-48 rounded-full bg-card" aria-label={t("store.sort")}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">{t("store.sort.default")}</SelectItem>
                  <SelectItem value="low">{t("store.sort.low")}</SelectItem>
                  <SelectItem value="high">{t("store.sort.high")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div ref={grid} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ordered.map((p) => {
              const show = filter === "all" || p.cat === filter;
              return (
                <div key={p.id} data-flip-id={p.id} className="card-in" style={show ? undefined : { display: "none" }} aria-hidden={!show}>
                  <ProductCard p={p} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <OfferBannerBlock />
      <RoasteryStory />
      <ShopTheSet />
      <CompareTable />
      <SloganBand />
      <div className="pt-20 md:pt-28"><WhyIngo /></div>
      <AboutIngo />
    </>
  );
}
