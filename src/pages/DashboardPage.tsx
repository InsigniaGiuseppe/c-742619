
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PortfolioChart from '@/components/PortfolioChart';
import RecentTransactions from '@/components/RecentTransactions';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const DashboardPage = () => {
  const { user } = useAuth();
  const { totalValue, totalProfitLoss, totalProfitLossPercentage, loading } = usePortfolio();
  const [demoBalance, setDemoBalance] = React.useState(0);

  React.useEffect(() => {
    if (user) {
      fetchDemoBalance();
    }
  }, [user]);

  const fetchDemoBalance = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data && (data as any).demo_balance_usd !== undefined) {
      setDemoBalance((data as any).demo_balance_usd || 0);
    } else {
      setDemoBalance(10000); // Default demo balance
    }
  };

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-20 pt-24">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Demo Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${demoBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Available for trading
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${loading ? '...' : totalValue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total crypto holdings
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
              {totalProfitLoss >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {totalProfitLoss >= 0 ? '+' : ''}${loading ? '...' : totalProfitLoss.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalProfitLossPercentage >= 0 ? '+' : ''}{loading ? '...' : totalProfitLossPercentage.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(demoBalance + totalValue).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Balance + Holdings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PortfolioChart />
          <RecentTransactions />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
