
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Database } from '@/integrations/supabase/types';

export type UserVault = Database['public']['Tables']['user_vaults']['Row'] & {
  vault_configurations: {
    duration_days: number;
    apy: number;
    cryptocurrencies: {
      name: string;
      symbol: string;
      logo_url: string;
    }
  }
};

const fetchUserVaults = async (userId: string | undefined): Promise<UserVault[]> => {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('user_vaults')
    .select(`
      *,
      vault_configurations (
        duration_days,
        apy,
        cryptocurrencies (
          name,
          symbol,
          logo_url
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user vaults:', error);
    throw new Error(error.message);
  }

  return data as UserVault[];
};

export const useUserVaults = () => {
  const { session } = useAuth();
  return useQuery({
    queryKey: ['user_vaults', session?.user.id],
    queryFn: () => fetchUserVaults(session?.user.id),
    enabled: !!session?.user.id,
  });
};
