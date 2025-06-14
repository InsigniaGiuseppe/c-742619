import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const fetchUsers = async (searchTerm: string) => {
  let query = supabase.from('profiles').select(`
    id,
    full_name,
    email,
    account_status,
    account_type,
    created_at,
    kyc_status,
    last_login_date
  `);

  if (searchTerm) {
    // Search by full name, email, or even user ID (if it's a valid UUID)
    const searchFor = `%${searchTerm}%`;
    let orQuery = `full_name.ilike.${searchFor},email.ilike.${searchFor}`;
    
    // Rudimentary check if it could be a UUID to search by ID
    if (searchTerm.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      orQuery += `,id.eq.${searchTerm}`;
    }
    
    query = query.or(orQuery);
  }
  
  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching users:', error);
    throw new Error(error.message);
  }

  return data;
};

export const useAdminUsers = (searchTerm: string) => {
  return useQuery({
    queryKey: ['admin-users', searchTerm],
    queryFn: () => fetchUsers(searchTerm),
    placeholderData: keepPreviousData, // To avoid flickering when typing
  });
};
