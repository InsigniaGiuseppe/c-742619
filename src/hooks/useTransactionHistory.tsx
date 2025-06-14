import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Transaction {
  id: string;
  cryptocurrency_id?: string;
  transaction_type: string;
  amount?: number;
  usd_value?: number;
  fee_amount?: number;
  status: string;
  description?: string;
  created_at: string;
  crypto?: {
    name: string;
    symbol: string;
    logo_url?: string;
  };
}

const fetchTransactions = async (userId: string): Promise<Transaction[]> => {
  console.log('[useTransactionHistory] Fetching transactions for user:', userId);
  
  const { data, error } = await supabase
    .from('transaction_history')
    .select(`
      *,
      crypto:cryptocurrencies(
        name,
        symbol,
        logo_url
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[useTransactionHistory] Error fetching transactions:', error);
    throw new Error(error.message);
  }

  console.log('[useTransactionHistory] Raw data fetched:', data);
  return data || [];
};

export const useTransactionHistory = () => {
  const { user } = useAuth();
  const queryKey = ['transaction-history', user?.id];

  const query = useQuery({
    queryKey: queryKey,
    queryFn: () => {
      console.log(`[useTransactionHistory] queryFn executed with key:`, queryKey);
      return fetchTransactions(user!.id)
    },
    enabled: !!user,
    staleTime: 30000, // Consider data stale after 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  return {
    transactions: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
  };
};
