/**
 * Build-time SEO for the single-page app (applies the claude-seo checklists: seo-page, seo-technical,
 * seo-schema, seo-ecommerce, seo-sitemap, seo-geo / seo-agentic).
 *
 * After `vite build` it writes, into dist/:
 *  - one HTML file per real page (/, /shop, /business, /cart, /checkout, every product), each with its own
 *    <title>, meta description, canonical, Open Graph / Twitter tags, robots and JSON-LD. Hosts serve these
 *    as normal pages (200), and link previews / crawlers see the right info without running JavaScript.
 *  - 404.html (noindex) for unknown addresses
 *  - sitemap.xml, robots.txt, llms.txt
 *
 * The site's public address comes from SITE_URL (set per host in the GitHub workflows).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";
import { PRODUCTS } from "../src/lib/products";

interface Page {
  path: string; // "" for home, "shop", "shop/signature"…
  title: string;
  description: string;
  index: boolean;
  type?: "website" | "product";
  jsonld?: object[];
}

const BRAND = "إن قو";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function seoPages(): Plugin {
  return {
    name: "ingo-seo-pages",
    apply: "build",
    closeBundle() {
      const dist = "dist";
      const site = (process.env.SITE_URL || "https://ingo.sa").replace(/\/$/, "");
      const url = (p: string) => `${site}/${p ? `${p}/` : ""}`;
      const file = (p: string) => `${site}/${p}`; // public files (images, sitemap) at the root of SITE_URL
      const ogImage = file("img/roastery/pour-cooling-tray.webp");
      const today = new Date().toISOString().slice(0, 10);

      const organization = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${site}/#organization`,
        name: "INGO",
        alternateName: BRAND,
        url: url(""),
        logo: file("img/logo.svg"),
        email: "info@ingo.sa",
        telephone: "920000384",
        description: "إن قو علامة قهوة سعودية تحمّص قهوتها بنفسها: حبوب قهوة مختصة، منتجات سريعة التحضير، وماكينات خدمة ذاتية للمتاجر.",
      };
      const website = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${site}/#website`,
        name: "INGO",
        alternateName: BRAND,
        url: url(""),
        inLanguage: ["ar", "en"],
        publisher: { "@id": `${site}/#organization` },
      };
      const crumbs = (items: [string, string][]) => ({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map(([name, p], i) => ({ "@type": "ListItem", position: i + 1, name, item: url(p) })),
      });

      const pages: Page[] = [
        {
          path: "",
          title: "إن قو | قهوة مختصة سعودية معك في كل مكان",
          description: "إن قو علامة قهوة سعودية نحمّص قهوتنا بأنفسنا: حبوب قهوة مختصة، منتجات سريعة التحضير، وماكينات خدمة ذاتية للبقالات والمتاجر.",
          index: true,
          jsonld: [organization, website],
        },
        {
          path: "shop",
          title: "متجر إن قو | حبوب قهوة مختصة ومنتجات سريعة التحضير",
          description: "تسوّق حبوب قهوة مختصة من محمصة إن قو بأحجام 250 جم و500 جم و1 كجم، وأعواد وأكياس تقطير. توصيل خلال 2–5 أيام عمل.",
          index: true,
          jsonld: [crumbs([["الرئيسية", ""], ["المتجر", "shop"]])],
        },
        {
          path: "business",
          title: "ماكينة إن قو لمتجرك | مجاناً بعقد إعارة",
          description: "ماكينة قهوة إن قو لمتجرك مجاناً بعقد إعارة 6 أو 12 شهراً مع صيانة مجانية، أو اشترها بـ 2,500 ريال شامل الضريبة. مشروبين تختارهم من أكثر من 10 نكهات.",
          index: true,
          jsonld: [crumbs([["الرئيسية", ""], ["للشركات", "business"]])],
        },
        { path: "cart", title: `السلة | ${BRAND}`, description: "سلة المشتريات.", index: false },
        { path: "checkout", title: `إتمام الطلب | ${BRAND}`, description: "إتمام الطلب.", index: false },
        { path: "checkout/result", title: `نتيجة الدفع | ${BRAND}`, description: "نتيجة الدفع.", index: false },
        ...PRODUCTS.map((p): Page => {
          const prices = p.sizes.map((s) => s.price);
          return {
            path: `shop/${p.id}`,
            type: "product",
            title: `${p.name.ar} – ${p.tagline.ar} | ${BRAND}`,
            description: `${p.description.ar} ${p.notes.ar}. من ${Math.min(...prices)} ريال شامل الضريبة.`.replace(/\s+/g, " ").slice(0, 300),
            index: true,
            jsonld: [
              {
                "@context": "https://schema.org",
                "@type": "Product",
                name: p.name.ar,
                alternateName: p.name.en,
                description: p.description.ar,
                brand: { "@type": "Brand", name: "INGO" },
                category: p.cat === "beans" ? "حبوب قهوة" : "قهوة سريعة التحضير",
                url: url(`shop/${p.id}`),
                offers: {
                  "@type": "AggregateOffer",
                  priceCurrency: "SAR",
                  lowPrice: Math.min(...prices),
                  highPrice: Math.max(...prices),
                  offerCount: p.sizes.length,
                  url: url(`shop/${p.id}`),
                },
              },
              crumbs([["الرئيسية", ""], ["المتجر", "shop"], [p.name.ar, `shop/${p.id}`]]),
            ],
          };
        }),
      ];

      const template = readFileSync(join(dist, "index.html"), "utf8");
      const render = (pg: Page, canonical: string | null) => {
        const head = [
          `<title>${esc(pg.title)}</title>`,
          `<meta name="description" content="${esc(pg.description)}" />`,
          `<meta name="robots" content="${pg.index ? "index, follow, max-image-preview:large" : "noindex, follow"}" />`,
          canonical ? `<link rel="canonical" href="${canonical}" />` : "",
          `<meta property="og:site_name" content="INGO | ${BRAND}" />`,
          `<meta property="og:type" content="${pg.type === "product" ? "product" : "website"}" />`,
          `<meta property="og:title" content="${esc(pg.title)}" />`,
          `<meta property="og:description" content="${esc(pg.description)}" />`,
          canonical ? `<meta property="og:url" content="${canonical}" />` : "",
          `<meta property="og:image" content="${ogImage}" />`,
          `<meta property="og:locale" content="ar_SA" />`,
          `<meta property="og:locale:alternate" content="en_US" />`,
          `<meta name="twitter:card" content="summary_large_image" />`,
          ...(pg.jsonld ?? []).map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`),
        ].filter(Boolean).join("\n    ");
        return template
          .replace(/<title>[\s\S]*?<\/title>/, "")
          .replace(/<meta name="description"[^>]*>/, "")
          .replace("</head>", `    ${head}\n  </head>`);
      };

      for (const pg of pages) {
        const dir = pg.path ? join(dist, pg.path) : dist;
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, "index.html"), render(pg, url(pg.path)));
      }
      writeFileSync(join(dist, "404.html"), render({ path: "404", title: `الصفحة غير موجودة | ${BRAND}`, description: "الصفحة غير موجودة.", index: false }, null));

      const indexable = pages.filter((p) => p.index);
      writeFileSync(join(dist, "sitemap.xml"),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        indexable.map((p) => `  <url><loc>${url(p.path)}</loc><lastmod>${today}</lastmod></url>`).join("\n") +
        `\n</urlset>\n`);

      writeFileSync(join(dist, "robots.txt"),
        `# Everyone may crawl the site, including AI search crawlers (OAI-SearchBot, Claude-SearchBot, PerplexityBot).\n` +
        `# The cart and checkout are kept out of search results with a noindex tag on the page itself.\n` +
        `User-agent: *\nAllow: /\n\nSitemap: ${file("sitemap.xml")}\n`);

      writeFileSync(join(dist, "llms.txt"),
        `# INGO (إن قو)\n\n` +
        `> INGO is a Saudi coffee brand that roasts its own coffee. It sells specialty coffee beans (250g, 500g, 1kg), instant coffee sticks and drip bags to individuals, and places self-service coffee machines in baqalas, mini markets, supermarkets, restaurants and cafeterias.\n\n` +
        `## Pages\n\n` +
        `- [Shop](${url("shop")}): specialty beans and instant products, delivery across Saudi Arabia in 2–5 working days. Payment: Apple Pay, mada, Visa, Mastercard, Tabby, Tamara.\n` +
        PRODUCTS.map((p) => `- [${p.name.en}](${url(`shop/${p.id}`)}): ${p.tagline.en}. ${p.notes.en}. From SAR ${Math.min(...p.sizes.map((s) => s.price))} incl. VAT.\n`).join("") +
        `- [For business](${url("business")}): the INGO 2-drink machine, free on a 6- or 12-month loan with free maintenance; supplies bought from INGO as used, no minimum; or buy it for SAR 2,500 incl. VAT with a 2-year warranty. Two drinks picked from 10+ flavours. Free delivery and installation in Riyadh, Jeddah, Dammam and Madinah.\n\n` +
        `## Contact\n\n- Email: info@ingo.sa\n- Phone: 920000384\n`);

      console.log(`  seo: ${pages.length} pages + 404, sitemap (${indexable.length} URLs), robots.txt, llms.txt → ${site}`);
    },
  };
}
