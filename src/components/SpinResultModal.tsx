
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import CryptoLogo from '@/components/CryptoLogo';
import FormattedNumber from '@/components/FormattedNumber';
import { CheckCircle, XCircle } from 'lucide-react';

interface SpinResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    isWin: boolean;
    rewardCrypto: string;
    rewardAmount: number;
    multiplier: number;
    tier?: string;
    rewardValue?: number; // USD value of the reward
  } | null;
}

const SpinResultModal: React.FC<SpinResultModalProps> = ({
  isOpen,
  onClose,
  result
}) => {
  if (!result) return null;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'legendary':
        return 'text-yellow-400';
      case 'epic':
        return 'text-purple-400';
      case 'rare':
        return 'text-green-400';
      case 'common':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTierGlow = (tier: string) => {
    switch (tier) {
      case 'legendary':
        return 'shadow-[0_0_30px_rgba(255,215,0,0.6)]';
      case 'epic':
        return 'shadow-[0_0_30px_rgba(168,85,247,0.6)]';
      case 'rare':
        return 'shadow-[0_0_30px_rgba(34,197,94,0.6)]';
      case 'common':
        return 'shadow-[0_0_30px_rgba(59,130,246,0.6)]';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            {result.isWin ? (
              <div className="relative">
                <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-green-500 rounded-full animate-ping"></div>
              </div>
            ) : (
              <div className="relative">
                <XCircle className="w-16 h-16 text-red-500 animate-pulse" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-red-500 rounded-full animate-ping"></div>
              </div>
            )}
          </div>
          
          <DialogTitle className="text-2xl font-bold">
            {result.isWin ? '🎉 Congratulations!' : '😢 Better Luck Next Time!'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          {result.isWin ? (
            <>
              <p className="text-lg text-muted-foreground">You won:</p>
              
              <div className={`flex items-center justify-center gap-3 p-6 rounded-xl bg-gradient-to-r from-green-500/20 to-blue-500/20 ${getTierGlow(result.tier || 'common')}`}>
                <CryptoLogo
                  symbol={result.rewardCrypto}
                  name={result.rewardCrypto}
                  size="lg"
                  className="w-16 h-16"
                />
                <div className="text-left">
                  <div className="text-3xl font-bold text-white mb-1">
                    <FormattedNumber value={result.rewardAmount} type="price" /> {result.rewardCrypto}
                  </div>
                  {result.rewardValue && (
                    <div className="text-lg text-green-300 mb-2">
                      ≈ <FormattedNumber value={result.rewardValue} type="currency" />
                    </div>
                  )}
                  <div className={`text-sm font-semibold ${getTierColor(result.tier || 'common')}`}>
                    {result.multiplier.toFixed(2)}x Multiplier • {result.tier?.toUpperCase() || 'COMMON'}
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                The rewards have been added to your portfolio!
              </p>
            </>
          ) : (
            <>
              <p className="text-lg text-muted-foreground">You lost this round</p>
              
              <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-gradient-to-r from-red-500/20 to-gray-500/20">
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-2xl">
                  ✗
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">
                    No Reward
                  </div>
                  <div className="text-sm text-red-300">
                    0x Multiplier • LOSS
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Your BTC bet was added to the platform reserves. Try again!
              </p>
            </>
          )}
        </div>
        
        <div className="flex justify-center mt-6">
          <Button onClick={onClose} className="min-w-32">
            {result.isWin ? '🎊 Awesome!' : 'Try Again'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpinResultModal;
