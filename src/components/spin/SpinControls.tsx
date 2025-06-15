
import React from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface SpinControlsProps {
  isSpinning: boolean;
  canSpin: boolean;
  btcBalance: number;
  betAmountBtc: number;
  loading: boolean;
  cooldownTime: number;
  handleSpin: () => void;
}

const SpinControls: React.FC<SpinControlsProps> = ({
  isSpinning,
  canSpin,
  btcBalance,
  betAmountBtc,
  loading,
  cooldownTime,
  handleSpin,
}) => (
  <div className="flex items-center justify-center gap-4">
    <Button
      onClick={handleSpin}
      disabled={isSpinning || !canSpin || btcBalance < betAmountBtc || loading}
      size="lg"
      className="bg-purple-600 hover:bg-purple-700 text-white min-w-48"
    >
      {isSpinning ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          Spinning...
        </div>
      ) : cooldownTime > 0 ? (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Wait {cooldownTime}s
        </div>
      ) : (
        `Spin for ${betAmountBtc.toFixed(6)} BTC`
      )}
    </Button>
  </div>
);

export default SpinControls;
