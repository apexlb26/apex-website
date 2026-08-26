"use client";

import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from "react";

export default function AP_SpotlightCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  function move(event: MouseEvent<HTMLDivElement>) {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    node.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  }
  return <div ref={ref} onMouseMove={move} className={`ap-spotlight-card ${className}`} style={{} as CSSProperties}>{children}</div>;
}
