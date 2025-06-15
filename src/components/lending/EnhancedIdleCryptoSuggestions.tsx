
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import CryptoLogo from '@/components/CryptoLogo';
import FormattedNumber from '@/components/FormattedNumber';
import { PortfolioItem } from '@/hooks/usePortfolio';

interface EnhancedIdleCryptoSuggestionsProps {
  availableCryptos: Array<PortfolioItem & { available_quantity: number; potential_daily_earnings: number }>;
  onStartLending: (cryptoId: string) => void;
}

const EnhancedIdleCryptoSuggestions: React.FC<EnhancedIdleCryptoSuggestionsProps> = ({ 
  availableCryptos, 
  onStartLending 
}) => {
  // Filter out cryptos with zero balance
  const cryptosWithBalance = availableCryptos.filter(crypto => crypto.available_quantity > 0);
  
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    }
  };

  if (cryptosWithBalance.length === 0) {
    return null;
  }

  return (
    <Card className="glass glass-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Earn More with Idle Crypto
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              You have {cryptosWithBalance.length} crypto{cryptosWithBalance.length !== 1 ? 's' : ''} that could be earning interest
            </p>
          </div>
          
          {cryptosWithBalance.length > 3 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => scroll('left')}
                disabled={scrollPosition === 0}
                className="w-8 h-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scroll('right')}
                className="w-8 h-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {cryptosWithBalance.map((crypto) => {
            const topCoins = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL'];
            const apy = topCoins.includes(crypto.crypto.symbol.toUpperCase()) ? 5 : 3;
            
            return (
              <div 
                key={crypto.cryptocurrency_id} 
                className="flex-shrink-0 w-72 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
              >
                <div className="flex items-center gap-3 mb-3">
                  <CryptoLogo 
                    logo_url={crypto.crypto.logo_url}
                    name={crypto.crypto.name}
                    symbol={crypto.crypto.symbol}
                    size="md"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{crypto.crypto.symbol}</span>
                      <Badge className="bg-green-500/20 text-green-400 text-xs border-green-500/30">
                        {apy}% APR
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{crypto.crypto.name}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Available:</span>
                    <span className="font-medium">{crypto.available_quantity.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Daily earnings potential:</span>
                    <FormattedNumber 
                      value={crypto.potential_daily_earnings} 
                      type="currency" 
                      showTooltip={false} 
                      className="font-medium text-green-400" 
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Value:</span>
                    <FormattedNumber 
                      value={crypto.available_quantity * crypto.crypto.current_price} 
                      type="currency" 
                      showTooltip={false} 
                      className="font-medium" 
                    />
                  </div>
                </div>
                
                <Button
                  onClick={() => onStartLending(crypto.cryptocurrency_id)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start Lending
                </Button>
              </div>
            );
          })}
        </div>
        
        {cryptosWithBalance.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No crypto with available balance to lend.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedIdleCryptoSuggestions;
