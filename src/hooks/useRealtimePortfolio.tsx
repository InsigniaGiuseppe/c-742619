
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useLending } from '@/hooks/useLending';

export const useRealtimePortfolio = () => {
  const { user } = useAuth();
  const portfolio = usePortfolio();
  const lending = useLending();
  const [isRealtime, setIsRealtime] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Subscribe to real-time updates for cryptocurrency prices
    const channel = supabase
      .channel('crypto-price-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cryptocurrencies'
        },
        (payload) => {
          console.log('[Realtime] Crypto price updated:', payload);
          // Refetch both portfolio and lending data when crypto prices change
          portfolio.refetch();
          lending.refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_lending'
        },
        (payload) => {
          console.log('[Realtime] Lending position updated:', payload);
          // Refetch lending data when lending positions change
          lending.refetch();
          portfolio.refetch(); // Also refetch portfolio for updated P&L calculations
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lending_interest_payments'
        },
        (payload) => {
          console.log('[Realtime] Interest payment received:', payload);
          // Refetch both when interest payments are added
          lending.refetch();
          portfolio.refetch();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsRealtime(true);
          console.log('[Realtime] Connected to portfolio and lending updates');
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setIsRealtime(false);
    };
  }, [user, portfolio.refetch, lending.refetch]);

  return {
    ...portfolio,
    lendingData: lending,
    isRealtime
  };
};
