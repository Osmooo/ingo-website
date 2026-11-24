/**
 * Online payment through Moyasar (https://docs.moyasar.com).
 *
 * Card and Apple Pay payments are created straight from the customer's browser with the
 * PUBLISHABLE key (pk_test_… / pk_live_…). That key can only create payments, so it is safe in
 * site code. Card numbers go from the browser to Moyasar over HTTPS and never touch INGO's servers.
 *
 * Before fulfilling an order, check the payment in the Moyasar dashboard (or from a backend with
 * the secret key): the status the browser is sent back with can be edited by anyone.
 */
import { CONFIG } from "./config";

const API = "https://api.moyasar.com/v1";

export type CardBrand = "visa" | "mastercard" | "mada" | "unknown";

/* ---------------- card helpers ---------------- */

export const digitsOnly = (s: string) => s.replace(/\D/g, "");

/** Luhn checksum: catches mistyped card numbers before they reach the gateway. */
export function luhn(num: string) {
  const d = digitsOnly(num);
  if (d.length < 12) return false;
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i]);
    if (i % 2 === 1) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
  }
  return sum % 10 === 0;
}

/**
 * A partial list of mada BIN prefixes, used only to show the right logo while typing.
 * The gateway decides the real network (Moyasar returns source.company), so a miss here is harmless.
 */
const MADA_BINS = [
  "588845", "440647", "440795", "446404", "457865", "968208", "636120", "417633", "468540", "468541",
  "468542", "468543", "968201", "446393", "409201", "458456", "484783", "462220", "455708", "410621",
  "455036", "486094", "486095", "486096", "504300", "440533", "489318", "489319", "445564", "968211",
  "410685", "406996", "432328", "428671", "428672", "428673", "968206", "446672", "543357", "434107",
  "431361", "604906", "521076", "588850", "968202", "535825", "529415", "543085", "524130", "554180",
  "549760", "588848", "968209", "524514", "529741", "537767", "535989", "536023", "513213", "585265",
  "588983", "588982", "589005", "508160", "531095", "530906", "532013", "605141", "968204", "422817",
  "422818", "422819", "428331", "483010", "483011", "483012", "589206", "968207", "419593", "439954",
  "407197", "407395", "520058", "530060", "531196", "412565", "403024", "968205", "406136",
  "420132", // Moyasar's mada test cards
];

export function cardBrand(num: string): CardBrand {
  const d = digitsOnly(num);
  if (d.length >= 6 && MADA_BINS.includes(d.slice(0, 6))) return "mada";
  if (/^4/.test(d)) return "visa";
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(d)) return "mastercard";
  return "unknown";
}

/** "4111111111111111" → "4111 1111 1111 1111" (max 19 digits). */
export const formatCardNumber = (s: string) => digitsOnly(s).slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ");

/** "1228" → "12/28" */
export function formatExpiry(s: string) {
  const d = digitsOnly(s).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export function parseExpiry(s: string): { month: number; year: number } | null {
  const m = /^(\d{2})\/(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return null;
  const now = new Date();
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  return endOfMonth >= now ? { month, year } : null;
}

/** Moyasar wants the cardholder name in English letters, at least two words. */
export const validCardName = (s: string) => /^[A-Za-z][A-Za-z'.-]*(\s+[A-Za-z][A-Za-z'.-]*)+$/.test(s.trim());

export const validCvc = (s: string) => /^\d{3,4}$/.test(s);

/* ---------------- the order waiting for payment ---------------- */

export interface PendingOrder {
  ref: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
  notes?: string;
  items: string;
  total: number; // SAR
  method: string;
}

const PENDING = "ingo-pending-order";
export function savePending(o: PendingOrder) { try { sessionStorage.setItem(PENDING, JSON.stringify(o)); } catch { /* private mode */ } }
export function loadPending(): PendingOrder | null { try { return JSON.parse(sessionStorage.getItem(PENDING) || "null"); } catch { return null; } }
export function clearPending() { try { sessionStorage.removeItem(PENDING); } catch { /* ignore */ } }

export const newOrderRef = () => `INGO-${Date.now().toString(36).toUpperCase()}`;

/* ---------------- Moyasar ---------------- */

export const paymentsEnabled = () => Boolean(CONFIG.moyasarPublishableKey);

export interface MoyasarPayment {
  id: string;
  status: "initiated" | "paid" | "authorized" | "failed" | string;
  source?: { type?: string; company?: string; message?: string; transaction_url?: string };
  message?: string;
}

export class PaymentError extends Error {}

const halalas = (sar: number) => Math.round(sar * 100);

/** Order details travel with the payment, so they show next to it in the Moyasar dashboard. */
function metadata(o: PendingOrder): Record<string, string> {
  return {
    order_ref: o.ref, name: o.name, phone: o.phone, email: o.email || "", city: o.city,
    address: o.address.slice(0, 250), items: o.items.slice(0, 250), notes: (o.notes || "").slice(0, 250),
  };
}

async function createPayment(o: PendingOrder, source: Record<string, unknown>): Promise<MoyasarPayment> {
  const key = CONFIG.moyasarPublishableKey;
  if (!key) throw new PaymentError("not-connected");
  const res = await fetch(`${API}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${btoa(`${key}:`)}` },
    body: JSON.stringify({
      publishable_api_key: key,
      amount: halalas(o.total),
      currency: "SAR",
      description: `INGO order ${o.ref}`,
      callback_url: `${window.location.origin}${import.meta.env.BASE_URL}checkout/result`,
      source,
      metadata: metadata(o),
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const fieldErrors = json?.errors ? Object.values(json.errors as Record<string, string[]>).flat().join(" ") : "";
    throw new PaymentError(fieldErrors || json?.message || "payment-failed");
  }
  return json as MoyasarPayment;
}

/** Card: returns the payment. If 3-D Secure is needed, the caller sends the browser to transaction_url. */
export function payByCard(o: PendingOrder, card: { name: string; number: string; month: number; year: number; cvc: string }) {
  return createPayment(o, {
    type: "creditcard",
    name: card.name.trim(),
    number: digitsOnly(card.number),
    month: card.month,
    year: card.year,
    cvc: card.cvc,
  });
}

/* ---------------- Tabby / Tamara (pay in instalments) ---------------- */

export type BnplProvider = "tabby" | "tamara";

/**
 * Tabby and Tamara sessions must be created by a server with the merchant's SECRET keys, so the
 * site asks CONFIG.bnplEndpoint (a small backend you host) for a checkout link and sends the
 * customer there. See the contract in config.ts. Both providers send the customer back to
 * /checkout/result?provider=…&status=paid|cancelled|failed.
 */
export async function startBnpl(provider: BnplProvider, o: PendingOrder): Promise<string> {
  if (!CONFIG.bnplEndpoint) throw new PaymentError("not-connected");
  const back = (status: string) => `${window.location.origin}${import.meta.env.BASE_URL}checkout/result?provider=${provider}&status=${status}&ref=${encodeURIComponent(o.ref)}`;
  const res = await fetch(CONFIG.bnplEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider,
      order: o,
      amount: o.total.toFixed(2),
      currency: "SAR",
      urls: { success: back("paid"), cancel: back("cancelled"), failure: back("failed") },
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.checkout_url) throw new PaymentError(json?.message || "bnpl-failed");
  return json.checkout_url as string;
}

/* ---------------- Apple Pay (Safari on Apple devices, domain registered in Moyasar) ---------------- */

interface ApplePaySessionLike {
  new (version: number, request: unknown): ApplePayInstance;
  canMakePayments(): boolean;
  STATUS_SUCCESS: number;
  STATUS_FAILURE: number;
}
interface ApplePayInstance {
  onvalidatemerchant: (e: { validationURL: string }) => void;
  onpaymentauthorized: (e: { payment: { token: unknown } }) => void;
  oncancel: () => void;
  completeMerchantValidation(session: unknown): void;
  completePayment(status: number): void;
  abort(): void;
  begin(): void;
}
const AP = () => (window as unknown as { ApplePaySession?: ApplePaySessionLike }).ApplePaySession;

export function applePayAvailable() {
  try { return Boolean(AP()?.canMakePayments()); } catch { return false; }
}

/** Opens the Apple Pay sheet; resolves with the Moyasar payment, rejects on cancel/failure. */
export function payWithApplePay(o: PendingOrder): Promise<MoyasarPayment> {
  const Session = AP();
  const key = CONFIG.moyasarPublishableKey;
  if (!Session) return Promise.reject(new PaymentError("apple-pay-unavailable"));
  if (!key) return Promise.reject(new PaymentError("not-connected"));

  return new Promise((resolve, reject) => {
    const session = new Session(6, {
      countryCode: "SA",
      currencyCode: "SAR",
      supportedNetworks: ["mada", "visa", "masterCard"],
      merchantCapabilities: ["supports3DS", "supportsCredit", "supportsDebit"],
      total: { label: "INGO", amount: o.total.toFixed(2) },
    });

    session.onvalidatemerchant = async (e) => {
      try {
        const res = await fetch(`${API}/applepay/initiate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            validation_url: e.validationURL,
            display_name: "INGO",
            domain_name: window.location.hostname,
            publishable_api_key: key,
          }),
        });
        if (!res.ok) throw new Error("merchant validation failed");
        session.completeMerchantValidation(await res.json());
      } catch {
        session.abort();
        reject(new PaymentError("apple-pay-validation"));
      }
    };

    session.onpaymentauthorized = async (e) => {
      try {
        const payment = await createPayment(o, { type: "applepay", token: JSON.stringify(e.payment.token) });
        const ok = payment.status === "paid" || payment.status === "authorized";
        session.completePayment(ok ? Session.STATUS_SUCCESS : Session.STATUS_FAILURE);
        if (ok) resolve(payment); else reject(new PaymentError(payment.source?.message || "payment-failed"));
      } catch (err) {
        session.completePayment(Session.STATUS_FAILURE);
        reject(err);
      }
    };

    session.oncancel = () => reject(new PaymentError("cancelled"));
    session.begin();
  });
}
