import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

// Vite plugin: inject a <script> at the very top of <head> that suppresses
// Clerk network errors before the runtime-error-overlay plugin can catch them.
const suppressClerkNetworkErrors = () => ({
  name: "suppress-clerk-network-errors",
  transformIndexHtml: {
    order: "pre" as const,
    handler(html: string) {
      const snippet = `<script>
(function(){
  var _orig = window.addEventListener.bind(window);
  function patchListener(type, fn, opts) {
    if (type !== 'unhandledrejection') return _orig(type, fn, opts);
    _orig(type, function(e) {
      var msg = (e.reason && (e.reason.message || e.reason.toString())) || '';
      if (msg.indexOf('ClerkJS') !== -1 || msg.indexOf('clerk.accounts.dev') !== -1) {
        e.preventDefault(); return;
      }
      fn.call(this, e);
    }, opts);
  }
  window.addEventListener = patchListener;
  window.addEventListener('unhandledrejection', function(e){
    var msg = (e.reason && (e.reason.message || e.reason.toString())) || '';
    if (msg.indexOf('ClerkJS') !== -1 || msg.indexOf('clerk.accounts.dev') !== -1) {
      e.preventDefault(); e.stopImmediatePropagation();
    }
  }, true);
})();
</script>`;
      return html.replace('<head>', '<head>' + snippet);
    },
  },
});

export default defineConfig({
  define: {
    "import.meta.env.VITE_POLOTNO_KEY": JSON.stringify(process.env.POLOTNO_LICENSE_KEY ?? ""),
  },
  base: basePath,
  plugins: [
    suppressClerkNetworkErrors(),
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
      // Pin react & react-dom to the local React 18 install so Polotno SDK
      // (which requires React 18) and our app code share one instance.
      "react": path.resolve(import.meta.dirname, "node_modules/react"),
      "react-dom": path.resolve(import.meta.dirname, "node_modules/react-dom"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
