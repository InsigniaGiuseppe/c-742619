
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cryptocurrency } from '@/hooks/useCryptocurrencies';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import FormattedNumber from './FormattedNumber';
import CryptoLogo from './CryptoLogo';

interface TopMoversProps {
  cryptocurrencies: Cryptocurrency[];
}

const MoverItem = ({ crypto, isGainer }: { crypto: Cryptocurrency, isGainer: boolean }) => {
  const navigate = useNavigate();
  return (
    <div 
      className="flex items-center justify-between p-2 rounded-md hover:bg-white/10 cursor-pointer transition-colors"
      onClick={() => navigate(`/crypto/${crypto.symbol.toLowerCase()}`)}
    >
      <div className="flex items-center gap-3 min-w-0">
        <CryptoLogo logo_url={crypto.logo_url} name={crypto.name} symbol={crypto.symbol} size="sm" />
        <div className="min-w-0">
          <p className="font-semibold text-sm">{crypto.symbol.toUpperCase()}</p>
          <p className="text-xs text-muted-foreground truncate">{crypto.name}</p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <FormattedNumber value={crypto.current_price} type="price" className="text-sm"/>
        <div className={`flex items-center justify-end gap-1 text-xs ${isGainer ? 'text-green-400' : 'text-red-400'}`}>
          {isGainer ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          <FormattedNumber value={crypto.price_change_percentage_24h || 0} type="percent" />
        </div>
      </div>
    </div>
  );
};

const TopMovers: React.FC<TopMoversProps> = ({ cryptocurrencies }) => {
  if (!cryptocurrencies || cryptocurrencies.length === 0) {
    return null;
  }

  const sortedByChange = [...cryptocurrencies]
    .filter(c => c.price_change_percentage_24h !== null && c.price_change_percentage_24h !== undefined)
    .sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0));
  
  const topGainers = sortedByChange.slice(0, 3);
  const topLosers = sortedByChange.length > 3 ? sortedByChange.slice(-3).reverse() : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card className="glass">
        <CardHeader className="p-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-green-400" />
            Top Gainers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          {topGainers.map(crypto => (
            <MoverItem key={crypto.id} crypto={crypto} isGainer={true} />
          ))}
        </CardContent>
      </Card>
      <Card className="glass">
        <CardHeader className="p-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ArrowDownRight className="h-5 w-5 text-red-400" />
            Top Losers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          {topLosers.map(crypto => (
            <MoverItem key={crypto.id} crypto={crypto} isGainer={false} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default TopMovers;
