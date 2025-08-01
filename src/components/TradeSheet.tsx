
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
import TradeForm from './TradeForm';

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
      <SheetContent className="bg-background border-gray-800 text-white w-full sm:max-w-md">
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
                    <FormattedNumber value={crypto.price_change_percentage_24h || 0} type="percentage" />
                </span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Market Cap</span>
                <FormattedNumber value={crypto.market_cap || 0} type="currency" compact />
            </div>
        </div>

        <div className="mt-8">
            <TradeForm crypto={crypto} />
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
