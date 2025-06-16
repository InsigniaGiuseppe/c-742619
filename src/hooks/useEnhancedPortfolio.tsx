
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface EnhancedPortfolioData {
  totalValue: number;
  totalInvested: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  realizedPnl: number;
  unrealizedPnl: number;
  tradingValue: number;
  spinRewardsValue: number;
  lendingValue: number;
  vaultValue: number;
  diversificationScore: number;
  riskScore: number;
  performanceMetrics: {
    bestPerformer: any;
    worstPerformer: any;
    avgReturn: number;
    volatility: number;
  };
}

const fetchEnhancedPortfolio = async (userId: string): Promise<EnhancedPortfolioData> => {
  console.log('[useEnhancedPortfolio] Fetching enhanced portfolio data for user:', userId);

  // Fetch portfolio with enhanced data
  const { data: portfolioData, error: portfolioError } = await supabase
    .from('user_portfolios')
    .select(`
      *,
      crypto:cryptocurrencies(
        id, name, symbol, current_price, price_change_percentage_24h, logo_url
      )
    `)
    .eq('user_id', userId)
    .gt('quantity', 0);

  if (portfolioError) {
    console.error('[useEnhancedPortfolio] Portfolio error:', portfolioError);
    throw new Error(portfolioError.message);
  }

  // Fetch realized gains
  const { data: realizedGains, error: gainsError } = await supabase
    .from('realized_gains')
    .select('*')
    .eq('user_id', userId);

  if (gainsError) {
    console.error('[useEnhancedPortfolio] Realized gains error:', gainsError);
  }

  // Fetch lending positions
  const { data: lendingData, error: lendingError } = await supabase
    .from('user_lending')
    .select(`
      *,
      crypto:cryptocurrencies(id, name, symbol, current_price, logo_url)
    `)
    .eq('user_id', userId)
    .eq('status', 'active');

  if (lendingError) {
    console.error('[useEnhancedPortfolio] Lending error:', lendingError);
  }

  // Fetch vault positions
  const { data: vaultData, error: vaultError } = await supabase
    .from('user_vaults')
    .select(`
      *,
      vault_config:vault_configurations(
        cryptocurrency_id,
        apy,
        cryptocurrencies(name, symbol, current_price)
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active');

  if (vaultError) {
    console.error('[useEnhancedPortfolio] Vault error:', vaultError);
  }

  // Calculate enhanced metrics
  const portfolioItems = portfolioData || [];
  let totalValue = 0;
  let totalInvested = 0;
  let tradingValue = 0;
  let spinRewardsValue = 0;

  portfolioItems.forEach(item => {
    const currentValue = item.quantity * (item.crypto?.current_price || 0);
    totalValue += currentValue;
    totalInvested += item.total_invested;

    if (item.is_spin_reward) {
      spinRewardsValue += currentValue;
    } else {
      tradingValue += currentValue;
    }
  });

  // Calculate lending value
  let lendingValue = 0;
  if (lendingData) {
    lendingData.forEach(lending => {
      lendingValue += lending.amount_lent * (lending.crypto?.current_price || 0);
    });
  }

  // Calculate vault value
  let vaultValue = 0;
  if (vaultData) {
    vaultData.forEach(vault => {
      const cryptoPrice = vault.vault_config?.cryptocurrencies?.current_price || 0;
      vaultValue += (vault.amount_vaulted + vault.accrued_yield) * cryptoPrice;
    });
  }

  // Calculate realized P&L
  const realizedPnl = realizedGains?.reduce((sum, gain) => sum + gain.realized_pnl, 0) || 0;
  
  // Calculate unrealized P&L
  const unrealizedPnl = totalValue - totalInvested;
  const totalProfitLoss = realizedPnl + unrealizedPnl;
  const totalProfitLossPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  // Calculate performance metrics
  const bestPerformer = portfolioItems.reduce((best, current) => 
    current.profit_loss_percentage > (best?.profit_loss_percentage || -Infinity) ? current : best
  , portfolioItems[0]);
  
  const worstPerformer = portfolioItems.reduce((worst, current) => 
    current.profit_loss_percentage < (worst?.profit_loss_percentage || Infinity) ? current : worst
  , portfolioItems[0]);

  const avgReturn = portfolioItems.length > 0 
    ? portfolioItems.reduce((sum, item) => sum + item.profit_loss_percentage, 0) / portfolioItems.length 
    : 0;

  // Simple volatility calculation based on price changes
  const volatility = portfolioItems.length > 0
    ? Math.sqrt(portfolioItems.reduce((sum, item) => 
        sum + Math.pow(item.crypto?.price_change_percentage_24h || 0, 2), 0) / portfolioItems.length)
    : 0;

  // Calculate diversification score (0-100)
  const diversificationScore = Math.min(100, (portfolioItems.length / 10) * 100);

  // Calculate risk score based on volatility and concentration
  const concentration = portfolioItems.length > 0 
    ? Math.max(...portfolioItems.map(item => (item.quantity * (item.crypto?.current_price || 0)) / totalValue)) 
    : 0;
  const riskScore = Math.min(100, (volatility * 0.7 + concentration * 100 * 0.3));

  const combinedTotalValue = totalValue + lendingValue + vaultValue;

  return {
    totalValue: combinedTotalValue,
    totalInvested,
    totalProfitLoss,
    totalProfitLossPercentage,
    realizedPnl,
    unrealizedPnl,
    tradingValue,
    spinRewardsValue,
    lendingValue,
    vaultValue,
    diversificationScore,
    riskScore,
    performanceMetrics: {
      bestPerformer,
      worstPerformer,
      avgReturn,
      volatility
    }
  };
};

export const useEnhancedPortfolio = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['enhanced-portfolio', user?.id],
    queryFn: () => fetchEnhancedPortfolio(user!.id),
    enabled: !!user,
    staleTime: 30000,
    refetchInterval: 60000,
  });
};
