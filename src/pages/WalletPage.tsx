
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, TrendingDown, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const WalletPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { portfolio, totalValue, totalProfitLoss, loading: portfolioLoading } = usePortfolio();
  const { transactions, loading: transactionsLoading } = useTransactionHistory();
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

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-20 pt-24">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">My Wallet</h1>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/wallet-verification')}>
              <Plus className="mr-2 h-4 w-4" />
              Verify Wallet
            </Button>
          </div>
        </div>

        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass glass-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${demoBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Demo trading balance
              </p>
            </CardContent>
          </Card>

          <Card className="glass glass-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${portfolioLoading ? '...' : totalValue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Current holdings value
              </p>
            </CardContent>
          </Card>

          <Card className="glass glass-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
              {totalProfitLoss >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {totalProfitLoss >= 0 ? '+' : ''}${portfolioLoading ? '...' : totalProfitLoss.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Unrealized gains/losses
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Portfolio Holdings */}
          <Card className="glass glass-hover">
            <CardHeader>
              <CardTitle>Portfolio Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              {portfolioLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-800 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : portfolio.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-400">No crypto holdings yet</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => navigate('/trading')}
                  >
                    Start Trading
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {portfolio.map((holding) => (
                    <div key={holding.id} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors rounded-lg cursor-pointer"
                         onClick={() => navigate(`/crypto/${holding.crypto.symbol.toLowerCase()}`)}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                          {holding.crypto.symbol.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium">{holding.crypto.name}</p>
                          <p className="text-sm text-gray-400">
                            {holding.quantity.toFixed(8)} {holding.crypto.symbol}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${holding.current_value.toFixed(2)}</p>
                        <div className="flex items-center gap-1">
                          <Badge 
                            variant={holding.profit_loss >= 0 ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {holding.profit_loss >= 0 ? '+' : ''}${holding.profit_loss.toFixed(2)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="glass glass-hover">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/trading')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-12 bg-gray-800 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : recentTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <ArrowUpRight className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-400">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.transaction_type === 'buy' ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          {transaction.transaction_type === 'buy' ? (
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDownLeft className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          ${transaction.usd_value?.toFixed(2)}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WalletPage;
