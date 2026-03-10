import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import CyberNav from "@/components/CyberNav";
import HomePage from "@/pages/HomePage";
import GeneratePage from "@/pages/GeneratePage";
import OverlayPage from "@/pages/OverlayPage";
import QRAuthPage from "@/pages/QRAuthPage";
import AnalysisPage from "@/pages/AnalysisPage";
import DocsPage from "@/pages/DocsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CyberNav />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/overlay" element={<OverlayPage />} />
          <Route path="/qr-auth" element={<QRAuthPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
