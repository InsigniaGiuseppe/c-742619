
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
  const [fallbackError, setFallbackError] = useState(false);

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

  // Enhanced logo URLs for major cryptocurrencies
  const knownLogos: Record<string, string> = {
    'BTC': 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    'ETH': 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    'SOL': 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    'USDT': 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
    'BNB': 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    'USDC': 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
    'ADA': 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    'DOGE': 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
  };

  const fallbackUrl = knownLogos[symbol.toUpperCase()];
  
  console.log(`[CryptoLogo] ${symbol}: logo_url=${logo_url}, fallbackUrl=${fallbackUrl}, imageError=${imageError}, fallbackError=${fallbackError}`);

  // If both original and fallback failed, or no URLs available, show initials
  if ((!logo_url && !fallbackUrl) || (imageError && fallbackError)) {
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

  // Try original URL first, then fallback
  const imageUrl = (!imageError && logo_url) ? logo_url : fallbackUrl;
  
  return (
    <img
      src={imageUrl}
      alt={`${name} logo`}
      className={`${sizeClasses[size]} ${className} rounded-full object-cover`}
      loading="lazy"
      onError={() => {
        console.log(`[CryptoLogo] Image error for ${symbol} with URL: ${imageUrl}`);
        if (!imageError && logo_url && imageUrl === logo_url) {
          setImageError(true);
        } else {
          setFallbackError(true);
        }
      }}
      title={name}
    />
  );
};

export default CryptoLogo;
