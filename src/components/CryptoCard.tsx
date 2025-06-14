
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Cryptocurrency } from '@/hooks/useCryptocurrencies';
import CryptoLogo from './CryptoLogo';
import FormattedNumber from './FormattedNumber';

interface CryptoCardProps {
  crypto: Cryptocurrency;
  onTrade: (crypto: Cryptocurrency) => void;
}

const CryptoCard: React.FC<CryptoCardProps> = ({ crypto, onTrade }) => {
  const isPriceUp = (crypto.price_change_percentage_24h || 0) >= 0;

  return (
    <Card className="glass glass-hover transition-all duration-200 hover:scale-[1.02]">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CryptoLogo 
              logo_url={crypto.logo_url}
              name={crypto.name}
              symbol={crypto.symbol}
            />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg font-bold truncate">{crypto.symbol}</CardTitle>
              <p className="text-sm text-muted-foreground truncate">{crypto.name}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${
            isPriceUp ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'
          }`}>
            {isPriceUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <FormattedNumber
              value={crypto.price_change_percentage_24h || 0}
              type="percentage"
              showTooltip={false}
              className="text-xs font-medium"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div>
            <FormattedNumber
              value={crypto.current_price}
              type="price"
              className="text-2xl font-bold"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <span>Market Cap: </span>
            <FormattedNumber
              value={crypto.market_cap || 0}
              type="marketCap"
              compact={true}
              className="font-medium"
            />
          </div>
        </div>
        
        <Button 
          onClick={() => onTrade(crypto)}
          className="w-full bg-primary hover:bg-primary/90 transition-colors"
          size="sm"
        >
          Trade {crypto.symbol}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CryptoCard;
