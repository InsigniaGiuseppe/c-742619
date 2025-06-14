
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
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

  // Show access denied if user is not admin
  if (!isAdmin) {
    logState(`User ${user.email} is not admin, showing access denied`);
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-400">Access Denied</h1>
          <p className="text-muted-foreground">You don't have admin privileges.</p>
          <p className="text-sm text-gray-500">
            Current user: {user.email} | Admin status: {isAdmin ? 'Yes' : 'No'}
          </p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  logState(`Access granted for admin user ${user.email}, rendering children`);
  return <>{children}</>;
};

export default AdminRoute;
