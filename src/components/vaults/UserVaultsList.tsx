
import React from 'react';
import { useUserVaults } from '@/hooks/useUserVaults';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import CryptoLogo from '@/components/CryptoLogo';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const UserVaultsList: React.FC = () => {
  const { data: userVaults, isLoading, error } = useUserVaults();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'withdrawn':
        return <Badge variant="outline">Withdrawn</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card className="glass glass-hover">
      <CardHeader>
        <CardTitle>My Vaults</CardTitle>
        <CardDescription>Your active and past vault positions.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load your vaults. Please try again later.</AlertDescription>
          </Alert>
        ) : userVaults && userVaults.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Yield Earned</TableHead>
                <TableHead>Unlocks</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userVaults.map((vault) => (
                <TableRow key={vault.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      <CryptoLogo 
                        src={vault.vault_configurations.cryptocurrencies.logo_url} 
                        alt={vault.vault_configurations.cryptocurrencies.name}
                        className="w-6 h-6"
                      />
                      <span>{vault.vault_configurations.cryptocurrencies.symbol}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{vault.amount_vaulted.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-green-500">{vault.accrued_yield.toFixed(8)}</TableCell>
                  <TableCell>{format(new Date(vault.ends_at), 'MMM dd, yyyy')} ({formatDistanceToNow(new Date(vault.ends_at), { addSuffix: true })})</TableCell>
                  <TableCell>{getStatusBadge(vault.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">You have no active vaults.</p>
            <p className="text-sm">Explore available vaults above and start earning yield.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserVaultsList;
