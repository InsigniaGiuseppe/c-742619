
import React from 'react';
import IndividualVaultCard from './IndividualVaultCard';

// Prop types
interface VaultCryptosGridProps {
  vaultCryptos: {
    crypto: {
      id: string;
      name: string;
      symbol: string;
      logo_url: string;
      current_price: number;
    };
    availableBalance: number;
  }[];
  onVault: (cryptoId: string, amount: number, durationDays: number) => Promise<boolean>;
}

const VaultCryptosGrid: React.FC<VaultCryptosGridProps> = ({ vaultCryptos, onVault }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
    {vaultCryptos.map((item, index) => (
      <IndividualVaultCard
        key={`${item.crypto.symbol}-${index}`}
        crypto={item.crypto}
        availableBalance={item.availableBalance}
        onVault={onVault}
      />
    ))}
  </div>
);

export default VaultCryptosGrid;
