
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner"; // Ensure this is used or remove if not
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import WalletPage from "./pages/WalletPage";
import TradingPage from "./pages/TradingPage";
import LendingPage from "./pages/LendingPage";
import ProfilePage from "./pages/ProfilePage";
import TopUpPage from "./pages/TopUpPage";
import ReferralsPage from "./pages/ReferralsPage";
import MessagesPage from "./pages/MessagesPage";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Toaster /> {/* This is for shadcn/ui toasts */}
        <Sonner /> {/* This is for sonner toasts, ensure next-themes is setup if used with theme prop */}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/trading" element={<TradingPage />} />
            <Route path="/lending" element={<LendingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/topup" element={<TopUpPage />} />
            <Route path="/referrals" element={<ReferralsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
