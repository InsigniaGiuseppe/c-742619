
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import FormattedNumber from '@/components/FormattedNumber';
import CryptoLogo from '@/components/CryptoLogo';

interface AdminPortfolioProps {
  userId: string;
}

interface PortfolioItem {
  id: string;
  cryptocurrency_id: string;
  quantity: number;
  current_value: number;
  profit_loss: number;
  crypto: {
    id: string;
    name: string;
    symbol: string;
    logo_url?: string;
    current_price: number;
  };
}

const fetchUserPortfolio = async (userId: string): Promise<PortfolioItem[]> => {
  console.log('[AdminPortfolioOverview] Fetching portfolio for user:', userId);
  
  const { data, error } = await supabase
    .from('user_portfolios')
    .select(`
      *,
      crypto:cryptocurrencies(
        id,
        name,
        symbol,
        logo_url,
        current_price
      )
    `)
    .eq('user_id', userId)
    .gt('quantity', 0);

  console.log('[AdminPortfolioOverview] Portfolio query result:', { data, error });

  if (error) {
    console.error('[AdminPortfolioOverview] Error fetching user portfolio:', error);
    throw new Error(error.message);
  }

  return (data || []).map(item => ({
    ...item,
    crypto: {
      id: item.crypto.id,
      name: item.crypto.name,
      symbol: item.crypto.symbol,
      logo_url: item.crypto.logo_url || '',
      current_price: item.crypto.current_price
    }
  }));
};

const AdminPortfolioOverview: React.FC<AdminPortfolioProps> = ({ userId }) => {
  console.log('[AdminPortfolioOverview] Rendering with userId:', userId);
  
  const { data: portfolio, isLoading, error } = useQuery({
    queryKey: ['admin-portfolio', userId],
    queryFn: () => fetchUserPortfolio(userId),
    enabled: !!userId,
    retry: 1,
  });

  if (isLoading) {
    console.log('[AdminPortfolioOverview] Showing loading state');
    return (
      <div className="space-y-6">
        <Card className="glass glass-hover">
          <CardHeader>
            <CardTitle>Portfolio Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    console.log('[AdminPortfolioOverview] Showing error state:', error);
    return (
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-400">Error loading portfolio: {error.message}</p>
          <p className="text-sm text-muted-foreground mt-2">User ID: {userId}</p>
        </CardContent>
      </Card>
    );
  }

  if (!portfolio || portfolio.length === 0) {
    console.log('[AdminPortfolioOverview] No portfolio data found');
    return (
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No portfolio holdings found for this user.</p>
          <p className="text-sm text-muted-foreground mt-2">User ID: {userId}</p>
        </CardContent>
      </Card>
    );
  }

  console.log('[AdminPortfolioOverview] Rendering portfolio with', portfolio.length, 'items');

  const totalValue = portfolio.reduce((sum, item) => sum + item.current_value, 0);
  const totalProfitLoss = portfolio.reduce((sum, item) => sum + item.profit_loss, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass glass-hover">
          <CardHeader>
            <CardTitle>Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              <FormattedNumber value={totalValue} type="currency" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass glass-hover">
          <CardHeader>
            <CardTitle>Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              <FormattedNumber value={totalProfitLoss} type="currency" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolio.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <CryptoLogo
                    logo_url={item.crypto.logo_url || ''}
                    name={item.crypto.name}
                    symbol={item.crypto.symbol}
                    className="w-8 h-8"
                  />
                  <div>
                    <div className="font-semibold">{item.crypto.symbol}</div>
                    <div className="text-sm text-muted-foreground">{item.crypto.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    <FormattedNumber value={item.quantity} type="price" /> {item.crypto.symbol}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <FormattedNumber value={item.current_value} type="currency" />
                  </div>
                  <div className={`text-sm ${item.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <FormattedNumber value={item.profit_loss} type="currency" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPortfolioOverview;
