import { useEffect, useRef, useState } from "react";
import { Coffee, Flag, MapPin, Pause, Play, Zap } from "lucide-react";
import AnimatedContent from "@/components/AnimatedContent";
import ScrollVelocity from "@/components/ScrollVelocity";
import SpotlightCard from "@/components/SpotlightCard";
import { PackArt } from "@/components/brand/pack-art";
import { Display, Eyebrow, SectionHeading } from "@/components/site/section-heading";
import { useI18n } from "@/lib/i18n";
import { useMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { asset } from "@/lib/asset";

/**
 * Brand sections shared by the pages (the shop tells the roastery story around the products).
 * Photos in /img/roastery are free Unsplash stock (see CREDITS.txt there) standing in until
 * INGO's own roastery photos are ready; swap the files and keep the names.
 */
export const ROASTERY = asset("img/roastery");

/* ---------------- orange slogan band ---------------- */
export function SloganBand() {
  const { t } = useI18n();
  const { paused, toggle } = useMotion();
  const dot = <span className="mx-6 inline-block size-3 rounded-full bg-white/70 align-middle md:mx-10" />;
  return (
    <section className="relative overflow-hidden bg-flame py-2 text-white md:py-3">
      <p className="sr-only">{t("brand.tagline")}</p>
      {/* the moving copies are decorative; the slogan is read once above */}
      <div dir="ltr" aria-hidden>
        <ScrollVelocity
          texts={[
            <span key="a"><span lang="ar" className="swash font-light">إن قو - معك في كل مكــــــان</span>{dot}<span className="font-black">INGO — WITH YOU EVERYWHERE</span>{dot}</span>,
          ]}
          velocity={paused ? 0 : 40}
          numCopies={4}
          fontSize="clamp(28px, 4.5vw, 56px)"
          fontWeight={900}
          className="pe-6"
          // room under the line for the dots of the long-tail ي (Tajarib ss01 draws them below the baseline)
          scrollerStyle={{ lineHeight: 1.45, paddingBottom: "0.35em" }}
        />
      </div>
      {/* WCAG 2.2.2: one visible control pauses all auto-playing motion on the page */}
      <button
        type="button"
        onClick={toggle}
        aria-pressed={paused}
        aria-label={paused ? t("motion.play") : t("motion.pause")}
        className="absolute end-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-foreground text-background shadow-lg outline-none transition-colors hover:bg-black focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-flame"
      >
        {paused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
      </button>
    </section>
  );
}

/* ---------------- the roastery: a story told while scrolling ---------------- */
/** Desktop: the steps scroll on one side while the photo beside them stays pinned and changes to the
 *  step in view. Phones: each step shows its own photo above the text. */
export function RoasteryStory() {
  const { t, num } = useI18n();
  // step 3 shows our own bags on a shelf (stock shelf photos all carry other brands' labels)
  const steps: { k: "1" | "2" | "3" | "4"; img?: string }[] = [
    { k: "1", img: `${ROASTERY}/green-beans.webp` },
    { k: "2", img: `${ROASTERY}/beans-in-bag.webp` },
    { k: "3" },
    { k: "4", img: `${ROASTERY}/cup-in-hand.webp` },
  ];
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    // the step crossing the middle of the screen is the active one
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i)); }),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section aria-labelledby="roastery-title" className="py-20 md:py-28">
      <div className="container-ingo">
        <div className="max-w-3xl">
          <Eyebrow>{t("roast.eyebrow")}</Eyebrow>
          <h2 id="roastery-title" className="mt-3 text-4xl leading-[1.2] md:text-6xl"><Display text={t("roast.title")} /></h2>
        </div>
        <div className="mt-10 grid gap-10 md:mt-4 md:grid-cols-2 md:gap-16">
          <ol className="grid gap-10 md:gap-0">
            {steps.map((st, i) => (
              <li key={st.k} data-i={i} ref={(el) => { refs.current[i] = el; }} className="list-none md:flex md:min-h-[60vh] md:items-center">
                <div className={cn("transition-opacity duration-500 md:opacity-30", active === i && "md:opacity-100")}>
                  <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-[1.75rem] md:hidden">
                    {st.img ? <img src={st.img} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" /> : <StoreShelf />}
                  </div>
                  <span className={cn("grid size-12 place-items-center rounded-full text-lg font-black transition-colors", active === i ? "bg-orange text-foreground" : "bg-secondary")}>{num(i + 1)}</span>
                  <h3 className="mt-4 text-3xl leading-[1.2] font-light md:text-5xl">{t(`roast.${st.k}.t`)}</h3>
                  <p className="mt-3 max-w-md text-lg text-muted-foreground">{t(`roast.${st.k}.b`)}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="hidden md:block">
            <div data-roast-frame className="sticky top-28 aspect-[4/5] overflow-hidden rounded-[2rem] bg-ember shadow-[0_40px_70px_-30px_rgba(150,70,20,.6)]">
              {steps.map((st, i) => (
                <div key={st.k} className={cn("absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none", active === i ? "opacity-100" : "opacity-0")}>
                  {st.img ? <img src={st.img} alt="" loading="lazy" decoding="async" className="size-full object-cover" /> : <StoreShelf />}
                </div>
              ))}
              <div aria-hidden className="absolute inset-x-6 bottom-6 flex gap-2">
                {steps.map((st, i) => <span key={st.k} className={cn("h-1.5 flex-1 rounded-full transition-colors duration-500", i <= active ? "bg-white" : "bg-white/35")} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Our own bags and boxes on a store shelf, drawn from the packaging (no other brands in view). */
function StoreShelf() {
  const plank = "absolute inset-x-[6%] h-3 rounded-sm bg-[#B97A4A] shadow-[0_10px_16px_-8px_rgba(60,25,5,.55)]";
  return (
    <div aria-hidden className="absolute inset-0 bg-[#F6E3D0]">
      <div className="absolute inset-x-[8%] top-[10%] flex h-[36%] items-end justify-around px-2">
        <div className="h-[78%]"><PackArt kind="bag" size="250g" className="h-full w-auto" /></div>
        <div className="h-[92%]"><PackArt kind="bag" size="1kg" className="h-full w-auto" /></div>
        <div className="h-[84%]"><PackArt kind="bag" size="500g" className="h-full w-auto" /></div>
      </div>
      <div className={cn(plank, "top-[46%]")} />
      <div className="absolute inset-x-[8%] top-[52%] flex h-[34%] items-end justify-around px-2">
        <div className="h-[70%]"><PackArt kind="box" className="h-full w-auto" /></div>
        <div className="h-[70%]"><PackArt kind="drip" className="h-full w-auto" /></div>
        <div className="h-[70%]"><PackArt kind="box" className="h-full w-auto" /></div>
      </div>
      <div className={cn(plank, "top-[86%]")} />
    </div>
  );
}

/* ---------------- why INGO ---------------- */
export function WhyIngo() {
  const { t } = useI18n();
  const items = [
    { icon: Zap, k: "1" }, { icon: Coffee, k: "2" }, { icon: Flag, k: "3" }, { icon: MapPin, k: "4" },
  ] as const;
  return (
    <section className="pb-20 md:pb-28">
      <div className="container-ingo">
        <SectionHeading eyebrow={t("why.eyebrow")} title={t("why.title")} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, k }, i) => (
            <AnimatedContent className="h-full" key={k} distance={40} delay={i * 0.08} duration={0.8}>
              <SpotlightCard theme="light" spotlightColor="rgba(238, 138, 46, 0.35)" className="h-full rounded-3xl p-7">
                <div className="mb-6 grid size-14 place-items-center rounded-2xl bg-secondary text-flame-ink">
                  <Icon aria-hidden className="size-7" />
                </div>
                <h3 className="text-xl font-bold">{t(`why.${k}.t`)}</h3>
                <p className="mt-2 text-muted-foreground">{t(`why.${k}.b`)}</p>
              </SpotlightCard>
            </AnimatedContent>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- who we are ---------------- */
export function AboutIngo() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden bg-foreground py-20 text-background md:py-28">
      <div aria-hidden dir="ltr" className="pointer-events-none absolute inset-x-0 top-6 text-center text-[24vw] leading-[.8] font-black tracking-tight text-flame select-none md:top-10 md:text-[15rem]">COFFEE</div>
      <div className="container-ingo relative z-10 grid items-center gap-12 pt-[13vw] md:grid-cols-2 md:pt-36">
        <AnimatedContent distance={40} duration={0.9}>
          <Eyebrow className="text-orange">{t("about.eyebrow")}</Eyebrow>
          <h2 className="mt-3 text-5xl leading-[1.15] md:text-7xl"><Display text={t("about.title")} /></h2>
          <p className="mt-6 text-lg text-background/75">{t("about.p1")}</p>
          <p className="mt-4 text-lg text-background/75">{t("about.roast")}</p>
        </AnimatedContent>
        <AnimatedContent distance={40} delay={0.1} duration={0.9}>
          <img src={`${ROASTERY}/scoop-beans.webp`} alt="" loading="lazy" decoding="async" className="aspect-[4/3] w-full rounded-[2rem] object-cover" />
        </AnimatedContent>
      </div>
    </section>
  );
}
