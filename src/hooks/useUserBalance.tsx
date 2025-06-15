
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { convertUsdToEur } from '@/lib/currencyConverter';

export const useUserBalance = () => {
  const { user } = useAuth();
  const { exchangeRate } = useExchangeRate();
  const [balanceUsd, setBalanceUsd] = useState<number>(0);
  const [totalAssetsUsd, setTotalAssetsUsd] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    if (!user) {
      setBalanceUsd(0);
      setTotalAssetsUsd(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get liquid balance from profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('demo_balance_usd')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('[useUserBalance] Error fetching profile:', profileError);
        setBalanceUsd(0);
      } else {
        setBalanceUsd(profile?.demo_balance_usd || 0);
      }

      // Calculate total assets including portfolio and lending
      let totalAssets = profile?.demo_balance_usd || 0;

      // Add portfolio value
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('user_portfolios')
        .select(`
          *,
          crypto:cryptocurrencies(current_price)
        `)
        .eq('user_id', user.id)
        .gt('quantity', 0);

      if (!portfolioError && portfolioData) {
        const portfolioValue = portfolioData.reduce((sum, item) => {
          return sum + (item.quantity * (item.crypto?.current_price || 0));
        }, 0);
        totalAssets += portfolioValue;
      }

      // Add lending positions value
      const { data: lendingData, error: lendingError } = await supabase
        .from('user_lending')
        .select(`
          *,
          crypto:cryptocurrencies(current_price)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (!lendingError && lendingData) {
        const lendingValue = lendingData.reduce((sum, lending) => {
          const currentValue = lending.amount_lent * (lending.crypto?.current_price || 0);
          const interestValue = lending.total_interest_earned * (lending.crypto?.current_price || 0);
          return sum + currentValue + interestValue;
        }, 0);
        totalAssets += lendingValue;
      }

      setTotalAssetsUsd(totalAssets);

    } catch (error) {
      console.error('[useUserBalance] Error fetching balance:', error);
      setBalanceUsd(0);
      setTotalAssetsUsd(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [user?.id]);

  // Convert USD values to EUR for display
  const balanceEur = convertUsdToEur(balanceUsd, exchangeRate);
  const totalAssetsEur = convertUsdToEur(totalAssetsUsd, exchangeRate);

  return {
    balance: balanceEur, // Liquid balance in EUR
    balanceUsd, // Liquid balance in USD
    totalAssets: totalAssetsEur, // Total assets including lending in EUR
    totalAssetsUsd, // Total assets including lending in USD
    loading,
    refetch: fetchBalance
  };
};
