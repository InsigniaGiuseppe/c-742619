
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

  // Show loading while checking authentication and admin status
  if (authLoading || adminLoading) {
    logState('Loading...');
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    logState('No user, redirecting to /admin/login');
    return <Navigate to="/admin/login" replace />;
  }

  // Redirect to dashboard if user is not admin
  if (!isAdmin) {
    logState(`User ${user.email} is not admin, redirecting to /dashboard`);
    return <Navigate to="/dashboard" replace />;
  }

  logState(`Access granted for admin user ${user.email}, rendering children`);
  return <>{children}</>;
};

export default AdminRoute;
