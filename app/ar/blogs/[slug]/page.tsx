import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AP_Header from "@/app/components/AP_Header";
import AP_Footer from "@/app/components/AP_Footer";
import { getCmsContent } from "@/shared/content";
import { blogEntries, findBlogEntry, paragraphs } from "@/shared/blog";
import { sizedImage, imageSrcSet } from "@/shared/images";
import { absoluteUrl, buildPageMetadata, localizeFooter, localizeNavigation } from "@/shared/seo";

export const dynamic = "force-dynamic";

type RouteProps = { params: Promise<{ slug: string }> };
function absoluteMedia(value: string) {
  return /^https?:\/\//i.test(value) ? value : absoluteUrl(value);
}

function isoDate(value?: string) {
  if (!value) return undefined;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : undefined;
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getCmsContent("ar");
  const post = findBlogEntry(blogEntries(data.blogs, "ar"), slug);
  if (!post) return {};
  return buildPageMetadata({
    title: post.title,
    description: post.body,
    path: `/blogs/${slug}`,
    locale: "ar",
    image: post.image,
  });
}

export default async function ArabicBlogPostPage({ params }: RouteProps) {
  const { slug } = await params;
  const { data } = await getCmsContent("ar");
  const post = findBlogEntry(blogEntries(data.blogs, "ar"), slug);
  if (!post) notFound();
  const others = blogEntries(data.blogs, "ar").filter((entry) => entry.slug !== post.slug).slice(0, 3);

  const nav = localizeNavigation(data.nav, "ar");
  const footer = localizeFooter(data.footer, "ar");
  const url = absoluteUrl(`/ar/blogs/${slug}`);
  const published = isoDate(post.date);
  const author = post.author?.trim();
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.body,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(published ? { datePublished: published, dateModified: published } : {}),
    ...(post.image ? { image: absoluteMedia(post.image) } : {}),
    author: author
      ? { "@type": "Person", name: author }
      : { "@type": "Organization", "@id": "https://apexlb.tech/#organization", name: "APEX" },
    publisher: { "@type": "Organization", "@id": "https://apexlb.tech/#organization", name: "APEX" },
    inLanguage: "ar",
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: "https://apexlb.tech/ar" },
      { "@type": "ListItem", position: 2, name: "المدونة", item: "https://apexlb.tech/ar/blogs" },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} />
      <AP_Header labels={data.meta.labels} cta={data.meta.headerCta ?? ""} logo={data.meta.logo} logoAlt={data.meta.logoAlt} nav={nav} activePath="/ar/blogs" />
      <main className="bg-white text-hx-ink">
        <article className="mx-auto w-[min(900px,88%)] py-[clamp(3rem,8vw,7rem)]">
          <a href="/ar/blogs" className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-hx-cyanInk hover:text-[#00897E]">← العودة إلى المدونة</a>
          <div className="mt-8 flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-hx-muted">
            {post.category ? <span>{post.category}</span> : null}
            {post.category && post.date ? <span aria-hidden="true">•</span> : null}
            {post.date ? <time>{post.date}</time> : null}
          </div>
          <h1 className="mt-4 max-w-[850px] text-[clamp(34px,6vw,68px)] font-bold leading-[1.02] tracking-[-0.045em] text-hx-ink">{post.title}</h1>
          <p className="mt-7 max-w-[760px] text-[clamp(17px,2vw,21px)] leading-[1.75] text-hx-copy">{post.body}</p>
          {paragraphs(post.content).length ? (
            <div className="mt-8 flex max-w-[760px] flex-col gap-5 text-[16px] leading-[1.85] text-hx-copy">
              {paragraphs(post.content).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
          ) : null}
          {post.image ? <img src={sizedImage(post.image, 1200)} srcSet={imageSrcSet(post.image)} sizes="(min-width:1024px) 900px, 100vw" alt={post.title} decoding="async" className="mt-10 h-auto w-full rounded-[22px] border border-hx-line object-cover" /> : null}
          {others.length ? (
            <section className="mt-14 border-t border-hx-line pt-8">
              <h2 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-hx-cyanInk">المزيد من القصص</h2>
              <ul className="mt-4 flex list-none flex-col gap-3 p-0">
                {others.map((other) => (
                  <li key={other.slug}>
                    <a href={other.href} className="group block rounded-xl border border-hx-line p-4 transition hover:border-[#bcdff2]">
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-hx-muted">{other.category}{other.category && other.date ? " • " : ""}{other.date}</span>
                      <strong className="mt-1 block text-[15px] text-hx-ink group-hover:text-hx-cyanInk">{other.title}</strong>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </article>
      </main>
      <AP_Footer labels={data.meta.labels} logo={data.meta.logo} logoAlt={data.meta.logoAlt} nav={nav} content={footer} social={data.social} />
    </>
  );
}
