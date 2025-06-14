import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Tables } from '@/integrations/supabase/types';

export type AdminExternalWallet = Tables<'external_wallets'> & {
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
};

const fetchAllExternalWallets = async (): Promise<AdminExternalWallet[]> => {
  const { data, error } = await supabase
    .from('external_wallets')
    .select(`
      *,
      profiles(full_name, email)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all external wallets:', error);
    throw new Error(error.message);
  }

  return data as unknown as AdminExternalWallet[];
};


export const useAdminWallets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: wallets = [], isLoading, error, isError } = useQuery<AdminExternalWallet[]>({
    queryKey: ['adminExternalWallets'],
    queryFn: fetchAllExternalWallets,
    enabled: !!user,
  });

  const updateWalletStatusMutation = useMutation({
    mutationFn: async ({ walletId, newStatus, adminNotes }: { walletId: string; newStatus: 'verified' | 'rejected'; adminNotes: string }) => {
      if (!user) throw new Error("Admin not authenticated");

      const { error } = await supabase.rpc('update_wallet_status_and_log', {
        target_wallet_id_in: walletId,
        admin_id_in: user.id,
        new_status_in: newStatus,
        admin_notes_in: adminNotes
      });

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminExternalWallets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] });
    },
  });

  return {
    wallets,
    isLoading,
    isError,
    error: error?.message,
    updateWalletStatus: updateWalletStatusMutation.mutateAsync,
    isUpdating: updateWalletStatusMutation.isPending,
  };
};
