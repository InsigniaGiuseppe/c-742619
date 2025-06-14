
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Cryptocurrency } from '@/hooks/useCryptocurrencies';
import { formatPrice, formatMarketCap, formatPercentage } from '@/lib/formatters';
import CryptoLogo from './CryptoLogo';

interface CryptoCardProps {
  crypto: Cryptocurrency;
  onTrade: (crypto: Cryptocurrency) => void;
}

const CryptoCard: React.FC<CryptoCardProps> = ({ crypto, onTrade }) => {
  const isPriceUp = (crypto.price_change_percentage_24h || 0) >= 0;

  return (
    <Card className="glass glass-hover">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CryptoLogo 
              logo_url={crypto.logo_url}
              name={crypto.name}
              symbol={crypto.symbol}
            />
            <div>
              <CardTitle className="text-lg">{crypto.symbol}</CardTitle>
              <p className="text-sm text-muted-foreground">{crypto.name}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1 ${isPriceUp ? 'text-green-400' : 'text-red-400'}`}>
            {isPriceUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {formatPercentage(crypto.price_change_percentage_24h || 0)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-2xl font-bold">{formatPrice(crypto.current_price)}</p>
            <p className="text-sm text-muted-foreground">
              Market Cap: {formatMarketCap(crypto.market_cap || 0)}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => onTrade(crypto)}
              className="flex-1"
              size="sm"
            >
              Trade {crypto.symbol}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CryptoCard;
