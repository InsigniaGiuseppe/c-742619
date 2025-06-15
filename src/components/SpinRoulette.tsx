
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CryptoLogo from '@/components/CryptoLogo';

interface SpinItem {
  id: string;
  crypto: {
    name: string;
    symbol: string;
    logo_url?: string;
  };
  amount: number;
  tier: string;
}

interface SpinRouletteProps {
  items: SpinItem[];
  isSpinning: boolean;
  winningItem?: SpinItem;
  onSpinComplete?: () => void;
}

const SpinRoulette: React.FC<SpinRouletteProps> = ({
  items,
  isSpinning,
  winningItem,
  onSpinComplete
}) => {
  const [currentItems, setCurrentItems] = useState<SpinItem[]>([]);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (isSpinning && winningItem) {
      // Generate roulette items with winning item positioned correctly
      const totalItems = 50;
      const winningIndex = Math.floor(totalItems * 0.75); // Position winner near the end
      const generatedItems: SpinItem[] = [];

      for (let i = 0; i < totalItems; i++) {
        if (i === winningIndex) {
          generatedItems.push(winningItem);
        } else {
          const randomItem = items[Math.floor(Math.random() * items.length)];
          generatedItems.push({
            ...randomItem,
            id: `${randomItem.id}-${i}`,
            amount: randomItem.amount * (0.5 + Math.random() * 1.5) // Vary amounts
          });
        }
      }

      setCurrentItems(generatedItems);
      setAnimationKey(prev => prev + 1);
    }
  }, [isSpinning, winningItem, items]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'common': return 'border-gray-400 bg-gray-100';
      case 'rare': return 'border-blue-400 bg-blue-100';
      case 'epic': return 'border-purple-400 bg-purple-100';
      default: return 'border-gray-400 bg-gray-100';
    }
  };

  return (
    <div className="relative w-full h-32 overflow-hidden bg-gray-900 rounded-lg border-2 border-gray-700">
      {/* Selection indicator */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20">
        <div className="w-1 h-32 bg-red-500 shadow-lg"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500"></div>
      </div>

      {/* Roulette container */}
      <div className="flex items-center h-full">
        <AnimatePresence>
          {isSpinning && (
            <motion.div
              key={animationKey}
              className="flex items-center space-x-2 pl-8"
              initial={{ x: '100%' }}
              animate={{ 
                x: `calc(-75% - ${currentItems.length * 120}px)` 
              }}
              transition={{
                duration: 3,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              onAnimationComplete={onSpinComplete}
            >
              {currentItems.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className={`
                    flex flex-col items-center justify-center w-28 h-28 rounded-lg border-2 p-2
                    ${getTierColor(item.tier)}
                  `}
                >
                  <CryptoLogo
                    symbol={item.crypto.symbol}
                    logo_url={item.crypto.logo_url}
                    name={item.crypto.name}
                    size="sm"
                    className="mb-1"
                  />
                  <div className="text-xs font-bold text-center">
                    {item.amount.toFixed(6)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {item.crypto.symbol}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Static display when not spinning */}
        {!isSpinning && (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center text-gray-400">
              <div className="text-lg font-semibold mb-2">Ready to Spin!</div>
              <div className="text-sm">Place your bet and spin to win crypto rewards</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpinRoulette;
