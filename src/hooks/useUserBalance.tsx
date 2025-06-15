
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { convertUsdToEur } from '@/lib/currencyConverter';

export const useUserBalance = () => {
  const { user } = useAuth();
  const { exchangeRate } = useExchangeRate();
  const [balanceUsd, setBalanceUsd] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    if (!user) {
      setBalanceUsd(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('demo_balance_usd')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user balance:', error);
        setBalanceUsd(0);
      } else {
        setBalanceUsd(data?.demo_balance_usd || 0);
      }
    } catch (error) {
      console.error('Error fetching user balance:', error);
      setBalanceUsd(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [user?.id]);

  // Convert USD balance to EUR for display
  const balanceEur = convertUsdToEur(balanceUsd, exchangeRate);

  return {
    balance: balanceEur, // Return EUR balance for display
    balanceUsd, // Keep USD balance for internal calculations
    loading,
    refetch: fetchBalance
  };
};
