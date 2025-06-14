
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const fetchAuditLogs = async () => {
  const { data, error } = await supabase
    .from('admin_audit_log')
    .select(`
      id,
      created_at,
      action_type,
      details,
      ip_address,
      admin:profiles!admin_audit_log_admin_id_fkey(full_name, email),
      target_user:profiles!admin_audit_log_target_user_id_fkey(full_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(100); // Let's limit to the last 100 logs for now

  if (error) {
    console.error('Error fetching audit logs:', error);
    throw new Error(error.message);
  }

  return data;
};

export const useAdminAuditLogs = () => {
  return useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: fetchAuditLogs,
  });
};
