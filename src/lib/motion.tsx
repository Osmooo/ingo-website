import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * One page-level switch for auto-playing motion (ticker, rotating text, showcase autoplay, floating bag).
 * WCAG 2.2.2 needs a visible pause for motion longer than 5s; it also starts paused when the
 * visitor's OS asks for reduced motion, and follows live changes to that setting.
 */
const QUERY = "(prefers-reduced-motion: reduce)";
const prefersReduced = () => typeof window !== "undefined" && !!window.matchMedia?.(QUERY).matches;

interface MotionState {
  paused: boolean;
  reduced: boolean;
  toggle: () => void;
}

const Ctx = createContext<MotionState | null>(null);

export function MotionProvider({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(prefersReduced);
  const [userPaused, setUserPaused] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const value = useMemo<MotionState>(() => {
    const paused = userPaused ?? reduced;
    return { paused, reduced, toggle: () => setUserPaused(!paused) };
  }, [userPaused, reduced]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMotion() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMotion must be used inside MotionProvider");
  return ctx;
}
