import { useState } from "react";
import { Clock, Coffee, Droplets, Thermometer } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { GUIDES, type RecipeKind } from "@/lib/coffee-guide";
import { useI18n, type DictKey } from "@/lib/i18n";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

const TAB: Record<RecipeKind, DictKey> = { hot: "rc.hot", iced: "rc.iced", espresso: "rc.espresso" };

/** Product page: the full story of the coffee, then suggested recipes (hot V60, iced V60, espresso). */
export function CoffeeGuideSection({ p }: { p: Product }) {
  const { t, L, lang, num } = useI18n();
  const g = GUIDES[p.id];
  const [kind, setKind] = useState<RecipeKind>("hot");
  if (!g) return null;
  const r = g.recipes.find((x) => x.kind === kind) ?? g.recipes[0];
  const story = lang === "ar" ? g.story.ar : g.story.en;
  const ratio = r.kind === "espresso" ? `1:${(r.water / r.dose).toFixed(1).replace(/\.0$/, "")}` : `1:${Math.round((r.water + (r.ice ?? 0)) / r.dose)}`;

  const stats: { icon: typeof Clock; label: string; value: string }[] = [
    { icon: Thermometer, label: t("rc.temp"), value: `${num(r.temp)}°` },
    { icon: Coffee, label: t("rc.dose"), value: t("rc.g", { x: num(r.dose) }) },
    r.kind === "espresso"
      ? { icon: Droplets, label: t("rc.yield"), value: t("rc.g", { x: num(r.water) }) }
      : { icon: Droplets, label: t("rc.water"), value: t("rc.ml", { x: num(r.water) }) },
    { icon: Clock, label: t("rc.time"), value: r.kind === "espresso" ? t("rc.sec", { x: r.time }) : r.time },
  ];

  return (
    <section className="border-t py-16 md:py-24">
      <div className="container-ingo grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
        {/* full description */}
        <div>
          <SectionHeading eyebrow={L(p.tagline)} title={t("rc.storyTitle")} className="mb-6 md:mb-8" />
          <div className="grid gap-4 text-lg font-light leading-relaxed">
            {story.map((para, i) => <p key={i}>{para}</p>)}
          </div>
        </div>

        {/* recipes */}
        <div>
          <h2 className="text-3xl font-light md:text-4xl">{t("rc.title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("rc.sub")}</p>
          <div role="tablist" aria-label={t("rc.title")} className="mt-6 inline-flex flex-wrap gap-2">
            {g.recipes.map((x) => (
              <button
                key={x.kind}
                type="button"
                role="tab"
                id={`rc-tab-${x.kind}`}
                aria-selected={kind === x.kind}
                aria-controls="rc-panel"
                onClick={() => setKind(x.kind)}
                className={cn(
                  "h-10 rounded-full border px-4 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  kind === x.kind ? "border-foreground bg-foreground text-background" : "bg-card hover:border-apricot",
                )}
              >
                {t(TAB[x.kind])}
              </button>
            ))}
          </div>

          <div id="rc-panel" role="tabpanel" aria-labelledby={`rc-tab-${r.kind}`} className="mt-5 rounded-[1.75rem] border bg-card p-6 md:p-8">
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-2xl bg-secondary p-4">
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon aria-hidden className="size-3.5" />{label}</dt>
                  <dd className="mt-1 text-2xl font-extrabold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-sm"><span className="font-bold">{t("rc.ratio")}:</span> <span dir="ltr" className="tabular-nums">{ratio}</span> · <span className="font-bold">{t("rc.grind")}:</span> {L(r.grind)}</p>

            {r.pours && (
              <>
                <h3 className="mt-6 font-bold">{t("rc.pours")}</h3>
                <ol className="mt-3 grid gap-2">
                  {r.pours.map((s, i) => (
                    <li key={s.at} className="flex items-center gap-4 rounded-xl border px-4 py-3">
                      <span className="w-12 font-bold tabular-nums" dir="ltr">{s.at}</span>
                      <span className="flex-1 text-sm">{i === 0 ? t("rc.bloom") : t("rc.pourTo")}</span>
                      <span className="font-extrabold tabular-nums">{t("rc.ml", { x: num(s.total) })}</span>
                    </li>
                  ))}
                </ol>
                {r.ice && <p className="mt-3 text-sm text-muted-foreground">{t("rc.iceNote", { x: num(r.ice) })}</p>}
              </>
            )}
            {r.kind === "espresso" && <p className="mt-4 text-sm text-muted-foreground">{t("rc.espNote", { x: num(r.dose), y: num(r.water) })}</p>}

            <p className="mt-5 rounded-xl bg-secondary px-4 py-3 text-sm"><span className="font-bold">{t("rc.tip")}: </span>{L(r.tip)}</p>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{t("rc.note")}</p>
        </div>
      </div>
    </section>
  );
}
