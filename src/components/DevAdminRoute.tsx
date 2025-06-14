
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useDevAdmin } from '@/hooks/useDevAdmin';
import { useDevAuth } from '@/contexts/DevAuthContext';

interface DevAdminRouteProps {
  children: React.ReactNode;
}

const DevAdminRoute: React.FC<DevAdminRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useDevAuth();
  const { isAdmin, loading: adminLoading } = useDevAdmin();

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/dev-admin" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dev-dashboard" replace />;
  }

  return <>{children}</>;
};

export default DevAdminRoute;
