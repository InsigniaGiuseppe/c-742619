
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
const VISIBLE_CARDS = 7; // always odd for nice center alignment
const GHOST_CARDS = 14;  // number of random cards before and after for smooth entry/exit

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
  for (let i = 0; i < GHOST_CARDS; i++) {
    surround.push({ 
      ...all[Math.floor(Math.random() * all.length)], 
      id: `ghost-${i}-${Math.random()}`
    });
  }
  const cards = [
    ...surround,
    { ...winning, id: 'winner' },
    ...surround
  ];
  // Winner is at GHOST_CARDS index (centered after sliding)
  return { cards, winnerIndex: GHOST_CARDS };
};

const SpinRoulette: React.FC<SpinRouletteProps> = ({
  items,
  isSpinning,
  winningItem,
  onSpinComplete
}) => {
  const [cards, setCards] = useState<SpinItem[]>([]);
  const [animStyle, setAnimStyle] = useState<React.CSSProperties>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Always build track before animating
  useEffect(() => {
    if (isSpinning && winningItem && items.length > 0) {
      const { cards: fullTrack, winnerIndex } = buildCardsTrack(true, items, winningItem);
      setCards(fullTrack);

      // After rendering cards, trigger animation in next frame
      setTimeout(() => {
        if (!sliderRef.current || !containerRef.current) return;
        // compute starting offset (winner far right), then slide to center
        const containerWidth = containerRef.current.offsetWidth;
        const trackLength = fullTrack.length;
        const winnerPos = winnerIndex * TOTAL_CARD_WIDTH + CARD_WIDTH/2;
        // Start off screen right: center is at right edge, so winner is far right
        const startOffset = winnerPos - (containerWidth - CARD_WIDTH)/2 + GHOST_CARDS * TOTAL_CARD_WIDTH;
        // End at winner in center
        const endOffset = winnerPos - containerWidth/2;

        setAnimStyle({
          transition: 'none',
          transform: `translateX(-${startOffset}px)`,
        });

        setTimeout(() => {
          setAnimStyle({
            transition: 'transform 2.5s cubic-bezier(0.25,0.1,0.25,1)',
            transform: `translateX(-${endOffset}px)`,
            willChange: 'transform'
          });
          setIsAnimating(true);

          // Animation complete
          setTimeout(() => {
            setIsAnimating(false);
            onSpinComplete?.();
          }, 2550);
        }, 70);
      }, 25);
    } else {
      setCards([]);
      setIsAnimating(false);
      setAnimStyle({});
    }
    // eslint-disable-next-line
  }, [isSpinning, winningItem, items]);

  // Always render the slider track
  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="relative w-full h-36 overflow-hidden bg-gradient-to-r from-gray-900 via-black to-gray-900 rounded-xl border-2 border-green-400/50"
      >
        {/* Center marker */}
        <div
          className="absolute top-0 left-1/2 w-0.5 h-full bg-green-400 z-30"
          style={{
            transform: "translateX(-50%)",
            boxShadow: "0 0 10px rgba(34, 197, 94, 0.8)",
          }}
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-green-400"></div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-green-400"></div>
        </div>

        <div className="flex items-center h-full relative">
          {(isSpinning && cards.length > 0) ? (
            <div
              ref={sliderRef}
              className="flex items-center h-full"
              style={animStyle}
            >
              {cards.map((card, idx) => {
                const isWinner = winningItem && card.id === 'winner';
                const glowClass = getTierGlow(card.tier);
                const bgClass = getTierBgColor(card.tier);

                return (
                  <div
                    key={card.id}
                    className="flex-shrink-0 flex flex-col items-center justify-center p-2"
                    style={{
                      width: CARD_WIDTH,
                      margin: `0 ${CARD_MARGIN/2}px`,
                    }}
                  >
                    <div className={`relative rounded-lg p-3 ${bgClass} ${glowClass} transition-all duration-300`}>
                      {card.crypto.symbol === "LOSS" ? (
                        <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-lg">✗</div>
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
                        <div className="absolute inset-0 rounded-lg bg-yellow-400/30 pointer-events-none animate-pulse"></div>
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
            // Preview mode
            <div className="flex items-center justify-center w-full h-full">
              <div className="flex justify-center gap-6">
                {items.slice(0, 5).map((item, i) => {
                  const glowClass = getTierGlow(item.tier);
                  const bgClass = getTierBgColor(item.tier);
                  return (
                    <div key={item.id} className="flex flex-col items-center">
                      <div className={`rounded-lg p-3 ${bgClass} ${glowClass}`}>
                        {item.crypto.symbol === "LOSS" ? (
                          <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-lg">✗</div>
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

        {/* Gradients */}
        <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none z-20"></div>
        <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-black via-black/80 to-transparent pointer-events-none z-20"></div>
      </div>
    </div>
  );
};

export default SpinRoulette;
