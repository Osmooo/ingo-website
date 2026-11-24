import { useEffect } from "react";

/** Sets the browser-tab title for the current page (each route has its own).
 *  t() turns "|" into an invisible Display split marker, so it is turned back into " | " here. */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title.replace(/\s*⁣\s*/g, " | ");
  }, [title]);
}
