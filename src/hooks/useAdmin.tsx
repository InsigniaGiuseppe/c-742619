
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const timestamp = new Date().toISOString();
      console.log(`[useAdmin] ${timestamp} EFFECT RUNNING. User object:`, user ? { id: user.id, email: user.email } : null);
      
      if (!user) {
        console.log(`[useAdmin] ${timestamp} No user, setting isAdmin to false.`);
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      
      let finalIsAdmin = false;
      
      try {
        console.log(`[useAdmin] ${timestamp} Checking admin status for user ${user.id} (${user.email})`);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin, email')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error(`[useAdmin] ${timestamp} Error fetching profile:`, error);
          // finalIsAdmin remains false
        } else if (error && error.code === 'PGRST116') {
          // Profile not found, create it.
          console.log(`[useAdmin] ${timestamp} Profile not found for ${user.email}, creating new profile.`);
          const isAdminByEmail = user.email === 'admin@prompto.trading';
          const { error: createError } = await supabase
            .from('profiles')
            .insert({ id: user.id, email: user.email, is_admin: isAdminByEmail });

          if (createError) {
            console.error(`[useAdmin] ${timestamp} Error creating profile:`, createError);
          } else {
            console.log(`[useAdmin] ${timestamp} Profile created. is_admin set to: ${isAdminByEmail}`);
            finalIsAdmin = isAdminByEmail;
          }
        } else if (profile) {
          // Profile found.
          console.log(`[useAdmin] ${timestamp} Profile found for ${user.email}. DB is_admin: ${profile.is_admin}`);
          if (user.email === 'admin@prompto.trading' && !profile.is_admin) {
            // Auto-promote.
            console.log(`[useAdmin] ${timestamp} Mismatch found. Auto-promoting ${user.email} to admin.`);
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ is_admin: true })
              .eq('id', user.id);

            if (updateError) {
              console.error(`[useAdmin] ${timestamp} Failed to auto-promote:`, updateError);
              finalIsAdmin = false;
            } else {
              console.log(`[useAdmin] ${timestamp} Auto-promotion successful.`);
              finalIsAdmin = true;
            }
          } else {
            finalIsAdmin = profile.is_admin || false;
          }
        }
      } catch (err) {
        console.error(`[useAdmin] ${timestamp} CATCH block error in checkAdminStatus:`, err);
        // finalIsAdmin remains false
      } finally {
        console.log(`[useAdmin] ${timestamp} FINAL DECISION. Setting isAdmin to: ${finalIsAdmin}`);
        setIsAdmin(finalIsAdmin);
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  console.log(`[useAdmin] HOOK RENDER. Returning: isAdmin=${isAdmin}, loading=${loading}`);
  return { isAdmin, loading };
};
