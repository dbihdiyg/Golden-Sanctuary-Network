import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import TemplateDetail from "@/pages/TemplateDetail";
import Order from "@/pages/order";
import Help from "@/pages/help";
import Admin from "@/pages/admin";
import Editor from "@/pages/editor";
import { ChatWidget } from "@/components/ChatWidget";
import { LangProvider } from "@/contexts/LangContext";

const queryClient = new QueryClient();

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/template/:id" component={TemplateDetail} />
        <Route path="/order" component={Order} />
        <Route path="/help" component={Help} />
        <Route path="/admin" component={Admin} />
        <Route path="/editor/:id" component={Editor} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LangProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
            <ChatWidget />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </LangProvider>
    </QueryClientProvider>
  );
}

export default App;
