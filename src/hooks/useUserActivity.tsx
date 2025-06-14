
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserActivityEntry {
  id: string;
  created_at: string;
  action_type: string;
  details: any;
  ip_address?: string;
  table_name: string;
  description: string;
}

const fetchUserActivity = async (userId: string): Promise<UserActivityEntry[]> => {
  if (!userId) return [];

  // Fetch from multiple sources to create comprehensive activity log
  const activities: UserActivityEntry[] = [];

  // 1. Admin audit logs where user is target
  const { data: auditLogs } = await supabase
    .from('admin_audit_log')
    .select('*')
    .eq('target_user_id', userId)
    .order('created_at', { ascending: false });

  if (auditLogs) {
    activities.push(...auditLogs.map(log => ({
      id: log.id,
      created_at: log.created_at,
      action_type: log.action_type,
      details: log.details,
      ip_address: log.ip_address?.toString(),
      table_name: 'admin_audit_log',
      description: `Admin action: ${log.action_type}`
    })));
  }

  // 2. Trading orders
  const { data: trades } = await supabase
    .from('trading_orders')
    .select(`
      *,
      cryptocurrencies(symbol, name)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (trades) {
    activities.push(...trades.map(trade => ({
      id: trade.id,
      created_at: trade.created_at!,
      action_type: 'trade_execution',
      details: {
        order_type: trade.order_type,
        amount: trade.amount,
        crypto: trade.cryptocurrencies,
        total_value: trade.total_value,
        status: trade.order_status
      },
      table_name: 'trading_orders',
      description: `${trade.order_type.toUpperCase()} ${trade.amount} ${trade.cryptocurrencies?.symbol}`
    })));
  }

  // 3. Transaction history
  const { data: transactions } = await supabase
    .from('transaction_history')
    .select(`
      *,
      cryptocurrencies(symbol, name)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (transactions) {
    activities.push(...transactions.map(tx => ({
      id: tx.id,
      created_at: tx.created_at!,
      action_type: tx.transaction_type,
      details: {
        amount: tx.amount,
        usd_value: tx.usd_value,
        crypto: tx.cryptocurrencies,
        status: tx.status
      },
      table_name: 'transaction_history',
      description: tx.description || `${tx.transaction_type} transaction`
    })));
  }

  // 4. KYC document submissions
  const { data: kycDocs } = await supabase
    .from('kyc_documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (kycDocs) {
    activities.push(...kycDocs.map(doc => ({
      id: doc.id,
      created_at: doc.created_at,
      action_type: 'kyc_document_submission',
      details: {
        document_type: doc.document_type,
        status: doc.status,
        admin_notes: doc.admin_notes
      },
      table_name: 'kyc_documents',
      description: `KYC ${doc.document_type} submission - ${doc.status}`
    })));
  }

  // 5. External wallet submissions
  const { data: wallets } = await supabase
    .from('external_wallets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (wallets) {
    activities.push(...wallets.map(wallet => ({
      id: wallet.id,
      created_at: wallet.created_at,
      action_type: 'wallet_submission',
      details: {
        coin_symbol: wallet.coin_symbol,
        network: wallet.network,
        status: wallet.status,
        wallet_label: wallet.wallet_label
      },
      table_name: 'external_wallets',
      description: `Wallet submission: ${wallet.coin_symbol} on ${wallet.network} - ${wallet.status}`
    })));
  }

  // 6. User sessions (login/logout tracking)
  const { data: sessions } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (sessions) {
    activities.push(...sessions.map(session => ({
      id: session.id,
      created_at: session.created_at,
      action_type: session.is_active ? 'login' : 'logout',
      details: {
        ip_address: session.ip_address?.toString(),
        device_name: session.device_name,
        os_browser: session.os_browser,
        last_login: session.last_login
      },
      ip_address: session.ip_address?.toString(),
      table_name: 'user_sessions',
      description: `User ${session.is_active ? 'logged in' : 'logged out'}`
    })));
  }

  // Sort all activities by date
  return activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const useUserActivity = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user-activity', userId],
    queryFn: () => fetchUserActivity(userId!),
    enabled: !!userId,
  });
};
