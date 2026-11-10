import { localizedPath, slugifySeo } from "@/shared/seo";
import type { BlogsPageContent, Locale } from "@/shared/types";

/*
 * Every story an editor can publish - the featured one, the update cards and
 * the insight posts - normalised into one shape. The listing page and the
 * article page both read from here, so a card's "Read more" link and the page
 * it opens can never disagree about which story is which.
 */
export type BlogEntry = {
  kind: "featured" | "update" | "post";
  title: string;
  /** Short summary shown on the card. */
  body: string;
  /** Full article, paragraphs separated by blank lines. */
  content?: string;
  date?: string;
  category?: string;
  image?: string;
  author?: string;
  cta?: string;
  slug: string;
  /** Link to the article page, or a custom address the editor set. */
  href: string;
};

export function blogSlug(title: string, fallback: string) {
  return slugifySeo(title) || fallback;
}

export function blogEntries(blogs: BlogsPageContent, locale: Locale = "en"): BlogEntry[] {
  const entries: BlogEntry[] = [];
  const featured = blogs.featured;
  if (featured?.title) {
    const slug = blogSlug(featured.title, "featured");
    entries.push({
      kind: "featured",
      title: featured.title,
      body: featured.body,
      content: featured.content,
      date: featured.date,
      category: featured.label,
      image: featured.image,
      author: featured.author,
      cta: featured.cta,
      slug,
      href: featured.href || localizedPath(`/blogs/${slug}`, locale),
    });
  }
  (blogs.updates ?? []).forEach((item, index) => {
    const slug = blogSlug(item.title, `update-${index + 1}`);
    entries.push({
      kind: "update",
      title: item.title,
      body: item.body,
      content: item.content,
      date: item.date,
      category: item.category,
      image: item.image,
      author: item.author,
      cta: item.cta,
      slug,
      href: item.href || localizedPath(`/blogs/${slug}`, locale),
    });
  });
  (blogs.posts ?? []).forEach((item, index) => {
    const slug = blogSlug(item.title, `post-${index + 1}`);
    entries.push({
      kind: "post",
      title: item.title,
      body: item.body,
      content: item.content,
      date: item.date,
      category: item.category,
      image: item.image,
      author: item.author,
      slug,
      href: item.href || localizedPath(`/blogs/${slug}`, locale),
    });
  });
  return entries;
}

export function findBlogEntry(entries: BlogEntry[], slug: string) {
  return entries.find((entry) => entry.slug === slug);
}

/** Split stored article text into paragraphs. */
export function paragraphs(text?: string) {
  return (text ?? "").split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
}
