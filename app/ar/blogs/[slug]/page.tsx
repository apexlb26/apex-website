import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AP_Header from "@/app/components/AP_Header";
import AP_Footer from "@/app/components/AP_Footer";
import { getCmsContent } from "@/shared/content";
import { absoluteUrl, buildPageMetadata, localizeFooter, localizeNavigation, slugifySeo } from "@/shared/seo";

export const dynamic = "force-dynamic";

type RouteProps = { params: Promise<{ slug: string }> };
type CitablePost = { title: string; body: string; date?: string; category?: string; image?: string; author?: string };

function blogEntries(data: Awaited<ReturnType<typeof getCmsContent>>["data"]): CitablePost[] {
  const updates = (data.blogs.updates ?? []).map((item) => ({
    title: item.title, body: item.body, date: item.date, category: item.category, image: item.image,
    author: (item as typeof item & { author?: string }).author,
  }));
  const posts = (data.blogs.posts ?? []).map((item) => ({
    title: item.title, body: item.body, date: item.date, category: item.category, image: item.image,
    author: (item as typeof item & { author?: string }).author,
  }));
  return [...updates, ...posts];
}

function findPost(entries: CitablePost[], slug: string) {
  return entries.find((entry) => slugifySeo(entry.title) === slug);
}

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
  const post = findPost(blogEntries(data), slug);
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
  const post = findPost(blogEntries(data), slug);
  if (!post) notFound();

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
          {post.image ? <img src={post.image} alt={post.title} className="mt-10 h-auto w-full rounded-[22px] border border-hx-line object-cover" /> : null}
        </article>
      </main>
      <AP_Footer labels={data.meta.labels} logo={data.meta.logo} logoAlt={data.meta.logoAlt} nav={nav} content={footer} social={data.social} />
    </>
  );
}
