import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { ProductCard } from "@/components/store/product-card";
import { asset } from "@/lib/asset";
import { blocks, findPost, POSTS } from "@/lib/blog";
import { useI18n } from "@/lib/i18n";
import { findProduct } from "@/lib/products";
import { usePageTitle } from "@/lib/use-title";
import NotFound from "@/pages/not-found";

/** /blog/:slug: one article, then the coffees it mentions and more articles. */
export default function BlogPost() {
  const { slug } = useParams();
  const { t, lang, dir } = useI18n();
  const post = findPost(slug ?? "");
  usePageTitle(post ? `${post[lang].title} | ${t("blog.brand")}` : t("title.blog"));
  if (!post) return <NotFound />;
  const c = post[lang];
  const Back = dir === "rtl" ? ArrowRight : ArrowLeft;
  const date = new Intl.DateTimeFormat(lang === "ar" ? "ar-SA-u-nu-latn-ca-gregory" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
  const products = post.products.map(findProduct).filter((p) => p !== undefined);
  const more = POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <article className="container-ingo py-10 md:py-16">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold hover:underline">
          <Back aria-hidden className="size-4" /> {t("blog.back")}
        </Link>
        <header className="mx-auto mt-6 max-w-3xl">
          <p className="flex items-center gap-3 text-sm text-muted-foreground">
            <time dateTime={post.date}>{date.format(new Date(post.date))}</time>
            <span className="inline-flex items-center gap-1"><Clock aria-hidden className="size-3.5" />{t("blog.min", { x: String(post.minutes) })}</span>
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-[1.25] md:text-5xl">{c.title}</h1>
          <p className="mt-4 text-xl font-light text-muted-foreground">{c.excerpt}</p>
        </header>
        <img src={asset(post.cover)} alt="" decoding="async" className="mx-auto mt-8 aspect-[16/8] w-full max-w-4xl rounded-[1.75rem] object-cover" />

        <div className="mx-auto mt-10 max-w-3xl text-lg leading-relaxed">
          {blocks(c.body).map((b, i) => {
            if (b.t === "h") return <h2 key={i} className="mt-10 mb-3 text-2xl font-bold md:text-3xl">{b.text}</h2>;
            if (b.t === "tip") return <p key={i} className="my-6 rounded-2xl bg-secondary px-5 py-4 font-medium">{b.text}</p>;
            if (b.t === "ul") return <ul key={i} className="my-4 grid list-disc gap-2 ps-6 marker:text-flame-ink">{b.items.map((x, j) => <li key={j}>{x}</li>)}</ul>;
            if (b.t === "ol") return <ol key={i} className="my-4 grid list-decimal gap-2 ps-6 marker:font-bold marker:text-flame-ink">{b.items.map((x, j) => <li key={j}>{x}</li>)}</ol>;
            return <p key={i} className="my-4 font-light">{b.text}</p>;
          })}
        </div>
      </article>

      {products.length > 0 && (
        <section className="border-t py-16 md:py-20">
          <div className="container-ingo">
            <SectionHeading title={t("blog.products")} />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          </div>
        </section>
      )}

      <section className="border-t py-16 md:py-20">
        <div className="container-ingo">
          <SectionHeading title={t("blog.more")} />
          <ul className="grid gap-4 md:grid-cols-2">
            {more.map((p) => (
              <li key={p.slug} className="list-none">
                <Link to={`/blog/${p.slug}`} className="flex h-full gap-4 rounded-2xl border bg-card p-4 hover:border-apricot">
                  <img src={asset(p.cover)} alt="" loading="lazy" decoding="async" className="size-20 shrink-0 rounded-xl object-cover" />
                  <span>
                    <span className="block font-bold">{p[lang].title}</span>
                    <span className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p[lang].excerpt}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
