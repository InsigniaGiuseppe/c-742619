
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const fetchUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*') // Select all columns for the detail view
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    throw new Error(error.message);
  }

  return data;
};

export const useAdminUser = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['admin-user', userId],
    queryFn: () => fetchUser(userId!),
    enabled: !!userId, // Only run the query if userId is defined
  });
};
