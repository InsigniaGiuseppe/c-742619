
import React from 'react';
import { useVaults } from '@/hooks/useVaults';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { VaultCard } from './VaultCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

const AvailableVaultsList: React.FC = () => {
  const { data: vaults, isLoading, error } = useVaults();

  return (
    <Card className="glass glass-hover">
      <CardHeader>
        <CardTitle>Available Vaults</CardTitle>
        <CardDescription>Lock your assets for a fixed term to earn yield.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-lg" />)}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load available vaults. Please try again later.</AlertDescription>
          </Alert>
        ) : vaults && vaults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaults.map((vault) => (
              <VaultCard key={vault.id} vault={vault} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Lock className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg mb-2">No Vaults Available</p>
            <p className="text-sm">Administrators need to configure vaults in the database.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailableVaultsList;
