
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Cryptocurrency } from '@/hooks/useCryptocurrencies';
import CryptoLogo from './CryptoLogo';
import FormattedNumber from './FormattedNumber';

interface TradeSheetProps {
  crypto: Cryptocurrency | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TradeSheet: React.FC<TradeSheetProps> = ({ crypto, open, onOpenChange }) => {
  if (!crypto) return null;

  const priceChangePercentage = crypto.price_change_percentage_24h || 0;
  const isPositiveChange = priceChangePercentage >= 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-gray-950 border-gray-800 text-white w-full sm:max-w-md">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-3 text-2xl">
            <CryptoLogo logo_url={crypto.logo_url} name={crypto.name} symbol={crypto.symbol} size="lg" />
            <div>
              Trade {crypto.name}
              <span className="text-muted-foreground ml-2">{crypto.symbol.toUpperCase()}</span>
            </div>
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Current Price</span>
                <FormattedNumber value={crypto.current_price} type="currency" className="text-xl font-bold" />
            </div>
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">24h Change</span>
                <span className={isPositiveChange ? 'text-green-500' : 'text-red-500'}>
                    <FormattedNumber value={crypto.price_change_percentage_24h || 0} type="percent" />
                </span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Market Cap</span>
                <FormattedNumber value={crypto.market_cap || 0} type="currency" compact />
            </div>
        </div>

        <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Trade Form</h3>
            <div className="glass p-6 rounded-lg text-center">
                <p className="text-muted-foreground">Trading functionality is coming soon!</p>
            </div>
        </div>

        <SheetFooter className="mt-8">
          <SheetClose asChild>
            <Button type="button" variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default TradeSheet;
