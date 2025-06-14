
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData?: any) => {
    const redirectUrl = `${window.location.origin}/`;
    
    console.log('SignUp attempt with redirectUrl:', redirectUrl);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData
      }
    });
    
    console.log('SignUp response:', { data, error });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('=== SIGNIN ATTEMPT START ===');
    console.log('Email:', email);
    console.log('Current origin:', window.location.origin);
    console.log('Supabase client status:', !!supabase);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('=== SIGNIN RESPONSE ===');
      console.log('Data:', data);
      console.log('Error:', error);
      
      if (error) {
        console.error('=== SIGNIN ERROR DETAILS ===');
        console.error('Error message:', error.message);
        console.error('Error status:', error.status);
        console.error('Error name:', error.name);
        console.error('Full error object:', JSON.stringify(error, null, 2));
      }
      
      if (data?.user) {
        console.log('=== SIGNIN SUCCESS ===');
        console.log('User ID:', data.user.id);
        console.log('User email:', data.user.email);
        console.log('User metadata:', data.user.user_metadata);
        console.log('Session:', data.session);
      }
      
      return { data, error };
    } catch (catchError) {
      console.error('=== SIGNIN CATCH ERROR ===');
      console.error('Catch error:', catchError);
      console.error('Catch error type:', typeof catchError);
      console.error('Catch error stringified:', JSON.stringify(catchError, null, 2));
      
      return { data: null, error: catchError as any };
    }
  };

  const signOut = async () => {
    console.log('Signing out...');
    const { error } = await supabase.auth.signOut();
    console.log('SignOut response:', { error });
    return { error };
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };
};
