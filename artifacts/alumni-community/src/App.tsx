import { useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import SiteNav from "@/components/SiteNav";
import FloatingActions from "@/components/FloatingActions";
import UserPortal from "@/pages/UserPortal";
import AdminPage from "@/pages/AdminPage";
import {
  AskRabbiPage,
  ContactPage,
  EventsPage,
  JoinPage,
  LibraryPage,
  PhotosPage,
  StoriesPage,
  VideosPage,
} from "@/pages/ContentPages";

const queryClient = new QueryClient();

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

function AdminRoute() {
  return <AdminPage />;
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
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route path="/portal" component={PortalRoute} />
      <Route path="/admin" component={AdminRoute} />
      <Route path="/photos" component={PhotosPage} />
      <Route path="/videos" component={VideosPage} />
      <Route path="/library" component={LibraryPage} />
      <Route path="/ask-rabbi" component={AskRabbiPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/join" component={JoinPage} />
      <Route path="/stories" component={StoriesPage} />
      <Route path="/events" component={EventsPage} />
      <Route component={NotFound} />
    </Switch>
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
        <TooltipProvider>
          <div dir="rtl" className="min-h-[100dvh] bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
            <SiteNav />
            <AppRoutes />
            <FloatingActions />
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
