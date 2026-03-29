import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Pricing from "./pages/Pricing.tsx";
import Tour from "./pages/Tour.tsx";
import Signup from "./pages/Signup.tsx";
import BrandDashboard from "./pages/BrandDashboard.tsx";
import CreatorDashboard from "./pages/CreatorDashboard.tsx";
import BrandLogin from "./pages/BrandLogin.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/tour" element={<Tour />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/brand/login" element={<BrandLogin />} />
          <Route path="/brand/dashboard" element={<BrandDashboard />} />
          <Route path="/creator/dashboard" element={<CreatorDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
