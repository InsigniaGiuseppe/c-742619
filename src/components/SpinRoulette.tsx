
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
      const totalItems = 60; // Increased for smoother animation
      const winningIndex = Math.floor(totalItems * 0.8); // Position winner later for better effect
      const generatedItems: SpinItem[] = [];

      for (let i = 0; i < totalItems; i++) {
        if (i === winningIndex) {
          generatedItems.push({
            ...winningItem,
            id: `winner-${winningItem.id}`,
          });
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

  const getTierColors = (tier: string) => {
    switch (tier) {
      case 'common': 
        return {
          border: 'border-gray-400',
          bg: 'bg-gradient-to-br from-gray-700/50 to-gray-800/50',
          glow: 'shadow-lg shadow-gray-400/20'
        };
      case 'rare': 
        return {
          border: 'border-blue-400',
          bg: 'bg-gradient-to-br from-blue-600/30 to-blue-800/50',
          glow: 'shadow-lg shadow-blue-400/40'
        };
      case 'epic': 
        return {
          border: 'border-purple-400',
          bg: 'bg-gradient-to-br from-purple-600/30 to-purple-800/50',
          glow: 'shadow-lg shadow-purple-400/40'
        };
      default: 
        return {
          border: 'border-gray-400',
          bg: 'bg-gradient-to-br from-gray-700/50 to-gray-800/50',
          glow: 'shadow-lg shadow-gray-400/20'
        };
    }
  };

  return (
    <div className="relative w-full h-32 overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-white/10">
      {/* Selection indicator with enhanced styling */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20">
        <div className="w-1 h-32 bg-gradient-to-b from-red-400 to-red-600 shadow-lg shadow-red-500/50"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-b-8 border-l-transparent border-r-transparent border-b-red-500 shadow-lg"></div>
      </div>

      {/* Roulette container */}
      <div className="flex items-center h-full">
        <AnimatePresence>
          {isSpinning && currentItems.length > 0 && (
            <motion.div
              key={animationKey}
              className="flex items-center space-x-3 pl-8"
              initial={{ x: '100%' }}
              animate={{ 
                x: `calc(-80% - ${currentItems.length * 130}px)` 
              }}
              transition={{
                duration: 4, // Longer duration for better effect
                ease: [0.25, 0.1, 0.25, 1], // Custom easing for realistic feel
                type: "tween"
              }}
              onAnimationComplete={() => {
                setTimeout(() => {
                  onSpinComplete?.();
                }, 500); // Delay to show the winning item
              }}
            >
              {currentItems.map((item, index) => {
                const colors = getTierColors(item.tier);
                const isWinner = item.id.startsWith('winner-');
                
                return (
                  <motion.div
                    key={`${item.id}-${index}`}
                    className={`
                      flex flex-col items-center justify-center w-32 h-28 rounded-lg border-2 p-2 relative
                      ${colors.border} ${colors.bg} ${colors.glow}
                      ${isWinner ? 'ring-2 ring-yellow-400 ring-opacity-75' : ''}
                    `}
                    animate={isWinner ? {
                      scale: [1, 1.05, 1],
                      rotateY: [0, 5, -5, 0]
                    } : {}}
                    transition={{
                      duration: 0.6,
                      repeat: isWinner ? 2 : 0,
                      delay: index * 0.02
                    }}
                  >
                    {/* Tier indicator */}
                    <div className={`absolute top-1 right-1 text-xs font-bold px-1 py-0.5 rounded ${
                      item.tier === 'epic' ? 'bg-purple-500 text-white' :
                      item.tier === 'rare' ? 'bg-blue-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {item.tier.charAt(0).toUpperCase()}
                    </div>

                    <CryptoLogo
                      symbol={item.crypto.symbol}
                      logo_url={item.crypto.logo_url}
                      name={item.crypto.name}
                      size="sm"
                      className="mb-1"
                    />
                    <div className="text-xs font-bold text-center text-white">
                      {item.amount.toFixed(6)}
                    </div>
                    <div className="text-xs text-gray-300">
                      {item.crypto.symbol}
                    </div>

                    {/* Animated glow effect for epic items */}
                    {item.tier === 'epic' && (
                      <motion.div
                        className="absolute inset-0 rounded-lg bg-purple-400/20"
                        animate={{
                          opacity: [0.2, 0.6, 0.2]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}

                    {/* Animated glow effect for rare items */}
                    {item.tier === 'rare' && (
                      <motion.div
                        className="absolute inset-0 rounded-lg bg-blue-400/15"
                        animate={{
                          opacity: [0.1, 0.4, 0.1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Static display when not spinning */}
        {!isSpinning && (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center text-muted-foreground">
              <motion.div 
                className="text-lg font-semibold mb-2"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Ready to Spin!
              </motion.div>
              <div className="text-sm">Place your bet and spin to win crypto rewards</div>
              
              {/* Preview items when not spinning */}
              <div className="flex justify-center gap-2 mt-4">
                {items.slice(0, 3).map((item, index) => {
                  const colors = getTierColors(item.tier);
                  return (
                    <div key={item.id} className={`w-16 h-16 rounded border ${colors.border} ${colors.bg} flex flex-col items-center justify-center p-1`}>
                      <CryptoLogo
                        symbol={item.crypto.symbol}
                        logo_url={item.crypto.logo_url}
                        name={item.crypto.name}
                        size="xs"
                      />
                      <div className="text-xs text-white">{item.crypto.symbol}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gradient overlays for edge effects */}
      <div className="absolute left-0 top-0 w-16 h-full bg-gradient-to-r from-gray-900 to-transparent pointer-events-none z-10"></div>
      <div className="absolute right-0 top-0 w-16 h-full bg-gradient-to-l from-gray-900 to-transparent pointer-events-none z-10"></div>
    </div>
  );
};

export default SpinRoulette;
