
import React, { useState } from 'react';

interface CryptoLogoProps {
  logo_url?: string;
  name: string;
  symbol: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const CryptoLogo: React.FC<CryptoLogoProps> = ({ 
  logo_url, 
  name, 
  symbol, 
  size = 'md', 
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  // Known logo URLs for major cryptocurrencies as fallbacks
  const knownLogos: Record<string, string> = {
    'BTC': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    'ETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    'SOL': 'https://cryptologos.cc/logos/solana-sol-logo.png',
    'USDT': 'https://cryptologos.cc/logos/tether-usdt-logo.png',
    'BNB': 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
    'USDC': 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    'ADA': 'https://cryptologos.cc/logos/cardano-ada-logo.png',
    'DOGE': 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
  };

  const fallbackUrl = knownLogos[symbol.toUpperCase()];

  if (!logo_url && !fallbackUrl || imageError) {
    // Return initials as fallback
    const initials = symbol.slice(0, 2).toUpperCase();
    return (
      <div 
        className={`${sizeClasses[size]} ${className} bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center border border-white/10`}
        title={name}
      >
        <span className={`font-bold text-white ${textSizeClasses[size]}`}>
          {initials}
        </span>
      </div>
    );
  }

  return (
    <img 
      src={logo_url || fallbackUrl}
      alt={`${name} logo`}
      className={`${sizeClasses[size]} ${className} rounded-full object-cover`}
      onError={() => setImageError(true)}
      title={name}
    />
  );
};

export default CryptoLogo;
