import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

function getSessionId(): string {
  const key = "meirim_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(key, id);
  }
  return id;
}

function getDeviceType(): "mobile" | "desktop" {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
    ? "mobile"
    : "desktop";
}

function fireAndForget(url: string, body: object) {
  try {
    navigator.sendBeacon(url, new Blob([JSON.stringify(body)], { type: "application/json" }));
  } catch {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  }
}

const HEARTBEAT_INTERVAL = 2 * 60 * 1000;

export function useAnalytics() {
  const sessionId = useRef(getSessionId());
  const deviceType = useRef(getDeviceType());
  const [location] = useLocation();
  const trackedPages = useRef<Set<string>>(new Set());

  useEffect(() => {
    const page = location || "/";
    if (trackedPages.current.has(page)) return;
    trackedPages.current.add(page);

    fireAndForget("/api/analytics/visit", {
      session_id: sessionId.current,
      device_type: deviceType.current,
      page,
      referrer: document.referrer || null,
    });
  }, [location]);

  useEffect(() => {
    const sendHeartbeat = () => {
      fireAndForget("/api/analytics/heartbeat", {
        session_id: sessionId.current,
        device_type: deviceType.current,
      });
    };

    const timeout = setTimeout(() => {
      sendHeartbeat();
      const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
      return () => clearInterval(interval);
    }, 10_000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const onChange = () => {
      if (document.fullscreenElement) {
        fireAndForget("/api/analytics/fullscreen", { session_id: sessionId.current });
      }
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
}
