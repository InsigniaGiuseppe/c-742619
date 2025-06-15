import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Index from "./pages/Index";
import { Toaster } from "@/components/ui/sonner";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminUserDetailPage from "./pages/AdminUserDetailPage";
import AdminAuditLog from "./pages/AdminAuditLog";
import AdminWallets from "./pages/AdminWallets";
import AdminKyc from "./pages/AdminKyc";
import AdminTransactions from "./pages/AdminTransactions";
import ProfilePage from "./pages/ProfilePage";
import WalletPage from "./pages/WalletPage";
import TopUpPage from "./pages/TopUpPage";
import LendingPage from "./pages/LendingPage";
import MessagesPage from "./pages/MessagesPage";
import TradingPage from "./pages/TradingPage";
import CryptoDetailPage from "./pages/CryptoDetailPage";
import { CryptocurrenciesProvider } from "./hooks/useCryptocurrencies";

function App() {
  return (
    <Router>
      <CryptocurrenciesProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
          <Route path="/top-up" element={<ProtectedRoute><TopUpPage /></ProtectedRoute>} />
          <Route path="/lending" element={<ProtectedRoute><LendingPage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/trading" element={<ProtectedRoute><TradingPage /></ProtectedRoute>} />
          <Route path="/crypto/:symbol" element={<ProtectedRoute><CryptoDetailPage /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/users/:userId" element={<AdminRoute><AdminUserDetailPage /></AdminRoute>} />
          <Route path="/admin/audit-log" element={<AdminRoute><AdminAuditLog /></AdminRoute>} />
          <Route path="/admin/wallets" element={<AdminRoute><AdminWallets /></AdminRoute>} />
          <Route path="/admin/kyc" element={<AdminRoute><AdminKyc /></AdminRoute>} />
          <Route path="/admin/transactions" element={<AdminRoute><AdminTransactions /></AdminRoute>} />
        </Routes>
      </CryptocurrenciesProvider>
      <Toaster />
    </Router>
  );
}

export default App;
