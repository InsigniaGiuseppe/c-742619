
import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Helper hook for the VaultsPage vault function logic
export const useVaultCreation = (
  portfolio: any[],
  user: any,
) => {
  const [isVaulting, setIsVaulting] = useState(false);

  // Main handler for vault
  const handleVault = useCallback(
    async (cryptoId: string, amount: number, durationDays: number): Promise<boolean> => {
      if (!user) {
        toast.error('Please log in to vault crypto');
        return false;
      }
      try {
        // Find the crypto info
        const cryptoInfo = portfolio?.find(item => item.crypto.id === cryptoId);
        if (!cryptoInfo) {
          toast.error('Crypto not found');
          return false;
        }

        // Check if user has sufficient balance
        if (amount > cryptoInfo.quantity) {
          toast.error('Insufficient balance');
          return false;
        }

        // Find corresponding vault config by cryptoId and duration
        const { data: vaultConfigRows, error: vaultConfigError } = await supabase
          .from('vault_configurations')
          .select('*')
          .eq('cryptocurrency_id', cryptoId)
          .eq('duration_days', durationDays)
          .limit(1);

        if (vaultConfigError || !vaultConfigRows || vaultConfigRows.length === 0) {
          toast.error('Vault configuration not found.');
          return false;
        }
        const vaultConfig = vaultConfigRows[0];

        // Calculate end date
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + durationDays);

        // Insert user_vaults entry
        const { data: vaultData, error: vaultError } = await supabase
          .from('user_vaults')
          .insert({
            user_id: user.id,
            vault_config_id: vaultConfig.id,
            amount_vaulted: amount,
            ends_at: endDate.toISOString(),
            status: 'active'
          })
          .select()
          .single();

        if (vaultError || !vaultData) {
          toast.error('Failed to create vault.');
          console.error('[Vaults] Error vaulting:', vaultError);
          return false;
        }

        // Update portfolio (subtract amount)
        const { error: portfolioError } = await supabase
          .from('user_portfolios')
          .update({ quantity: cryptoInfo.quantity - amount })
          .eq('user_id', user.id)
          .eq('cryptocurrency_id', cryptoId);

        if (portfolioError) {
          toast.error('Failed to update portfolio.');
          console.error('[Vaults] Portfolio update error:', portfolioError);
          // Optionally, rollback the created vault
          await supabase.from('user_vaults').delete().eq('id', vaultData.id);
          return false;
        }

        // Add transaction record
        const { error: transactionError } = await supabase.from('transaction_history').insert({
          user_id: user.id,
          cryptocurrency_id: cryptoId,
          amount: amount,
          usd_value: amount * cryptoInfo.crypto.current_price,
          transaction_type: 'vault_deposit',
          description: `Vaulted ${amount} ${cryptoInfo.crypto.symbol} for ${durationDays} days.`,
          status: 'completed'
        });

        if (transactionError) {
          // Do not block core operation, just log.
          console.warn('Transaction log failed.', transactionError);
        }

        toast.success(`Successfully vaulted ${amount} ${cryptoInfo.crypto.symbol} for ${durationDays} days`);
        return true;
      } catch (error: any) {
        console.error('[VaultCreation] Vault error:', error);
        toast.error(`Failed to vault crypto: ${error.message}`);
        return false;
      } finally {
        setIsVaulting(false);
      }
    },
    [portfolio, user]
  );

  return {
    handleVault,
    isVaulting,
  };
};
