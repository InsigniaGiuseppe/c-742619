
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      console.log('[useAdmin] useEffect triggered. User:', user?.id);
      if (!user) {
        console.log('[useAdmin] No user, setting isAdmin to false.');
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      
      console.log(`[useAdmin] Checking admin status for user ${user.id}`);
      setLoading(true); // Set loading to true when check starts

      try {
        // Check admin status from profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('[useAdmin] Error checking admin status:', error.message);
          setIsAdmin(false);
        } else {
          console.log('[useAdmin] Profile fetched. is_admin:', profile?.is_admin);
          setIsAdmin(profile?.is_admin || false);
        }
      } catch (error) {
        console.error('[useAdmin] CATCH block error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        console.log('[useAdmin] Finished check. Loading set to false.');
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, loading };
};
