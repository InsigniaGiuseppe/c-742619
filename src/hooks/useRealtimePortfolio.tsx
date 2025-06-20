
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useLending } from '@/hooks/useLending';

export const useRealtimePortfolio = () => {
  const { user } = useAuth();
  const portfolio = usePortfolio();
  const lending = useLending();
  const [isRealtime, setIsRealtime] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    if (!user || isSubscribedRef.current) return;

    // Clean up existing channel before creating a new one
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      setIsRealtime(false);
      isSubscribedRef.current = false;
    }

    // Create a new channel with a unique name to avoid conflicts
    const channelName = `crypto-updates-${user.id}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
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
          table: 'user_portfolios'
        },
        (payload) => {
          console.log('[Realtime] Portfolio updated:', payload);
          // Refetch portfolio data when user portfolios change
          portfolio.refetch();
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trading_orders'
        },
        (payload) => {
          console.log('[Realtime] Trading order updated:', payload);
          // Refetch portfolio when trading orders change
          portfolio.refetch();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsRealtime(true);
          isSubscribedRef.current = true;
          console.log('[Realtime] Connected to portfolio and lending updates');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setIsRealtime(false);
          isSubscribedRef.current = false;
          console.log('[Realtime] Disconnected from portfolio and lending updates');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsRealtime(false);
      isSubscribedRef.current = false;
    };
  }, [user?.id]); // Only depend on user.id to prevent unnecessary re-subscriptions

  return {
    ...portfolio,
    lendingData: lending,
    isRealtime
  };
};
