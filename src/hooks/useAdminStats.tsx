
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalUsers: number;
  totalVolume: number;
  totalAUM: number;
  activeUsers: number;
  pendingKyc: number;
  completedTransactions: number;
  totalProfit: number;
  totalFees: number;
}

const fetchAdminStats = async (): Promise<AdminStats> => {
  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get active users (users who have logged in within the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_login_date', thirtyDaysAgo.toISOString());

    // Get pending KYC submissions
    const { count: pendingKyc } = await supabase
      .from('kyc_documents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get total trading volume from trading orders
    const { data: volumeData } = await supabase
      .from('trading_orders')
      .select('total_value')
      .eq('order_status', 'completed');

    const totalVolume = volumeData?.reduce((sum, order) => sum + Number(order.total_value || 0), 0) || 0;

    // Get completed transactions count
    const { count: completedTransactions } = await supabase
      .from('transaction_history')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    // Calculate total fees from transaction history
    const { data: feeData } = await supabase
      .from('transaction_history')
      .select('fee_amount')
      .eq('status', 'completed');

    const totalFees = feeData?.reduce((sum, transaction) => sum + Number(transaction.fee_amount || 0), 0) || 0;

    // Calculate AUM (Assets Under Management) from user portfolios
    const { data: portfolioData } = await supabase
      .from('user_portfolios')
      .select('current_value');

    const totalAUM = portfolioData?.reduce((sum, portfolio) => sum + Number(portfolio.current_value || 0), 0) || 0;

    // Calculate total profit from user portfolios
    const { data: profitData } = await supabase
      .from('user_portfolios')
      .select('profit_loss');

    const totalProfit = profitData?.reduce((sum, portfolio) => sum + Number(portfolio.profit_loss || 0), 0) || 0;

    return {
      totalUsers: totalUsers || 0,
      totalVolume,
      totalAUM,
      activeUsers: activeUsers || 0,
      pendingKyc: pendingKyc || 0,
      completedTransactions: completedTransactions || 0,
      totalProfit,
      totalFees,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchAdminStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
};
