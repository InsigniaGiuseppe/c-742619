
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Tables } from '@/integrations/supabase/types';

export type AdminKycSubmission = Tables<'kyc_documents'> & {
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
};

const fetchAllKycSubmissions = async (): Promise<AdminKycSubmission[]> => {
  const { data, error } = await supabase
    .from('kyc_documents')
    .select(`
      *,
      profiles(full_name, email)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all KYC submissions:', error);
    throw new Error(error.message);
  }

  return data as unknown as AdminKycSubmission[];
};

export const useAdminKycSubmissions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: submissions = [], isLoading, isError, error } = useQuery<AdminKycSubmission[]>({
    queryKey: ['adminKycSubmissions'],
    queryFn: fetchAllKycSubmissions,
    enabled: !!user,
  });

  const updateKycStatusMutation = useMutation({
    mutationFn: async ({ kycId, newStatus, adminNotes }: { kycId: string; newStatus: 'verified' | 'rejected'; adminNotes: string }) => {
      if (!user) throw new Error("Admin not authenticated");

      const { error } = await supabase.rpc('update_kyc_status_and_log', {
        target_kyc_id_in: kycId,
        admin_id_in: user.id,
        new_status_in: newStatus,
        admin_notes_in: adminNotes
      });

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminKycSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  return {
    submissions,
    isLoading,
    isError,
    error: error?.message,
    updateKycStatus: updateKycStatusMutation.mutateAsync,
    isUpdating: updateKycStatusMutation.isPending,
  };
};
