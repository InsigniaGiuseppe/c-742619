
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { convertUsdToEur } from '@/lib/currencyConverter';

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

const fetchPortfolio = async (
  userId: string,
  exchangeRate: number
): Promise<{
  portfolio: PortfolioItem[];
  totalValue: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  totalInvested: number;
  liquidValue: number;
  lendingValue: number;
}> => {
  console.log('[usePortfolio] Fetching complete portfolio for user:', userId);
  
  // Fetch trading portfolio
  const { data: portfolioData, error: portfolioError } = await supabase
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

  if (portfolioError) {
    console.error('[usePortfolio] Error fetching portfolio:', portfolioError);
    throw new Error(portfolioError.message);
  }

  // Fetch lending positions
  const { data: lendingData, error: lendingError } = await supabase
    .from('user_lending')
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
    .eq('user_id', userId)
    .eq('status', 'active');

  if (lendingError) {
    console.error('[usePortfolio] Error fetching lending data:', lendingError);
  }

  console.log('[usePortfolio] Raw portfolio data:', portfolioData);
  console.log('[usePortfolio] Raw lending data:', lendingData);

const portfolioItems = portfolioData?.map(item => {
    // Calculate current value in USD first
    const liveCurrentValueUsd = item.quantity * (item.crypto?.current_price || 0);
    // Convert to EUR using the latest exchange rate
    const liveCurrentValueEur = convertUsdToEur(liveCurrentValueUsd, exchangeRate);
    
    // FIXED: Use database stored total_invested directly (already in EUR from recent trades)
    // For older entries that might have USD values, we need to detect and convert them
    let totalInvestedEur = item.total_invested;
    
    // Heuristic: If total_invested is much larger than current EUR value, it's likely in USD
    const eurPrice = convertUsdToEur(item.crypto?.current_price || 0, exchangeRate);
    const expectedEurValue = item.quantity * eurPrice;
    
    if (totalInvestedEur > expectedEurValue * 2) {
      // This looks like USD data, convert it using the current exchange rate
      console.log(
        `[usePortfolio] Converting suspected USD total_invested for ${item.crypto?.symbol}:`,
        totalInvestedEur
      );
      totalInvestedEur = convertUsdToEur(totalInvestedEur, exchangeRate);
    }
    
    const profitLoss = liveCurrentValueEur - totalInvestedEur;
    const profitLossPercentage = totalInvestedEur > 0 ? (profitLoss / totalInvestedEur) * 100 : 0;

    return {
      ...item,
      total_invested: totalInvestedEur,
      current_value: liveCurrentValueEur,
      profit_loss: profitLoss,
      profit_loss_percentage: profitLossPercentage,
      crypto: item.crypto
    };
  }) || [];

  // Calculate liquid trading values
  const liquidTotalValue = portfolioItems.reduce((sum, item) => sum + item.current_value, 0);
  const liquidTotalPL = portfolioItems.reduce((sum, item) => sum + item.profit_loss, 0);
  const liquidTotalInvested = portfolioItems.reduce((sum, item) => sum + item.total_invested, 0);

  // Calculate lending values
  let lendingTotalValue = 0;
  let lendingTotalInvested = 0;
  let lendingTotalInterestEarned = 0;

  if (lendingData) {
    lendingData.forEach(lending => {
      const currentLendingValueUsd = lending.amount_lent * (lending.crypto?.current_price || 0);
      const originalInvestmentUsd = lending.original_amount_lent * (lending.crypto?.current_price || 0);
      const interestInCrypto = lending.total_interest_earned;
      const interestInUsd = interestInCrypto * (lending.crypto?.current_price || 0);

      lendingTotalValue += convertUsdToEur(currentLendingValueUsd, exchangeRate);
      lendingTotalInvested += convertUsdToEur(originalInvestmentUsd, exchangeRate);
      lendingTotalInterestEarned += convertUsdToEur(interestInUsd, exchangeRate);
    });
  }

  // Total portfolio includes both liquid and lending assets
  const totalValue = liquidTotalValue + lendingTotalValue;
  const totalInvested = liquidTotalInvested + lendingTotalInvested;
  const totalPL = liquidTotalPL + lendingTotalInterestEarned;
  const totalPLPercentage = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

  console.log('[usePortfolio] Complete portfolio calculations:', {
    liquid: { value: liquidTotalValue, invested: liquidTotalInvested, pl: liquidTotalPL },
    lending: { value: lendingTotalValue, invested: lendingTotalInvested, interest: lendingTotalInterestEarned },
    combined: { totalValue, totalInvested, totalPL, totalPLPercentage }
  });

  return {
    portfolio: portfolioItems,
    totalValue: totalValue,
    totalProfitLoss: totalPL,
    totalProfitLossPercentage: totalPLPercentage,
    totalInvested: totalInvested,
    liquidValue: liquidTotalValue,
    lendingValue: lendingTotalValue,
  };
};

export const usePortfolio = () => {
  const { user } = useAuth();
  const { exchangeRate } = useExchangeRate();
  const queryKey = ['portfolio', user?.id, exchangeRate];

  const query = useQuery({
    queryKey: queryKey,
    queryFn: () => {
      console.log(`[usePortfolio] queryFn executed with key:`, queryKey);
      return fetchPortfolio(user!.id, exchangeRate);
    },
    enabled: !!user,
    staleTime: 5000,
    refetchInterval: 25000,
  });

  // Portfolio values are already in EUR from the calculation above
  return {
    portfolio: query.data?.portfolio || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    totalValue: query.data?.totalValue || 0,
    totalInvested: query.data?.totalInvested || 0,
    totalProfitLoss: query.data?.totalProfitLoss || 0,
    totalProfitLossPercentage: query.data?.totalProfitLossPercentage || 0,
    liquidValue: query.data?.liquidValue || 0,
    lendingValue: query.data?.lendingValue || 0,
    refetch: query.refetch,
  };
};
