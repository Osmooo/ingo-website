import { useState } from "react";
import { Check } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";
import { useI18n, type DictKey } from "@/lib/i18n";
import { goToSection } from "@/lib/scroll";
import { cn } from "@/lib/utils";
import { asset } from "@/lib/asset";

/**
 * The INGO 2-drink machine: the store picks two drinks from the flavour list.
 * Photos are free Unsplash stand-ins (see /img/flavours/CREDITS.txt). To add or change a flavour,
 * edit FLAVOURS and its name in i18n; the registration form uses the same list.
 */
export const FLAVOURS: { id: string; value: string; img: string; name: DictKey }[] = [
  { id: "three-in-one", value: "3-in-1 coffee", img: asset("img/flavours/three-in-one.webp"), name: "flv.3in1" },
  { id: "karak", value: "Karak tea with cardamom", img: asset("img/flavours/karak.webp"), name: "flv.karak" },
  { id: "karak-low-sugar", value: "Low-sugar karak tea", img: asset("img/flavours/karak-low-sugar.webp"), name: "flv.karakLow" },
  { id: "espresso", value: "Instant espresso", img: asset("img/flavours/espresso.webp"), name: "flv.espresso" },
  { id: "hot-chocolate", value: "Hot chocolate", img: asset("img/flavours/hot-chocolate.webp"), name: "flv.choc" },
  { id: "hazelnut-cappuccino", value: "Hazelnut cappuccino", img: asset("img/flavours/hazelnut-cappuccino.webp"), name: "flv.hazelnut" },
  { id: "vanilla-cappuccino", value: "Vanilla cappuccino", img: asset("img/flavours/vanilla-cappuccino.webp"), name: "flv.vanilla" },
];

const MAX = 2;

export function MachineDrinks({ machine }: { machine: string }) {
  const { t, num } = useI18n();
  const [picked, setPicked] = useState<string[]>([FLAVOURS[1].id, FLAVOURS[5].id]);
  const full = picked.length >= MAX;

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= MAX ? p : [...p, id]));

  // carry the choice into the registration form (its flavour checkboxes) and go there
  const useChoice = () => {
    const values = picked.map((id) => FLAVOURS.find((f) => f.id === id)!.value);
    document.querySelectorAll<HTMLInputElement>('input[name="preferred_drinks"]').forEach((el) => {
      el.checked = values.includes(el.value);
    });
    goToSection("register");
  };

  const chosen = picked.map((id) => FLAVOURS.find((f) => f.id === id)!);

  return (
    <section aria-labelledby="drinks-title" className="py-20 md:py-24">
      <div className="container-ingo">
        <SectionHeading eyebrow={t("biz.drinks.eyebrow")} title={t("biz.drinks.title")} sub={t("biz.drinks.sub")} />
        <div className="grid items-start gap-8 lg:grid-cols-[1.35fr_.65fr]">
          {/* the flavours: pick any two */}
          <div>
            <p className="mb-4 text-sm font-bold" aria-live="polite">{t("biz.drinks.count", { x: num(picked.length) })}</p>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
              {FLAVOURS.map((f) => {
                const on = picked.includes(f.id);
                const blocked = full && !on;
                return (
                  <li key={f.id} className="list-none">
                    <button
                      type="button"
                      aria-pressed={on}
                      aria-disabled={blocked}
                      onClick={() => toggle(f.id)}
                      className={cn(
                        "group relative block w-full overflow-hidden rounded-2xl border-2 bg-card text-start outline-none transition-colors focus-visible:ring-4 focus-visible:ring-orange/50",
                        on ? "border-foreground" : "border-transparent hover:border-apricot",
                        blocked && "opacity-55",
                      )}
                    >
                      <img src={f.img} alt="" loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
                      <span className="block px-3 py-3 text-sm font-bold md:text-base">{t(f.name)}</span>
                      <span className={cn("absolute end-2 top-2 grid size-7 place-items-center rounded-full border-2 shadow", on ? "border-foreground bg-foreground text-background" : "border-white bg-white/80")}>
                        {on && <Check aria-hidden className="size-4" />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {full && <p className="mt-3 text-xs text-muted-foreground">{t("biz.drinks.full")}</p>}
          </div>

          {/* the machine with the chosen pair */}
          <div className="rounded-[2rem] bg-pattern-orange p-6 lg:sticky lg:top-28">
            <div className="mx-auto w-fit rounded-2xl bg-background p-3 shadow-xl">
              <img src={machine} alt="" aria-hidden className="h-56 w-auto mix-blend-multiply md:h-64" />
            </div>
            <p className="mt-5 text-sm font-bold">{t("biz.drink.screen")}</p>
            <ol className="mt-2 grid gap-2">
              {[0, 1].map((i) => {
                const f = chosen[i];
                return (
                  <li key={i} className="flex items-center gap-3 rounded-xl bg-card/95 p-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-foreground text-sm font-bold text-background">{num(i + 1)}</span>
                    {f ? (
                      <>
                        <img src={f.img} alt="" className="size-9 rounded-lg object-cover" />
                        <span className="font-extrabold">{t(f.name)}</span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">{t("biz.drinks.empty")}</span>
                    )}
                  </li>
                );
              })}
            </ol>
            <Button size="lg" disabled={picked.length < MAX} onClick={useChoice} className="mt-5 h-12 w-full rounded-full text-base font-bold">
              {t("biz.drinks.cta")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
