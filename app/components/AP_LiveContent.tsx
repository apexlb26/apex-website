"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { io, type Socket } from "socket.io-client";
import { CONTENT_UPDATED } from "@/shared/realtime";

/*
 * Keeps the open page in step with the CMS.
 *
 * Preferred path is Socket.IO: publishing pushes an event and the page
 * re-renders on the spot. Where a socket cannot stay open (serverless
 * hosting) the connection fails and we poll a small version endpoint
 * instead, so the behaviour degrades rather than disappearing.
 */
const POLL_MS = 15000;

export default function AP_LiveContent() {
  const router = useRouter();

  useEffect(() => {
    let socket: Socket | undefined;
    let pollTimer: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;
    let knownVersion: string | null = null;

    /** Pull fresh server-rendered content into the current page. */
    const refresh = () => router.refresh();

    const startPolling = () => {
      if (pollTimer || cancelled) return;
      pollTimer = setInterval(async () => {
        try {
          const response = await fetch("/api/content/version", { cache: "no-store" });
          if (!response.ok) return;
          const { version } = (await response.json()) as { version: string };
          if (knownVersion === null) {
            knownVersion = version;
            return;
          }
          if (version !== knownVersion) {
            knownVersion = version;
            refresh();
          }
        } catch {
          /* offline or endpoint unavailable; try again next tick */
        }
      }, POLL_MS);
    };

    socket = io({ path: "/api/socket", transports: ["websocket", "polling"], reconnectionAttempts: 3 });
    socket.on(CONTENT_UPDATED, refresh);
    socket.on("connect_error", startPolling);
    socket.io.on("reconnect_failed", startPolling);

    return () => {
      cancelled = true;
      socket?.off(CONTENT_UPDATED, refresh);
      socket?.disconnect();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [router]);

  return null;
}
