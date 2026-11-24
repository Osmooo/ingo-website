import { useEffect, useState } from "react";

/** True once the page has scrolled past `threshold` px. Passive listener, checked once on mount. */
export function useScroll(threshold = 10) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > threshold);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [threshold]);
  return scrolled;
}
