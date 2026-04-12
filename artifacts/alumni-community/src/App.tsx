import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import SiteNav from "@/components/SiteNav";
import FloatingActions from "@/components/FloatingActions";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <div dir="rtl" className="min-h-[100dvh] bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
            <SiteNav />
            <Router />
            <FloatingActions />
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
