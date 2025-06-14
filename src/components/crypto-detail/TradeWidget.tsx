
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatCurrency, formatPrice } from '@/lib/formatters';
import { Cryptocurrency } from '@/hooks/useCryptocurrencies';
import { useTrade } from '@/hooks/useTrade';
import { toast } from 'sonner';

interface TradeWidgetProps {
  crypto: Cryptocurrency;
}

const TradeWidget: React.FC<TradeWidgetProps> = ({ crypto }) => {
  const {
    user,
    tradeType,
    setTradeType,
    paymentMethod,
    setPaymentMethod,
    amountEUR,
    amountCoin,
    handleAmountEURChange,
    handleAmountCoinChange,
    isProcessingTrade,
    userBalance,
    handleTrade,
  } = useTrade(crypto);

  return (
    <Card className="glass glass-hover">
      <CardHeader>
        <CardTitle>Trade {crypto.symbol.toUpperCase()}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Demo Balance: {formatCurrency(userBalance)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={tradeType === 'buy' ? "default" : "outline"}
            onClick={() => setTradeType('buy')}
            className="flex-1"
          >
            Buy
          </Button>
          <Button
            variant={tradeType === 'sell' ? "default" : "outline"}
            onClick={() => setTradeType('sell')}
            className="flex-1"
          >
            Sell
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Payment Method</label>
            <ToggleGroup
              type="single"
              value={paymentMethod}
              onValueChange={(value) => {
                if (value) {
                  setPaymentMethod(value as 'balance' | 'ideal');
                  if (value === 'ideal') {
                    toast.info("iDEAL payments are for demo purposes and not yet functional.");
                  }
                }
              }}
              className="grid grid-cols-2"
            >
              <ToggleGroupItem value="balance" aria-label="Pay with balance">
                Pay with Balance
              </ToggleGroupItem>
              <ToggleGroupItem value="ideal" aria-label="Pay with iDEAL">
                Pay with iDEAL
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Amount (USD)</label>
            <Input
              type="number"
              placeholder="0.00"
              value={amountEUR}
              onChange={(e) => handleAmountEURChange(e.target.value)}
              className="bg-transparent"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Amount ({crypto.symbol.toUpperCase()})</label>
            <Input
              type="number"
              placeholder="0.00000000"
              value={amountCoin}
              onChange={(e) => handleAmountCoinChange(e.target.value)}
              className="bg-transparent"
            />
          </div>

          {amountEUR && (
            <div className="p-3 bg-white/5 rounded-lg text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span>{formatPrice(crypto.current_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee (0.1%)</span>
                <span>{formatCurrency(parseFloat(amountEUR) * 0.001, { maximumFractionDigits: 4 })}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-white/10 pt-2 mt-2">
                <span>Total</span>
                <span>{formatCurrency(parseFloat(amountEUR) * 1.001)}</span>
              </div>
            </div>
          )}

          <Button 
            onClick={handleTrade}
            disabled={!amountEUR || !amountCoin || isProcessingTrade || !user || paymentMethod === 'ideal'}
            className="w-full"
          >
            {isProcessingTrade ? 'Processing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${crypto.symbol.toUpperCase()}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradeWidget;
