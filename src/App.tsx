import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Direction } from "radix-ui";
import { CartSheet } from "@/components/site/cart-sheet";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/ui/header-2";
import { AnnouncementBar } from "@/components/store/storefront-blocks";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/lib/cart";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { MotionProvider } from "@/lib/motion";
import { goToSectionWhenReady } from "@/lib/scroll";
import Home from "@/pages/home";

// Code-split the secondary pages: the home bundle no longer carries the shop grid or the registration form.
const loadShop = () => import("@/pages/shop");
const loadBusiness = () => import("@/pages/business");
const loadProduct = () => import("@/pages/product");
const loadCart = () => import("@/pages/cart");
const Shop = lazy(loadShop);
const Business = lazy(loadBusiness);
const ProductPage = lazy(loadProduct);
const CartPage = lazy(loadCart);
const Blog = lazy(() => import("@/pages/blog"));
const BlogPost = lazy(() => import("@/pages/blog-post"));
const NotFound = lazy(() => import("@/pages/not-found"));
const CheckoutPage = lazy(() => import("@/pages/checkout"));
const CheckoutResult = lazy(() => import("@/pages/checkout-result"));

/** New page: start at the top, unless the link points at a section (/business#register). */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) goToSectionWhenReady(decodeURIComponent(hash.slice(1)));
    else window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

/** Prefetch the other pages once the browser is idle, so navigation stays instant. */
function PrefetchPages() {
  useEffect(() => {
    const go = () => { void loadShop(); void loadBusiness(); void loadProduct(); void loadCart(); };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(go, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(go, 1500);
    return () => clearTimeout(id);
  }, []);
  return null;
}

function PageFallback() {
  return <div className="min-h-[60vh]" aria-busy="true" />;
}

function Layout() {
  const { dir, t } = useI18n();
  return (
    // Radix primitives (select, radio, accordion, sheet) default to LTR unless told the page direction
    <Direction.Provider dir={dir}>
    <div className="flex min-h-svh flex-col">
      <a href="#main" className="skip-link">{t("nav.skip")}</a>
      <ScrollToTop />
      <PrefetchPages />
      <AnnouncementBar />
      <Header />
      {/* the page is an opaque layer above the footer; at the end it slides up and uncovers it (curtain reveal) */}
      <main id="main" tabIndex={-1} className="relative z-10 flex-1 bg-background shadow-[0_40px_60px_-30px_rgba(35,31,32,.45)] outline-none">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <div className="sticky bottom-0 z-0"><Footer /></div>
      <CartSheet />
      <Toaster position={dir === "rtl" ? "bottom-left" : "bottom-right"} richColors closeButton dir={dir} />
    </div>
    </Direction.Provider>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <MotionProvider>
        <CartProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "") || "/"}>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="shop" element={<Shop />} />
                <Route path="shop/:id" element={<ProductPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="checkout/result" element={<CheckoutResult />} />
                <Route path="business" element={<Business />} />
                <Route path="blog" element={<Blog />} />
                <Route path="blog/:slug" element={<BlogPost />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </MotionProvider>
    </I18nProvider>
  );
}
