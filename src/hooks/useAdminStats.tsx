
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminStats {
  totalUsers: number;
  totalBalances: number;
  pendingKycs: number;
  pendingTransactions: number;
  totalTradingProfit: number;
  totalTrades: number;
}

const fetchAdminStats = async (): Promise<AdminStats> => {
  // Get total users count
  const { count: totalUsers, error: usersError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (usersError) {
    console.error('Error fetching users count:', usersError);
    throw new Error(usersError.message);
  }

  // Get total balances
  const { data: balancesData, error: balancesError } = await supabase
    .from('profiles')
    .select('demo_balance_usd');

  if (balancesError) {
    console.error('Error fetching balances:', balancesError);
    throw new Error(balancesError.message);
  }

  const totalBalances = balancesData?.reduce((sum, profile) => sum + (profile.demo_balance_usd || 0), 0) || 0;

  // Get pending KYCs count
  const { count: pendingKycs, error: kycsError } = await supabase
    .from('kyc_documents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (kycsError) {
    console.error('Error fetching pending KYCs:', kycsError);
    throw new Error(kycsError.message);
  }

  // Get pending transactions count
  const { count: pendingTransactions, error: transactionsError } = await supabase
    .from('trading_orders')
    .select('*', { count: 'exact', head: true })
    .eq('order_status', 'pending');

  if (transactionsError) {
    console.error('Error fetching pending transactions:', transactionsError);
    throw new Error(transactionsError.message);
  }

  // Get total trading profit (sum of all fees from completed orders)
  const { data: feesData, error: feesError } = await supabase
    .from('trading_orders')
    .select('fees')
    .eq('order_status', 'completed');

  if (feesError) {
    console.error('Error fetching trading fees:', feesError);
    throw new Error(feesError.message);
  }

  const totalTradingProfit = feesData?.reduce((sum, order) => sum + (order.fees || 0), 0) || 0;

  // Get total completed trades count
  const { count: totalTrades, error: tradesError } = await supabase
    .from('trading_orders')
    .select('*', { count: 'exact', head: true })
    .eq('order_status', 'completed');

  if (tradesError) {
    console.error('Error fetching total trades:', tradesError);
    throw new Error(tradesError.message);
  }

  return {
    totalUsers: totalUsers || 0,
    totalBalances,
    pendingKycs: pendingKycs || 0,
    pendingTransactions: pendingTransactions || 0,
    totalTradingProfit,
    totalTrades: totalTrades || 0,
  };
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchAdminStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
