import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "APEX Admin",
  description: "Private APEX website administration.",
  robots: { index: false, follow: false },
};

export default function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
