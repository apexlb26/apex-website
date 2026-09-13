import { getStorageMode } from "@/shared/store";
import AP_AdminMailSettings from "@/app/components/AP_AdminMailSettings";

function present(value?: string) {
  return value ? value : "Not configured";
}

export default function AP_AdminSettingsScreen() {
  const mode = getStorageMode();
  return (
    <div className="settings-grid">
      <AP_AdminMailSettings />

      <section className="setting-card">
        <h3>Publishing</h3>
        <p>The portal supports MongoDB-backed production publishing with bundled JSON fallback.</p>
        <ul className="setting-list">
          <li><span>Current mode</span><strong>{mode === "mongodb" ? "MongoDB" : "Fallback JSON (read-only)"}</strong></li>
          <li><span>Repository</span><strong>{present(process.env.GITHUB_REPO)}</strong></li>
          <li><span>Branch</span><strong>{process.env.GITHUB_BRANCH || "main"}</strong></li>
          <li><span>English path</span><strong>{process.env.GITHUB_CONTENT_PATH_EN || "shared/en.json"}</strong></li>
          <li><span>Arabic path</span><strong>{process.env.GITHUB_CONTENT_PATH_AR || "shared/ar.json"}</strong></li>
        </ul>
      </section>

      <section className="setting-card">
        <h3>Brand tokens</h3>
        <p>The portal intentionally keeps the same restrained APEX visual language as the public site.</p>
        <ul className="setting-list">
          <li><span>Primary</span><strong>#00B3A4</strong></li>
          <li><span>Secondary</span><strong>#1E2328</strong></li>
          <li><span>Tertiary</span><strong>#FF6B6B</strong></li>
          <li><span>Public site</span><strong>{process.env.NEXT_PUBLIC_APEX_SITE_URL || "http://localhost:3000"}</strong></li>
        </ul>
      </section>

      <section className="setting-card">
        <h3>Authentication</h3>
        <p>Credentials are read from environment variables and the session is stored in a signed, HTTP-only cookie.</p>
        <ul className="setting-list">
          <li><span>Admin email</span><strong>{process.env.APEX_ADMIN_EMAIL ? "Configured" : "Development fallback"}</strong></li>
          <li><span>Admin password</span><strong>{process.env.APEX_ADMIN_PASSWORD ? "Configured" : "Development fallback"}</strong></li>
          <li><span>Signing secret</span><strong>{process.env.APEX_ADMIN_SECRET ? "Configured" : "Development fallback"}</strong></li>
          <li><span>Session duration</span><strong>12 hours</strong></li>
        </ul>
      </section>

      <section className="setting-card">
        <h3>Production checklist</h3>
        <p>Before exposing /admin in production, configure all secrets and verify the mail transport from the settings panel above.</p>
        <ul className="setting-list">
          <li><span>1</span><strong>Set real admin credentials</strong></li>
          <li><span>2</span><strong>Set a long random session secret</strong></li>
          <li><span>3</span><strong>Configure SMTP environment fallback</strong></li>
          <li><span>4</span><strong>Send a test email from /admin/settings</strong></li>
        </ul>
      </section>
    </div>
  );
}
