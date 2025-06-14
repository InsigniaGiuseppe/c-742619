
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Cryptocurrency } from '@/hooks/useCryptocurrencies';

interface CryptoStatsDisplayProps {
  crypto: Cryptocurrency;
}

const CryptoStatsDisplay: React.FC<CryptoStatsDisplayProps> = ({ crypto }) => {
  const priceChange = crypto.price_change_24h || 0;
  const priceChangePercent = crypto.price_change_percentage_24h || 0;

  return (
    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
      <div>
        <span className="text-muted-foreground">Market Cap:</span>
        <div className="font-semibold">${(crypto.market_cap || 0).toLocaleString()}</div>
      </div>
      <div>
        <span className="text-muted-foreground">Volume 24h:</span>
        <div className="font-semibold">${(crypto.volume_24h || 0).toLocaleString()}</div>
      </div>
      <div>
        <span className="text-muted-foreground">Price Change 24h:</span>
        <div className={`font-semibold ${priceChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
        </div>
      </div>
    </div>
  );
};

export default CryptoStatsDisplay;
