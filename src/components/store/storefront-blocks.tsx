import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, CreditCard, Flag, Flame, ShieldCheck, Truck } from "lucide-react";
import { PackArt } from "@/components/brand/pack-art";
import { Button } from "@/components/ui/button";
import { CONFIG } from "@/lib/config";
import { useI18n } from "@/lib/i18n";
import { announcement, isLive, ribbons, slides, values, type RibbonTone, type Slide, type ValueIcon } from "@/lib/storefront";
import { cn } from "@/lib/utils";

/**
 * Storefront blocks. Content comes from lib/storefront.ts; each block matches an Odoo website block
 * so it can be rebuilt there and edited without code. No auto-play and no moving parts.
 */

/* ---------------- announcement bar ---------------- */
export function AnnouncementBar() {
  const { L, money } = useI18n();
  const live = announcement.filter((a) => isLive(a));
  if (!live.length) return null;
  const text = (i: number) => L(live[i].text).replace("{shipping}", money(CONFIG.freeShippingOver));
  return (
    <div className="bg-foreground text-background">
      <ul className="container-ingo flex min-h-9 items-center justify-center gap-x-8 py-1.5 text-center text-xs font-semibold md:text-sm">
        {live.map((a, i) => (
          // phones show the first message only; wider screens show them side by side
          <li key={i} className={cn(i > 0 && "hidden", i === 1 && "md:block", i >= 2 && "lg:block")}>
            {a.link ? <Link to={a.link} className="underline-offset-4 hover:underline">{text(i)}</Link> : text(i)}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- banner slider ---------------- */
const THEME: Record<Slide["theme"], string> = {
  cream: "bg-pattern-cream text-foreground",
  orange: "bg-pattern-orange text-foreground",
  dark: "bg-foreground text-background",
};

/** Swipe or use the arrows; nothing moves on its own. */
export function PromoSlider({ heading }: { heading: string }) {
  const { L, dir, num } = useI18n();
  const live = slides.filter((s) => isLive(s));
  const track = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [index, setIndex] = useState(0);

  // which slide is in view (works the same in RTL and LTR)
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) setIndex(Number((e.target as HTMLElement).dataset.i)); }),
      { root: track.current, threshold: 0.6 },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [live.length]);

  const go = (i: number) => {
    const n = (i + live.length) % live.length;
    refs.current[n]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };
  if (!live.length) return null;
  const Prev = dir === "rtl" ? ChevronRight : ChevronLeft;
  const Next = dir === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <section aria-roledescription="carousel" aria-label={heading} className="relative">
      <div ref={track} className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {live.map((s, i) => (
          <article
            key={s.id}
            data-i={i}
            ref={(el) => { refs.current[i] = el; }}
            aria-roledescription="slide"
            aria-label={`${num(i + 1)} / ${num(live.length)}`}
            className={cn("relative grid w-full shrink-0 snap-start overflow-hidden rounded-[2rem] md:min-h-[420px] md:grid-cols-2", THEME[s.theme])}
          >
            <div className="relative z-10 flex flex-col justify-center gap-3 p-7 md:p-12">
              {s.eyebrow && <p className="text-sm font-bold opacity-80">{L(s.eyebrow)}</p>}
              {i === 0 ? (
                <h2 className="text-3xl leading-[1.2] font-black md:text-5xl">{L(s.title)}</h2>
              ) : (
                <h3 className="text-3xl leading-[1.2] font-black md:text-5xl">{L(s.title)}</h3>
              )}
              {s.body && <p className="max-w-md text-base opacity-85 md:text-lg">{L(s.body)}</p>}
              <Button asChild size="lg" className={cn("mt-3 h-12 w-fit rounded-full px-7 font-bold", s.theme === "dark" ? "bg-orange text-foreground hover:bg-flame" : "")}>
                <Link to={s.cta.to}>{L(s.cta.label)}</Link>
              </Button>
            </div>
            <div aria-hidden className="relative min-h-56 md:min-h-full">
              {s.image ? (
                <img src={s.image} alt="" loading={i === 0 ? "eager" : "lazy"} decoding="async" className="absolute inset-0 size-full object-cover" />
              ) : (
                <SlideArt kind={s.art ?? "bags"} />
              )}
            </div>
          </article>
        ))}
      </div>

      {live.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button type="button" onClick={() => go(index - 1)} aria-label={dir === "rtl" ? "السابق" : "Previous"} className="grid size-10 place-items-center rounded-full border bg-card hover:bg-secondary">
            <Prev aria-hidden className="size-5" />
          </button>
          <div className="flex gap-2">
            {live.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`${num(i + 1)} / ${num(live.length)}`}
                aria-current={index === i}
                className={cn("h-2 rounded-full transition-[width,background-color] duration-300", index === i ? "w-7 bg-foreground" : "w-2 bg-foreground/25")}
              />
            ))}
          </div>
          <button type="button" onClick={() => go(index + 1)} aria-label={dir === "rtl" ? "التالي" : "Next"} className="grid size-10 place-items-center rounded-full border bg-card hover:bg-secondary">
            <Next aria-hidden className="size-5" />
          </button>
        </div>
      )}
    </section>
  );
}

function SlideArt({ kind }: { kind: "bags" | "instant" }) {
  return kind === "instant" ? (
    <div className="absolute inset-0 flex items-end justify-center gap-4 p-8">
      <div className="h-[62%]"><PackArt kind="box" className="h-full w-auto drop-shadow-xl" /></div>
      <div className="h-[72%]"><PackArt kind="drip" className="h-full w-auto drop-shadow-xl" /></div>
    </div>
  ) : (
    <div className="absolute inset-0 flex items-end justify-center gap-3 p-8">
      <div className="h-[58%]"><PackArt kind="bag" size="250g" className="h-full w-auto drop-shadow-xl" /></div>
      <div className="h-[78%]"><PackArt kind="bag" size="1kg" className="h-full w-auto drop-shadow-xl" /></div>
      <div className="h-[66%]"><PackArt kind="bag" size="500g" className="h-full w-auto drop-shadow-xl" /></div>
    </div>
  );
}

/* ---------------- value strip ---------------- */
const VALUE_ICON: Record<ValueIcon, typeof Truck> = { roast: Flame, saudi: Flag, truck: Truck, split: CreditCard, secure: ShieldCheck };

export function ValueStrip() {
  const { L } = useI18n();
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {values.map((v) => {
        const Icon = VALUE_ICON[v.icon];
        return (
          <li key={v.icon} className="flex items-center gap-3 rounded-2xl border bg-card p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-flame-ink"><Icon aria-hidden className="size-5" /></span>
            <span className="min-w-0">
              <span className="block text-sm font-bold">{L(v.title)}</span>
              <span className="block text-xs text-muted-foreground">{L(v.body)}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------- product ribbon ---------------- */
const RIBBON_TONE: Record<RibbonTone, string> = {
  new: "bg-foreground text-background",
  sale: "bg-flame text-white",
  best: "bg-orange text-foreground",
  soldout: "bg-muted text-muted-foreground",
};

export function ProductRibbon({ id, className }: { id: string; className?: string }) {
  const { L } = useI18n();
  const r = ribbons[id];
  if (!r) return null;
  return <span className={cn("rounded-full px-3 py-1 text-xs font-bold", RIBBON_TONE[r.tone], className)}>{L(r.label)}</span>;
}
