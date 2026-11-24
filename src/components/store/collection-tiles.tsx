import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useI18n, type DictKey } from "@/lib/i18n";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

export type Filter = "all" | Product["cat"];

const TABS: { id: Filter; key: DictKey }[] = [
  { id: "all", key: "shop.all" },
  { id: "beans", key: "shop.beans" },
  { id: "instant", key: "shop.instant" },
];

/** Category tabs; the dark pill slides to the active tab with GSAP (measured, transform only). */
export function CategoryTabs({ value, onChange }: { value: Filter; onChange: (f: Filter) => void }) {
  const { t, dir } = useI18n();
  const wrap = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const first = useRef(true);

  const place = useCallback((animate: boolean) => {
    const btn = wrap.current?.querySelector<HTMLButtonElement>(`[data-tab="${value}"]`);
    if (!btn || !pill.current || !wrap.current) return;
    const box = wrap.current.getBoundingClientRect();
    const r = btn.getBoundingClientRect();
    const vars = { x: r.left - box.left, width: r.width, height: r.height, y: r.top - box.top };
    if (!animate || prefersReducedMotion()) gsap.set(pill.current, vars);
    else gsap.to(pill.current, { ...vars, duration: 0.5, ease: "ingo" });
  }, [value]);

  useLayoutEffect(() => {
    place(!first.current);
    first.current = false;
  }, [place, dir, t]);

  // re-measure when the tab sizes change (window resize, web font finishing loading, language switch)
  useEffect(() => {
    if (!wrap.current) return;
    const ro = new ResizeObserver(() => place(false));
    ro.observe(wrap.current);
    document.fonts?.ready.then(() => place(false));
    return () => ro.disconnect();
  }, [place]);

  return (
    <div ref={wrap} className="relative inline-flex rounded-full border bg-card p-1" role="group" aria-label={t("shop.filter")}>
      <span ref={pill} aria-hidden className="absolute top-0 left-0 rounded-full bg-foreground" />
      {TABS.map((f) => (
        <button
          key={f.id}
          data-tab={f.id}
          type="button"
          aria-pressed={value === f.id}
          onClick={() => onChange(f.id)}
          className="relative rounded-full px-5 py-2.5 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span className={cn("relative transition-colors", value === f.id && "text-background")}>{t(f.key)}</span>
        </button>
      ))}
    </div>
  );
}
