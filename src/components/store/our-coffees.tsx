import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { CoffeeSpecs, ProductVisual } from "@/components/store/product-visual";
import { useI18n } from "@/lib/i18n";
import { PRODUCTS } from "@/lib/products";

/** "Meet our coffees": each bean coffee with its real label, tasting notes and the details from the bag. */
export function OurCoffees() {
  const { t, L, money, dir } = useI18n();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const coffees = PRODUCTS.filter((p) => p.cat === "beans" && p.specs);
  if (!coffees.length) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="container-ingo">
        <SectionHeading eyebrow={t("cof.eyebrow")} title={t("cof.title")} sub={t("cof.sub")} />
        <ul className="grid gap-6 md:grid-cols-3">
          {coffees.map((p) => (
            <li key={p.id} className="list-none">
              <article className="flex h-full flex-col overflow-hidden rounded-[2rem] border bg-card">
                <Link to={`/shop/${p.id}`} className="block bg-secondary p-6" tabIndex={-1} aria-hidden>
                  <div className="mx-auto h-72 w-fit md:h-80"><ProductVisual p={p} /></div>
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-sm font-bold text-flame-ink">{L(p.tagline)}</p>
                  <h3 className="mt-1 text-3xl font-light"><Link to={`/shop/${p.id}`} className="hover:underline">{L(p.name)}</Link></h3>
                  <p className="mt-2 font-semibold">{L(p.notes)}</p>
                  <CoffeeSpecs p={p} className="mt-4" />
                  <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                    <span className="text-sm text-muted-foreground">{t("cof.from", { x: money(Math.min(...p.sizes.map((s) => s.price))) })}</span>
                    <Link to={`/shop/${p.id}`} className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-bold text-background hover:bg-black">
                      {t("cof.cta")} <Arrow aria-hidden className="size-4" />
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
