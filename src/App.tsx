import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RentalCTA from "./components/RentalCTA";
import ScrollToTop from "./components/ScrollToTop";

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
const VehicleDetail = lazy(() => import("./pages/VehicleDetail"));
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
const AdminInviteCodesPage = lazy(() => import("./pages/AdminInviteCodes"));
const CityLanding = lazy(() => import("./pages/CityLanding"));
const Cities = lazy(() => import("./pages/Cities"));
const ForTuroHosts = lazy(() => import("./pages/ForTuroHosts"));
const LasVegasLanding = lazy(() => import("./pages/LasVegasLanding"));
const PhoenixLanding = lazy(() => import("./pages/PhoenixLanding"));
const LosAngelesLanding = lazy(() => import("./pages/LosAngelesLanding"));
const HoustonLanding = lazy(() => import("./pages/HoustonLanding"));
const MiamiLanding = lazy(() => import("./pages/MiamiLanding"));
const NewYorkLanding = lazy(() => import("./pages/NewYorkLanding"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const CancellationPolicy = lazy(() => import("./pages/CancellationPolicy"));

const queryClient = new QueryClient();

const LazyFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const GlobalLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <>
      <Header />
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
          <Route path="/vehicles/:id" element={<VehicleDetail />} />
          <Route path="/dashboard" element={<OwnerDashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/for-agencies" element={<ForAgencies />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/agencies" element={<AdminAgenciesPage />} />
          <Route path="/admin/setup" element={<AdminSetupPage />} />
          <Route path="/admin/invite-codes" element={<AdminInviteCodesPage />} />
          <Route path="/cities" element={<Cities />} />
          <Route path="/for-turo-hosts" element={<ForTuroHosts />} />
          <Route path="/las-vegas" element={<LasVegasLanding />} />
          <Route path="/phoenix" element={<PhoenixLanding />} />
          <Route path="/los-angeles" element={<LosAngelesLanding />} />
          <Route path="/houston" element={<HoustonLanding />} />
          <Route path="/miami" element={<MiamiLanding />} />
          <Route path="/new-york" element={<NewYorkLanding />} />
          <Route path="/city/:citySlug" element={<CityLanding />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/cancellation-policy" element={<CancellationPolicy />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {isHomePage && <RentalCTA />}
      <Footer />

      {/* Floating "Find a Car Now" button — hidden on /search */}
      {location.pathname !== "/search" && (
        <Link
          to="/search"
          className="fixed bottom-6 right-6 z-50 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-bold bg-gradient-primary text-primary-foreground shadow-xl hover:scale-105 transition-transform duration-200 px-4 py-2.5 sm:px-6 sm:py-3"
        >
          Find a Car Now
        </Link>
      )}
    </>
  );
};

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <GlobalLayout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
