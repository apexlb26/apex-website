"use client";

import { useRef, type HTMLAttributes, type MouseEvent, type ReactNode } from "react";

type Props = Omit<HTMLAttributes<HTMLDivElement>, "onMouseMove" | "onMouseLeave" | "children"> & {
  children: ReactNode;
  max?: number;
};

export default function AP_TiltCard({ children, className = "", max = 4, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  function move(event: MouseEvent<HTMLDivElement>) {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - .5;
    const py = (event.clientY - rect.top) / rect.height - .5;
    node.style.transform = `perspective(1100px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`;
  }
  function leave() {
    if (ref.current) ref.current.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg)";
  }
  return <div {...rest} ref={ref} onMouseMove={move} onMouseLeave={leave} className={`ap-tilt-card ${className}`}>{children}</div>;
}
