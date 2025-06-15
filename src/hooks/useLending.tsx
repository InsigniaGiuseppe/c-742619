
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

export const useLending = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['lending-positions', user?.id],
    queryFn: () => fetchLendingPositions(user!.id),
    enabled: !!user,
  });

  const cancelLendingMutation = useMutation({
    mutationFn: async (lendingId: string) => {
      console.log('[useLending] Cancelling lending position:', lendingId);
      
      // Get the lending position details first
      const { data: lendingPosition, error: fetchError } = await supabase
        .from('user_lending')
        .select('*')
        .eq('id', lendingId)
        .eq('user_id', user!.id)
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
          updated_at: new Date().toISOString()
        })
        .eq('id', lendingId)
        .eq('user_id', user!.id);

      if (updateError) {
        console.error('Error updating lending status:', updateError);
        throw new Error(updateError.message);
      }

      // Get current portfolio for this crypto
      const { data: currentPortfolio, error: portfolioError } = await supabase
        .from('user_portfolios')
        .select('*')
        .eq('user_id', user!.id)
        .eq('cryptocurrency_id', lendingPosition.cryptocurrency_id)
        .single();

      if (portfolioError && portfolioError.code !== 'PGRST116') {
        console.error('Error fetching current portfolio:', portfolioError);
        throw new Error(portfolioError.message);
      }

      // Calculate new quantity (restore the lent amount)
      const newQuantity = (currentPortfolio?.quantity || 0) + lendingPosition.amount_lent;

      // Update or insert portfolio record
      const { error: portfolioUpdateError } = await supabase
        .from('user_portfolios')
        .upsert({
          user_id: user!.id,
          cryptocurrency_id: lendingPosition.cryptocurrency_id,
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        });

      if (portfolioUpdateError) {
        console.error('Error updating portfolio:', portfolioUpdateError);
        throw new Error(portfolioUpdateError.message);
      }

      // Create transaction record for the cancellation
      const { error: transactionError } = await supabase
        .from('transaction_history')
        .insert({
          user_id: user!.id,
          cryptocurrency_id: lendingPosition.cryptocurrency_id,
          transaction_type: 'lending_cancelled',
          amount: lendingPosition.amount_lent,
          status: 'completed',
          description: `Cancelled lending position of ${lendingPosition.amount_lent} tokens`,
          created_at: new Date().toISOString()
        });

      if (transactionError) {
        console.error('Error creating transaction record:', transactionError);
        // Don't throw here as the main operation succeeded
      }

      return { success: true };
    },
    onSuccess: () => {
      // Invalidate both lending and portfolio queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['lending-positions'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['user-portfolios'] });
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
