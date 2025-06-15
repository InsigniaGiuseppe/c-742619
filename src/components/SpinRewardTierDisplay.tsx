
import React from 'react';
import { Badge } from '@/components/ui/badge';
import CryptoLogo from '@/components/CryptoLogo';
import { formatCurrency } from '@/lib/formatters';

interface SpinReward {
  tier: string;
  crypto: {
    symbol: string;
    name: string;
    logo_url?: string;
  };
  amount: number;
  usdValue: number;
  multiplier: number;
  probability: number;
}

interface SpinRewardTierDisplayProps {
  rewards: SpinReward[];
  selectedTier?: string;
  className?: string;
}

const SpinRewardTierDisplay: React.FC<SpinRewardTierDisplayProps> = ({ 
  rewards, 
  selectedTier,
  className = '' 
}) => {
  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze':
        return 'bg-gradient-to-r from-amber-600 to-amber-800';
      case 'silver':
        return 'bg-gradient-to-r from-gray-400 to-gray-600';
      case 'gold':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'diamond':
        return 'bg-gradient-to-r from-blue-400 to-purple-600';
      case 'legendary':
        return 'bg-gradient-to-r from-purple-500 to-pink-600';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-700';
    }
  };

  const getRarityText = (probability: number) => {
    if (probability >= 0.4) return 'Common';
    if (probability >= 0.25) return 'Uncommon';
    if (probability >= 0.15) return 'Rare';
    if (probability >= 0.05) return 'Epic';
    return 'Legendary';
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {rewards.map((reward, index) => {
        const isSelected = selectedTier === reward.tier;
        const tierColor = getTierColor(reward.tier);
        
        return (
          <div
            key={index}
            className={`
              relative p-4 rounded-xl border-2 transition-all duration-500 transform
              ${tierColor}
              ${isSelected 
                ? 'border-white scale-110 z-10 shadow-2xl animate-pulse' 
                : 'border-transparent hover:border-white/30'
              }
              backdrop-blur-sm
            `}
            style={{
              boxShadow: isSelected 
                ? `0 0 30px rgba(255, 255, 255, 0.8), 0 0 60px rgba(255, 255, 255, 0.6), 0 0 90px rgba(255, 255, 255, 0.4)`
                : 'none'
            }}
          >
            {/* Tier Badge */}
            <div className="flex items-center justify-between mb-3">
              <Badge 
                variant="outline" 
                className="text-white border-white/50 bg-black/20 font-bold uppercase tracking-wider"
              >
                {reward.tier}
              </Badge>
              <Badge 
                variant="secondary" 
                className="text-xs bg-white/20 text-white border-white/30"
              >
                {getRarityText(reward.probability)}
              </Badge>
            </div>

            {/* Crypto Info */}
            <div className="flex items-center gap-3 mb-3">
              <CryptoLogo
                logo_url={reward.crypto.logo_url}
                name={reward.crypto.name}
                symbol={reward.crypto.symbol}
                size="md"
                className="ring-2 ring-white/50"
              />
              <div>
                <p className="font-bold text-white text-lg">
                  {reward.amount.toFixed(8)} {reward.crypto.symbol.toUpperCase()}
                </p>
                <p className="text-white/80 text-sm">
                  {formatCurrency(reward.usdValue, { currency: 'EUR' })}
                </p>
              </div>
            </div>

            {/* Multiplier & Probability */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-sm">Multiplier:</span>
                <span className="text-white font-bold">{reward.multiplier}x</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-sm">Chance:</span>
                <span className="text-white font-bold">{(reward.probability * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Selected Indicator */}
            {isSelected && (
              <div className="absolute -top-2 -right-2">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            )}

            {/* Enhanced glow effect overlay for selected items */}
            {isSelected && (
              <>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent via-white/10 to-white/20 pointer-events-none animate-pulse"></div>
                <div className="absolute inset-0 rounded-xl animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SpinRewardTierDisplay;
