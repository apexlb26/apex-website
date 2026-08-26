import { redirect } from "next/navigation";
import AP_LoginForm from "@/app/components/AP_LoginForm";
import { getAdminSession } from "@/shared/auth";

export default async function AP_AdminLoginScreen() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return (
    <div className="ap-admin-root"><main className="login-page">
      <section className="login-brand">
        <img className="login-logo" src="/api/assets/logo/apex-logo.svg" alt="APEX" />
        <div className="login-brand-copy">
          <div className="login-eyebrow" style={{ color: "#60dfd0" }}>APEX INTERNAL</div>
          <h1>One place to run the <span>content layer.</span></h1>
          <p>Manage website copy, industries, case studies, products, news, media, and localization without changing presentation code.</p>
        </div>
        <div className="login-brand-foot">Private administrative portal · Authorized users only</div>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <img className="mobile-logo" src="/api/assets/logo/apex-logo.svg" alt="APEX" />
          <div className="login-eyebrow">CONTENT MANAGEMENT</div>
          <h2>Welcome back.</h2>
          <p>Sign in to manage the APEX website and publish approved changes.</p>
          <AP_LoginForm />
          {process.env.NODE_ENV !== "production" ? <div className="login-hint">Local development fallback: <strong>admin@apex.local</strong> / <strong>apex-dev</strong>. Configure real credentials in <code>.env.local</code> before deployment.</div> : null}
        </div>
      </section>
    </main></div>
  );
}
