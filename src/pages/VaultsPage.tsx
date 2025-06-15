
import React from 'react';
import AvailableVaultsList from '@/components/vaults/AvailableVaultsList';
import UserVaultsList from '@/components/vaults/UserVaultsList';

const VaultsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="text-center">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-3 mb-4">
            <img 
              src="/lovable-uploads/3765d287-ffd3-40d5-8628-4f8191064138.png" 
              alt="PROMPTO TRADING Logo" 
              className="w-8 h-8 md:w-10 md:h-10 object-contain mx-auto sm:mx-0"
            />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">Crypto Vaults</h1>
          </div>
          <p className="mt-4 text-lg text-muted-foreground">
            Lock your crypto and earn passive income. Daily payouts, withdraw at the end of the term.
          </p>
        </div>

        <AvailableVaultsList />

        <UserVaultsList />
      </div>
    </div>
  );
};

export default VaultsPage;
