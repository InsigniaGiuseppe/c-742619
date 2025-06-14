
import { useState, useEffect } from 'react';
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
    logo_url?: string;
  };
}

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalValue, setTotalValue] = useState(0);
  const [totalProfitLoss, setTotalProfitLoss] = useState(0);
  const [totalProfitLossPercentage, setTotalProfitLossPercentage] = useState(0);
  const { user } = useAuth();

  const fetchPortfolio = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_portfolios')
        .select(`
          *,
          crypto:cryptocurrencies(
            id,
            name,
            symbol,
            current_price,
            logo_url
          )
        `)
        .eq('user_id', user.id)
        .gt('quantity', 0);

      if (error) {
        setError(error.message);
        return;
      }

      const portfolioData = data?.map(item => ({
        ...item,
        crypto: item.crypto
      })) || [];

      setPortfolio(portfolioData);

      // Calculate totals
      const totalVal = portfolioData.reduce((sum, item) => sum + item.current_value, 0);
      const totalPL = portfolioData.reduce((sum, item) => sum + item.profit_loss, 0);
      const totalInvested = portfolioData.reduce((sum, item) => sum + item.total_invested, 0);
      const totalPLPercentage = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

      setTotalValue(totalVal);
      setTotalProfitLoss(totalPL);
      setTotalProfitLossPercentage(totalPLPercentage);

    } catch (err) {
      setError('Failed to fetch portfolio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [user]);

  return {
    portfolio,
    loading,
    error,
    totalValue,
    totalProfitLoss,
    totalProfitLossPercentage,
    refetch: fetchPortfolio,
  };
};
