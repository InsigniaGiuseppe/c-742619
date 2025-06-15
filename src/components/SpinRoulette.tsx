
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

  const getTierColors = (tier: string) => {
    switch (tier) {
      case 'common': 
        return {
          border: 'border-gray-400',
          bg: 'bg-gradient-to-br from-gray-700/40 to-gray-900/60',
          glow: 'shadow-[0_0_20px_rgba(156,163,175,0.4)]',
          ringColor: 'ring-gray-400/50'
        };
      case 'rare': 
        return {
          border: 'border-blue-400',
          bg: 'bg-gradient-to-br from-blue-600/30 to-blue-900/60',
          glow: 'shadow-[0_0_25px_rgba(59,130,246,0.6)]',
          ringColor: 'ring-blue-400/60'
        };
      case 'epic': 
        return {
          border: 'border-purple-400',
          bg: 'bg-gradient-to-br from-purple-600/30 to-purple-900/60',
          glow: 'shadow-[0_0_30px_rgba(147,51,234,0.8)]',
          ringColor: 'ring-purple-400/70'
        };
      default: 
        return {
          border: 'border-gray-400',
          bg: 'bg-gradient-to-br from-gray-700/40 to-gray-900/60',
          glow: 'shadow-[0_0_20px_rgba(156,163,175,0.4)]',
          ringColor: 'ring-gray-400/50'
        };
    }
  };

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
                x: `calc(-85% - ${currentItems.length * 140}px)` 
              }}
              transition={{
                duration: 5,
                ease: [0.25, 0.1, 0.25, 1],
                type: "tween"
              }}
              onAnimationComplete={() => {
                setTimeout(() => {
                  onSpinComplete?.();
                }, 800);
              }}
            >
              {currentItems.map((item, index) => {
                const colors = getTierColors(item.tier);
                const isWinner = item.id.startsWith('winner-');
                
                return (
                  <motion.div
                    key={`${item.id}-${index}`}
                    className={`
                      relative flex flex-col items-center justify-center w-36 h-32 rounded-xl border-2 p-3
                      ${colors.border} ${colors.bg} ${colors.glow}
                      ${isWinner ? `ring-4 ${colors.ringColor} ring-opacity-80` : ''}
                      backdrop-blur-sm
                    `}
                    initial={{ 
                      y: Math.random() * 10 - 5,
                      rotateZ: Math.random() * 6 - 3
                    }}
                    animate={{
                      y: [0, -8, 0],
                      rotateZ: [0, 2, -2, 0],
                      scale: isWinner ? [1, 1.08, 1] : [1, 1.02, 1]
                    }}
                    transition={{
                      duration: 2 + Math.random(),
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.1
                    }}
                  >
                    {/* Tier indicator */}
                    <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full ${
                      item.tier === 'epic' ? 'bg-purple-500 text-white shadow-[0_0_10px_rgba(147,51,234,0.6)]' :
                      item.tier === 'rare' ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.6)]' :
                      'bg-gray-500 text-white shadow-[0_0_10px_rgba(156,163,175,0.4)]'
                    }`}>
                      {item.tier.charAt(0).toUpperCase()}
                    </div>

                    {/* Crypto logo with enhanced ring */}
                    <div className={`relative ring-2 ${colors.ringColor} rounded-full p-1 mb-2`}>
                      <CryptoLogo
                        symbol={item.crypto?.symbol || 'UNK'}
                        logo_url={item.crypto?.logo_url}
                        name={item.crypto?.name || 'Unknown'}
                        size="md"
                        className="drop-shadow-lg"
                      />
                    </div>

                    {/* Amount and symbol */}
                    <div className="text-center">
                      <div className="text-sm font-bold text-white drop-shadow-md">
                        {item.amount.toFixed(6)}
                      </div>
                      <div className="text-xs text-gray-200 font-medium">
                        {(item.crypto?.symbol || 'UNK').toUpperCase()}
                      </div>
                    </div>

                    {/* Enhanced tier-based glow effects */}
                    {item.tier === 'epic' && (
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-purple-400/20 pointer-events-none"
                        animate={{
                          opacity: [0.2, 0.8, 0.2],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}

                    {item.tier === 'rare' && (
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-blue-400/15 pointer-events-none"
                        animate={{
                          opacity: [0.1, 0.5, 0.1],
                          scale: [1, 1.03, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}

                    {/* Winner highlight effect */}
                    {isWinner && (
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-gradient-to-t from-yellow-400/30 via-transparent to-yellow-400/30 pointer-events-none"
                        animate={{
                          opacity: [0.3, 0.7, 0.3],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 0.8,
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
                className="text-xl font-bold mb-3 text-white"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎰 Ready to Spin!
              </motion.div>
              <div className="text-sm mb-4 text-gray-300">Place your bet and spin to win crypto rewards</div>
              
              {/* Enhanced preview items */}
              <div className="flex justify-center gap-3">
                {items.slice(0, 3).map((item, index) => {
                  const colors = getTierColors(item.tier);
                  return (
                    <motion.div 
                      key={item.id} 
                      className={`relative w-20 h-20 rounded-lg border-2 ${colors.border} ${colors.bg} ${colors.glow} flex flex-col items-center justify-center p-2`}
                      animate={{ 
                        y: [0, -5, 0],
                        rotateY: [0, 5, 0]
                      }}
                      transition={{ 
                        duration: 2 + index * 0.5, 
                        repeat: Infinity,
                        delay: index * 0.3
                      }}
                    >
                      <div className={`ring-1 ${colors.ringColor} rounded-full p-1 mb-1`}>
                        <CryptoLogo
                          symbol={item.crypto?.symbol || 'UNK'}
                          logo_url={item.crypto?.logo_url}
                          name={item.crypto?.name || 'Unknown'}
                          size="sm"
                        />
                      </div>
                      <div className="text-xs text-white font-medium">{item.crypto?.symbol || 'UNK'}</div>
                    </motion.div>
                  );
                })}
              </div>
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
