// GitHub Pages has no server routing, so /shop or /business would come back as "404 page not found"
// (the app still shows, but search engines treat the page as missing). This copies the built
// index.html into a folder for every real page, so each one is served normally (200).
// 404.html stays as the fallback for anything else. Run after `vite build`.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";
const index = join(dist, "index.html");

const productIds = [...readFileSync("src/lib/products.ts", "utf8").matchAll(/^\s*id: "([\w-]+)"/gm)].map((m) => m[1]);
const routes = ["shop", "business", "cart", "checkout", "checkout/result", ...productIds.map((id) => `shop/${id}`)];

for (const r of routes) {
  mkdirSync(join(dist, r), { recursive: true });
  copyFileSync(index, join(dist, r, "index.html"));
}
copyFileSync(index, join(dist, "404.html"));
console.log(`pages: / + ${routes.length} (${routes.join(", ")}) + 404 fallback`);
