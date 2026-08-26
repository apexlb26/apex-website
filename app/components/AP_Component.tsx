import type { ReactNode } from "react";

export default function AP_Component({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return <section id={id} className={className}>{children}</section>;
}
