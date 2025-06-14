
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, Enums } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from "sonner";

export type TransactionWithDetails = Tables<'trading_orders'> & {
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
  cryptocurrencies: {
    symbol: string;
    name: string;
  } | null;
};

const fetchTransactions = async (): Promise<TransactionWithDetails[]> => {
  const { data, error } = await supabase
    .from('trading_orders')
    .select(`
      *,
      profiles (
        full_name,
        email
      ),
      cryptocurrencies (
        symbol,
        name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data as TransactionWithDetails[];
};

export const useAdminTransactions = () => {
  return useQuery({
    queryKey: ['admin-transactions'],
    queryFn: fetchTransactions,
  });
};

interface UpdateStatusParams {
  orderId: string;
  status: 'pending' | 'completed' | 'rejected' | 'failed';
  adminNotes: string;
}

export const useUpdateTransactionStatus = () => {
  const queryClient = useQueryClient();
  const { user: adminUser } = useAuth();

  const updateStatus = async ({ orderId, status, adminNotes }: UpdateStatusParams) => {
    if (!adminUser) throw new Error("Admin user not found");

    const { error } = await supabase.rpc('update_transaction_status_and_log', {
      target_order_id_in: orderId,
      admin_id_in: adminUser.id,
      new_status_in: status,
      admin_notes_in: adminNotes,
    });

    if (error) {
      throw new Error(`Database error: ${error.message}. There might be a mismatch between user IDs in 'trading_orders' and 'profiles' tables.`);
    }
  };

  return useMutation({
    mutationFn: updateStatus,
    onSuccess: () => {
      toast.success("Transaction status updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-audit-log'] });
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
};
