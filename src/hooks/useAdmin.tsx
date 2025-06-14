
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
      
      console.log(`[useAdmin] ${timestamp} Checking admin status for user ${user.id} (${user.email})`);

      try {
        // Check admin status from profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin, email')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error(`[useAdmin] ${timestamp} Error checking admin status:`, error);
          
          // If profile doesn't exist, create it
          if (error.code === 'PGRST116') {
            console.log(`[useAdmin] ${timestamp} Profile not found, creating profile for user`);
            const { error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                is_admin: user.email === 'admin@prompto.trading'
              });
            
            if (createError) {
              console.error(`[useAdmin] ${timestamp} Error creating profile:`, createError);
              setIsAdmin(false);
            } else {
              const newIsAdmin = user.email === 'admin@prompto.trading';
              console.log(`[useAdmin] ${timestamp} Profile created. is_admin:`, newIsAdmin);
              setIsAdmin(newIsAdmin);
            }
          } else {
            setIsAdmin(false);
          }
        } else {
          console.log(`[useAdmin] ${timestamp} Profile fetched. is_admin:`, profile?.is_admin, 'email:', profile?.email);
          
          // Auto-promote admin@prompto.trading if needed
          if (user.email === 'admin@prompto.trading' && !profile?.is_admin) {
            console.log(`[useAdmin] ${timestamp} Auto-promoting admin@prompto.trading to admin`);
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ is_admin: true })
              .eq('id', user.id);
            
            if (updateError) {
              console.error(`[useAdmin] ${timestamp} Error promoting to admin:`, updateError);
            } else {
              console.log(`[useAdmin] ${timestamp} Successfully promoted to admin`);
              setIsAdmin(true);
            }
          } else {
            setIsAdmin(profile?.is_admin || false);
          }
        }
      } catch (error) {
        console.error(`[useAdmin] ${timestamp} CATCH block error checking admin status:`, error);
        setIsAdmin(false);
      } finally {
        console.log(`[useAdmin] ${timestamp} Finished check. Loading set to false. Final isAdmin:`, isAdmin);
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  console.log(`[useAdmin] Hook returning: isAdmin=${isAdmin}, loading=${loading}`);
  return { isAdmin, loading };
};
