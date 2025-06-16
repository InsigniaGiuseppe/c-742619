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
  <div className="flex items-center justify-center gap-4 mt-8 mb-4"> {/* Added mt-8 for more space above, mb-4 for space below */}
    <Button
      onClick={handleSpin}
      disabled={isSpinning || !canSpin || btcBalance < betAmountBtc || loading}
      size="lg"
      className="bg-purple-600 hover:bg-purple-700 text-white min-w-48 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300" // Made button slightly larger
    >
      {isSpinning ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          <span>Spinning...</span>
        </div>
      ) : cooldownTime > 0 ? (
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <span>Wait {cooldownTime}s</span>
        </div>
      ) : (
        <span>Spin for {betAmountBtc.toFixed(6)} BTC</span>
      )}
    </Button>
  </div>
);

export default SpinControls;