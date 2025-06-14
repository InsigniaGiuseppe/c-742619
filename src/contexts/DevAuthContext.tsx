
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';

interface DevAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  isDevMode: boolean;
  mockUserType: 'user' | 'admin' | null;
  setMockUserType: (type: 'user' | 'admin' | null) => void;
}

const DevAuthContext = createContext<DevAuthContextType | undefined>(undefined);

export const useDevAuth = () => {
  const context = useContext(DevAuthContext);
  if (context === undefined) {
    throw new Error('useDevAuth must be used within a DevAuthProvider');
  }
  return context;
};

interface DevAuthProviderProps {
  children: React.ReactNode;
}

export const DevAuthProvider: React.FC<DevAuthProviderProps> = ({ children }) => {
  const [mockUserType, setMockUserType] = useState<'user' | 'admin' | null>(null);
  const [loading, setLoading] = useState(false);

  // Create mock user based on type
  const createMockUser = (type: 'user' | 'admin'): User => ({
    id: type === 'admin' ? 'admin-dev-id' : 'user-dev-id',
    email: type === 'admin' ? 'admin@prompto.trading' : 'test@prompto.trading',
    user_metadata: {},
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    email_confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    role: 'authenticated',
    confirmed_at: new Date().toISOString(),
  } as User);

  const createMockSession = (user: User): Session => ({
    access_token: 'dev-token',
    refresh_token: 'dev-refresh',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user,
  });

  const user = mockUserType ? createMockUser(mockUserType) : null;
  const session = user ? createMockSession(user) : null;

  const signUp = async (email: string, password: string, userData?: any) => {
    return { data: { user: null, session: null }, error: null };
  };

  const signIn = async (email: string, password: string) => {
    return { data: { user: null, session: null }, error: null };
  };

  const signOut = async () => {
    setMockUserType(null);
    return { error: null };
  };

  const value: DevAuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isDevMode: true,
    mockUserType,
    setMockUserType,
  };

  return (
    <DevAuthContext.Provider value={value}>
      {children}
    </DevAuthContext.Provider>
  );
};
