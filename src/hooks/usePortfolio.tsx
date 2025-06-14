
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface PortfolioItem {
  id: string;
  cryptocurrency_id: string;
  quantity: number;
  average_buy_price: number;
  total_invested: number;
  current_value: number;
  profit_loss: number;
  profit_loss_percentage: number;
  crypto: {
    id: string;
    name: string;
    symbol: string;
    current_price: number;
    price_change_percentage_24h: number;
    logo_url?: string;
  };
}

const fetchPortfolio = async (userId: string): Promise<{
  portfolio: PortfolioItem[];
  totalValue: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
}> => {
  console.log('[usePortfolio] Fetching portfolio for user:', userId);
  
  const { data, error } = await supabase
    .from('user_portfolios')
    .select(`
      *,
      crypto:cryptocurrencies(
        id,
        name,
        symbol,
        current_price,
        price_change_percentage_24h,
        logo_url
      )
    `)
    .eq('user_id', userId)
    .gt('quantity', 0);

  if (error) {
    console.error('[usePortfolio] Error fetching portfolio:', error);
    throw new Error(error.message);
  }

  console.log('[usePortfolio] Raw data fetched from supabase:', data);

  const portfolioData = data?.map(item => ({
    ...item,
    crypto: item.crypto
  })) || [];

  // Calculate totals
  const totalVal = portfolioData.reduce((sum, item) => sum + item.current_value, 0);
  const totalPL = portfolioData.reduce((sum, item) => sum + item.profit_loss, 0);
  const totalInvested = portfolioData.reduce((sum, item) => sum + item.total_invested, 0);
  const totalPLPercentage = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

  console.log('[usePortfolio] Processed data being returned:', {
    portfolio: portfolioData,
    totalValue: totalVal,
    totalProfitLoss: totalPL,
    totalProfitLossPercentage: totalPLPercentage,
  });

  return {
    portfolio: portfolioData,
    totalValue: totalVal,
    totalProfitLoss: totalPL,
    totalProfitLossPercentage: totalPLPercentage,
  };
};

export const usePortfolio = () => {
  const { user } = useAuth();
  const queryKey = ['portfolio', user?.id];

  const query = useQuery({
    queryKey: queryKey,
    queryFn: () => {
      console.log(`[usePortfolio] queryFn executed with key:`, queryKey);
      return fetchPortfolio(user!.id);
    },
    enabled: !!user,
    staleTime: 30000, // Consider data stale after 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  return {
    portfolio: query.data?.portfolio || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    totalValue: query.data?.totalValue || 0,
    totalProfitLoss: query.data?.totalProfitLoss || 0,
    totalProfitLossPercentage: query.data?.totalProfitLossPercentage || 0,
    refetch: query.refetch,
  };
};
