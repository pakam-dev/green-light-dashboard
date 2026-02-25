import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/layout/DashboardLayout";
import SchedulePage from "./pages/schedules/SchedulePage";
import ReportsPage from "./pages/reports/ReportsPage";
import PublicReportPage from "./pages/reports/PublicReportPage";
import SignIn from "./pages/auth/SignIn";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/signin" element={<SignIn />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            } 
          >
            <Route index element={<Navigate to="/dashboard/reports" replace />} />
            <Route path="schedules" element={<SchedulePage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>

          {/* Public shareable report — no auth required */}
          <Route path="/reports/public/:token" element={<PublicReportPage />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
