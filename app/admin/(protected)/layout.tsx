import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AP_AdminShell from "@/app/components/AP_AdminShell";
import { getAdminSession } from "@/shared/auth";
import { getStorageMode } from "@/shared/store";

export const metadata: Metadata = {
  title: "APEX Admin",
  robots: { index: false, follow: false },
};

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="ap-admin-root">
      <AP_AdminShell email={session.email} mode={getStorageMode()}>
        {children}
      </AP_AdminShell>
    </div>
  );
}
