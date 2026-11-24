import { ShoppingBag, Store } from "lucide-react";
import { CinematicChoice } from "@/components/ui/motion-hero";
import { useI18n } from "@/lib/i18n";
import { usePageTitle } from "@/lib/use-title";

/**
 * Home is one question and nothing else: individual or business?
 * Individuals go to the shop (which tells the roastery story around the coffee);
 * businesses go to the machine offer.
 */
export default function Home() {
  const { t } = useI18n();
  usePageTitle(t("title.home"));
  return (
    <CinematicChoice
      eyebrow={t("brand.sub")}
      question={t("choose.q")}
      hint={t("home.hint")}
      items={[
        {
          to: "/shop",
          title: t("choose.ind.title"),
          sub: t("home.ind.sub"),
          icon: <ShoppingBag aria-hidden className="size-6" />,
          className: "bg-foreground text-background hover:bg-black",
        },
        {
          to: "/business",
          title: t("choose.biz.title"),
          sub: t("home.biz.sub"),
          icon: <Store aria-hidden className="size-6" />,
          className: "bg-orange text-foreground hover:bg-flame",
        },
      ]}
    />
  );
}
