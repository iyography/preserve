import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import SignIn from "@/pages/sign-in";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Community from "@/pages/community";
import Onboarding from "@/pages/onboarding";
import GradualAwakening from "@/pages/gradual-awakening";
import DigitalSeance from "@/pages/digital-seance";
import LivingArchive from "@/pages/living-archive";

// For Families pages
import CreateFirstPersona from "@/pages/create-first-persona";
import FamilySharingGuide from "@/pages/family-sharing-guide";
import PrivacySecurity from "@/pages/privacy-security";
import DataExport from "@/pages/data-export";

// Professional Services pages
import DoneForYou from "@/pages/done-for-you";
import FuneralHomePartners from "@/pages/funeral-home-partners";
import ElderCareIntegration from "@/pages/elder-care-integration";
import EstatePlanning from "@/pages/estate-planning";

// Support & Safety pages
import CrisisResources from "@/pages/crisis-resources";
import GriefCounselingPartners from "@/pages/grief-counseling-partners";
import CommunityGuidelines from "@/pages/community-guidelines";
import ContactSupport from "@/pages/contact-support";

// Company pages
import AboutMission from "@/pages/about-mission";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import PartnerWithUs from "@/pages/partner-with-us";
import Waitlist from "@/pages/waitlist";

import NotFound from "@/pages/not-found";
import Chat from "@/pages/chat";
import EmailConfirmed from "@/pages/email-confirmed";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/email-confirmed" component={EmailConfirmed} />
      <Route path="/community" component={Community} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/gradual-awakening" component={GradualAwakening} />
      <Route path="/onboarding/gradual-awakening" component={GradualAwakening} />
      <Route path="/onboarding/digital-seance" component={DigitalSeance} />
      <Route path="/onboarding/living-archive" component={LivingArchive} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/chat/:personaId" component={Chat} />
      
      {/* For Families */}
      <Route path="/create-first-persona" component={CreateFirstPersona} />
      <Route path="/family-sharing-guide" component={FamilySharingGuide} />
      <Route path="/privacy-security" component={PrivacySecurity} />
      <Route path="/data-export" component={DataExport} />
      
      {/* Professional Services */}
      <Route path="/done-for-you" component={DoneForYou} />
      <Route path="/funeral-home-partners" component={FuneralHomePartners} />
      <Route path="/elder-care-integration" component={ElderCareIntegration} />
      <Route path="/estate-planning" component={EstatePlanning} />
      
      {/* Support & Safety */}
      <Route path="/crisis-resources" component={CrisisResources} />
      <Route path="/grief-counseling-partners" component={GriefCounselingPartners} />
      <Route path="/community-guidelines" component={CommunityGuidelines} />
      <Route path="/contact-support" component={ContactSupport} />
      
      {/* Company */}
      <Route path="/about-mission" component={AboutMission} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/partner-with-us" component={PartnerWithUs} />
      
      {/* Waitlist */}
      <Route path="/waitlist" component={Waitlist} />
      
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
