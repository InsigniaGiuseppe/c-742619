import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface LendingPosition {
  id: string;
  user_id: string;
  cryptocurrency_id: string;
  amount_lent: number;
  original_amount_lent: number;
  annual_interest_rate: number;
  total_interest_earned: number;
  status: string;
  lending_started_at: string;
  lending_cancelled_at?: string;
  crypto: {
    id: string;
    name: string;
    symbol: string;
    current_price: number;
    logo_url?: string;
  };
}

export interface LendingStats {
  totalLentValue: number;
  totalEarnedInterest: number;
  averageYield: number;
  activeLendingCount: number;
  estimatedDailyReturn: number;
  estimatedMonthlyReturn: number;
  daysSinceLastPayout: number;
  nextPayoutIn: string;
}

const fetchLendingPositions = async (userId: string): Promise<LendingPosition[]> => {
  console.log('[useLending] Fetching lending positions for user:', userId);
  
  const { data, error } = await supabase
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
    .eq('status', 'active')
    .order('lending_started_at', { ascending: false });

  if (error) {
    console.error('[useLending] Error fetching lending positions:', error);
    throw new Error(error.message);
  }

  console.log('[useLending] Fetched lending positions:', data);
  return data || [];
};

const fetchLendingStats = async (userId: string): Promise<LendingStats> => {
  console.log('[useLending] Fetching lending stats for user:', userId);
  
  const { data: positions, error } = await supabase
    .from('user_lending')
    .select(`
      *,
      crypto:cryptocurrencies(current_price)
    `)
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) {
    console.error('[useLending] Error fetching lending stats:', error);
    throw new Error(error.message);
  }

  // Get last payout date
  const { data: lastPayout } = await supabase
    .from('lending_interest_payments')
    .select('payment_date')
    .eq('user_id', userId)
    .order('payment_date', { ascending: false })
    .limit(1)
    .single();

  const stats = positions?.reduce((acc, position) => {
    const currentValue = position.amount_lent * (position.crypto?.current_price || 0);
    const dailyRate = position.annual_interest_rate / 365;
    const dailyReturn = position.amount_lent * dailyRate * (position.crypto?.current_price || 0);
    
    acc.totalLentValue += currentValue;
    acc.totalEarnedInterest += position.total_interest_earned * (position.crypto?.current_price || 0);
    acc.estimatedDailyReturn += dailyReturn;
    return acc;
  }, {
    totalLentValue: 0,
    totalEarnedInterest: 0,
    estimatedDailyReturn: 0,
    estimatedMonthlyReturn: 0,
    averageYield: 0,
    activeLendingCount: positions?.length || 0,
    daysSinceLastPayout: 0,
    nextPayoutIn: 'Tomorrow at 9:00 AM'
  }) || { 
    totalLentValue: 0, 
    totalEarnedInterest: 0, 
    estimatedDailyReturn: 0,
    estimatedMonthlyReturn: 0,
    averageYield: 0, 
    activeLendingCount: 0,
    daysSinceLastPayout: 0,
    nextPayoutIn: 'Tomorrow at 9:00 AM'
  };

  // Calculate monthly return (30 days)
  stats.estimatedMonthlyReturn = stats.estimatedDailyReturn * 30;

  // Calculate average yield
  if (stats.activeLendingCount > 0) {
    const totalRate = positions?.reduce((sum, pos) => sum + pos.annual_interest_rate, 0) || 0;
    stats.averageYield = (totalRate / stats.activeLendingCount) * 100;
  }

  // Calculate days since last payout
  if (lastPayout) {
    const lastPayoutDate = new Date(lastPayout.payment_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastPayoutDate.getTime());
    stats.daysSinceLastPayout = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Calculate next payout time
  const now = new Date();
  const tomorrow9AM = new Date();
  tomorrow9AM.setDate(tomorrow9AM.getDate() + 1);
  tomorrow9AM.setHours(9, 0, 0, 0);
  
  if (now.getHours() < 9) {
    // If before 9 AM today, next payout is today at 9 AM
    const today9AM = new Date();
    today9AM.setHours(9, 0, 0, 0);
    const hoursUntil = Math.ceil((today9AM.getTime() - now.getTime()) / (1000 * 60 * 60));
    stats.nextPayoutIn = hoursUntil <= 1 ? 'In less than 1 hour' : `In ${hoursUntil} hours`;
  } else {
    // After 9 AM today, next payout is tomorrow at 9 AM
    const hoursUntil = Math.ceil((tomorrow9AM.getTime() - now.getTime()) / (1000 * 60 * 60));
    stats.nextPayoutIn = `In ${hoursUntil} hours`;
  }

  console.log('[useLending] Calculated lending stats:', stats);
  return stats;
};

export const useLending = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const queryKey = ['lending-positions', user?.id];
  const statsKey = ['lending-stats', user?.id];

  const positionsQuery = useQuery({
    queryKey,
    queryFn: () => fetchLendingPositions(user!.id),
    enabled: !!user,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const statsQuery = useQuery({
    queryKey: statsKey,
    queryFn: () => fetchLendingStats(user!.id),
    enabled: !!user,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Mutation to start lending
  const startLendingMutation = useMutation({
    mutationFn: async ({ cryptoId, amount }: { cryptoId: string; amount: number }) => {
      console.log('[useLending] Starting lending:', { cryptoId, amount });
      
      // Get crypto info to determine APR
      const { data: crypto } = await supabase
        .from('cryptocurrencies')
        .select('symbol')
        .eq('id', cryptoId)
        .single();

      // Top 5 coins get 5% APR, others get 3%
      const topCoins = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL'];
      const annualRate = topCoins.includes(crypto?.symbol?.toUpperCase()) ? 0.05 : 0.03;

      const { data, error } = await supabase
        .from('user_lending')
        .insert({
          user_id: user!.id,
          cryptocurrency_id: cryptoId,
          amount_lent: amount,
          original_amount_lent: amount,
          annual_interest_rate: annualRate,
        })
        .select()
        .single();

      if (error) throw error;

      // Create transaction record
      await supabase
        .from('transaction_history')
        .insert({
          user_id: user!.id,
          cryptocurrency_id: cryptoId,
          transaction_type: 'lending_start',
          amount: amount,
          status: 'completed',
          description: `Started lending ${amount} ${crypto?.symbol}`,
        });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: statsKey });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-history'] });
    },
  });

  // Mutation to cancel lending
  const cancelLendingMutation = useMutation({
    mutationFn: async (lendingId: string) => {
      console.log('[useLending] Cancelling lending:', lendingId);
      
      const { data, error } = await supabase
        .from('user_lending')
        .update({
          status: 'cancelled',
          lending_cancelled_at: new Date().toISOString(),
        })
        .eq('id', lendingId)
        .eq('user_id', user!.id)
        .select(`
          *,
          crypto:cryptocurrencies(symbol)
        `)
        .single();

      if (error) throw error;

      // Create transaction record for cancellation
      await supabase
        .from('transaction_history')
        .insert({
          user_id: user!.id,
          cryptocurrency_id: data.cryptocurrency_id,
          transaction_type: 'lending_cancelled',
          amount: data.amount_lent,
          status: 'completed',
          description: `Cancelled lending and returned ${data.amount_lent} ${data.crypto?.symbol}`,
        });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: statsKey });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-history'] });
    },
  });

  return {
    lendingPositions: positionsQuery.data || [],
    lendingStats: statsQuery.data || { 
      totalLentValue: 0, 
      totalEarnedInterest: 0, 
      averageYield: 0, 
      activeLendingCount: 0,
      estimatedDailyReturn: 0,
      estimatedMonthlyReturn: 0,
      daysSinceLastPayout: 0,
      nextPayoutIn: 'Tomorrow at 9:00 AM'
    },
    loading: positionsQuery.isLoading || statsQuery.isLoading,
    error: positionsQuery.error?.message || statsQuery.error?.message || null,
    startLending: startLendingMutation.mutate,
    cancelLending: cancelLendingMutation.mutate,
    isStartingLending: startLendingMutation.isPending,
    isCancellingLending: cancelLendingMutation.isPending,
    refetch: () => {
      positionsQuery.refetch();
      statsQuery.refetch();
    },
  };
};
