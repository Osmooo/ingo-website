import { useRef } from "react";
import { Link } from "react-router-dom";
import { PackArt } from "@/components/brand/pack-art";
import { RevealHeading } from "@/components/store/reveal-heading";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n";
import { PRODUCTS } from "@/lib/products";

/** Block 5 — side-by-side comparison of the bean products, built only from catalogue data. */
export function CompareTable() {
  const { t, L, money, sz } = useI18n();
  const root = useRef<HTMLElement>(null);
  const beans = PRODUCTS.filter((p) => p.cat === "beans");

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.set(".cmp-col", { autoAlpha: 0, y: 24 });
    ScrollTrigger.batch(".cmp-col", {
      start: "top 85%", once: true,
      onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, stagger: 0.1, overwrite: true }),
    });
  }, { scope: root });

  return (
    <section ref={root} className="pb-20 md:pb-28">
      <div className="container-ingo">
        <RevealHeading text={t("store.compare")} className="mb-10 text-4xl leading-[1.2] md:text-5xl lg:text-6xl" />
        <div className="overflow-x-auto rounded-[1.75rem] border bg-card">
          <table className="w-full min-w-[640px] border-collapse text-start">
            <caption className="sr-only">{t("store.compare")}</caption>
            <thead>
              <tr>
                <th scope="col" className="w-40 p-5 text-start text-sm font-medium text-muted-foreground">{t("store.cmp.product")}</th>
                {beans.map((p) => (
                  <th key={p.id} scope="col" className="cmp-col p-5 text-start align-bottom">
                    <Link to={`/shop/${p.id}`} className="group block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
                      <span className="mb-3 block h-28" aria-hidden><PackArt kind="bag" size={p.featured} /></span>
                      <span className="text-xl font-light group-hover:underline">{L(p.name)}</span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { k: t("store.cmp.use"), v: (p: (typeof beans)[number]) => L(p.tagline) },
                { k: t("store.cmp.notes"), v: (p: (typeof beans)[number]) => L(p.notes) },
                { k: t("store.cmp.sizes"), v: (p: (typeof beans)[number]) => p.sizes.map((s) => sz(s.w)).join(" · ") },
                { k: t("store.cmp.from"), v: (p: (typeof beans)[number]) => money(Math.min(...p.sizes.map((s) => s.price))) },
              ].map((row) => (
                <tr key={row.k} className="border-t">
                  <th scope="row" className="p-5 text-start text-sm font-medium text-muted-foreground">{row.k}</th>
                  {beans.map((p) => (
                    <td key={p.id} className="cmp-col p-5 font-medium tabular-nums">{row.v(p)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
