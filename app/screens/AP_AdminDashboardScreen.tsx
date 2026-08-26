import Link from "next/link";
import { getContent, getStorageMode } from "@/shared/store";
import { AP_AdminIcon } from "@/app/components/AP_AdminIcons";

export default async function AP_AdminDashboardScreen() {
  const content = await getContent("en");
  const metrics = [
    { icon: "layers" as const, value: content.solutions.items.length, label: "Solution capabilities" },
    { icon: "globe" as const, value: content.industries.items.length, label: "Active verticals" },
    { icon: "case" as const, value: content.caseStudy.client ? 1 : 0, label: "Published case study" },
    { icon: "news" as const, value: 2, label: "Languages prepared" },
  ];

  return (
    <>
      <section className="dashboard-hero">
        <div className="dashboard-welcome">
          <div className="section-eyebrow" style={{ color: "#60dfd0" }}>APEX CMS</div>
          <h2>Manage the site without <span>touching the build.</span></h2>
          <p>Content is separated from presentation. Edit structured fields here, review the result, then publish the approved content back to the APEX website.</p>
        </div>
        <div className="dashboard-system">
          <h3>Publishing system</h3>
          <div className="system-row"><span>Storage mode</span><strong>{getStorageMode() === "github" ? "GitHub repository" : "Local JSON"}</strong></div>
          <div className="system-row"><span>English content</span><strong>Connected</strong></div>
          <div className="system-row"><span>Arabic content</span><strong>Connected</strong></div>
          <div className="system-row"><span>Products catalog</span><strong>Layout ready · empty</strong></div>
          <div className="system-row"><span>Blogs feed</span><strong>Layout ready · empty</strong></div>
        </div>
      </section>

      <section className="metric-grid">
        {metrics.map((metric) => <article className="metric-card" key={metric.label}><div className="metric-top"><div className="metric-icon"><AP_AdminIcon name={metric.icon} /></div><span className="status-dot" /></div><strong>{metric.value}</strong><p>{metric.label}</p></article>)}
      </section>

      <section className="panel">
        <div className="panel-head"><div><h2>Quick access</h2><p>The most common content areas.</p></div></div>
        <div className="quick-grid">
          <Link prefetch={false} className="quick-card" href="/admin/site"><div className="metric-icon"><AP_AdminIcon name="edit" /></div><h3>Website content</h3><p>Hero, about, solutions, industries, method, navigation, and footer.</p></Link>
          <Link prefetch={false} className="quick-card" href="/admin/site?section=caseStudy"><div className="metric-icon"><AP_AdminIcon name="case" /></div><h3>Case study</h3><p>Manage the TutWithUs collaboration and future case-study copy.</p></Link>
          <Link prefetch={false} className="quick-card" href="/admin/products"><div className="metric-icon"><AP_AdminIcon name="products" /></div><h3>Products page</h3><p>Maintain the page architecture now; add real products only when approved.</p></Link>
          <Link prefetch={false} className="quick-card" href="/admin/blogs"><div className="metric-icon"><AP_AdminIcon name="blogs" /></div><h3>Blogs & updates</h3><p>Prepare the newsroom layout without inventing announcements or milestones.</p></Link>
          <Link prefetch={false} className="quick-card" href="/admin/careers"><div className="metric-icon"><AP_AdminIcon name="products" /></div><h3>Careers page</h3><p>Manage the careers narrative and publish only approved openings.</p></Link>
          <Link prefetch={false} className="quick-card" href="/admin/media"><div className="metric-icon"><AP_AdminIcon name="media" /></div><h3>Media library</h3><p>Upload approved website images and copy their public asset paths.</p></Link>
          <Link prefetch={false} className="quick-card" href="/admin/settings"><div className="metric-icon"><AP_AdminIcon name="settings" /></div><h3>Portal settings</h3><p>See the publishing mode, repo target, content paths, and brand tokens.</p></Link>
        </div>
      </section>
    </>
  );
}
