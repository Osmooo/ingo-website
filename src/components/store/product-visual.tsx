import { Coffee, Filter } from "lucide-react";
import { PackArt } from "@/components/brand/pack-art";
import { asset } from "@/lib/asset";
import { useI18n } from "@/lib/i18n";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

/** The product's picture: its real label artwork when it has one, otherwise the drawn package. */
export function ProductVisual({ p, size, className, eager }: { p: Product; size?: string; className?: string; eager?: boolean }) {
  const { L } = useI18n();
  if (p.image) {
    return (
      <img
        src={asset(p.image)}
        alt={`${L(p.name)} – ${L(p.tagline)}`}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className={cn("h-full w-auto max-w-full rounded-xl object-contain shadow-[0_18px_30px_-16px_rgba(60,30,10,.45)]", className)}
      />
    );
  }
  return <PackArt kind={p.art} size={size} className={className} />;
}

/** Roast level on the label's 7-step scale. */
export function RoastScale({ level, className }: { level: number; className?: string }) {
  const { t, num } = useI18n();
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)} role="img" aria-label={`${t("cof.roast")}: ${num(level)} / ${num(7)}`}>
      {Array.from({ length: 7 }, (_, i) => (
        <span key={i} aria-hidden className={cn("size-3.5 rounded-[4px] border-2 border-[#8A4B22]", i + 1 === level && "bg-[#8A4B22]")} />
      ))}
    </span>
  );
}

/** The coffee details printed on the label, as a small spec list. */
export function CoffeeSpecs({ p, className }: { p: Product; className?: string }) {
  const { t, L } = useI18n();
  if (!p.specs) return null;
  const s = p.specs;
  const row = (k: string, v: React.ReactNode) => (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/70 py-2 last:border-0">
      <dt className="text-sm text-muted-foreground">{k}</dt>
      <dd className="text-end text-sm font-bold">{v}</dd>
    </div>
  );
  return (
    <dl className={cn("", className)}>
      {row(t("cof.origin"), L(s.origin))}
      {row(t("cof.process"), L(s.process))}
      {row(t("cof.variety"), L(s.variety))}
      {row(t("cof.body"), L(s.body))}
      {row(t("cof.roast"), <RoastScale level={s.roast} />)}
      {row(
        t("cof.brew"),
        <span className="inline-flex flex-wrap justify-end gap-1.5">
          {s.brew.map((b) => (
            <span key={b} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold">
              {b === "filter" ? <Filter aria-hidden className="size-3.5" /> : <Coffee aria-hidden className="size-3.5" />}
              {t(b === "filter" ? "cof.filter" : "cof.espresso")}
            </span>
          ))}
        </span>,
      )}
    </dl>
  );
}
