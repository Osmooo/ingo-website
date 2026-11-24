import { useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { LOGO_PATHS } from "@/components/brand/logo";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * One-question screen: the packaging motif (rows of the INGO wordmark in thin outline), one question, and a few big choices. Choosing one opens that page directly. Buttons don't follow the cursor (client asked for no moving buttons).
 */
export interface CinematicChoiceItem {
  to: string;
  title: string;
  sub: string;
  icon: ReactNode;
  /** button look */
  className: string;
}

export function CinematicChoice({ eyebrow, question, hint, items }: {
  eyebrow: string;
  question: string;
  /** screen-reader hint about what the buttons do */
  hint: string;
  items: CinematicChoiceItem[];
}) {
  const root = useRef<HTMLElement>(null);

  // entrance: the wordmark rises into place, the question and choices follow
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".cine-mark svg", { opacity: 0, y: 30, stagger: 0.12, duration: 1.1 })
      .from(".cine-in", { y: 32, opacity: 0, stagger: 0.12, duration: 0.9 }, 0.2);
  }, { scope: root });

  return (
    <section ref={root} className="relative -mt-18 flex min-h-svh flex-col overflow-hidden bg-pattern-cream pt-18">
      {/* the packaging motif: rows of the real INGO wordmark drawn as thin orange outlines */}
      <div aria-hidden className="cine-mark pointer-events-none absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
        {[0, 1, 2, 3].map((row) => (
          <svg key={row} viewBox="40 100 1560 462" className="h-auto w-[118vw] max-w-none shrink-0 md:w-[104vw] [&_*]:[vector-effect:non-scaling-stroke]">
            <g fill="none" stroke="#E4601F" strokeOpacity={0.3} strokeWidth={1.5} strokeLinejoin="round">
              {LOGO_PATHS}
            </g>
          </svg>
        ))}
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p className="cine-in text-sm font-bold text-flame-ink md:text-base">{eyebrow}</p>
        <h1 className="cine-in mt-3 text-[2.6rem] leading-[1.15] font-black sm:text-6xl md:text-7xl lg:text-8xl">{question}</h1>
        <p className="sr-only">{hint}</p>
        <ul className="cine-in mt-10 flex w-full flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center md:mt-12">
          {items.map((it) => (
            <li key={it.to} className="list-none">
              <Link
                to={it.to}
                className={cn(
                  "group flex min-h-20 items-center gap-4 rounded-full px-7 py-4 text-start shadow-[0_20px_40px_-24px_rgba(150,70,20,.55)] outline-none transition-colors duration-300 focus-visible:ring-4 focus-visible:ring-orange/60 motion-reduce:transition-none sm:min-w-72 md:px-9",
                  it.className,
                )}
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/15">{it.icon}</span>
                <span className="flex flex-col">
                  <span className="text-xl font-extrabold md:text-2xl">{it.title}</span>
                  <span className="text-sm opacity-80">{it.sub}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

    </section>
  );
}
