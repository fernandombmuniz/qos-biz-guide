import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProfileProvider } from "@/context/ProfileContext";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import Hub from "./pages/Hub";
import FirewallPage from "./pages/FirewallPage";
import EndpointPage from "./pages/EndpointPage";
import BackupPage from "./pages/BackupPage";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ProfileProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/hub" replace />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/hub" element={<Hub />} />
            <Route path="/firewall" element={<FirewallPage />} />
            <Route path="/endpoint" element={<EndpointPage />} />
            <Route path="/backup" element={<BackupPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ProfileProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
