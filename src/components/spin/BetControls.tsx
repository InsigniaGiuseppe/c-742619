
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import CryptoLogo from "@/components/CryptoLogo";
import FormattedNumber from "@/components/FormattedNumber";

interface BetControlsProps {
  btcHolding: any;
  btcBalance: number;
  btcPrice: number;
  betAmount: number[];
  setBetAmount: (val: number[]) => void;
}

const BetControls: React.FC<BetControlsProps> = ({
  btcHolding,
  btcBalance,
  btcPrice,
  betAmount,
  setBetAmount,
}) => {
  const betBtc = betAmount[0];
  const betValue = betBtc * btcPrice;
  return (
    <Card className="glass glass-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {btcHolding?.crypto.logo_url ? (
              <img src={btcHolding.crypto.logo_url} alt="Bitcoin" className="w-5 h-5 rounded-full" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold text-white">₿</div>
            )}
            <span>Your BTC Balance</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          <FormattedNumber value={btcBalance} type="price" /> BTC
        </div>
        <div className="text-sm text-muted-foreground">
          ≈ <FormattedNumber value={btcBalance * btcPrice} type="currency" />
        </div>
        <div className="my-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">BTC Amount</span>
            <span className="font-mono">{betBtc.toFixed(6)} BTC</span>
          </div>
          <Slider
            value={betAmount}
            onValueChange={setBetAmount}
            min={0.0001}
            max={Math.min(0.1, btcBalance)}
            step={0.0001}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0.0001 BTC</span>
            <span>{Math.min(0.1, btcBalance).toFixed(4)} BTC</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Bet Value</div>
          <div className="font-semibold">
            <FormattedNumber value={betValue} type="currency" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BetControls;
