/** Contact details & business settings — edit here. */
export const CONFIG = {
  email: "info@ingo.sa",
  phone: "920000384",
  site: "ingo.sa",
  social: "ingo_coffee",
  freeShippingOver: 200, // SAR
  shippingFee: 25, // SAR — placeholder
  /**
   * Where submissions go. Paste a form endpoint (Formspree, Google Apps Script, your API…)
   * to receive JSON. Left empty, the site opens a pre-filled email to CONFIG.email.
   */
  orderEndpoint: "",
  /** Apple Pay: off until the payment gateway account has Apple Pay switched on. */
  applePay: false,
  /**
   * Optional: a backend URL (yours) that turns a Saudi short address (e.g. RRRD2929) into the full
   * National Address using the SPL API (api.address.gov.sa, needs an SPL subscription key, so it must
   * run on a server, never in the site). The site GETs `<endpoint>?code=RRRD2929` and expects
   * { city, district, street, building, postcode, lat, lng }. Empty = the customer types the address.
   */
  addressLookupEndpoint: "",
  /**
   * Payment gateway for mada / Visa / Mastercard: Moyasar (a Saudi gateway licensed by SAMA).
   * Moyasar PUBLISHABLE key (pk_test_… while testing, pk_live_… when live), from the Moyasar
   * dashboard → Settings → API keys. Never put the secret key (sk_…) here. Empty = online
   * payment switched off: checkout shows a notice and takes no card details.
   */
  moyasarPublishableKey: "",
  /**
   * Tabby / Tamara: a backend URL (yours) that creates the instalment checkout with the SECRET keys.
   * The site POSTs { provider: "tabby" | "tamara", order, amount: "217.00", currency: "SAR",
   * urls: { success, cancel, failure } } and expects back { checkout_url }.
   * The backend calls Tabby (POST https://api.tabby.ai/api/v2/checkout, link at
   * configuration.available_products.installments[0].web_url) or Tamara (POST /checkout, returns
   * checkout_url); check both providers' current docs when building it. Empty = Tabby/Tamara shown
   * but switched off.
   */
  bnplEndpoint: "",
  businessEndpoint: "",
};

export async function sendSubmission(endpoint: string, subject: string, data: Record<string, string>) {
  if (endpoint) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ subject, ...data }),
    });
    if (!res.ok) throw new Error("Submission failed");
    return;
  }
  const body = Object.entries(data)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
