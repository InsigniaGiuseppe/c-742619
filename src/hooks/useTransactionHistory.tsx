
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { convertUsdToEur } from '@/lib/currencyConverter';

export interface Transaction {
  id: string;
  cryptocurrency_id?: string;
  transaction_type: string;
  amount?: number;
  usd_value?: number;
  eur_value?: number; // Add EUR converted value
  fee_amount?: number;
  eur_fee_amount?: number; // Add EUR converted fee
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
  const { exchangeRate } = useExchangeRate();
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

  // Convert USD values to EUR for display
  const transactionsEur = query.data?.map(transaction => ({
    ...transaction,
    eur_value: transaction.usd_value ? convertUsdToEur(transaction.usd_value, exchangeRate) : undefined,
    eur_fee_amount: transaction.fee_amount ? convertUsdToEur(transaction.fee_amount, exchangeRate) : undefined,
  })) || [];

  return {
    transactions: transactionsEur,
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
  };
};
