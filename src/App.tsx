
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import Index from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import TradingPage from '@/pages/TradingPage';
import CryptoDetailPage from '@/pages/CryptoDetailPage';
import LendingPage from '@/pages/LendingPage';
import VaultsPage from '@/pages/VaultsPage';
import WalletPage from '@/pages/WalletPage';
import WalletVerificationPage from '@/pages/WalletVerificationPage';
import ProfilePage from '@/pages/ProfilePage';
import MessagesPage from '@/pages/MessagesPage';
import TopUpPage from '@/pages/TopUpPage';
import SpinPage from '@/pages/SpinPage';

import AdminDashboard from '@/pages/AdminDashboard';
import EnhancedTransactionManagement from '@/components/admin/EnhancedTransactionManagement';
import AdminUsers from '@/pages/AdminUsers';
import AdminTransactions from '@/pages/AdminTransactions';
import AdminKyc from '@/pages/AdminKyc';
import AdminWallets from '@/pages/AdminWallets';

import { AuthProvider } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <Navigation />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/trading" element={<TradingPage />} />
                  <Route path="/trading/:cryptoId" element={<CryptoDetailPage />} />
                  <Route path="/lending" element={<LendingPage />} />
                  <Route path="/vaults" element={<VaultsPage />} />
                  <Route path="/spin" element={<SpinPage />} />
                  <Route path="/wallet" element={<WalletPage />} />
                  <Route path="/wallet/verification" element={<WalletVerificationPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/messages" element={<MessagesPage />} />
                  <Route path="/top-up" element={<TopUpPage />} />
                </Route>

                <Route path="/admin/*" element={<ProtectedRoute />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="transactions" element={<EnhancedTransactionManagement />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="kyc" element={<AdminKyc />} />
                  <Route path="wallets" element={<AdminWallets />} />
                </Route>
              </Routes>
            </main>
            <Footer />
            <Toaster />
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
