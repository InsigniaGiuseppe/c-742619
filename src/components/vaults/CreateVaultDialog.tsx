
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { VaultConfiguration } from '@/hooks/useVaults';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { add } from 'date-fns';

// Defining PortfolioEntry locally to fix build error as it's not exported from usePortfolio
type PortfolioEntry = {
    id: string;
    quantity: number;
    cryptocurrency_id: string;
    cryptocurrencies: {
        current_price: number;
    };
};

interface CreateVaultDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  vaultConfig: VaultConfiguration;
  assetInPortfolio: PortfolioEntry | undefined;
}

export const CreateVaultDialog: React.FC<CreateVaultDialogProps> = ({ isOpen, onOpenChange, vaultConfig, assetInPortfolio }) => {
  const { session } = useAuth();
  const [amount, setAmount] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (vaultAmount: number) => {
      if (!session || !assetInPortfolio) throw new Error("User not authenticated or asset not in portfolio");

      const ends_at = add(new Date(), { days: vaultConfig.duration_days }).toISOString();

      // This should ideally be a single atomic transaction in a db function.
      // Doing it client-side has risks, but it's the best we can do for now.
      
      // 1. Create the vault entry
      const { data: vaultData, error: vaultError } = await supabase.from('user_vaults').insert({
        user_id: session.user.id,
        vault_config_id: vaultConfig.id,
        amount_vaulted: vaultAmount,
        ends_at: ends_at,
      }).select().single();
      
      if (vaultError) throw vaultError;

      // 2. Update the portfolio
      try {
        const newQuantity = assetInPortfolio.quantity - vaultAmount;
        const { error: portfolioError } = await supabase
            .from('user_portfolios')
            .update({ quantity: newQuantity })
            .eq('id', assetInPortfolio.id);

        if (portfolioError) throw portfolioError;
      } catch (error) {
          // Attempt to roll back vault creation
          await supabase.from('user_vaults').delete().eq('id', vaultData.id);
          throw error;
      }
      
      // 3. Add to transaction history (non-critical)
      await supabase.from('transaction_history').insert({
          user_id: session.user.id,
          cryptocurrency_id: vaultConfig.cryptocurrencies.id,
          transaction_type: 'vault_deposit',
          amount: vaultAmount,
          usd_value: vaultAmount * assetInPortfolio.cryptocurrencies.current_price,
          description: `Vaulted ${vaultAmount} ${vaultConfig.cryptocurrencies.symbol} for ${vaultConfig.duration_days} days.`
      });

      return vaultData;
    },
    onSuccess: () => {
      toast.success('Successfully created vault!');
      queryClient.invalidateQueries({ queryKey: ['user_vaults', session?.user.id] });
      queryClient.invalidateQueries({ queryKey: ['portfolio', session?.user.id] });
      queryClient.invalidateQueries({ queryKey: ['transaction_history', session?.user.id] });
      onOpenChange(false);
      setAmount('');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create vault: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vaultAmount = parseFloat(amount);
    if (isNaN(vaultAmount) || vaultAmount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    if (!assetInPortfolio || vaultAmount > assetInPortfolio.quantity) {
      toast.error("Insufficient balance.");
      return;
    }
    mutation.mutate(vaultAmount);
  };

  const handleMax = () => {
    if (assetInPortfolio) {
      setAmount(assetInPortfolio.quantity.toString());
    }
  };
  
  const estimatedYield = useMemo(() => {
    const numAmount = parseFloat(amount);
    if(isNaN(numAmount) || numAmount <= 0) return 0;
    const dailyRate = vaultConfig.apy / 365;
    return numAmount * dailyRate * vaultConfig.duration_days;
  }, [amount, vaultConfig.apy, vaultConfig.duration_days]);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create {vaultConfig.cryptocurrencies.name} Vault</DialogTitle>
          <DialogDescription>
            Lock {vaultConfig.cryptocurrencies.symbol} for {vaultConfig.duration_days} days to earn {(vaultConfig.apy * 100).toFixed(2)}% APY.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Vault</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="any"
                  min="0"
                />
                <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-7" onClick={handleMax}>
                  Max
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Balance: {assetInPortfolio?.quantity.toFixed(6) ?? '0.00'} {vaultConfig.cryptocurrencies.symbol}
              </p>
            </div>
             <div className="text-sm text-muted-foreground">
              <p>Estimated Yield: {estimatedYield.toFixed(8)} {vaultConfig.cryptocurrencies.symbol}</p>
            </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Vaulting...' : 'Confirm Vault'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
