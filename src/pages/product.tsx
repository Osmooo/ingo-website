import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { bagGeometry, PackArt } from "@/components/brand/pack-art";
import { Eyebrow, SectionHeading } from "@/components/site/section-heading";
import { ProductCard } from "@/components/store/product-card";
import { RevealHeading } from "@/components/store/reveal-heading";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { useI18n, type DictKey } from "@/lib/i18n";
import { findProduct, priceOf, PRODUCTS, type Product } from "@/lib/products";
import { SplitNote } from "@/components/site/payment-badges";
import { usePageTitle } from "@/lib/use-title";
import { cn } from "@/lib/utils";

type Detail = "overview" | "zipper" | "valve" | "finish" | "weight";
const DETAILS: { id: Detail; title: DictKey; body?: DictKey }[] = [
  { id: "overview", title: "pd.overview" },
  { id: "zipper", title: "pd.zipper.t", body: "pd.zipper.b" },
  { id: "valve", title: "pd.valve.t", body: "pd.valve.b" },
  { id: "finish", title: "pd.finish.t", body: "pd.finish.b" },
  { id: "weight", title: "pd.weight.t", body: "pd.weight.b" },
];

export default function ProductPage() {
  const { id } = useParams();
  const { t, L, lang } = useI18n();
  const p = findProduct(id ?? "");
  usePageTitle(p ? `${L(p.name)} | ${lang === "ar" ? "إن قو" : "INGO"}` : t("title.notFound"));
  if (!p) {
    return (
      <section className="container-ingo py-32 text-center">
        <h1 className="text-3xl font-light">{t("pd.notFound")}</h1>
        <Link to="/shop" className="mt-6 inline-block font-bold underline">{t("pd.back")}</Link>
      </section>
    );
  }
  // keyed by product: moving between products starts with fresh size / quantity / zoom state
  return <ProductView key={p.id} p={p} />;
}

function ProductView({ p }: { p: Product }) {
  const { t, L, money, dir, sz, num } = useI18n();
  const cart = useCart();
  const [size, setSize] = useState(p.featured);
  const [qty, setQty] = useState(1);
  const [detail, setDetail] = useState<Detail>("overview");

  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const zoomer = useRef<HTMLDivElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const Back = dir === "rtl" ? ArrowRight : ArrowLeft;

  // entrance: gallery and info rise in once
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.from(".pd-in", { y: 30, autoAlpha: 0, stagger: 0.08, duration: 0.8 });
  }, { scope: root });

  const { contextSafe } = useGSAP({ scope: root });

  /** Block 15 — zoom the photo to a labelled detail: centre the point and scale up (transform only). */
  const zoomTo = contextSafe((d: Detail, s = size) => {
    setDetail(d);
    if (!stage.current || !zoomer.current || !art.current) return;
    const reduce = prefersReducedMotion();
    if (d === "overview" || p.art !== "bag") {
      gsap.to(zoomer.current, { x: 0, y: 0, scale: 1, duration: reduce ? 0 : 0.8 });
      return;
    }
    const pt = bagGeometry(s).points[d];
    const st = stage.current.getBoundingClientRect();
    // measure the art at scale 1 (offset within the zoomer does not change with the transform origin at 0 0)
    const a = art.current.getBoundingClientRect();
    const z = zoomer.current.getBoundingClientRect();
    const cur = (gsap.getProperty(zoomer.current, "scale") as number) || 1;
    const ax = (a.left - z.left) / cur, ay = (a.top - z.top) / cur, aw = a.width / cur, ah = a.height / cur;
    const cx = ax + (pt.x / 100) * aw, cy = ay + (pt.y / 100) * ah;
    const S = 2.6;
    gsap.to(zoomer.current, { transformOrigin: "0 0", scale: S, x: st.width / 2 - cx * S, y: st.height / 2 - cy * S, duration: reduce ? 0 : 0.9 });
    if (!reduce) gsap.fromTo(".pd-caption", { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, delay: 0.25 });
  });

  const pickSize = contextSafe((w: string) => {
    if (w === size) return;
    setSize(w);
    if (detail !== "overview") requestAnimationFrame(() => zoomTo(detail, w));
    if (!prefersReducedMotion() && art.current) gsap.fromTo(art.current, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5 });
  });

  const price = priceOf(p, size);
  const isBag = p.art === "bag";
  const current = DETAILS.find((d) => d.id === detail)!;
  const marker = isBag && detail !== "overview" ? bagGeometry(size).points[detail] : null;
  const related = [...PRODUCTS.filter((x) => x.id !== p.id && x.cat === p.cat), ...PRODUCTS.filter((x) => x.cat !== p.cat)].slice(0, 3);

  const add = () => {
    const line = cart.lines.find((l) => l.id === p.id && l.w === size);
    if (line) cart.setQty(p.id, size, line.qty + qty);
    else { cart.add(p.id, size); if (qty > 1) cart.setQty(p.id, size, qty); }
    toast.success(t("shop.added"), {
      description: `${L(p.name)} · ${sz(size)} × ${num(qty)}`,
      action: { label: t("shop.view"), onClick: () => cart.setOpen(true) },
    });
  };

  return (
    <div ref={root}>
      <section className="relative -mt-18 bg-background pt-18">
        <div className="container-ingo py-10 md:py-14">
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-semibold hover:underline">
            <Back aria-hidden className="size-4" /> {t("pd.back")}
          </Link>

          <div className="mt-6 grid items-start gap-10 lg:grid-cols-[1.05fr_.95fr]">
            {/* gallery + labelled zoom (blocks 13 + 15) */}
            <div className="pd-in">
              <div ref={stage} className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-card ring-1 ring-border md:aspect-square">
                <div ref={zoomer} className="absolute inset-0 grid place-items-center will-change-transform">
                  <div ref={art} className="relative h-[78%]">
                    <PackArt kind={p.art} size={isBag ? size : undefined} className="drop-shadow-[0_30px_30px_rgba(150,70,20,.28)]" />
                    {marker && (
                      <span aria-hidden className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-flame shadow" style={{ left: `${marker.x}%`, top: `${marker.y}%` }} />
                    )}
                  </div>
                </div>
                {isBag && current.body && (
                  <div className="pd-caption absolute inset-x-4 bottom-4 rounded-2xl bg-card/95 p-4 shadow-lg backdrop-blur" aria-live="polite">
                    <p className="font-bold">{t(current.title)}</p>
                    <p className="text-sm text-muted-foreground">{t(current.body, { x: sz(size) })}</p>
                  </div>
                )}
              </div>

              {isBag && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium text-muted-foreground">{t("pd.zoomHint")}</p>
                  <div className="flex flex-wrap gap-2" role="group" aria-label={t("pd.details")}>
                    {DETAILS.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        aria-pressed={detail === d.id}
                        onClick={() => zoomTo(d.id)}
                        className={cn(
                          "h-10 rounded-full border px-4 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                          detail === d.id ? "border-foreground bg-foreground text-background" : "bg-card hover:border-apricot",
                        )}
                      >
                        {t(d.title)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* buy box (blocks 13 + 3) */}
            <div className="pd-in lg:sticky lg:top-28">
              <Eyebrow>{L(p.tagline)}</Eyebrow>
              <RevealHeading as="h1" onScroll={false} text={L(p.name)} className="mt-3 text-5xl leading-[1.15] md:text-6xl" />
              <p className="mt-3 text-lg font-medium text-muted-foreground">{L(p.notes)}</p>
              <p className="mt-4 max-w-lg text-lg font-light leading-relaxed">{L(p.description)}</p>

              <p className="mt-6 text-4xl font-extrabold tabular-nums">{money(price)}</p>
              <SplitNote amount={price} className="mt-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t("shop.vat")}</p>

              {p.sizes.length > 1 && (
                <fieldset className="mt-6">
                  <legend className="mb-2 text-sm font-medium">{t("pd.size")}</legend>
                  <div className="flex flex-wrap gap-2">
                    {p.sizes.map((s) => (
                      <button
                        key={s.w}
                        type="button"
                        aria-pressed={size === s.w}
                        onClick={() => pickSize(s.w)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-start outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                          size === s.w ? "border-foreground bg-card shadow-sm" : "bg-background hover:border-apricot",
                        )}
                      >
                        {/* swatch: the real bag colour for that size (1kg orange, others cream) */}
                        <span aria-hidden className={cn("size-5 rounded-full ring-1 ring-foreground/15", s.w === "1kg" ? "bg-orange" : "bg-cream")} />
                        <span>
                          <span className="block font-bold">{sz(s.w)}</span>
                          <span className="text-xs text-muted-foreground tabular-nums">{money(s.price)}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="inline-flex h-14 items-center rounded-full border bg-card" role="group" aria-label={t("pd.qty")}>
                  <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label={t("pd.less")} className="grid size-14 place-items-center rounded-full hover:bg-secondary">
                    <Minus aria-hidden className="size-4" />
                  </button>
                  <span className="w-8 text-center text-lg font-bold tabular-nums" aria-live="polite">{num(qty)}</span>
                  <button type="button" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label={t("pd.more")} className="grid size-14 place-items-center rounded-full hover:bg-secondary">
                    <Plus aria-hidden className="size-4" />
                  </button>
                </div>
                <Button onClick={add} size="lg" className="h-14 flex-1 rounded-full bg-orange px-8 text-base font-bold text-foreground hover:bg-flame">
                  <ShoppingBag aria-hidden className="size-5" /> {t("pd.add")} · <span className="tabular-nums">{money(price * qty)}</span>
                </Button>
              </div>

              {/* spec sheet (block 8) — catalogue + packaging facts only */}
              <div className="mt-10">
                <h2 className="mb-3 text-2xl font-light">{t("pd.spec")}</h2>
                <dl className="divide-y rounded-2xl border bg-card">
                  {[
                    [t("pd.type"), t(p.cat === "beans" ? "shop.beans" : "shop.instant")],
                    [t("store.cmp.use"), L(p.tagline)],
                    [t("store.cmp.notes"), L(p.notes)],
                    [t("store.cmp.sizes"), p.sizes.map((s) => sz(s.w)).join(" · ")],
                    ...(isBag ? [[t("pd.pack"), t("pd.packBag")]] : []),
                    [t("pd.price"), `${money(price)} · ${t("shop.vat")}`],
                  ].map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[8rem_1fr] gap-4 px-5 py-3.5">
                      <dt className="text-sm text-muted-foreground">{k}</dt>
                      <dd className="font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-ingo">
          <SectionHeading title={t("pd.related")} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => <ProductCard key={r.id} p={r} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
