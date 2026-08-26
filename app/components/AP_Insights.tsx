import Link from "next/link";
import type { BlogsPageContent, InsightPost, SolutionsContent } from "@/shared/types";
import AP_Icon from "@/app/components/AP_Icon";

/* No media queries: label column + wrapping card row closed by ghost items. */
const shell = "mx-auto w-[min(1640px,86%)]";

/** Abstract cover used until a real image is set on the post. */
function PostArt({ index }: { index: number }) {
  const palettes = [
    ["#e8f4fb", "#cfe8f7", "#1f8fce"],
    ["#eaf6fb", "#d6ecf6", "#38b6d8"],
    ["#edf5fb", "#dbeaf6", "#2f7fb8"],
  ];
  const [from, to, ink] = palettes[index % palettes.length];
  return (
    <svg viewBox="0 0 400 190" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`post-${index}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={from} /><stop offset="1" stopColor={to} /></linearGradient>
      </defs>
      <rect width="400" height="190" fill={`url(#post-${index})`} />
      <rect x="118" y="42" width="164" height="106" rx="10" fill="#ffffff" fillOpacity=".7" />
      <g stroke={ink} strokeOpacity=".55" fill="none" strokeWidth="2">
        {index === 0 && <><circle cx="200" cy="95" r="26" /><path d="M200 69v52M174 95h52M182 77l36 36M218 77l-36 36" /></>}
        {index === 1 && <><path d="M168 112a20 20 0 0 1 3-39 28 28 0 0 1 52 8 17 17 0 0 1 2 31Z" /><path d="M186 124h28M180 134h40" /></>}
        {index === 2 && <><path d="M162 128V96M182 128V78M202 128v-40M222 128V86M242 128v-52" strokeWidth="7" strokeLinecap="round" /></>}
      </g>
    </svg>
  );
}

export default function AP_Insights({ blogs, solutions, compact = false }: { blogs: BlogsPageContent; solutions: SolutionsContent; compact?: boolean }) {
  const posts: InsightPost[] = blogs.posts?.length
    ? blogs.posts
    : solutions.items.slice(0, 3).map((item) => ({ category: item.title, title: item.title, body: item.body, date: "", readTime: "" }));

  return (
    <section className={`border-t border-hx-line bg-hx-band ${compact ? "py-[clamp(2rem,4vw,3.25rem)]" : "py-[clamp(2.25rem,4.5vw,3.75rem)]"}`}>
      <div className={`${shell} flex flex-wrap gap-x-[clamp(2rem,5vw,5rem)] gap-y-8`}>
        <div className="min-w-[min(260px,100%)] flex-1 basis-[22%]">
          <span className="block text-[10px] font-extrabold uppercase leading-tight tracking-[0.14em] text-hx-cyanInk">{blogs.insightsEyebrow ?? ""}</span>
          <h2 className="mt-3 text-[clamp(22px,2.1vw,28px)] font-bold leading-[1.2] tracking-[-0.02em] text-hx-ink">{blogs.insightsTitle ?? ""}</h2>
          <p className="mt-3 max-w-[330px] text-[11.5px] leading-[1.6] text-hx-copy">{blogs.insightsBody ?? ""}</p>
          <Link
            href="/blogs"
            className="mt-5 inline-flex h-[34px] items-center gap-2 rounded border border-hx-line bg-white px-4 text-[10.5px] font-extrabold uppercase tracking-[0.08em] text-hx-cyanInk transition-colors hover:border-hx-cyan"
          >
            <span>{blogs.insightsCta ?? ""}</span><AP_Icon name="arrow-right" className="h-[13px] w-[13px]" />
          </Link>
        </div>

        <div className="flex min-w-[min(560px,100%)] flex-[3] basis-[70%] flex-wrap gap-5">
          {posts.map((post, index) => (
            <article key={post.title} className="flex min-w-[min(250px,100%)] flex-1 basis-[calc(33.333%-14px)] flex-col overflow-hidden rounded-xl border border-hx-line bg-white transition hover:-translate-y-0.5 hover:border-[#bcdff2] hover:shadow-[0_14px_30px_rgba(11,34,51,.08)]">
              <div className="h-[124px] w-full shrink-0 overflow-hidden bg-hx-tint">
                {post.image ? <img src={post.image} alt={post.title} className="h-full w-full object-cover" /> : <PostArt index={index} />}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <span className="block text-[10px] font-extrabold uppercase tracking-[0.12em] text-hx-cyanInk">{post.category}</span>
                <h3 className="mt-2 text-[13.5px] font-bold leading-[1.3] text-hx-ink">{post.title}</h3>
                <p className="mt-2 text-[11px] leading-[1.5] text-hx-copy">{post.body}</p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-[10px] text-hx-muted">
                  <span>{[post.date, post.readTime].filter(Boolean).join("  •  ")}</span>
                  <AP_Icon name="arrow-right" className="h-3.5 w-3.5 text-hx-cyan" />
                </div>
              </div>
            </article>
          ))}
          {Array.from({ length: 2 }).map((_, ghost) => <span key={`ghost-${ghost}`} aria-hidden="true" className="h-0 min-w-[min(250px,100%)] flex-1 basis-[calc(33.333%-14px)]" />)}
        </div>
      </div>
    </section>
  );
}
