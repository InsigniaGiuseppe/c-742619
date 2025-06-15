
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type VaultConfiguration = Database['public']['Tables']['vault_configurations']['Row'] & {
  cryptocurrencies: Pick<Database['public']['Tables']['cryptocurrencies']['Row'], 'id' | 'name' | 'symbol' | 'logo_url'>;
};

const fetchVaults = async (): Promise<VaultConfiguration[]> => {
  const { data, error } = await supabase
    .from('vault_configurations')
    .select(`
      *,
      cryptocurrencies (
        id,
        name,
        symbol,
        logo_url
      )
    `)
    .eq('is_active', true)
    .order('cryptocurrency_id')
    .order('duration_days');

  if (error) {
    console.error('Error fetching vault configurations:', error);
    throw new Error(error.message);
  }

  return data as VaultConfiguration[];
};

export const useVaults = () => {
  return useQuery({
    queryKey: ['vaults'],
    queryFn: fetchVaults,
  });
};
