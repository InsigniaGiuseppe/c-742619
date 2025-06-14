
import React from 'react';
import { Cryptocurrency } from '@/hooks/useCryptocurrencies';
import { formatPrice, formatCurrency, formatPercentage } from '@/lib/formatters';
import CryptoLogo from '@/components/CryptoLogo';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CryptoDetailHeaderProps {
  crypto: Cryptocurrency;
  userHoldings: number;
}

const CryptoDetailHeader: React.FC<CryptoDetailHeaderProps> = ({ crypto, userHoldings }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <CryptoLogo 
          logo_url={crypto.logo_url}
          name={crypto.name}
          symbol={crypto.symbol}
          size="lg"
        />
        <div>
          <h1 className="text-3xl font-bold">{crypto.name}</h1>
          <p className="text-muted-foreground">{crypto.symbol.toUpperCase()}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-4xl font-bold">{formatPrice(crypto.current_price)}</span>
        <Badge 
          variant={crypto.price_change_percentage_24h && crypto.price_change_percentage_24h >= 0 ? "default" : "destructive"}
          className="flex items-center gap-1 text-base"
        >
          {crypto.price_change_percentage_24h && crypto.price_change_percentage_24h >= 0 ? 
            <TrendingUp className="h-4 w-4" /> : 
            <TrendingDown className="h-4 w-4" />
          }
          {formatPercentage(crypto.price_change_percentage_24h || 0)}
        </Badge>
      </div>
      
      {crypto.market_cap && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Market Cap: </span>
            <span>{formatCurrency(crypto.market_cap, { compact: true })}</span>
          </div>
          <div>
            <span className="text-muted-foreground">24h Volume: </span>
            <span>{formatCurrency(crypto.volume_24h || 0, { compact: true })}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Your Holdings: </span>
            <span>{userHoldings.toFixed(8)} {crypto.symbol.toUpperCase()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoDetailHeader;
