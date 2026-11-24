import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Languages, ShoppingBag, Store } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { useScroll } from "@/components/ui/use-scroll";
import { useCart } from "@/lib/cart";
import { LANGUAGES, useI18n, type DictKey } from "@/lib/i18n";
import type { Lang } from "@/lib/products";
import { cn } from "@/lib/utils";

const LINKS: { to: string; key: DictKey }[] = [
  { to: "/", key: "nav.home" },
  { to: "/shop", key: "nav.shop" },
  { to: "/business", key: "nav.business" },
];

/**
 * Header 2, adapted for INGO. Full width at the top of the page; once scrolled it floats as a
 * rounded, blurred pill (md+). The outer <header> keeps a fixed 72px height so the page never
 * shifts while the pill changes shape. Logical classes only, so it mirrors for Arabic (RTL).
 */
export function Header() {
  const { t, setLang, dir, lang, num } = useI18n();
  const cart = useCart();
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);
  const { pathname } = useLocation();
  const current = LANGUAGES.find((l) => l.code === lang)!;

  // lock page scroll while the mobile menu is open
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // close the menu on navigation and on Escape
  React.useEffect(() => { setOpen(false); }, [pathname]);
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    cn(buttonVariants({ variant: "ghost" }), "h-10 rounded-full px-4 text-[15px]", isActive && "bg-foreground text-background hover:bg-foreground hover:text-background");

  return (
    <header className="sticky top-0 z-50 h-18">
      <div
        className={cn(
          "mx-auto flex h-18 w-[min(1200px,100%-32px)] items-center border border-transparent md:transition-all md:duration-300 md:ease-out",
          {
            "border-border bg-background/95 shadow-[0_8px_30px_-20px_rgba(150,70,20,.45)] backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 md:mt-3 md:h-14 md:w-[min(900px,100%-32px)] md:rounded-full":
              scrolled && !open,
            "bg-background/95": open,
          },
          // full-bleed bar on phones once scrolled
          scrolled && !open && "max-md:w-full max-md:rounded-none max-md:border-x-0 max-md:border-t-0 max-md:px-4",
        )}
      >
        <nav aria-label={t("nav.menu")} className={cn("flex w-full items-center justify-between gap-3", scrolled && "md:ps-5 md:pe-2")}>
          <Link to="/" aria-label="INGO" className="shrink-0">
            <Logo className={cn("h-7 transition-all md:duration-300", scrolled && "md:h-6")} />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end className={linkCls}>{t(l.key)}</NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* language menu: icon + current language */}
            <DropdownMenu dir={dir}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" aria-label={t("lang.label")} className="h-10 gap-1.5 rounded-full bg-card px-3 font-semibold">
                  <Languages aria-hidden className="size-[18px]" />
                  <span lang={current.code}>{current.code === "ar" ? "عربي" : "EN"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-[60] min-w-44 rounded-2xl p-1.5">
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">{t("lang.menu")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={lang} onValueChange={(v) => setLang(v as Lang)}>
                  {LANGUAGES.map((l) => (
                    <DropdownMenuRadioItem key={l.code} value={l.code} lang={l.code} dir={l.dir} className="rounded-xl py-2 text-[15px]">
                      {l.name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* cart */}
            <Button
              variant="outline"
              size="icon"
              id="cart-button"
              onClick={() => { setOpen(false); cart.setOpen(true); }}
              aria-label={cart.count ? `${t("nav.cart")} (${cart.count})` : t("nav.cart")}
              className="relative size-10 rounded-full bg-card"
            >
              <ShoppingBag aria-hidden className="size-[18px]" />
              {cart.count > 0 && (
                <span className="absolute -top-1 -end-1 grid h-5 min-w-5 place-items-center rounded-full bg-flame px-1 text-[11px] font-bold text-foreground">
                  {num(cart.count)}
                </span>
              )}
            </Button>

            <Button
              size="icon"
              variant="outline"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={t("nav.menu")}
              className="size-10 rounded-full bg-card md:hidden"
            >
              <MenuToggleIcon open={open} className="size-5" duration={300} />
            </Button>
          </div>
        </nav>
      </div>

      {/* mobile menu: full screen under the bar */}
      <div
        id="mobile-menu"
        className={cn("fixed inset-x-0 top-18 bottom-0 z-50 flex-col overflow-hidden border-y bg-background/95 backdrop-blur-lg md:hidden", open ? "flex" : "hidden")}
      >
        <div
          data-slot={open ? "open" : "closed"}
          className={cn(
            "data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out",
            "flex h-full w-full flex-col justify-between gap-y-2 p-4",
          )}
        >
          <div className="grid gap-y-2">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end className={({ isActive }) => cn(linkCls({ isActive }), "h-14 justify-start rounded-2xl px-5 text-xl")}>
                {t(l.key)}
              </NavLink>
            ))}
          </div>
          {/* the two customer paths, same as the home page */}
          <div className="flex flex-col gap-2">
            <Button asChild variant="outline" className="h-12 w-full rounded-full border-2 border-foreground bg-transparent text-base font-bold">
              <Link to="/business"><Store aria-hidden className="size-5" /> {t("choose.biz.cta")}</Link>
            </Button>
            <Button asChild className="h-12 w-full rounded-full bg-orange text-base font-bold text-foreground hover:bg-flame">
              <Link to="/shop"><ShoppingBag aria-hidden className="size-5" /> {t("choose.ind.cta")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
