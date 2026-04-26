import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress Clerk session-touch network errors from triggering the Vite overlay.
// These are benign keep-alive failures (e.g. network hiccups in development)
// and don't affect app functionality.
window.addEventListener("unhandledrejection", (e) => {
  const msg: string =
    (e.reason?.message ?? "") + (e.reason?.toString?.() ?? "");
  if (msg.includes("ClerkJS") || msg.includes("clerk.accounts.dev")) {
    e.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
