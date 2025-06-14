
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type UpdateUserStatusPayload = {
  userId: string;
  status: 'active' | 'frozen' | 'blocked';
};

const updateUserStatus = async ({ userId, status }: UpdateUserStatusPayload) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ account_status: status })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
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
