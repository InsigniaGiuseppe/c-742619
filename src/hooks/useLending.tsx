
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface LendingPosition {
  id: string;
  cryptocurrency_id: string;
  amount_lent: number;
  original_amount_lent: number;
  annual_interest_rate: number;
  total_interest_earned: number;
  lending_started_at: string;
  lending_cancelled_at: string | null;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  user_id: string;
  crypto: {
    id: string;
    name: string;
    symbol: string;
    logo_url: string;
    current_price: number;
  };
}

const fetchLendingPositions = async (userId: string): Promise<LendingPosition[]> => {
  const { data, error } = await supabase
    .from('user_lending')
    .select(`
      *,
      crypto:cryptocurrencies(
        id,
        name,
        symbol,
        logo_url,
        current_price
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching lending positions:', error);
    throw new Error(error.message);
  }

  // Transform the data to match our interface
  return (data || []).map(item => ({
    ...item,
    status: item.status as 'active' | 'completed' | 'cancelled',
    crypto: {
      id: item.crypto.id,
      name: item.crypto.name,
      symbol: item.crypto.symbol,
      logo_url: item.crypto.logo_url || '',
      current_price: item.crypto.current_price
    }
  }));
};

const cancelLendingPosition = async (
  lendingId: string,
  userId: string | undefined
): Promise<{ success: boolean }> => {
  console.log('[useLending] Cancelling lending position:', lendingId);

  // Get lending position details
  const { data: lendingPosition, error: fetchError } = await supabase
    .from('user_lending')
    .select(`
      *,
      crypto:cryptocurrencies(
        id,
        name,
        symbol,
        logo_url,
        current_price
      )
    `)
    .eq('id', lendingId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !lendingPosition) {
    throw new Error('Lending position not found');
  }

  if (lendingPosition.status !== 'active') {
    throw new Error('Can only cancel active lending positions');
  }

  // Update lending status to cancelled
  const { error: updateError } = await supabase
    .from('user_lending')
    .update({
      status: 'cancelled',
      lending_cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', lendingId)
    .eq('user_id', userId);

  if (updateError) {
    console.error('Error updating lending status:', updateError);
    throw new Error(updateError.message);
  }

  const totalToReturn = lendingPosition.amount_lent + lendingPosition.total_interest_earned;
  const currentPrice = lendingPosition.crypto?.current_price || 0;

  // Use a simple approach: try to get existing portfolio, then either insert or update
  const { data: existingPortfolio, error: selectError } = await supabase
    .from('user_portfolios')
    .select('id, quantity')
    .eq('user_id', userId)
    .eq('cryptocurrency_id', lendingPosition.cryptocurrency_id)
    .maybeSingle();

  if (selectError) {
    console.error('Error checking existing portfolio:', selectError);
    throw new Error(`Failed to check existing portfolio: ${selectError.message}`);
  }

  if (existingPortfolio) {
    // Update existing portfolio entry
    const newQuantity = existingPortfolio.quantity + totalToReturn;
    const { error: updatePortfolioError } = await supabase
      .from('user_portfolios')
      .update({
        quantity: newQuantity,
        current_value: newQuantity * currentPrice,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingPortfolio.id);

    if (updatePortfolioError) {
      console.error('Error updating existing portfolio:', updatePortfolioError);
      throw new Error(`Failed to update portfolio: ${updatePortfolioError.message}`);
    }
  } else {
    // Create new portfolio entry
    const { error: insertPortfolioError } = await supabase
      .from('user_portfolios')
      .insert({
        user_id: userId,
        cryptocurrency_id: lendingPosition.cryptocurrency_id,
        quantity: totalToReturn,
        average_buy_price: 0,
        total_invested: 0,
        current_value: totalToReturn * currentPrice,
        profit_loss: 0,
        profit_loss_percentage: 0,
        updated_at: new Date().toISOString()
      });

    if (insertPortfolioError) {
      console.error('Error creating portfolio entry:', insertPortfolioError);
      throw new Error(`Failed to create portfolio entry: ${insertPortfolioError.message}`);
    }
  }

  // Create transaction record for the cancellation
  const { error: transactionError } = await supabase
    .from('transaction_history')
    .insert({
      user_id: userId,
      cryptocurrency_id: lendingPosition.cryptocurrency_id,
      transaction_type: 'lending_cancelled',
      amount: totalToReturn,
      usd_value: totalToReturn * currentPrice,
      status: 'completed',
      description: `Cancelled lending position: ${lendingPosition.amount_lent} + ${lendingPosition.total_interest_earned} interest`
    });

  if (transactionError) {
    console.error('Error creating transaction record:', transactionError);
    // Log but do not throw
    console.warn('Transaction recording failed but lending cancellation succeeded');
  }

  return { success: true };
};

export const useLending = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['lending-positions', user?.id],
    queryFn: () => fetchLendingPositions(user!.id),
    enabled: !!user,
  });

  const cancelLendingMutation = useMutation({
    mutationFn: (lendingId: string) => cancelLendingPosition(lendingId, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lending-positions'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['user-portfolios'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-history'] });
      toast.success('Lending position cancelled successfully');
    },
    onError: (error: any) => {
      console.error('Error cancelling lending position:', error);
      toast.error(`Failed to cancel lending position: ${error.message}`);
    },
  });

  return {
    lendingPositions: query.data || [],
    loading: query.isLoading,
    error: query.error,
    isLoading: query.isLoading,
    isError: query.isError,
    cancelLending: cancelLendingMutation.mutate,
    isCancelling: cancelLendingMutation.isPending,
    refetch: query.refetch,
  };
};
