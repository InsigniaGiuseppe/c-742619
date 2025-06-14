
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', !!session);
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
    
    console.log('SignUp response:', { success: !!data.user, error: error?.message });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('=== SIGNIN ATTEMPT ===');
    console.log('Email:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('=== SIGNIN ERROR ===');
        console.error('Error message:', error.message);
        console.error('Error status:', error.status);
        
        // Provide user-friendly error messages
        let userMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          userMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          userMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (error.message.includes('Too many requests')) {
          userMessage = 'Too many sign-in attempts. Please wait a moment before trying again.';
        }
        
        return { data: null, error: { ...error, message: userMessage } };
      }
      
      if (data?.user) {
        console.log('=== SIGNIN SUCCESS ===');
        console.log('User ID:', data.user.id);
        console.log('User email:', data.user.email);
      }
      
      return { data, error };
    } catch (catchError) {
      console.error('=== SIGNIN CATCH ERROR ===');
      console.error('Unexpected error:', catchError);
      
      return { 
        data: null, 
        error: { 
          message: 'An unexpected error occurred. Please try again.',
          status: 500
        } as any 
      };
    }
  };

  const signOut = async () => {
    console.log('Signing out...');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('SignOut error:', error.message);
    } else {
      console.log('SignOut successful');
    }
    
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
