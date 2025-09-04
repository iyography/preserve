import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import SignIn from "@/pages/sign-in";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Onboarding from "@/pages/onboarding";
import AIGuidedInterview from "@/pages/ai-guided-interview";
import GradualAwakening from "@/pages/gradual-awakening";
import DigitalSeance from "@/pages/digital-seance";
import LivingArchive from "@/pages/living-archive";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/register" component={Register} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/onboarding/ai-guided-interview" component={AIGuidedInterview} />
      <Route path="/onboarding/gradual-awakening" component={GradualAwakening} />
      <Route path="/onboarding/digital-seance" component={DigitalSeance} />
      <Route path="/onboarding/living-archive" component={LivingArchive} />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
