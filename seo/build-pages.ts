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
import { GUIDES } from "../src/lib/coffee-guide";
import { blocks, POSTS } from "../src/lib/blog";

interface Page {
  path: string; // "" for home, "shop", "shop/signature"…
  title: string;
  description: string;
  index: boolean;
  type?: "website" | "product" | "article";
  jsonld?: object[];
  image?: string; // absolute URL for og:image (defaults to the roastery photo)
  /** readable page text placed inside #root, so crawlers that don't run JavaScript still see the content */
  body?: string;
}

const BRAND = "إن قو";
/** Cut a meta description at a word boundary, at most n characters. */
const clip = (s: string, n = 160) => {
  s = s.replace(/\s+/g, " ").trim();
  if (s.length <= n) return s;
  const cut = s.slice(0, n - 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[،,.:;·\s]+$/, "") + "…";
};
const esc =(s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function seoPages(): Plugin {
  return {
    name: "ingo-seo-pages",
    apply: "build",
    closeBundle() {
      const dist = "dist";
      // domain in lowercase so canonical links and the sitemap always use one exact address
      const raw = new URL(process.env.SITE_URL || "https://ingo.sa");
      const site = `${raw.protocol}//${raw.host.toLowerCase()}${raw.pathname}`.replace(/\/$/, "");
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
      /** Plain HTML of an article body (same markup rules as the React page). */
      const blocksHtml = (body: string[]) => blocks(body).map((b) =>
        b.t === "h" ? `<h2>${esc(b.text)}</h2>`
        : b.t === "ul" || b.t === "ol" ? `<${b.t}>${b.items.map((x) => `<li>${esc(x)}</li>`).join("")}</${b.t}>`
        : `<p>${esc(b.text)}</p>`).join("");
      /** Product text for crawlers: name, short + full description, details and suggested recipes. */
      const productBody = (p: (typeof PRODUCTS)[number]) => {
        const g = GUIDES[p.id];
        const sp = p.specs;
        const name = { hot: "V60 حار", iced: "V60 بارد", espresso: "إسبريسو" } as const;
        return `<article class="container-ingo py-12"><h1>${esc(p.name.ar)} – ${esc(p.tagline.ar)}</h1>` +
          `<p>${esc(p.description.ar)}</p><p>النكهات: ${esc(p.notes.ar)}. الأحجام: ${p.sizes.map((x) => `${x.w} (${x.price} ريال)`).join("، ")}.</p>` +
          (sp ? `<ul><li>المنشأ: ${esc(sp.origin.ar)}</li><li>المعالجة: ${esc(sp.process.ar)}</li><li>السلالة: ${esc(sp.variety.ar)}</li><li>القوام: ${esc(sp.body.ar)}</li><li>درجة التحميص: ${sp.roast} من 7</li></ul>` : "") +
          (g ? `<h2>عن هذه القهوة</h2>${g.story.ar.map((x) => `<p>${esc(x)}</p>`).join("")}<h2>طريقة التحضير</h2>` +
            g.recipes.map((r) => `<h3>${name[r.kind]}</h3><p>${r.dose} جم قهوة، ${r.kind === "espresso" ? `${r.water} جم في الكوب` : `${r.water} مل ماء${r.ice ? ` و${r.ice} جم ثلج` : ""}`}، حرارة الماء ${r.temp} درجة، الوقت ${r.time}${r.kind === "espresso" ? " ثانية" : ""}. الطحنة: ${esc(r.grind.ar)}. ${esc(r.tip.ar)}</p>`).join("") : "") +
          `</article>`;
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
          const low = Math.min(...prices);
          const sp = p.specs;
          const image = p.image ? file(p.image) : undefined;
          // short, specific meta description: what it is, where from, how it tastes, the price
          const description = sp
            ? clip(`${p.name.ar}: قهوة مختصة من ${sp.origin.ar}، ${sp.process.ar}، محمّصة في محمصة إن قو. النكهات: ${p.notes.ar}. ${sp.body.ar}. من ${low} ريال شامل الضريبة.`)
            : clip(`${p.name.ar} من إن قو. ${p.notes.ar}. من ${low} ريال شامل الضريبة. ${p.description.ar}`);
          return {
            path: `shop/${p.id}`,
            type: "product",
            title: `${p.name.ar} – ${p.tagline.ar} | ${BRAND}`,
            description,
            index: true,
            image,
            body: productBody(p),
            jsonld: [
              {
                "@context": "https://schema.org",
                "@type": "Product",
                name: p.name.ar,
                alternateName: p.name.en,
                description: p.description.ar,
                sku: p.id,
                ...(image ? { image: [image] } : {}),
                ...(sp
                  ? {
                      additionalProperty: [
                        ["بلد المنشأ", sp.origin.ar],
                        ["طريقة المعالجة", sp.process.ar],
                        ["السلالة", sp.variety.ar],
                        ["القوام", sp.body.ar],
                        ["النكهات", p.notes.ar],
                        ["درجة التحميص", `${sp.roast} من 7`],
                      ].map(([name, value]) => ({ "@type": "PropertyValue", name, value })),
                    }
                  : {}),
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
        {
          path: "blog",
          title: "مدونة إن قو | وصفات تحضير القهوة ونصائح القهوة المختصة",
          description: "وصفات V60 حار وبارد، الفرق بين القهوة المجففة والمغسولة، وطريقة حفظ حبوب القهوة. مقالات من محمصة إن قو.",
          index: true,
          jsonld: [crumbs([["الرئيسية", ""], ["المدونة", "blog"]])],
          body: `<section class="container-ingo py-12"><h1>مدونة إن قو</h1><ul>${POSTS.map((b) => `<li><a href="${url(`blog/${b.slug}`)}">${esc(b.ar.title)}</a>: ${esc(b.ar.excerpt)}</li>`).join("")}</ul></section>`,
        },
        ...POSTS.map((b): Page => ({
          path: `blog/${b.slug}`,
          type: "article",
          title: `${b.ar.title} | ${BRAND}`,
          description: clip(b.ar.excerpt),
          index: true,
          image: file(b.cover),
          body: `<article class="container-ingo py-12"><h1>${esc(b.ar.title)}</h1><p>${esc(b.ar.excerpt)}</p>${blocksHtml(b.ar.body)}</article>`,
          jsonld: [
            {
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: b.ar.title,
              description: b.ar.excerpt,
              image: [file(b.cover)],
              datePublished: b.date,
              dateModified: b.date,
              inLanguage: "ar",
              author: { "@type": "Organization", name: "INGO", url: url("") },
              publisher: { "@id": `${site}/#organization` },
              mainEntityOfPage: url(`blog/${b.slug}`),
            },
            crumbs([["الرئيسية", ""], ["المدونة", "blog"], [b.ar.title, `blog/${b.slug}`]]),
          ],
        })),
      ];

      const template = readFileSync(join(dist, "index.html"), "utf8");
      const render = (pg: Page, canonical: string | null) => {
        const head = [
          `<title>${esc(pg.title)}</title>`,
          `<meta name="description" content="${esc(pg.description)}" />`,
          `<meta name="robots" content="${pg.index ? "index, follow, max-image-preview:large" : "noindex, follow"}" />`,
          canonical ? `<link rel="canonical" href="${canonical}" />` : "",
          `<meta property="og:site_name" content="INGO | ${BRAND}" />`,
          `<meta property="og:type" content="${pg.type ?? "website"}" />`,
          `<meta property="og:title" content="${esc(pg.title)}" />`,
          `<meta property="og:description" content="${esc(pg.description)}" />`,
          canonical ? `<meta property="og:url" content="${canonical}" />` : "",
          `<meta property="og:image" content="${pg.image ?? ogImage}" />`,
          `<meta property="og:locale" content="ar_SA" />`,
          `<meta property="og:locale:alternate" content="en_US" />`,
          `<meta name="twitter:card" content="summary_large_image" />`,
          ...(pg.jsonld ?? []).map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`),
        ].filter(Boolean).join("\n    ");
        return template
          .replace(/<title>[\s\S]*?<\/title>/, "")
          .replace(/<meta name="description"[^>]*>/, "")
          .replace("</head>", `    ${head}\n  </head>`)
          .replace('<div id="root"></div>', `<div id="root">${pg.body ?? ""}</div>`);
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
        `- [Shop](${url("shop")}): specialty beans and instant products, delivery across Saudi Arabia in 2–5 working days. Payment: mada, Visa, Mastercard, Tabby, Tamara.\n` +
        POSTS.map((b) => `- [${b.en.title}](${url(`blog/${b.slug}`)}): ${b.en.excerpt}
`).join("") +
        PRODUCTS.map((p) => `- [${p.name.en}](${url(`shop/${p.id}`)}): ${p.tagline.en}${p.specs ? `, ${p.specs.variety.en}, ${p.specs.body.en.toLowerCase()}, roast ${p.specs.roast}/7` : ""}. ${p.notes.en}. From SAR ${Math.min(...p.sizes.map((s) => s.price))} incl. VAT.\n`).join("") +
        `- [For business](${url("business")}): the INGO 2-drink machine, free on a 6- or 12-month loan with free maintenance; supplies bought from INGO as used, no minimum; or buy it for SAR 2,500 incl. VAT with a 2-year warranty. Two drinks picked from 10+ flavours. Free delivery and installation in Riyadh, Jeddah, Dammam and Madinah.\n\n` +
        `## Contact\n\n- Email: info@ingo.sa\n- Phone: 920000384\n`);

      console.log(`  seo: ${pages.length} pages + 404, sitemap (${indexable.length} URLs), robots.txt, llms.txt → ${site}`);
    },
  };
}
