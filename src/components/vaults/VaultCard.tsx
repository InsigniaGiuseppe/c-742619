
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CryptoLogo from '@/components/CryptoLogo';
import { VaultConfiguration } from '@/hooks/useVaults';
import { CreateVaultDialog } from './CreateVaultDialog';
import { useAuth } from '@/hooks/useAuth';
import { usePortfolio } from '@/hooks/usePortfolio';

interface VaultCardProps {
  vault: VaultConfiguration;
}

export const VaultCard: React.FC<VaultCardProps> = ({ vault }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { session } = useAuth();
  const { data: portfolio } = usePortfolio(session?.user.id);

  const assetInPortfolio = portfolio?.find(p => p.cryptocurrency_id === vault.cryptocurrencies.id);

  return (
    <>
      <Card className="bg-background/50 flex flex-col">
        <CardHeader className="flex-row items-center gap-4">
          <CryptoLogo
            src={vault.cryptocurrencies.logo_url}
            alt={vault.cryptocurrencies.name}
            className="w-10 h-10"
          />
          <div>
            <CardTitle>{vault.cryptocurrencies.name} Vault</CardTitle>
            <CardDescription>{vault.cryptocurrencies.symbol}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-semibold">{vault.duration_days} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">APY</span>
              <span className="font-semibold text-green-500">{(vault.apy * 100).toFixed(2)}%</span>
            </div>
          </div>
          <Button className="w-full" onClick={() => setIsDialogOpen(true)} disabled={!assetInPortfolio || assetInPortfolio.quantity <= 0}>
            Vault Now
          </Button>
        </CardContent>
      </Card>
      <CreateVaultDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        vaultConfig={vault}
        assetInPortfolio={assetInPortfolio}
      />
    </>
  );
};
