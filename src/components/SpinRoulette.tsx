import React, { useEffect, useRef, useState } from 'react';
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

// Simple card width config
const CARD_WIDTH = 120;
const CARD_MARGIN = 8;
const TOTAL_CARD_WIDTH = CARD_WIDTH + CARD_MARGIN;
const VISIBLE_CARDS = 7;
// Number of placeholder cards placed before and after the winner
// Lowered a bit to reduce initial network requests
const GHOST_CARDS = 12;

const getTierGlow = (tier: string) => {
  switch (tier) {
    case 'common': 
      return 'shadow-[0_0_8px_rgba(156,163,175,0.4)]';
    case 'rare': 
      return 'shadow-[0_0_12px_rgba(34,197,94,0.8)]';
    case 'epic': 
      return 'shadow-[0_0_16px_rgba(168,85,247,0.9)]';
    case 'legendary': 
      return 'shadow-[0_0_20px_rgba(255,215,0,1)]';
    case 'loss':
      return 'shadow-[0_0_10px_rgba(239,68,68,0.7)]';
    default: 
      return '';
  }
};

const getTierBgColor = (tier: string) => {
  switch (tier) {
    case 'common': 
      return 'bg-gray-700/50 border border-gray-500/30';
    case 'rare': 
      return 'bg-green-700/50 border border-green-500/50';
    case 'epic': 
      return 'bg-purple-700/50 border border-purple-500/50';
    case 'legendary': 
      return 'bg-yellow-700/50 border border-yellow-500/50';
    case 'loss':
      return 'bg-red-700/50 border border-red-500/50';
    default: 
      return 'bg-gray-700/50 border border-gray-500/30';
  }
};

const buildCardsTrack = (
  isSpinning: boolean,
  all: SpinItem[],
  winning: SpinItem | undefined
): { cards: SpinItem[]; winnerIndex: number } => {
  if (!isSpinning || !winning) return { cards: [], winnerIndex: 0 };

  const surround = [];
  // Add more variety and ensure smooth distribution
  for (let i = 0; i < GHOST_CARDS; i++) {
    // Mix items to avoid repetitive patterns
    const randomIndex = Math.floor(Math.random() * all.length);
    surround.push({
      ...all[randomIndex],
      // Use stable id so the same element can be reused between spins
      id: `ghost-${i}`
    });
  }
  
  const cards = [
    ...surround,
    { ...winning, id: 'winner' },
    ...surround
  ];
  
  return { cards, winnerIndex: GHOST_CARDS };
};

const SpinRoulette: React.FC<SpinRouletteProps> = ({
  items,
  isSpinning,
  winningItem,
  onSpinComplete
}) => {
  const [cards, setCards] = useState<SpinItem[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    if (isSpinning && winningItem && items.length > 0) {
      const { cards: fullTrack, winnerIndex } = buildCardsTrack(true, items, winningItem);
      setCards(fullTrack);

      // Small delay to ensure DOM is ready
      requestAnimationFrame(() => {
        if (!sliderRef.current || !containerRef.current) return;

        const containerWidth = containerRef.current.offsetWidth;
        const winnerPos = winnerIndex * TOTAL_CARD_WIDTH + CARD_WIDTH/2;
        
        // Calculate positions
        const startOffset = winnerPos + (GHOST_CARDS * TOTAL_CARD_WIDTH * 0.8); // Start further right
        const endOffset = winnerPos - containerWidth/2;

        // Set initial position instantly
        sliderRef.current.style.transition = 'none';
        sliderRef.current.style.transform = `translateX(-${startOffset}px)`;
        
        // Force layout recalculation
        void sliderRef.current.offsetHeight;

        // Start smooth animation
        requestAnimationFrame(() => {
          if (!sliderRef.current) return;
          
          // Enhanced smooth animation with custom easing
          sliderRef.current.style.transition = 'transform 3s cubic-bezier(0.17, 0.67, 0.16, 0.99)';
          sliderRef.current.style.transform = `translateX(-${endOffset}px)`;
          sliderRef.current.style.willChange = 'transform';
          setIsAnimating(true);

          // Animation complete
          animationTimeoutRef.current = setTimeout(() => {
            setIsAnimating(false);
            if (sliderRef.current) {
              sliderRef.current.style.willChange = 'auto';
            }
            onSpinComplete?.();
          }, 3000);
        });
      });
    } else {
      // Reset state when not spinning
      setCards([]);
      setIsAnimating(false);
      if (sliderRef.current) {
        sliderRef.current.style.transition = 'none';
        sliderRef.current.style.transform = 'translateX(0)';
      }
    }

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [isSpinning, winningItem, items, onSpinComplete]);

  return (
    <div className="relative w-full mb-6"> {/* Added margin bottom */}
      <div
        ref={containerRef}
        className="relative w-full h-40 overflow-hidden bg-gradient-to-r from-gray-900 via-black to-gray-900 rounded-xl border-2 border-green-400/50"
        style={{
          // Add subtle glow during animation
          boxShadow: isAnimating ? '0 0 30px rgba(34, 197, 94, 0.3)' : 'none'
        }}
      >
        {/* Center marker with enhanced visibility */}
        <div
          className="absolute top-0 left-1/2 w-1 h-full bg-gradient-to-b from-green-300 to-green-500 z-30"
          style={{
            transform: "translateX(-50%)",
            boxShadow: "0 0 15px rgba(34, 197, 94, 1)",
          }}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-green-400"></div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-l-transparent border-r-transparent border-t-green-400"></div>
        </div>

        <div className="flex items-center h-full relative">
          {(isSpinning && cards.length > 0) ? (
            <div
              ref={sliderRef}
              className="flex items-center h-full absolute"
              style={{
                left: 0,
                top: 0,
                // GPU acceleration for smoother animation
                transform: 'translateX(0)',
                backfaceVisibility: 'hidden',
                perspective: 1000
              }}
            >
              {cards.map((card, idx) => {
                const isWinner = winningItem && card.id === 'winner';
                const glowClass = getTierGlow(card.tier);
                const bgClass = getTierBgColor(card.tier);

                return (
                  <div
                    key={card.id}
                    className={`flex-shrink-0 flex flex-col items-center justify-center p-2 transition-all duration-300 ${
                      isWinner && isAnimating ? 'scale-110' : ''
                    }`}
                    style={{
                      width: CARD_WIDTH,
                      margin: `0 ${CARD_MARGIN/2}px`,
                      // Add slight opacity variation for depth effect
                      opacity: isAnimating ? (isWinner ? 1 : 0.85) : 1
                    }}
                  >
                    <div className={`relative rounded-lg p-3 ${bgClass} ${glowClass} ${
                      isAnimating ? 'transition-all duration-300' : ''
                    }`}>
                      {card.crypto.symbol === "LOSS" ? (
                        <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-lg">
                          ✗
                        </div>
                      ) : (
                        <CryptoLogo
                          symbol={card.crypto?.symbol || "UNK"}
                          logo_url={card.crypto?.logo_url}
                          name={card.crypto?.name || "Unknown"}
                          size="lg"
                          className="w-12 h-12"
                        />
                      )}
                      {isWinner && isAnimating && (
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-yellow-400/40 to-transparent pointer-events-none animate-pulse"></div>
                      )}
                    </div>
                    <div className="text-center mt-1">
                      <div className="text-xs font-bold text-white">
                        {card.crypto.symbol === "LOSS" ? "0.00" : card.amount.toFixed(4)}
                      </div>
                      <div className="text-xs text-gray-300">
                        {card.crypto.symbol === "LOSS" ? "LOSS" : card.crypto.symbol.toUpperCase()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Preview mode with subtle animation
            <div className="flex items-center justify-center w-full h-full">
              <div className="flex justify-center gap-6">
                {items.slice(0, 5).map((item, i) => {
                  const glowClass = getTierGlow(item.tier);
                  const bgClass = getTierBgColor(item.tier);
                  return (
                    <div 
                      key={item.id} 
                      className="flex flex-col items-center transform transition-transform hover:scale-105"
                    >
                      <div className={`rounded-lg p-3 ${bgClass} ${glowClass} transition-all duration-300`}>
                        {item.crypto.symbol === "LOSS" ? (
                          <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-lg">
                            ✗
                          </div>
                        ) : (
                          <CryptoLogo
                            symbol={item.crypto?.symbol || "UNK"}
                            logo_url={item.crypto?.logo_url}
                            name={item.crypto?.name || "Unknown"}
                            size="lg"
                            className="w-12 h-12"
                          />
                        )}
                      </div>
                      <div className="text-xs text-white font-medium text-center mt-2">
                        {item.crypto.symbol === "LOSS" ? "LOSS" : item.crypto.symbol.toUpperCase()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced gradients with blur effect during animation */}
        <div className={`absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-black via-black/90 to-transparent pointer-events-none z-20 transition-all duration-300 ${
          isAnimating ? 'backdrop-blur-[1px]' : ''
        }`}></div>
        <div className={`absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-black via-black/90 to-transparent pointer-events-none z-20 transition-all duration-300 ${
          isAnimating ? 'backdrop-blur-[1px]' : ''
        }`}></div>
      </div>
    </div>
  );
};

export default SpinRoulette;