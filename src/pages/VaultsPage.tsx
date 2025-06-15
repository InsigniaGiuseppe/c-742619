import React from 'react';
import { useRealtimePortfolio } from '@/hooks/useRealtimePortfolio';
import { useAuth } from '@/hooks/useAuth';
import IndividualVaultCard from '@/components/vaults/IndividualVaultCard';
import UserVaultsList from '@/components/vaults/UserVaultsList';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import VaultCryptosGrid from '@/components/vaults/VaultCryptosGrid';
import { useVaultCreation } from '@/hooks/useVaultCreation';

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

  // Use new custom hook for vault logic
  const { handleVault } = useVaultCreation(portfolio, user);

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

        {/* Refactored grid to new component */}
        <VaultCryptosGrid
          vaultCryptos={vaultCryptos}
          onVault={handleVault}
        />
        <UserVaultsList />
      </div>
    </div>
  );
};

export default VaultsPage;
