
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePortfolio } from '@/hooks/usePortfolio';

export const useRealtimePortfolio = () => {
  const { user } = useAuth();
  const portfolio = usePortfolio();
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
          // Refetch portfolio data when crypto prices change
          portfolio.refetch();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsRealtime(true);
          console.log('[Realtime] Connected to crypto price updates');
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setIsRealtime(false);
    };
  }, [user, portfolio.refetch]);

  return {
    ...portfolio,
    isRealtime
  };
};
