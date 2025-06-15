
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
      const winningIndex = Math.floor(totalItems * 0.85); // Position winner near the end
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
            amount: randomItem.amount * (0.3 + Math.random() * 1.4)
          });
        }
      }

      setCurrentItems(generatedItems);
      setAnimationKey(prev => prev + 1);
    }
  }, [isSpinning, winningItem, items]);

  const getTierGlow = (tier: string) => {
    switch (tier) {
      case 'common': 
        return 'drop-shadow-[0_0_20px_rgba(156,163,175,0.8)]';
      case 'rare': 
        return 'drop-shadow-[0_0_25px_rgba(59,130,246,0.9)]';
      case 'epic': 
        return 'drop-shadow-[0_0_30px_rgba(147,51,234,1)]';
      default: 
        return 'drop-shadow-[0_0_20px_rgba(156,163,175,0.8)]';
    }
  };

  const getTierRingColor = (tier: string) => {
    switch (tier) {
      case 'common': 
        return 'ring-gray-400/60';
      case 'rare': 
        return 'ring-blue-400/80';
      case 'epic': 
        return 'ring-purple-400/90';
      default: 
        return 'ring-gray-400/60';
    }
  };

  const cardWidth = 80; // Width of each crypto logo + spacing
  const gap = 16; // Gap between items

  return (
    <div className="relative w-full h-40 overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-white/10">
      {/* Enhanced selection indicator */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-30">
        <div className="w-1 h-40 bg-gradient-to-b from-red-400 via-red-500 to-red-600 shadow-[0_0_15px_rgba(239,68,68,0.8)]"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-12 border-l-transparent border-r-transparent border-b-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]"></div>
      </div>

      {/* Roulette container */}
      <div className="flex items-center h-full">
        <AnimatePresence>
          {isSpinning && currentItems.length > 0 && (
            <motion.div
              key={animationKey}
              className="flex items-center gap-4 pl-8"
              initial={{ x: '100%' }}
              animate={{ 
                x: `calc(-50% - ${(cardWidth + gap) * 42}px)` // Calculate exact position for winner
              }}
              transition={{
                duration: 4,
                ease: [0.25, 0.1, 0.0, 1], // Custom cubic-bezier for realistic deceleration
                type: "tween"
              }}
              onAnimationComplete={() => {
                setTimeout(() => {
                  onSpinComplete?.();
                }, 500);
              }}
            >
              {currentItems.map((item, index) => {
                const glowClass = getTierGlow(item.tier);
                const ringClass = getTierRingColor(item.tier);
                const isWinner = item.id.startsWith('winner-');
                
                return (
                  <motion.div
                    key={`${item.id}-${index}`}
                    className="relative flex flex-col items-center justify-center"
                    style={{ width: cardWidth }}
                    initial={{ 
                      y: Math.random() * 8 - 4,
                      rotateZ: Math.random() * 4 - 2
                    }}
                    animate={{
                      y: [0, -6, 0],
                      rotateZ: [0, 1, -1, 0],
                      scale: isWinner ? [1, 1.15, 1] : [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 1.5 + Math.random(),
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.05
                    }}
                  >
                    {/* Crypto logo with tier-based glow and ring */}
                    <div className={`relative ring-3 ${ringClass} rounded-full p-2 mb-2 ${glowClass}`}>
                      <CryptoLogo
                        symbol={item.crypto?.symbol || 'UNK'}
                        logo_url={item.crypto?.logo_url}
                        name={item.crypto?.name || 'Unknown'}
                        size="lg"
                        className="drop-shadow-lg"
                      />
                      
                      {/* Enhanced tier-based particle effects */}
                      {item.tier === 'epic' && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-purple-400/30 pointer-events-none"
                          animate={{
                            opacity: [0.3, 0.8, 0.3],
                            scale: [1, 1.2, 1]
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      )}

                      {item.tier === 'rare' && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-blue-400/25 pointer-events-none"
                          animate={{
                            opacity: [0.2, 0.6, 0.2],
                            scale: [1, 1.15, 1]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      )}

                      {/* Winner highlight effect */}
                      {isWinner && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-gradient-to-t from-yellow-400/40 via-transparent to-yellow-400/40 pointer-events-none"
                          animate={{
                            opacity: [0.4, 0.8, 0.4],
                            scale: [1, 1.3, 1]
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      )}
                    </div>

                    {/* Amount and symbol below the logo */}
                    <div className="text-center">
                      <div className="text-xs font-bold text-white drop-shadow-md">
                        {item.amount.toFixed(4)}
                      </div>
                      <div className="text-xs text-gray-200 font-medium">
                        {(item.crypto?.symbol || 'UNK').toUpperCase()}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Static display when not spinning - simplified */}
        {!isSpinning && (
          <div className="flex items-center justify-center w-full h-full">
            <div className="flex justify-center gap-6">
              {items.slice(0, 5).map((item, index) => {
                const glowClass = getTierGlow(item.tier);
                const ringClass = getTierRingColor(item.tier);
                return (
                  <motion.div 
                    key={item.id} 
                    className="relative flex flex-col items-center"
                    animate={{ 
                      y: [0, -8, 0],
                      rotateY: [0, 10, 0]
                    }}
                    transition={{ 
                      duration: 2 + index * 0.3, 
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  >
                    <div className={`ring-2 ${ringClass} rounded-full p-2 mb-2 ${glowClass}`}>
                      <CryptoLogo
                        symbol={item.crypto?.symbol || 'UNK'}
                        logo_url={item.crypto?.logo_url}
                        name={item.crypto?.name || 'Unknown'}
                        size="md"
                      />
                    </div>
                    <div className="text-xs text-white font-medium text-center">
                      {item.crypto?.symbol || 'UNK'}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced gradient overlays */}
      <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-gray-900 via-gray-900/50 to-transparent pointer-events-none z-20"></div>
      <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-gray-900 via-gray-900/50 to-transparent pointer-events-none z-20"></div>
    </div>
  );
};

export default SpinRoulette;
