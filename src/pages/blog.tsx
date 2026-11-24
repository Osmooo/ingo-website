import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { Display, Eyebrow } from "@/components/site/section-heading";
import { asset } from "@/lib/asset";
import { POSTS } from "@/lib/blog";
import { useI18n } from "@/lib/i18n";
import { usePageTitle } from "@/lib/use-title";

/** /blog: all articles, newest first. */
export default function Blog() {
  const { t, lang } = useI18n();
  usePageTitle(t("title.blog"));
  const posts = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
  const date = new Intl.DateTimeFormat(lang === "ar" ? "ar-SA-u-nu-latn-ca-gregory" : "en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <section className="container-ingo py-12 md:py-20">
      <Eyebrow>{t("blog.eyebrow")}</Eyebrow>
      <h1 className="mt-3 text-5xl leading-[1.15] md:text-7xl"><Display text={t("blog.title")} /></h1>
      <p className="mt-4 max-w-2xl text-lg font-light text-muted-foreground md:text-xl">{t("blog.sub")}</p>

      <ul className="mt-12 grid gap-6 md:grid-cols-2">
        {posts.map((p) => {
          const c = p[lang];
          return (
            <li key={p.slug} className="list-none">
              <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border bg-card">
                <Link to={`/blog/${p.slug}`} tabIndex={-1} aria-hidden className="block aspect-[16/9] overflow-hidden bg-secondary">
                  <img src={asset(p.cover)} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <p className="flex items-center gap-3 text-sm text-muted-foreground">
                    <time dateTime={p.date}>{date.format(new Date(p.date))}</time>
                    <span className="inline-flex items-center gap-1"><Clock aria-hidden className="size-3.5" />{t("blog.min", { x: String(p.minutes) })}</span>
                  </p>
                  <h2 className="mt-2 text-2xl font-bold leading-snug"><Link to={`/blog/${p.slug}`} className="hover:underline">{c.title}</Link></h2>
                  <p className="mt-2 text-muted-foreground">{c.excerpt}</p>
                  <Link to={`/blog/${p.slug}`} className="mt-auto pt-4 text-sm font-bold text-flame-ink underline-offset-4 hover:underline">{t("blog.read")}</Link>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
