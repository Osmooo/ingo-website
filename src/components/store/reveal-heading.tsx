import { useRef, type ElementType } from "react";
import { Display } from "@/components/site/section-heading";
import { gsap, prefersReducedMotion, SplitText, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Tajarib Display headline with a GSAP SplitText word reveal.
 * Split by WORDS only — splitting Arabic into letters breaks joining. aria:"auto" keeps it readable.
 * `onScroll` reveals when the heading enters the viewport; otherwise on mount.
 */
export function RevealHeading({ as: Tag = "h2", text, className, onScroll = true }: {
  as?: ElementType; text: string; className?: string; onScroll?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!ref.current || prefersReducedMotion()) return;
    const split = SplitText.create(ref.current, { type: "words", aria: "auto" });
    gsap.from(split.words, {
      yPercent: 60, autoAlpha: 0, duration: 0.9, stagger: 0.07,
      scrollTrigger: onScroll ? { trigger: ref.current, start: "top 85%", once: true } : undefined,
    });
  }, { scope: ref, dependencies: [text], revertOnUpdate: true });

  return (
    <Tag ref={ref} className={cn(className)}>
      <Display text={text} />
    </Tag>
  );
}
