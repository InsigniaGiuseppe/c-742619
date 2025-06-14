
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type UpdateUserStatusPayload = {
  userId: string;
  status: 'active' | 'frozen' | 'blocked';
};

const updateUserStatus = async ({ userId, status }: UpdateUserStatusPayload) => {
  const { data: { user: adminUser } } = await supabase.auth.getUser();

  if (!adminUser) {
    throw new Error('You must be logged in as an admin to perform this action.');
  }

  const { error } = await supabase.rpc('update_user_status_and_log', {
    target_user_id_in: userId,
    admin_id_in: adminUser.id,
    new_status: status,
  });

  if (error) {
    throw new Error(error.message);
  }

  return null; // The RPC function returns void
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateUserStatus,
    onSuccess: (data, variables) => {
      toast({
        title: 'Success!',
        description: `User status has been updated.`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-user', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error) => {
        toast({
            title: 'Error updating user status',
            description: error.message,
            variant: 'destructive',
          });
    }
  });
};
