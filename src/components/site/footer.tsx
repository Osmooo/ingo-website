import { Link } from "react-router-dom";
import { AtSign, Globe, Mail, Phone } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { PaymentBadges } from "@/components/site/payment-badges";
import { CONFIG } from "@/lib/config";
import { useI18n } from "@/lib/i18n";
import { trust } from "@/lib/storefront";
import { asset } from "@/lib/asset";

/**
 * Footer, in four columns: brand (logo, about, Saudi Made) · explore · contact · payment,
 * then one bottom line with the copyright and the company details (VAT / CR, shown once filled in).
 */
export function Footer() {
  const { t } = useI18n();
  const contact = [
    { icon: Mail, label: CONFIG.email, href: `mailto:${CONFIG.email}` },
    { icon: Phone, label: CONFIG.phone, href: `tel:${CONFIG.phone}` },
    { icon: Globe, label: CONFIG.site, href: `https://${CONFIG.site}` },
    { icon: AtSign, label: CONFIG.social },
  ];
  const explore = [
    { to: "/", label: t("nav.home") },
    { to: "/shop", label: t("nav.shop") },
    { to: "/business", label: t("nav.business") },
    { to: "/blog", label: t("nav.blog") },
    { to: "/cart", label: t("nav.cart") },
  ];
  const heading = "mb-4 text-sm font-bold text-white";

  return (
    <footer className="bg-[#111010] text-white">
      {/* sign-off in the Tajarib specimen style: Arabic Light with kashida + swash, English Black underneath */}
      <div className="container-ingo border-b border-white/10 pt-20 pb-14 text-center">
        <p lang="ar" dir="rtl" className="swash text-[clamp(2.75rem,10vw,8.5rem)] leading-[1.25] font-light">
          معك في كل مكــــــان
        </p>
        <p lang="en" dir="ltr" className="-mt-2 text-[clamp(2.25rem,7vw,6rem)] leading-none font-black tracking-tight">
          With you <span className="text-orange">everywhere</span>
        </p>
      </div>

      <div className="container-ingo grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_.8fr_1fr_1.2fr]">
        {/* brand */}
        <div>
          <Logo className="h-9 text-white" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed font-light text-white/70">{t("foot.about")}</p>
          <span className="mt-6 inline-flex rounded-xl bg-white px-3 py-2">
            <img src={asset("img/saudi-made.svg")} alt="Saudi Made" width={3000} height={1000} loading="lazy" className="h-10 w-auto" />
          </span>
        </div>

        {/* explore */}
        <nav aria-label={t("foot.explore")}>
          <h2 className={heading}>{t("foot.explore")}</h2>
          <ul className="grid gap-2.5 text-sm font-light text-white/70">
            {explore.map((l) => (
              <li key={l.to}><Link className="hover:text-orange hover:underline" to={l.to}>{l.label}</Link></li>
            ))}
          </ul>
        </nav>

        {/* contact */}
        <div>
          <h2 className={heading}>{t("foot.contact")}</h2>
          <ul className="grid gap-2.5 text-sm font-light text-white/70">
            {contact.map(({ icon: Icon, label, href }) => (
              <li key={label} className="flex items-center gap-2.5">
                <Icon aria-hidden className="size-4 shrink-0 text-orange" />
                {href ? <a dir="ltr" className="hover:text-orange hover:underline" href={href}>{label}</a> : <span dir="ltr">{label}</span>}
              </li>
            ))}
            {trust.whatsapp && (
              <li><a className="hover:text-orange hover:underline" href={`https://wa.me/${trust.whatsapp}`}>{t("foot.whatsapp")}</a></li>
            )}
          </ul>
        </div>

        {/* payment */}
        <div>
          <h2 className={heading}>{t("pay.accepted")}</h2>
          <PaymentBadges dark />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-ingo flex flex-col gap-2 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <span>{t("foot.rights")}</span>
          {/* company details from lib/storefront.ts; each shows only once filled in */}
          {(trust.vatNumber || trust.crNumber) && (
            <span className="flex flex-wrap gap-x-5 gap-y-1">
              {trust.vatNumber && <span>{t("foot.vat")}: <bdi dir="ltr">{trust.vatNumber}</bdi></span>}
              {trust.crNumber && <span>{t("foot.cr")}: <bdi dir="ltr">{trust.crNumber}</bdi></span>}
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}
