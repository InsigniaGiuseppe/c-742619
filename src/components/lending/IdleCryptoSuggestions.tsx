
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp } from 'lucide-react';
import CryptoLogo from '@/components/CryptoLogo';
import FormattedNumber from '@/components/FormattedNumber';
import { PortfolioItem } from '@/hooks/usePortfolio';

interface IdleCryptoSuggestionsProps {
  availableCryptos: Array<PortfolioItem & { available_quantity: number; potential_daily_earnings: number }>;
  onStartLending: (cryptoId: string) => void;
}

const IdleCryptoSuggestions: React.FC<IdleCryptoSuggestionsProps> = ({ 
  availableCryptos, 
  onStartLending 
}) => {
  if (availableCryptos.length === 0) {
    return null;
  }

  return (
    <Card className="glass glass-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Earn More with Idle Crypto
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          You have {availableCryptos.length} crypto{availableCryptos.length !== 1 ? 's' : ''} that could be earning interest
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {availableCryptos.slice(0, 3).map((crypto) => {
            const topCoins = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL'];
            const apy = topCoins.includes(crypto.crypto.symbol.toUpperCase()) ? 5 : 3;
            
            return (
              <div key={crypto.cryptocurrency_id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <CryptoLogo 
                    logo_url={crypto.crypto.logo_url}
                    name={crypto.crypto.name}
                    symbol={crypto.crypto.symbol}
                    size="sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{crypto.crypto.symbol}</span>
                      <Badge className="bg-green-500/20 text-green-400 text-xs">
                        {apy}% APR
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Available: {crypto.available_quantity.toFixed(6)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Could earn daily</p>
                  <FormattedNumber 
                    value={crypto.potential_daily_earnings} 
                    type="currency" 
                    showTooltip={false} 
                    className="font-medium text-green-400" 
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStartLending(crypto.cryptocurrency_id)}
                    className="ml-2 h-6 px-2 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Lend
                  </Button>
                </div>
              </div>
            );
          })}
          
          {availableCryptos.length > 3 && (
            <p className="text-center text-xs text-muted-foreground pt-2">
              +{availableCryptos.length - 3} more crypto{availableCryptos.length - 3 !== 1 ? 's' : ''} available
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IdleCryptoSuggestions;
