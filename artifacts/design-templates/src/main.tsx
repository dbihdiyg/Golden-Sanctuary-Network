import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress Clerk session-touch network errors BEFORE the Vite runtime error overlay
// registers its listener. Using capture phase + stopImmediatePropagation ensures
// this handler fires first and swallows benign Clerk network hiccups.
window.addEventListener(
  "unhandledrejection",
  (e) => {
    const msg: string =
      (e.reason?.message ?? "") + (e.reason?.toString?.() ?? "");
    if (msg.includes("ClerkJS") || msg.includes("clerk.accounts.dev")) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  },
  true, // capture phase — fires before ALL bubble-phase handlers
);

createRoot(document.getElementById("root")!).render(<App />);
