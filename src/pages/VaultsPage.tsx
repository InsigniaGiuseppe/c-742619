import React from 'react';
import { useRealtimePortfolio } from '@/hooks/useRealtimePortfolio';
import { useAuth } from '@/hooks/useAuth';
import IndividualVaultCard from '@/components/vaults/IndividualVaultCard';
import UserVaultsList from '@/components/vaults/UserVaultsList';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const VaultsPage: React.FC = () => {
  const { user } = useAuth();
  const { portfolio } = useRealtimePortfolio();

  // Define the main cryptocurrencies for vaulting
  const mainCryptos = ['BTC', 'ETH', 'SOL', 'USDT'];
  
  // Filter portfolio to show only main cryptos and their available balances
  const availableForVaulting = portfolio?.filter(item => 
    mainCryptos.includes(item.crypto.symbol.toUpperCase()) && item.quantity > 0
  ) || [];

  // Create cards for all main cryptos, even if balance is 0
  const vaultCryptos = mainCryptos.map(symbol => {
    const portfolioItem = portfolio?.find(item => 
      item.crypto.symbol.toUpperCase() === symbol
    );
    
    return {
      crypto: portfolioItem?.crypto || {
        id: `${symbol.toLowerCase()}-placeholder`,
        name: symbol === 'BTC' ? 'Bitcoin' : 
              symbol === 'ETH' ? 'Ethereum' : 
              symbol === 'SOL' ? 'Solana' : 'Tether',
        symbol: symbol,
        logo_url: '',
        current_price: 0
      },
      availableBalance: portfolioItem?.quantity || 0
    };
  });

  // Add react-query to get vault configurations if not already available
  // const { data: vaultConfigs } = useVaults();

  const handleVault = async (cryptoId: string, amount: number, durationDays: number) => {
    if (!user) {
      toast.error('Please log in to vault crypto');
      return;
    }

    try {
      // Find the crypto info
      const cryptoInfo = portfolio?.find(item => item.crypto.id === cryptoId);
      if (!cryptoInfo) {
        toast.error('Crypto not found');
        return;
      }

      // Check if user has sufficient balance
      if (amount > cryptoInfo.quantity) {
        toast.error('Insufficient balance');
        return;
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
        return;
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
        console.error('[VaultsPage] Error vaulting:', vaultError);
        return;
      }

      // Update portfolio (subtract amount)
      const { error: portfolioError } = await supabase
        .from('user_portfolios')
        .update({ quantity: cryptoInfo.quantity - amount })
        .eq('user_id', user.id)
        .eq('cryptocurrency_id', cryptoId);

      if (portfolioError) {
        toast.error('Failed to update portfolio.');
        console.error('[VaultsPage] Portfolio update error:', portfolioError);
        // Optionally, rollback the created vault
        await supabase.from('user_vaults').delete().eq('id', vaultData.id);
        return;
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

      // Refresh vaults UI (simulate by reloading, or refetch using query/react-query)
      if (typeof window !== 'undefined') window.location.reload();
      // If using react-query: queryClient.invalidateQueries({ queryKey: ['user_vaults', user.id] });
      
    } catch (error: any) {
      console.error('Vault error:', error);
      toast.error(`Failed to vault crypto: ${error.message}`);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p className="text-muted-foreground">Please log in to access crypto vaults.</p>
      </div>
    );
  }

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

        {/* Individual Vault Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {vaultCryptos.map((item, index) => (
            <IndividualVaultCard
              key={`${item.crypto.symbol}-${index}`}
              crypto={item.crypto}
              availableBalance={item.availableBalance}
              onVault={handleVault}
            />
          ))}
        </div>

        <UserVaultsList />
      </div>
    </div>
  );
};

export default VaultsPage;
