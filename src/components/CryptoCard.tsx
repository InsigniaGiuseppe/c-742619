import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Cryptocurrency } from '@/hooks/useCryptocurrencies';

interface CryptoCardProps {
  crypto: Cryptocurrency;
  onTrade: (crypto: Cryptocurrency) => void;
}

const CryptoCard: React.FC<CryptoCardProps> = ({ crypto, onTrade }) => {
  const formatPrice = (price: number) => {
    if (price < 0.01) {
      return price.toFixed(6);
    } else if (price < 1) {
      return price.toFixed(4);
    } else {
      return price.toFixed(2);
    }
  };

  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap) return 'N/A';
    
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(1)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(1)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(1)}M`;
    }
    return `$${marketCap.toFixed(0)}`;
  };

  const isPriceUp = (crypto.price_change_percentage_24h || 0) >= 0;

  return (
    <Card className="glass glass-hover">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {crypto.logo_url && (
              <img
                src={crypto.logo_url}
                alt={`${crypto.name} logo`}
                className="w-10 h-10 rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div>
              <CardTitle className="text-lg">{crypto.symbol}</CardTitle>
              <p className="text-sm text-muted-foreground">{crypto.name}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1 ${isPriceUp ? 'text-green-400' : 'text-red-400'}`}>
            {isPriceUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {crypto.price_change_percentage_24h?.toFixed(2) || '0.00'}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-2xl font-bold">${formatPrice(crypto.current_price)}</p>
            <p className="text-sm text-muted-foreground">
              Market Cap: {formatMarketCap(crypto.market_cap)}
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
