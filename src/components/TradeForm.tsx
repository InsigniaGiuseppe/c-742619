
import React from 'react';
import { Cryptocurrency } from '@/hooks/useCryptocurrencies';
import { useTrade } from '@/hooks/useTrade';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { formatCurrency, formatPrice } from '@/lib/formatters';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { convertUsdToEur } from '@/lib/currencyConverter';

interface TradeFormProps {
  crypto: Cryptocurrency;
}

const TradeForm: React.FC<TradeFormProps> = ({ crypto }) => {
  const { user, loading: authLoading } = useAuth();
  const { exchangeRate } = useExchangeRate();
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
  const cryptoPriceEur = convertUsdToEur(crypto.current_price, exchangeRate);

  return (
    <div className="space-y-6">
      <ToggleGroup 
        type="single" 
        value={tradeType} 
        onValueChange={(value) => { if (value) setTradeType(value as 'buy' | 'sell') }}
        className="grid grid-cols-2"
      >
        <ToggleGroupItem value="buy" aria-label="Buy" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Buy</ToggleGroupItem>
        <ToggleGroupItem value="sell" aria-label="Sell" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Sell</ToggleGroupItem>
      </ToggleGroup>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">You pay</span>
          <span className="text-muted-foreground">
            Balance: {formatCurrency(userBalanceDisplay, { currency: 'EUR' })}
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
            Available: {userHoldingsDisplay.toFixed(6)} {crypto.symbol.toUpperCase()}
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

      {amountEUR && (
        <div className="p-3 bg-white/5 rounded-lg text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price</span>
            <span>{formatPrice(cryptoPriceEur, 'EUR')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fee (0.35%)</span>
            <span>{formatCurrency(parseFloat(amountEUR) * 0.0035, { currency: 'EUR', maximumFractionDigits: 4 })}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t border-white/10 pt-2 mt-2">
            <span>Total</span>
            <span>{formatCurrency(parseFloat(amountEUR) * 1.0035, { currency: 'EUR' })}</span>
          </div>
        </div>
      )}

      <Button onClick={handleTrade} disabled={isProcessingTrade || !amountEUR || parseFloat(amountEUR) <= 0} className="w-full text-lg py-6">
        {isProcessingTrade ? <Loader2 className="animate-spin" /> : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${crypto.name}`}
      </Button>
    </div>
  );
};

export default TradeForm;
