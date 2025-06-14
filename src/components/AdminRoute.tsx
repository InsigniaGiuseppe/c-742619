
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();

  const logState = (decision: string) => {
    const timestamp = new Date().toISOString();
    console.log(`[AdminRoute] ${timestamp} Decision: ${decision}`, {
      authLoading,
      adminLoading,
      userExists: !!user,
      userEmail: user?.email,
      isAdmin,
    });
  };

  if (authLoading || adminLoading) {
    logState('Loading...');
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
    logState('No user, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    logState(`User ${user.email} is not admin, redirecting to /dashboard`);
    return <Navigate to="/dashboard" replace />;
  }

  logState(`Access granted for admin user ${user.email}, rendering children`);
  return <>{children}</>;
};

export default AdminRoute;
