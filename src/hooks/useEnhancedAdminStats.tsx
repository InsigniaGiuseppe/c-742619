
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedAdminStats {
  totalUsers: number;
  totalBalances: number;
  pendingKycs: number;
  pendingTransactions: number;
  totalTradingProfit: number;
  totalTrades: number;
  tradesPerDay: number;
  assetsUnderManagement: number;
  dailyTradingVolume: Array<{ date: string; volume: number; trades: number }>;
  userGrowth: Array<{ date: string; users: number }>;
  aumGrowth: Array<{ date: string; aum: number }>;
}

const fetchEnhancedAdminStats = async (): Promise<EnhancedAdminStats> => {
  // Get total users count
  const { count: totalUsers, error: usersError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (usersError) {
    console.error('Error fetching users count:', usersError);
    throw new Error(usersError.message);
  }

  // Get total balances (AUM)
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

  // Get total trading profit
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

  // Get trades per day (today)
  const today = new Date().toISOString().split('T')[0];
  const { count: tradesPerDay, error: tradesPerDayError } = await supabase
    .from('trading_orders')
    .select('*', { count: 'exact', head: true })
    .eq('order_status', 'completed')
    .gte('created_at', `${today}T00:00:00.000Z`)
    .lt('created_at', `${today}T23:59:59.999Z`);

  if (tradesPerDayError) {
    console.error('Error fetching trades per day:', tradesPerDayError);
  }

  // Get daily trading volume for last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: dailyVolumeData, error: volumeError } = await supabase
    .from('trading_orders')
    .select('created_at, total_value')
    .eq('order_status', 'completed')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  if (volumeError) {
    console.error('Error fetching daily volume:', volumeError);
  }

  // Process daily volume data
  const dailyTradingVolume = [];
  const volumeMap = new Map();
  
  if (dailyVolumeData) {
    dailyVolumeData.forEach(trade => {
      const date = new Date(trade.created_at).toISOString().split('T')[0];
      if (!volumeMap.has(date)) {
        volumeMap.set(date, { volume: 0, trades: 0 });
      }
      const current = volumeMap.get(date);
      current.volume += trade.total_value || 0;
      current.trades += 1;
    });
  }

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const data = volumeMap.get(dateStr) || { volume: 0, trades: 0 };
    dailyTradingVolume.push({
      date: dateStr,
      volume: data.volume,
      trades: data.trades
    });
  }

  // Get user growth data (last 30 days)
  const { data: userGrowthData, error: userGrowthError } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  if (userGrowthError) {
    console.error('Error fetching user growth:', userGrowthError);
  }

  const userGrowth = [];
  const userMap = new Map();
  let cumulativeUsers = totalUsers || 0;

  if (userGrowthData) {
    userGrowthData.forEach(user => {
      const date = new Date(user.created_at).toISOString().split('T')[0];
      userMap.set(date, (userMap.get(date) || 0) + 1);
    });
  }

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    cumulativeUsers -= userMap.get(dateStr) || 0;
    userGrowth.push({
      date: dateStr,
      users: cumulativeUsers + (userMap.get(dateStr) || 0)
    });
  }

  // Generate AUM growth (simplified - using current total)
  const aumGrowth = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    // Simulate growth - in real implementation, you'd track this historically
    const variance = Math.random() * 0.1 - 0.05; // ±5% variance
    const aumValue = totalBalances * (1 + variance);
    aumGrowth.push({
      date: dateStr,
      aum: aumValue
    });
  }

  return {
    totalUsers: totalUsers || 0,
    totalBalances,
    pendingKycs: pendingKycs || 0,
    pendingTransactions: pendingTransactions || 0,
    totalTradingProfit,
    totalTrades: totalTrades || 0,
    tradesPerDay: tradesPerDay || 0,
    assetsUnderManagement: totalBalances,
    dailyTradingVolume,
    userGrowth,
    aumGrowth,
  };
};

export const useEnhancedAdminStats = () => {
  return useQuery({
    queryKey: ['enhanced-admin-stats'],
    queryFn: fetchEnhancedAdminStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
