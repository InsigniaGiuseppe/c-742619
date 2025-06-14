
import { useState, useEffect } from 'react';
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

export const useTransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        setError(error.message);
        return;
      }

      setTransactions(data || []);
    } catch (err) {
      setError('Failed to fetch transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
  };
};
