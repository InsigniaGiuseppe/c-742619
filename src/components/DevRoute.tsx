
import React from 'react';
import { useAuth } from '@/hooks/useAuth';

interface DevRouteProps {
  children: React.ReactNode;
  mockUserType: 'user' | 'admin';
}

const DevRoute: React.FC<DevRouteProps> = ({ children, mockUserType }) => {
  // Mock user data for development
  const mockUser = {
    id: mockUserType === 'admin' ? 'admin-dev-id' : 'user-dev-id',
    email: mockUserType === 'admin' ? 'admin@prompto.trading' : 'test@prompto.trading',
    user_metadata: {},
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  };

  const mockSession = {
    access_token: 'dev-token',
    refresh_token: 'dev-refresh',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser,
  };

  // Override the auth context for development
  React.useEffect(() => {
    console.log(`🚧 Development Mode: Logged in as ${mockUserType}`);
    console.log('Mock user:', mockUser);
  }, [mockUserType]);

  return (
    <div className="relative">
      {/* Development Banner */}
      <div className="fixed top-0 left-0 right-0 bg-yellow-600 text-black text-center py-1 text-sm font-medium z-50">
        🚧 DEV MODE - Logged in as {mockUserType.toUpperCase()} (Remove before production)
      </div>
      <div className="pt-8">
        {children}
      </div>
    </div>
  );
};

export default DevRoute;
