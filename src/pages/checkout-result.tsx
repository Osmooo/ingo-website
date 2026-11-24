import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Clock, X } from "lucide-react";
import { SuccessMark } from "@/components/site/form-bits";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { CONFIG, sendSubmission } from "@/lib/config";
import { useI18n } from "@/lib/i18n";
import { clearPending, loadPending } from "@/lib/payments";
import { usePageTitle } from "@/lib/use-title";

/**
 * Moyasar sends the customer back here with ?id=…&status=…&message=…
 * The status in the address bar can be edited, so the team confirms the payment in the
 * Moyasar dashboard (search by order number) before shipping.
 */
export default function CheckoutResult() {
  const { t } = useI18n();
  usePageTitle(t("title.checkout"));
  const [params] = useSearchParams();
  const cart = useCart();
  const status = params.get("status") ?? "";
  const id = params.get("id") ?? "";
  const message = params.get("message") ?? "";
  const paid = status === "paid" || status === "authorized" || status === "captured";
  const cancelled = status === "cancelled";
  const failed = status === "failed" || cancelled;
  const pending = useRef(loadPending());
  const handled = useRef(false);

  useEffect(() => {
    if (!paid || handled.current) return;
    handled.current = true;
    cart.clear();
    const o = pending.current;
    // with an order endpoint configured, the store also gets the order by its usual channel
    if (o && CONFIG.orderEndpoint) {
      sendSubmission(CONFIG.orderEndpoint, `INGO order ${o.ref} (paid)`, {
        ...Object.fromEntries(Object.entries(o).map(([k, v]) => [k, String(v ?? "")])),
        total: `${o.total} SAR`, payment_id: id, payment_status: status,
      }).catch(() => { /* the order is also stored with the payment in Moyasar */ });
    }
    clearPending();
  }, [paid, id, status, cart]);

  return (
    <section className="relative -mt-18 bg-background pt-18">
      <div className="container-ingo grid min-h-[70vh] place-items-center py-16">
        <div className="w-full max-w-lg rounded-[2rem] border bg-card p-8 text-center shadow-[0_30px_60px_-30px_rgba(150,70,20,.4)] md:p-10">
          {paid ? (
            <>
              <SuccessMark />
              <h1 className="mt-5 text-3xl font-bold">{t("res.paidT")}</h1>
              <p className="mx-auto mt-3 max-w-sm text-muted-foreground">{t("res.paidB")}</p>
              <dl className="mt-6 grid gap-2 rounded-2xl bg-secondary p-4 text-sm">
                {pending.current?.ref && <div className="flex justify-between gap-3"><dt>{t("res.ref")}</dt><dd dir="ltr" className="font-mono font-bold">{pending.current.ref}</dd></div>}
                {id && <div className="flex justify-between gap-3"><dt>{t("res.pay")}</dt><dd dir="ltr" className="truncate font-mono text-xs">{id}</dd></div>}
              </dl>
              <Button asChild className="mt-7 h-12 rounded-full px-7 font-bold"><Link to="/shop">{t("cartp.continue")}</Link></Button>
            </>
          ) : failed ? (
            <>
              <div className="mx-auto grid size-18 place-items-center rounded-full bg-destructive/10 text-destructive"><X aria-hidden className="size-9" /></div>
              <h1 className="mt-5 text-3xl font-bold">{cancelled ? t("ck.cancelled") : t("ck.failed")}</h1>
              {message && <p lang="en" dir="ltr" className="mt-2 text-sm text-muted-foreground">{message}</p>}
              <p className="mx-auto mt-3 max-w-sm text-muted-foreground">{cancelled ? t("res.cancelledB") : t("res.failB")}</p>
              <Button asChild className="mt-7 h-12 rounded-full bg-orange px-7 font-bold text-foreground hover:bg-flame"><Link to="/checkout">{t("res.retry")}</Link></Button>
            </>
          ) : (
            <>
              <div className="mx-auto grid size-18 place-items-center rounded-full bg-secondary text-flame-ink"><Clock aria-hidden className="size-9" /></div>
              <h1 className="mt-5 text-3xl font-bold">{t("res.pendingT")}</h1>
              <p className="mx-auto mt-3 max-w-sm text-muted-foreground">{t("res.pendingB")}</p>
              {id && <p dir="ltr" className="mt-4 font-mono text-xs text-muted-foreground">{id}</p>}
              <Button asChild variant="outline" className="mt-7 h-12 rounded-full px-7 font-bold"><Link to="/cart">{t("nav.cart")}</Link></Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
