/** Space kept above a section when jumping to it, so the sticky header (72px) doesn't cover its heading. */
const HEADER_OFFSET = 84;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Scrolls to the element with `id`, puts it in the address bar (#id) so the link can be shared,
 * and moves keyboard / screen-reader focus to its heading (marked data-section-focus).
 * `smooth: false` jumps instantly ("instant", not "auto": the page sets scroll-behavior: smooth,
 * which would otherwise turn a long jump into a slow animation that gets cut short).
 * Returns false when the element isn't on the page (yet).
 */
export function goToSection(id: string, opts: { smooth?: boolean; focus?: boolean } = {}) {
  const el = document.getElementById(id);
  if (!el) return false;
  const { smooth = true, focus = true } = opts;
  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top, behavior: smooth && !reducedMotion() ? "smooth" : "instant" });
  if (window.location.hash !== `#${id}`) history.replaceState(history.state, "", `#${id}`);
  if (focus) {
    const target = el.querySelector<HTMLElement>("[data-section-focus]") ?? el;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }
  return true;
}

/**
 * For links that open a page at a section (/#business, /business#register): waits for the
 * (lazily loaded) section to exist, jumps there, then re-aligns while images and fonts settle,
 * unless the visitor has started scrolling themselves.
 */
export function goToSectionWhenReady(id: string, tries = 30) {
  if (!goToSection(id, { smooth: false, focus: false })) {
    if (tries > 0) window.setTimeout(() => goToSectionWhenReady(id, tries - 1), 100);
    return;
  }
  let userMoved = false;
  const stop = () => { userMoved = true; };
  const events = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
  events.forEach((e) => window.addEventListener(e, stop, { once: true, passive: true }));
  const realign = () => { if (!userMoved) goToSection(id, { smooth: false, focus: false }); };
  [250, 700, 1500].forEach((ms) => window.setTimeout(realign, ms));
  document.fonts?.ready.then(realign);
  window.setTimeout(() => events.forEach((e) => window.removeEventListener(e, stop)), 1600);
}
