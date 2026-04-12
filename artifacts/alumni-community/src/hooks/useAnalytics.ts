import { useEffect, useRef } from "react";

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

export function useAnalytics() {
  const sessionId = useRef(getSessionId());
  const deviceType = useRef(getDeviceType());
  const visitTracked = useRef(false);

  useEffect(() => {
    if (visitTracked.current) return;
    visitTracked.current = true;

    fetch("/api/analytics/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId.current,
        device_type: deviceType.current,
      }),
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const sendHeartbeat = () => {
      fetch("/api/analytics/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId.current,
          device_type: deviceType.current,
        }),
      }).catch(() => {});
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onChange = () => {
      if (document.fullscreenElement) {
        fetch("/api/analytics/fullscreen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId.current }),
        }).catch(() => {});
      }
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
}
