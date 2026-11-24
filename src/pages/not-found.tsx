import { Link } from "react-router-dom";
import { Display } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { usePageTitle } from "@/lib/use-title";

/** Unknown addresses get a real 404 page instead of silently showing the home page. */
export default function NotFound() {
  const { t } = useI18n();
  usePageTitle(t("title.notFound"));
  return (
    <section className="relative -mt-18 bg-background pt-18">
      <div className="container-ingo py-28 text-center md:py-40">
        <p className="text-7xl font-black text-flame-ink md:text-9xl" aria-hidden>404</p>
        <h1 className="mt-4 text-4xl leading-[1.2] md:text-6xl"><Display text={t("nf.title")} /></h1>
        <p className="mx-auto mt-4 max-w-md text-lg font-light text-muted-foreground">{t("nf.body")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="h-12 rounded-full px-7 font-bold"><Link to="/">{t("nf.home")}</Link></Button>
          <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-2 border-foreground bg-transparent px-7 font-bold"><Link to="/shop">{t("nav.shop")}</Link></Button>
        </div>
      </div>
    </section>
  );
}
