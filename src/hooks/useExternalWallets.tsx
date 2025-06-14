import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Tables } from '@/integrations/supabase/types';

export type ExternalWallet = Tables<'external_wallets'>;

// Define a type for the wallet submission payload.
// This separates required fields from optional ones and resolves TSX parsing issues.
export type NewWalletPayload =
  Pick<Tables<'external_wallets'>, 'coin_symbol' | 'network' | 'wallet_address'>
  & Partial<Pick<Tables<'external_wallets'>, 'wallet_label' | 'screenshot_url'>>;

export const useExternalWallets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchExternalWallets = async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('external_wallets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }
    return data;
  };

  const { data: wallets = [], isLoading, error } = useQuery<ExternalWallet[]>({
    queryKey: ['externalWallets', user?.id],
    queryFn: fetchExternalWallets,
    enabled: !!user,
  });

  const addWalletMutation = useMutation({
    mutationFn: async (newWallet: NewWalletPayload) => {
        if (!user) throw new Error("User not authenticated");
        const { data, error: insertError } = await supabase
            .from('external_wallets')
            .insert([{ ...newWallet, user_id: user.id }])
            .select();

        if (insertError) {
            throw new Error(insertError.message);
        }
        return data;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['externalWallets', user?.id] });
    },
  });

  const deleteWalletMutation = useMutation({
    mutationFn: async (walletId: string) => {
        if (!user) throw new Error("User not authenticated");
        const { error } = await supabase
            .from('external_wallets')
            .delete()
            .eq('id', walletId)
            .eq('user_id', user.id);

        if (error) {
            throw new Error(error.message);
        }
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['externalWallets', user?.id] });
    },
  });

  return {
    wallets,
    isLoading,
    error: error?.message,
    addWallet: addWalletMutation.mutateAsync,
    deleteWallet: deleteWalletMutation.mutateAsync,
  };
};
