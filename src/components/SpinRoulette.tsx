
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
  const [rouletteCards, setRouletteCards] = useState<SpinItem[]>([]);
  const [animationKey, setAnimationKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Card dimensions
  const CARD_WIDTH = 120;
  const CARD_MARGIN = 8;
  const TOTAL_CARD_WIDTH = CARD_WIDTH + CARD_MARGIN;
  const TOTAL_CARDS = 60;
  const WINNING_CARD_INDEX = 45;

  useEffect(() => {
    if (isSpinning && winningItem && items.length > 0) {
      console.log('[SpinRoulette] Generating cards for spin animation');
      
      const cards: SpinItem[] = [];
      
      for (let i = 0; i < TOTAL_CARDS; i++) {
        if (i === WINNING_CARD_INDEX) {
          cards.push({
            ...winningItem,
            id: `winner-${i}`,
          });
        } else {
          const randomItem = items[Math.floor(Math.random() * items.length)];
          cards.push({
            ...randomItem,
            id: `card-${i}`,
            amount: randomItem.amount * (0.5 + Math.random() * 1.5)
          });
        }
      }

      setRouletteCards(cards);
      setAnimationKey(prev => prev + 1);
    }
  }, [isSpinning, winningItem, items]);

  const getTierGlow = (tier: string) => {
    switch (tier) {
      case 'common': 
        return 'drop-shadow-[0_0_8px_rgba(156,163,175,0.4)]';
      case 'rare': 
        return 'drop-shadow-[0_0_12px_rgba(34,197,94,0.8)]';
      case 'epic': 
        return 'drop-shadow-[0_0_16px_rgba(168,85,247,0.9)]';
      case 'legendary': 
        return 'drop-shadow-[0_0_20px_rgba(255,215,0,1)]';
      case 'loss':
        return 'drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]';
      default: 
        return '';
    }
  };

  const getTierBgGlow = (tier: string) => {
    switch (tier) {
      case 'common': 
        return 'bg-gray-400/10';
      case 'rare': 
        return 'bg-green-400/20 ring-1 ring-green-400/30';
      case 'epic': 
        return 'bg-purple-400/25 ring-1 ring-purple-400/40';
      case 'legendary': 
        return 'bg-yellow-400/30 ring-2 ring-yellow-400/50';
      case 'loss':
        return 'bg-red-400/20 ring-1 ring-red-400/30';
      default: 
        return 'bg-gray-400/10';
    }
  };

  const calculateTranslation = () => {
    if (!containerRef.current) return 0;
    
    const containerWidth = containerRef.current.offsetWidth;
    const containerCenter = containerWidth / 2;
    const winningCardCenter = WINNING_CARD_INDEX * TOTAL_CARD_WIDTH + (CARD_WIDTH / 2);
    
    return containerCenter - winningCardCenter;
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-40 overflow-hidden bg-gradient-to-r from-gray-900 via-black to-gray-900 rounded-xl border border-white/10"
    >
      {/* Center selection marker */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
        <div className="w-1 h-40 bg-gradient-to-b from-red-400 via-red-500 to-red-600 shadow-[0_0_15px_rgba(239,68,68,0.8)]">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-red-500"></div>
        </div>
      </div>

      {/* Roulette track */}
      <div className="flex items-center h-full overflow-hidden">
        {isSpinning && rouletteCards.length > 0 ? (
          <motion.div
            key={animationKey}
            className="flex items-center h-full"
            initial={{ x: window.innerWidth }}
            animate={{ 
              x: calculateTranslation()
            }}
            transition={{
              duration: 4,
              ease: [0.25, 0.1, 0.25, 1],
              type: "tween"
            }}
            onAnimationComplete={() => {
              setTimeout(() => {
                onSpinComplete?.();
              }, 500);
            }}
          >
            {rouletteCards.map((card, index) => {
              const glowClass = getTierGlow(card.tier);
              const bgGlowClass = getTierBgGlow(card.tier);
              const isWinner = index === WINNING_CARD_INDEX;
              
              return (
                <div
                  key={card.id}
                  className="flex flex-col items-center justify-center flex-shrink-0"
                  style={{ 
                    width: CARD_WIDTH,
                    marginRight: CARD_MARGIN,
                    minWidth: CARD_WIDTH
                  }}
                >
                  <div className={`relative rounded-xl p-3 ${bgGlowClass} ${glowClass} transition-all duration-300`}>
                    {card.crypto.symbol === 'LOSS' ? (
                      <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-lg">
                        ✗
                      </div>
                    ) : (
                      <CryptoLogo
                        symbol={card.crypto?.symbol || 'UNK'}
                        logo_url={card.crypto?.logo_url}
                        name={card.crypto?.name || 'Unknown'}
                        size="lg"
                        className="w-12 h-12"
                      />
                    )}
                    
                    {isWinner && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-yellow-400/40 via-transparent to-yellow-400/40 pointer-events-none animate-pulse"></div>
                    )}

                    {card.tier === 'legendary' && (
                      <div className="absolute inset-0 rounded-xl bg-yellow-400/20 pointer-events-none animate-pulse"></div>
                    )}
                    {card.tier === 'epic' && (
                      <div className="absolute inset-0 rounded-xl bg-purple-400/15 pointer-events-none animate-pulse"></div>
                    )}
                    {card.tier === 'rare' && (
                      <div className="absolute inset-0 rounded-xl bg-green-400/15 pointer-events-none animate-pulse"></div>
                    )}
                  </div>

                  <div className="text-center mt-2">
                    <div className="text-xs font-bold text-white">
                      {card.crypto.symbol === 'LOSS' ? '0.00' : card.amount.toFixed(4)}
                    </div>
                    <div className="text-xs text-gray-300 font-medium">
                      {card.crypto.symbol === 'LOSS' ? 'LOSS' : card.crypto.symbol.toUpperCase()}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <div className="flex justify-center gap-6">
              {items.slice(0, 5).map((item, index) => {
                const glowClass = getTierGlow(item.tier);
                const bgGlowClass = getTierBgGlow(item.tier);
                
                return (
                  <motion.div 
                    key={item.id} 
                    className="flex flex-col items-center"
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
                    <div className={`rounded-xl p-3 ${bgGlowClass} ${glowClass}`}>
                      {item.crypto.symbol === 'LOSS' ? (
                        <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-lg">
                          ✗
                        </div>
                      ) : (
                        <CryptoLogo
                          symbol={item.crypto?.symbol || 'UNK'}
                          logo_url={item.crypto?.logo_url}
                          name={item.crypto?.name || 'Unknown'}
                          size="md"
                        />
                      )}
                    </div>
                    <div className="text-xs text-white font-medium text-center mt-2">
                      {item.crypto.symbol === 'LOSS' ? 'LOSS' : item.crypto.symbol.toUpperCase()}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Gradient overlays for depth */}
      <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none z-20"></div>
      <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-black via-black/80 to-transparent pointer-events-none z-20"></div>
    </div>
  );
};

export default SpinRoulette;
