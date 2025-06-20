
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayoutManager from '@/components/dashboard/DashboardLayoutManager';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <img 
          src="/lovable-uploads/3765d287-ffd3-40d5-8628-4f8191064138.png" 
          alt="PROMPTO TRADING Logo" 
          className="w-8 h-8 md:w-10 md:h-10 object-contain"
        />
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">TRADING DASHBOARD</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Welcome back, {user?.email}
          </p>
        </div>
      </div>

      <DashboardLayoutManager />
    </div>
  );
};

export default DashboardPage;
