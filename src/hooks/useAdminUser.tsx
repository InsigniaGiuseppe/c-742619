
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const fetchUser = async (userId: string) => {
  console.log('[useAdminUser] Fetching user with ID:', userId);
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle(); // Use maybeSingle instead of single to handle not found cases

  console.log('[useAdminUser] Query result:', { data, error });

  if (error) {
    console.error('[useAdminUser] Error fetching user:', error);
    throw new Error(error.message);
  }

  if (!data) {
    console.warn('[useAdminUser] User not found with ID:', userId);
    throw new Error('User not found');
  }

  return data;
};

export const useAdminUser = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['admin-user', userId],
    queryFn: () => fetchUser(userId!),
    enabled: !!userId,
    retry: 1, // Only retry once for admin queries
  });
};
