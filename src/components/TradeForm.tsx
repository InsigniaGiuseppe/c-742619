
import React from 'react';
import { Cryptocurrency } from '@/hooks/useCryptocurrencies';
import { useTrade } from '@/hooks/useTrade';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

interface TradeFormProps {
  crypto: Cryptocurrency;
}

const TradeForm: React.FC<TradeFormProps> = ({ crypto }) => {
  const { user, loading: authLoading } = useAuth();
  const {
    tradeType,
    setTradeType,
    amountEUR,
    amountCoin,
    handleAmountEURChange,
    handleAmountCoinChange,
    isProcessingTrade,
    userBalance,
    userHoldings,
    handleTrade,
  } = useTrade(crypto);

  if (authLoading) {
    return <div className="text-center p-8"><Loader2 className="animate-spin mx-auto" /></div>;
  }
  
  if (!user) {
    return (
      <div className="glass p-6 rounded-lg text-center">
        <p className="text-muted-foreground mb-4">Please log in to trade.</p>
        <Button asChild>
          <Link to="/login">Log In</Link>
        </Button>
      </div>
    );
  }

  const userBalanceDisplay = userBalance ?? 0;
  const userHoldingsDisplay = userHoldings ?? 0;

  return (
    <div className="space-y-6">
      <ToggleGroup 
        type="single" 
        value={tradeType} 
        onValueChange={(value) => { if (value) setTradeType(value as 'buy' | 'sell') }}
        className="grid grid-cols-2"
      >
        <ToggleGroupItem value="buy" aria-label="Buy" className="data-[state=on]:button-gradient data-[state=on]:text-white">Buy</ToggleGroupItem>
        <ToggleGroupItem value="sell" aria-label="Sell" className="data-[state=on]:button-gradient data-[state=on]:text-white">Sell</ToggleGroupItem>
      </ToggleGroup>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">You pay</span>
          <span className="text-muted-foreground">
            Balance: {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(userBalanceDisplay)}
          </span>
        </div>
        <div className="relative">
          <Input 
            type="number"
            placeholder="0.00"
            value={amountEUR}
            onChange={(e) => handleAmountEURChange(e.target.value)}
            className="bg-gray-900 border-gray-700 text-lg pr-16"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">EUR</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">You receive</span>
          <span className="text-muted-foreground">
            Holding: {userHoldingsDisplay.toFixed(6)} {crypto.symbol.toUpperCase()}
          </span>
        </div>
        <div className="relative">
           <Input 
            type="number"
            placeholder="0.000000"
            value={amountCoin}
            onChange={(e) => handleAmountCoinChange(e.target.value)}
            className="bg-gray-900 border-gray-700 text-lg pr-20"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">{crypto.symbol.toUpperCase()}</span>
        </div>
      </div>

      <Button onClick={handleTrade} disabled={isProcessingTrade || !amountEUR || parseFloat(amountEUR) <= 0} className="w-full button-gradient text-lg py-6">
        {isProcessingTrade ? <Loader2 className="animate-spin" /> : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${crypto.name}`}
      </Button>
    </div>
  );
};

export default TradeForm;
