import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Lock, ShieldCheck, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { PackArt } from "@/components/brand/pack-art";
import { Field, fieldCls } from "@/components/site/form-bits";
import { PayLogo, PaymentBadges, type PayLogoId } from "@/components/site/payment-badges";
import { RevealHeading } from "@/components/store/reveal-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart";
import { CONFIG } from "@/lib/config";
import { useI18n } from "@/lib/i18n";
import {
  applePayAvailable, cardBrand, digitsOnly, formatCardNumber, formatExpiry, luhn, newOrderRef,
  parseExpiry, payByCard, paymentsEnabled, payWithApplePay, PaymentError, savePending, startBnpl, validCardName,
  validCvc, type BnplProvider, type CardBrand, type MoyasarPayment, type PendingOrder,
} from "@/lib/payments";
import { findProduct, priceOf } from "@/lib/products";
import { usePageTitle } from "@/lib/use-title";
import { cn } from "@/lib/utils";
import { asset } from "@/lib/asset";

const PHONE = "^(05|\\+9665|9665)[0-9]{8}$";
type Method = "card" | "applepay" | BnplProvider;
interface Delivery { name: string; phone: string; email: string; city: string; address: string; notes: string }

/** Checkout in two steps on one page: 1. delivery details, 2. payment (card and Apple Pay via Moyasar; Tabby and Tamara via your backend). */
export default function CheckoutPage() {
  const { t, L, money, sz, num, dir } = useI18n();
  usePageTitle(t("title.checkout"));
  const cart = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [method, setMethod] = useState<Method>(applePayAvailable() ? "applepay" : "card");
  const Back = dir === "rtl" ? ArrowRight : ArrowLeft;
  const enabled = paymentsEnabled();

  const order = (m: Method): PendingOrder => ({
    ref: newOrderRef(),
    ...delivery!,
    items: cart.lines.map((l) => `${findProduct(l.id)!.name.en} ${l.w} x${l.qty}`).join(" | "),
    total: cart.total,
    method: { card: "Card", applepay: "Apple Pay", tabby: "Tabby", tamara: "Tamara" }[m],
  });

  /** Where a created payment goes next: 3-D Secure page, the result page, or an error. */
  const handle = (p: MoyasarPayment) => {
    if (p.status === "initiated" && p.source?.transaction_url) {
      window.location.href = p.source.transaction_url; // bank's 3-D Secure page, then back to /checkout/result
      return;
    }
    navigate(`/checkout/result?id=${encodeURIComponent(p.id)}&status=${encodeURIComponent(p.status)}`);
  };

  const fail = (err: unknown) => {
    const msg = err instanceof PaymentError ? err.message : "";
    if (msg === "cancelled") return toast(t("ck.cancelled"));
    if (msg === "not-connected") return toast.error(t("ck.off"));
    toast.error(t("ck.failed"), { description: msg && !/^[a-z-]+$/.test(msg) ? msg : undefined });
  };

  if (cart.lines.length === 0) {
    return (
      <section className="container-ingo py-28 text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-secondary text-flame-ink"><ShoppingBag aria-hidden className="size-9" /></div>
        <h1 className="mt-5 text-2xl font-light">{t("cart.empty")}</h1>
        <Button asChild className="mt-6 rounded-full px-6"><Link to="/shop">{t("cart.emptyCta")}</Link></Button>
      </section>
    );
  }

  return (
    <div>
      <section className="relative -mt-18 bg-background pt-18">
        <div className="container-ingo py-8 md:py-12">
          <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-semibold hover:underline">
            <Back aria-hidden className="size-4" /> {t("nav.cart")}
          </Link>
          <RevealHeading as="h1" onScroll={false} text={t("ck.title")} className="mt-3 text-4xl leading-[1.15] md:text-6xl" />
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="container-ingo grid items-start gap-8 lg:grid-cols-[1.35fr_.65fr]">
          <div className="grid gap-5">
            {/* step 1 */}
            <StepCard n={num(1)} title={t("ck.step1")} active={step === 1} done={step === 2} onEdit={() => setStep(1)} editLabel={t("ck.edit")}
              summary={delivery && `${delivery.name} · ${delivery.phone} · ${delivery.city}، ${delivery.address}`}>
              <DeliveryForm initial={delivery} onDone={(d) => { setDelivery(d); setStep(2); }} />
            </StepCard>

            {/* step 2 */}
            <StepCard n={num(2)} title={t("ck.step2")} active={step === 2}>
              {!enabled && (method === "card" || method === "applepay") && (
                <p role="alert" className="mb-5 flex items-start gap-3 rounded-2xl bg-secondary p-4 text-sm font-medium">
                  <Lock aria-hidden className="mt-0.5 size-4 shrink-0 text-flame-ink" /> {t("ck.off")}
                </p>
              )}
              <MethodPicker value={method} onChange={setMethod} />
              <div className="mt-6">
                {method === "card" && <CardPanel disabled={!enabled} onPay={async (card) => {
                  const o = order("card");
                  savePending(o);
                  try { handle(await payByCard(o, card)); } catch (e) { fail(e); }
                }} />}
                {method === "applepay" && <ApplePanel disabled={!enabled} onPay={async () => {
                  const o = order("applepay");
                  savePending(o);
                  try { handle(await payWithApplePay(o)); } catch (e) { fail(e); }
                }} />}
                {(method === "tabby" || method === "tamara") && <BnplPanel key={method} provider={method} onContinue={async () => {
                  const o = order(method);
                  savePending(o);
                  try { window.location.href = await startBnpl(method, o); } catch (e) { fail(e); }
                }} />}
              </div>
            </StepCard>
          </div>

          {/* order summary */}
          <aside className="rounded-[1.75rem] border bg-card p-6 lg:sticky lg:top-28">
            <h2 className="text-2xl font-light">{t("cartp.summary")}</h2>
            <ul className="mt-4 divide-y">
              {cart.lines.map((l) => {
                const p = findProduct(l.id)!;
                return (
                  <li key={l.id + l.w} className="flex items-center gap-3 py-3">
                    <span className="relative grid size-14 shrink-0 place-items-center rounded-xl bg-secondary p-1.5">
                      <PackArt kind={p.art} size={l.w} />
                      <span className="absolute -top-1.5 -end-1.5 grid size-5 place-items-center rounded-full bg-foreground text-[11px] font-bold text-background">{num(l.qty)}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{L(p.name)}</span>
                      <span className="text-xs text-muted-foreground">{sz(l.w)}</span>
                    </span>
                    <span className="font-bold tabular-nums">{money(priceOf(p, l.w) * l.qty)}</span>
                  </li>
                );
              })}
            </ul>
            <dl className="mt-3 grid gap-2 border-t pt-4 text-sm">
              <div className="flex justify-between"><dt>{t("cart.subtotal")}</dt><dd className="tabular-nums">{money(cart.subtotal)}</dd></div>
              <div className="flex justify-between"><dt>{t("cart.shipping")}</dt><dd>{cart.shipping ? money(cart.shipping) : t("cart.free")}</dd></div>
              <div className="flex justify-between border-t pt-3 text-xl font-bold"><dt>{t("cart.total")}</dt><dd className="tabular-nums">{money(cart.total)}</dd></div>
            </dl>
            <p className="mt-2 text-xs text-muted-foreground">{t("cartp.vat")} · {t("ship.time")}</p>
            <PaymentBadges className="mt-5" />
          </aside>
        </div>
      </section>
    </div>
  );
}

/* ---------------- building blocks ---------------- */

function StepCard({ n, title, active, done, summary, onEdit, editLabel, children }: {
  n: string; title: string; active: boolean; done?: boolean; summary?: string | null; onEdit?: () => void; editLabel?: string; children: ReactNode;
}) {
  return (
    <section aria-current={active ? "step" : undefined} className={cn("rounded-[1.75rem] border bg-card p-6 md:p-8", !active && !done && "opacity-60")}>
      <div className="flex items-center gap-3">
        <span className={cn("grid size-8 place-items-center rounded-full text-sm font-bold", active || done ? "bg-orange text-foreground" : "bg-secondary")}>{n}</span>
        <h2 className="flex-1 text-xl font-extrabold">{title}</h2>
        {done && onEdit && <button type="button" onClick={onEdit} className="text-sm font-bold underline-offset-4 hover:underline">{editLabel}</button>}
      </div>
      {done && summary && <p className="mt-3 text-sm text-muted-foreground">{summary}</p>}
      {active && <div className="mt-6">{children}</div>}
    </section>
  );
}

function DeliveryForm({ initial, onDone }: { initial: Delivery | null; onDone: (d: Delivery) => void }) {
  const { t } = useI18n();
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    if (!f.reportValidity()) return;
    const d = Object.fromEntries(new FormData(f)) as unknown as Delivery;
    onDone({ ...d, name: d.name.trim(), city: d.city.trim(), address: d.address.trim() });
  };
  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <Field label={t("co.name")} required htmlFor="ck-name" className="sm:col-span-2">
        <Input id="ck-name" name="name" required autoComplete="name" defaultValue={initial?.name} className={fieldCls} />
      </Field>
      <Field label={t("co.phone")} required htmlFor="ck-phone">
        <Input id="ck-phone" name="phone" type="tel" required pattern={PHONE} placeholder="05xxxxxxxx" dir="ltr" autoComplete="tel" defaultValue={initial?.phone} className={fieldCls} />
      </Field>
      <Field label={t("ck.email")} optional={t("optional")} htmlFor="ck-email">
        <Input id="ck-email" name="email" type="email" dir="ltr" autoComplete="email" defaultValue={initial?.email} className={fieldCls} />
      </Field>
      <Field label={t("co.city")} required htmlFor="ck-city">
        <Input id="ck-city" name="city" required autoComplete="address-level2" defaultValue={initial?.city} className={fieldCls} />
      </Field>
      <Field label={t("co.address")} required htmlFor="ck-address">
        <Input id="ck-address" name="address" required autoComplete="street-address" defaultValue={initial?.address} className={fieldCls} />
      </Field>
      <Field label={t("co.notes")} htmlFor="ck-notes" className="sm:col-span-2">
        <Textarea id="ck-notes" name="notes" rows={2} defaultValue={initial?.notes} className="rounded-xl bg-background" />
      </Field>
      <Button type="submit" size="lg" className="h-12 rounded-full text-base font-bold sm:col-span-2">{t("ck.next")}</Button>
    </form>
  );
}

function MethodPicker({ value, onChange }: { value: Method; onChange: (m: Method) => void }) {
  const { t } = useI18n();
  const items: { id: Method; label: ReactNode; icon: ReactNode }[] = [
    { id: "applepay", label: <span className="sr-only">Apple Pay</span>, icon: <PayLogo id="applepay" className="h-5" /> },
    {
      id: "card", label: <span className="sr-only">{t("ck.card")}</span>,
      icon: <span className="flex items-center gap-2"><PayLogo id="mada" /><PayLogo id="visa" /><PayLogo id="mastercard" /></span>,
    },
    { id: "tabby", label: t("bnpl.split4"), icon: <PayLogo id="tabby" className="h-6" /> },
    { id: "tamara", label: t("bnpl.split4"), icon: <PayLogo id="tamara" className="h-6" /> },
  ];
  return (
    <div role="radiogroup" aria-label={t("ck.step2")} className="grid gap-3 sm:grid-cols-2">
      {items.map((m) => (
        <button
          key={m.id}
          type="button"
          role="radio"
          aria-checked={value === m.id}
          onClick={() => onChange(m.id)}
          className={cn(
            "flex min-h-14 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-start text-sm font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-orange",
            value === m.id ? "border-foreground bg-background" : "border-border bg-background/60 hover:border-apricot",
          )}
        >
          <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border-2", value === m.id ? "border-foreground" : "border-muted-foreground/40")}>
            {value === m.id && <span className="size-2.5 rounded-full bg-foreground" />}
          </span>
          {m.icon}
          <span className="leading-tight">{m.label}</span>
        </button>
      ))}
    </div>
  );
}


/* ---------------- card ---------------- */

const BRAND_LOGO: Record<Exclude<CardBrand, "unknown">, PayLogoId> = { visa: "visa", mastercard: "mastercard", mada: "mada" };

function CardPanel({ disabled, onPay }: {
  disabled: boolean;
  onPay: (card: { name: string; number: string; month: number; year: number; cvc: string }) => Promise<void>;
}) {
  const { t, money } = useI18n();
  const cart = useCart();
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [flip, setFlip] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const brand = cardBrand(number);
  const expiry = parseExpiry(exp);

  const errors = useMemo(() => ({
    number: luhn(number) && digitsOnly(number).length >= 15 ? "" : t("ck.err.number"),
    name: validCardName(name) ? "" : t("ck.err.name"),
    exp: expiry ? "" : t("ck.err.exp"),
    cvc: validCvc(cvc) ? "" : t("ck.err.cvc"),
  }), [number, name, expiry, cvc, t]);
  const show = (k: keyof typeof errors) => (touched[k] ? errors[k] : "");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ number: true, name: true, exp: true, cvc: true });
    if (disabled) return toast.error(t("ck.off"));
    if (Object.values(errors).some(Boolean) || !expiry) return;
    setBusy(true);
    try { await onPay({ name, number, month: expiry.month, year: expiry.year, cvc }); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-start">
      <CardPreview number={number} name={name} exp={exp} cvc={cvc} brand={brand} flipped={flip} />
      <div className="grid gap-4">
        <Field label={t("ck.card.number")} required htmlFor="cc-number">
          <div className="relative">
            <Input
              id="cc-number" name="cc-number" inputMode="numeric" autoComplete="cc-number" dir="ltr" placeholder="0000 0000 0000 0000"
              value={number} onChange={(e) => setNumber(formatCardNumber(e.target.value))} onBlur={() => setTouched((x) => ({ ...x, number: true }))}
              aria-invalid={Boolean(show("number"))} aria-describedby="cc-number-err" className={cn(fieldCls, "pe-28 font-mono tracking-wider")}
            />
            {brand !== "unknown" && (
              <span className="pointer-events-none absolute end-3 top-1/2 grid h-7 -translate-y-1/2 place-items-center rounded-md bg-white px-2 ring-1 ring-border">
                <PayLogo id={BRAND_LOGO[brand]} />
              </span>
            )}
          </div>
          <FieldError id="cc-number-err" text={show("number")} />
        </Field>
        <Field label={t("ck.card.name")} required htmlFor="cc-name">
          <Input
            id="cc-name" name="cc-name" autoComplete="cc-name" dir="ltr" placeholder="MOHAMMED ALI" value={name}
            onChange={(e) => setName(e.target.value.replace(/[^A-Za-z '.-]/g, "").toUpperCase())} onBlur={() => setTouched((x) => ({ ...x, name: true }))}
            aria-invalid={Boolean(show("name"))} aria-describedby="cc-name-hint cc-name-err" className={cn(fieldCls, "uppercase")}
          />
          <p id="cc-name-hint" className="text-xs text-muted-foreground">{t("ck.card.nameHint")}</p>
          <FieldError id="cc-name-err" text={show("name")} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t("ck.card.exp")} required htmlFor="cc-exp">
            <Input
              id="cc-exp" name="cc-exp" inputMode="numeric" autoComplete="cc-exp" dir="ltr" placeholder="MM/YY" value={exp}
              onChange={(e) => setExp(formatExpiry(e.target.value))} onBlur={() => setTouched((x) => ({ ...x, exp: true }))}
              aria-invalid={Boolean(show("exp"))} aria-describedby="cc-exp-err" className={cn(fieldCls, "font-mono")}
            />
            <FieldError id="cc-exp-err" text={show("exp")} />
          </Field>
          <Field label={t("ck.card.cvc")} required htmlFor="cc-cvc">
            <Input
              id="cc-cvc" name="cc-csc" inputMode="numeric" autoComplete="cc-csc" dir="ltr" placeholder="123" maxLength={4} value={cvc}
              onChange={(e) => setCvc(digitsOnly(e.target.value).slice(0, 4))}
              onFocus={() => setFlip(true)} onBlur={() => { setFlip(false); setTouched((x) => ({ ...x, cvc: true })); }}
              aria-invalid={Boolean(show("cvc"))} aria-describedby="cc-cvc-err" className={cn(fieldCls, "font-mono")}
            />
            <FieldError id="cc-cvc-err" text={show("cvc")} />
          </Field>
        </div>
        <Button type="submit" size="lg" disabled={busy} className="h-14 rounded-full bg-orange text-base font-bold text-foreground hover:bg-flame">
          <Lock aria-hidden className="size-4" /> {busy ? t("ck.paying") : t("ck.pay", { x: money(cart.total) })}
        </Button>
        <SecureNote extra={t("ck.3ds")} />
      </div>
    </form>
  );
}

function FieldError({ id, text }: { id: string; text: string }) {
  return <p id={id} role={text ? "alert" : undefined} className="min-h-0 text-xs font-medium text-destructive">{text}</p>;
}

function SecureNote({ extra }: { extra?: string }) {
  const { t } = useI18n();
  return (
    <p className="flex items-start gap-2 text-xs text-muted-foreground">
      <ShieldCheck aria-hidden className="mt-px size-4 shrink-0 text-flame-ink" />
      <span>{t("ck.secure")}{extra ? ` ${extra}` : ""}</span>
    </p>
  );
}

/** Live card preview in brand colours; flips to the back while the security code is being typed. */
function CardPreview({ number, name, exp, cvc, brand, flipped }: { number: string; name: string; exp: string; cvc: string; brand: CardBrand; flipped: boolean }) {
  const shown = (formatCardNumber(number) || "•••• •••• •••• ••••").padEnd(19, "•");
  return (
    <div aria-hidden className="mx-auto w-full max-w-sm [perspective:1200px]">
      <div className={cn("relative aspect-[1.586] w-full transition-transform duration-700 [transform-style:preserve-3d] motion-reduce:transition-none", flipped && "[transform:rotateY(180deg)]")}>
        {/* front */}
        <div dir="ltr" className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-orange via-flame to-ember p-5 text-white shadow-[0_24px_40px_-18px_rgba(150,70,20,.6)] [backface-visibility:hidden]">
          <div aria-hidden className="pointer-events-none absolute -end-16 -top-16 size-56 rounded-full border-[28px] border-white/10" />
          <div className="relative flex items-start justify-between">
            <span className="text-xl font-black tracking-tight">INGO</span>
            {brand !== "unknown" ? (
              <span className="grid h-8 place-items-center rounded-md bg-white px-2.5 shadow-sm"><PayLogo id={BRAND_LOGO[brand]} /></span>
            ) : <span className="h-8" />}
          </div>
          <div className="relative">
            <span className="mb-3 block h-7 w-10 rounded-md bg-gradient-to-br from-[#F7E3B5] to-[#C9A35A]" />
            <p className="font-mono text-lg tracking-[0.12em] sm:text-xl">{shown}</p>
            <div className="mt-3 flex items-end justify-between gap-3 text-xs">
              <span className="truncate font-semibold uppercase">{name || "NAME SURNAME"}</span>
              <span className="font-mono">{exp || "MM/YY"}</span>
            </div>
          </div>
        </div>
        {/* back */}
        <div dir="ltr" className="absolute inset-0 overflow-hidden rounded-2xl bg-gradient-to-br from-ember to-flame-ink text-white shadow-[0_24px_40px_-18px_rgba(150,70,20,.6)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="mt-6 h-10 bg-black/70" />
          <div className="mx-5 mt-5 flex items-center justify-end rounded-md bg-white/90 px-3 py-2 font-mono text-sm text-foreground">{cvc || "•••"}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Apple Pay ---------------- */

function ApplePanel({ disabled, onPay }: { disabled: boolean; onPay: () => Promise<void> }) {
  const { t, money } = useI18n();
  const cart = useCart();
  const [busy, setBusy] = useState(false);
  const available = applePayAvailable();
  if (!available) {
    return <p className="rounded-2xl bg-secondary p-4 text-sm">{t("ck.apple.off")}</p>;
  }
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">{t("ck.apple.hint")}</p>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          if (disabled) return toast.error(t("ck.off"));
          setBusy(true);
          try { await onPay(); } finally { setBusy(false); }
        }}
        className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-black text-lg font-semibold text-white outline-none hover:bg-black/85 focus-visible:ring-2 focus-visible:ring-orange disabled:opacity-60"
        aria-label={`Apple Pay ${money(cart.total)}`}
      >
        <img src={asset("img/pay/applepay.svg")} alt="" className="h-6 w-auto invert" />
      </button>
      <SecureNote />
    </div>
  );
}

/* ---------------- Tabby / Tamara ---------------- */

/** Pay in 4: shows the four instalments, then hands the customer to Tabby's or Tamara's own checkout. */
function BnplPanel({ provider, onContinue }: { provider: BnplProvider; onContinue: () => Promise<void> }) {
  const { t, money, num } = useI18n();
  const cart = useCart();
  const [busy, setBusy] = useState(false);
  const enabled = Boolean(CONFIG.bnplEndpoint);
  const name = t(provider === "tabby" ? "bnpl.tabby" : "bnpl.tamara");
  // four equal parts; the last one absorbs rounding so they add up to the total exactly
  const part = Math.floor((cart.total / 4) * 100) / 100;
  const parts = [part, part, part, Math.round((cart.total - part * 3) * 100) / 100];
  return (
    <div className="grid gap-5">
      {!enabled && (
        <p role="alert" className="flex items-start gap-3 rounded-2xl bg-secondary p-4 text-sm font-medium">
          <Lock aria-hidden className="mt-0.5 size-4 shrink-0 text-flame-ink" /> {t("bnpl.off", { x: name })}
        </p>
      )}
      <div className="flex items-center gap-3">
        <span className="grid h-10 place-items-center rounded-lg bg-white px-3 ring-1 ring-border"><PayLogo id={provider} className="h-6" /></span>
        <p className="font-bold">{t("bnpl.title", { x: name })}</p>
      </div>
      <ol className="grid grid-cols-4 gap-2">
        {parts.map((v, i) => (
          <li key={i} className="flex flex-col items-center gap-2 rounded-2xl bg-background p-3 text-center ring-1 ring-border">
            <span className={cn("grid size-7 place-items-center rounded-full text-xs font-bold", i === 0 ? "bg-orange text-foreground" : "bg-secondary")}>{num(i + 1)}</span>
            <span className="text-sm font-extrabold tabular-nums">{money(v)}</span>
          </li>
        ))}
      </ol>
      <p className="text-sm text-muted-foreground">{t("bnpl.body", { x: name })}</p>
      <Button
        type="button" size="lg" disabled={busy}
        onClick={async () => {
          if (!enabled) return toast.error(t("bnpl.off", { x: name }));
          setBusy(true);
          try { await onContinue(); } finally { setBusy(false); }
        }}
        className="h-14 rounded-full bg-orange text-base font-bold text-foreground hover:bg-flame"
      >
        {busy ? t("ck.paying") : t("bnpl.continue", { x: name })}
      </Button>
    </div>
  );
}
