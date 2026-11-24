/**
 * GSAP setup for INGO (per the official GSAP skills: register once, useGSAP with a scope,
 * transforms/opacity only, contextSafe for handlers, gsap.matchMedia/reduced-motion respected).
 */
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, CustomEase, Flip, ScrollTrigger, SplitText);

/** The brand curve already used across the site (cubic-bezier .16,1,.3,1). */
CustomEase.create("ingo", "M0,0 C0.16,1 0.3,1 1,1");
gsap.defaults({ ease: "ingo", duration: 0.6 });

export { gsap, useGSAP, Flip, ScrollTrigger, SplitText };

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

