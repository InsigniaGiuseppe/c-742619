
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
import AdminUserDetailPage from '@/pages/AdminUserDetailPage';
import AdminTransactions from '@/pages/AdminTransactions';
import AdminKyc from '@/pages/AdminKyc';
import AdminWallets from '@/pages/AdminWallets';

import { AuthProvider } from '@/hooks/useAuth';
import { CryptocurrenciesProvider } from '@/hooks/useCryptocurrencies';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const queryClient = new QueryClient();

function App() {
  console.log('[App] Rendering App component');
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <CryptocurrenciesProvider>
            <div className="min-h-screen bg-background">
              <Navigation />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <DashboardPage />
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
                  <Route path="/lending" element={
                    <ProtectedRoute>
                      <LendingPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/vaults" element={
                    <ProtectedRoute>
                      <VaultsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/spin" element={
                    <ProtectedRoute>
                      <SpinPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/wallet" element={
                    <ProtectedRoute>
                      <WalletPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/wallet/verification" element={
                    <ProtectedRoute>
                      <WalletVerificationPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/messages" element={
                    <ProtectedRoute>
                      <MessagesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/top-up" element={
                    <ProtectedRoute>
                      <TopUpPage />
                    </ProtectedRoute>
                  } />

                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/transactions" element={
                    <ProtectedRoute>
                      <EnhancedTransactionManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/users" element={
                    <ProtectedRoute>
                      <AdminUsers />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/users/:userId" element={
                    <ProtectedRoute>
                      <AdminUserDetailPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/kyc" element={
                    <ProtectedRoute>
                      <AdminKyc />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/wallets" element={
                    <ProtectedRoute>
                      <AdminWallets />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
              <Footer />
              <Toaster />
            </div>
          </CryptocurrenciesProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
