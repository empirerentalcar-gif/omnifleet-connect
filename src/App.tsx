import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";

// Lazy-load non-critical routes to reduce initial JS bundle
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const OwnerBenefits = lazy(() => import("./pages/OwnerBenefits"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const AgencyDetail = lazy(() => import("./pages/AgencyDetail"));
const ReserveRequest = lazy(() => import("./pages/ReserveRequest"));
const ReservationConfirmed = lazy(() => import("./pages/ReservationConfirmed"));
const Pricing = lazy(() => import("./pages/Pricing"));
const OwnerDashboard = lazy(() => import("./pages/OwnerDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const About = lazy(() => import("./pages/About"));
const FAQ = lazy(() => import("./pages/FAQ"));
const ForAgencies = lazy(() => import("./pages/ForAgencies"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboard"));
const AdminAgenciesPage = lazy(() => import("./pages/AdminAgencies"));
const AdminSetupPage = lazy(() => import("./pages/AdminSetup"));

const queryClient = new QueryClient();

const LazyFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LazyFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/owner-benefits" element={<OwnerBenefits />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/agency/:id" element={<AgencyDetail />} />
            <Route path="/reserve/:agencyId" element={<ReserveRequest />} />
            <Route path="/reservation-confirmed" element={<ReservationConfirmed />} />
            <Route path="/dashboard" element={<OwnerDashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/for-agencies" element={<ForAgencies />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/agencies" element={<AdminAgenciesPage />} />
            <Route path="/admin/setup" element={<AdminSetupPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
