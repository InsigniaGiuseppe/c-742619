import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

import { AuthProvider } from './hooks/useAuth';
import { CryptocurrenciesProvider } from './hooks/useCryptocurrencies';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import DevRoute from './components/DevRoute';

import Index from './pages/Index';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import WalletPage from './pages/WalletPage';
import ProfilePage from './pages/ProfilePage';
import TradingPage from './pages/TradingPage';
import CryptoDetailPage from './pages/CryptoDetailPage';
import LendingPage from './pages/LendingPage';
import VaultsPage from './pages/VaultsPage';
import TopUpPage from './pages/TopUpPage';
import WalletVerificationPage from './pages/WalletVerificationPage';

// Admin pages
// import AdminDashboardPage from './pages/admin/AdminDashboardPage';
// import AdminUsersPage from './pages/admin/AdminUsersPage';
// import AdminTransactionsPage from './pages/admin/AdminTransactionsPage';
// import AdminKYCDocumentsPage from './pages/admin/AdminKYCDocumentsPage';
// import AdminExternalWalletsPage from './pages/admin/AdminExternalWalletsPage';
// import AdminTradingOrdersPage from './pages/admin/AdminTradingOrdersPage';
// import AdminVaultConfigurationsPage from './pages/admin/AdminVaultConfigurationsPage';

// Dev test pages
// import DevPlaygroundPage from './pages/dev/DevPlaygroundPage';
// import DevCronTestPage from './pages/dev/DevCronTestPage';
// import DevStyleguidePage from './pages/dev/DevStyleguidePage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CryptocurrenciesProvider>
          <TooltipProvider>
            <div className="flex flex-col min-h-screen bg-background text-foreground">
              <Navigation />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                  <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
                  <Route path="/lending" element={<ProtectedRoute><LendingPage /></ProtectedRoute>} />
                  <Route path="/vaults" element={<ProtectedRoute><VaultsPage /></ProtectedRoute>} />
                  <Route path="/trading" element={<ProtectedRoute><TradingPage /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/crypto/:id" element={<ProtectedRoute><CryptoDetailPage /></ProtectedRoute>} />
                  <Route path="/top-up" element={<ProtectedRoute><TopUpPage /></ProtectedRoute>} />
                  <Route path="/wallet-verification" element={<ProtectedRoute><WalletVerificationPage /></ProtectedRoute>} />

                  {/* Admin Routes - Temporarily commented out */}
                  {/* <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} /> */}
                  {/* <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} /> */}
                  {/* <Route path="/admin/transactions" element={<AdminRoute><AdminTransactionsPage /></AdminRoute>} /> */}
                  {/* <Route path="/admin/kyc-documents" element={<AdminRoute><AdminKYCDocumentsPage /></AdminRoute>} /> */}
                  {/* <Route path="/admin/external-wallets" element={<AdminRoute><AdminExternalWalletsPage /></AdminRoute>} /> */}
                  {/* <Route path="/admin/trading-orders" element={<AdminRoute><AdminTradingOrdersPage /></AdminRoute>} /> */}
                  {/* <Route path="/admin/vault-configurations" element={<AdminRoute><AdminVaultConfigurationsPage /></AdminRoute>} /> */}

                  {/* Dev Test Routes - Temporarily commented out */}
                  {/* <Route path="/dev/playground" element={<DevRoute><DevPlaygroundPage /></DevRoute>} /> */}
                  {/* <Route path="/dev/cron-test" element={<DevRoute><DevCronTestPage /></DevRoute>} /> */}
                  {/* <Route path="/dev/styleguide" element={<DevRoute><DevStyleguidePage /></DevRoute>} /> */}

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
              <Toaster />
            </div>
          </TooltipProvider>
        </CryptocurrenciesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
