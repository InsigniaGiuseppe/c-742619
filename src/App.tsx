import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import RegisterPage from "./pages/RegisterPage";
import WalletPage from "./pages/WalletPage";
import TradingPage from "./pages/TradingPage";
import LendingPage from "./pages/LendingPage";
import ProfilePage from "./pages/ProfilePage";
import TopUpPage from "./pages/TopUpPage";
import ReferralsPage from "./pages/ReferralsPage";
import MessagesPage from "./pages/MessagesPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import CryptoDetailPage from "./pages/CryptoDetailPage";
import WalletVerificationPage from "./pages/WalletVerificationPage";
import AdminUserDetailPage from "./pages/AdminUserDetailPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { CryptocurrenciesProvider } from "./hooks/useCryptocurrencies";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CryptocurrenciesProvider>
        <div className="min-h-screen bg-background">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin-login" element={<AdminLoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/wallet" element={
                <ProtectedRoute>
                  <WalletPage />
                </ProtectedRoute>
              } />
              <Route path="/trading" element={
                <ProtectedRoute>
                  <TradingPage />
                </ProtectedRoute>
              } />
              <Route path="/crypto/:symbol" element={
                <ProtectedRoute>
                  <CryptoDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/wallet-verification" element={
                <ProtectedRoute>
                  <WalletVerificationPage />
                </ProtectedRoute>
              } />
              <Route path="/lending" element={
                <ProtectedRoute>
                  <LendingPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/topup" element={
                <ProtectedRoute>
                  <TopUpPage />
                </ProtectedRoute>
              } />
              <Route path="/referrals" element={
                <ProtectedRoute>
                  <ReferralsPage />
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="/admin/users" element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              } />
              <Route path="/admin/users/:id" element={
                <AdminRoute>
                  <AdminUserDetailPage />
                </AdminRoute>
              } />
            </Routes>
          </BrowserRouter>
        </div>
      </CryptocurrenciesProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
