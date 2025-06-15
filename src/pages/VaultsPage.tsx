
import React from 'react';
import AvailableVaultsList from '@/components/vaults/AvailableVaultsList';
import UserVaultsList from '@/components/vaults/UserVaultsList';

const VaultsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Crypto Vaults</h1>
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
