import { lazy, Suspense, useEffect, useRef } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import FloatingActions from "@/components/FloatingActions";
import ChatbotWidget from "@/components/ChatbotWidget";
import Home from "@/pages/home";

// Lazy-load heavy pages — they won't be downloaded until actually visited
const NotFound   = lazy(() => import("@/pages/not-found"));
const UserPortal = lazy(() => import("@/pages/UserPortal"));
const AdminPage  = lazy(() => import("@/pages/AdminPage"));
const ForumPage  = lazy(() => import("@/pages/ForumPage"));
const ThreadPage = lazy(() => import("@/pages/ThreadPage"));

// ContentPages named exports — all share one chunk so only downloaded once
const PhotosPage   = lazy(() => import("@/pages/ContentPages").then(m => ({ default: m.PhotosPage })));
const VideosPage   = lazy(() => import("@/pages/ContentPages").then(m => ({ default: m.VideosPage })));
const LibraryPage  = lazy(() => import("@/pages/ContentPages").then(m => ({ default: m.LibraryPage })));
const AskRabbiPage = lazy(() => import("@/pages/ContentPages").then(m => ({ default: m.AskRabbiPage })));
const ContactPage  = lazy(() => import("@/pages/ContentPages").then(m => ({ default: m.ContactPage })));
const JoinPage     = lazy(() => import("@/pages/ContentPages").then(m => ({ default: m.JoinPage })));
const StoriesPage  = lazy(() => import("@/pages/ContentPages").then(m => ({ default: m.StoriesPage })));
const EventsPage   = lazy(() => import("@/pages/ContentPages").then(m => ({ default: m.EventsPage })));

function PageLoader() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
    },
  },
});

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function PortalRoute() {
  return (
    <>
      <Show when="signed-in">
        <UserPortal />
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

function AnalyticsTracker() {
  useAnalytics();
  return null;
}

function ClerkCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsub = addListener(({ user }: { user?: { id: string } | null }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsub;
  }, [addListener, qc]);

  return null;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/portal" component={PortalRoute} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/photos" component={PhotosPage} />
        <Route path="/videos" component={VideosPage} />
        <Route path="/library" component={LibraryPage} />
        <Route path="/ask-rabbi" component={AskRabbiPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/join" component={JoinPage} />
        <Route path="/stories" component={StoriesPage} />
        <Route path="/events" component={EventsPage} />
        <Route path="/forum/:id" component={ThreadPage} />
        <Route path="/forum" component={ForumPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkCacheInvalidator />
        <AnalyticsTracker />
        <TooltipProvider>
          <div dir="rtl" className="min-h-[100dvh] bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
            <SiteNav />
            <AppRoutes />
            <FloatingActions />
            <ChatbotWidget />
          </div>
        </TooltipProvider>
        <Toaster />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
