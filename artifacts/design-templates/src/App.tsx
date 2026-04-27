import { lazy, Suspense, type ReactNode } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { ClerkProvider, useAuth } from "@clerk/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { LangProvider } from "@/contexts/LangContext";

import NotFound from "@/pages/not-found";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";

const Admin = lazy(() => import("@/pages/admin"));
const Support = lazy(() => import("@/pages/Support"));
const VideoGallery = lazy(() => import("@/pages/VideoGallery"));
const VideoDetail = lazy(() => import("@/pages/VideoDetail"));
const MyVideos = lazy(() => import("@/pages/MyVideos"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 300_000, gcTime: 600_000, retry: 1 },
  },
});

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function PageLoader() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function AuthGuard({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  return <>{children}</>;
}

function SupportRoute() {
  return <AuthGuard><Support /></AuthGuard>;
}

function MyVideosRoute() {
  return <AuthGuard><MyVideos /></AuthGuard>;
}

function AppRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={VideoGallery} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route path="/support" component={SupportRoute} />
          <Route path="/admin" component={Admin} />
          <Route path="/video/:slug" component={VideoDetail} />
          <Route path="/my-videos" component={MyVideosRoute} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </AnimatePresence>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  function stripBase(path: string): string {
    return basePath && path.startsWith(basePath)
      ? path.slice(basePath.length) || "/"
      : path;
  }

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppRoutes />
        </TooltipProvider>
        <Toaster />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <LangProvider>
      <WouterRouter base={basePath}>
        <ClerkProviderWithRoutes />
      </WouterRouter>
    </LangProvider>
  );
}

export default App;
