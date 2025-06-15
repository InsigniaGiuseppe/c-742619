
import React, { useState, useEffect, useRef } from 'react';
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
  const [cards, setCards] = useState<SpinItem[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animation/display constants
  const CARD_WIDTH = 120;
  const CARD_MARGIN = 8;
  const TOTAL_CARD_WIDTH = CARD_WIDTH + CARD_MARGIN;
  const TOTAL_CARDS = 61; // Make odd to allow for perfect middle
  const WINNING_INDEX = Math.floor(TOTAL_CARDS / 2);

  // NEW: Store calculated positions for animation
  const [animationOffsets, setAnimationOffsets] = useState<{ startOffset: number; endOffset: number }>({
    startOffset: 0,
    endOffset: 0,
  });

  useEffect(() => {
    if (isSpinning && winningItem && items.length > 0) {
      if (sliderTrackRef.current) {
        sliderTrackRef.current.style.transition = "none";
        sliderTrackRef.current.style.transform = "translateX(0px)";
      }

      const generatedCards: SpinItem[] = [];
      for (let i = 0; i < TOTAL_CARDS; i++) {
        if (i === WINNING_INDEX) {
          generatedCards.push({ ...winningItem, id: `winner-${i}` });
        } else {
          const randomItem = items[Math.floor(Math.random() * items.length)];
          generatedCards.push({
            ...randomItem,
            id: `card-${i}`,
            amount: randomItem.amount * (0.3 + Math.random() * 2)
          });
        }
      }
      setCards(generatedCards);

      // NEW: Calculate start & end offsets for animation
      setTimeout(() => {
        const container = containerRef.current;
        if (!container) return;
        const containerWidth = container.offsetWidth;
        const cardOffset = CARD_WIDTH / 2;
        const winningCardAnchor = WINNING_INDEX * TOTAL_CARD_WIDTH + cardOffset;
        const center = containerWidth / 2;
        const endOffset = Math.round(winningCardAnchor - center);

        // Start offset: extra "pre-slide" so that cards start well off-screen
        // Let's show ~15 cards sliding in before winner arrives
        const preSlideCards = 15;
        const startOffset = endOffset - preSlideCards * TOTAL_CARD_WIDTH;

        setAnimationOffsets({ startOffset, endOffset });

        // Call animation
        startSpinAnimation(startOffset, endOffset);
      }, 150); // Give DOM time to render cards
    }
    // eslint-disable-next-line
  }, [isSpinning, winningItem, items]);

  function startSpinAnimation(startOffset: number, endOffset: number) {
    if (!sliderTrackRef.current) return;
    setIsAnimating(true);

    // 1. Set initial offset with no transition
    sliderTrackRef.current.style.transition = "none";
    sliderTrackRef.current.style.transform = `translateX(-${startOffset}px)`;

    // 2. Animate to final offset with a transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        sliderTrackRef.current!.style.transition = "transform 3.5s cubic-bezier(0.25,0.1,0.25,1)";
        sliderTrackRef.current!.style.transform = `translateX(-${endOffset}px)`;
      });
    });

    // Logging for dev
    console.log('[SpinRoulette] Animation: startOffset', startOffset, 'endOffset', endOffset);

    // 3. After animation, finish
    setTimeout(() => {
      setIsAnimating(false);
      setTimeout(() => {
        onSpinComplete?.();
      }, 500);
    }, 3500);
  }

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

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="relative w-full h-36 overflow-hidden bg-gradient-to-r from-gray-900 via-black to-gray-900 rounded-xl border-2 border-green-400/50"
        style={{ position: "relative" }}
      >
        {/* Center marker */}
        <div
          className="absolute top-0 left-1/2 w-0.5 h-full bg-green-400 z-30"
          style={{
            transform: "translateX(-50%)",
            boxShadow: "0 0 10px rgba(34, 197, 94, 0.8)",
          }}
        >
          {/* Arrows */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-green-400"></div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-green-400"></div>
        </div>
        {/* Slider track */}
        <div className="flex items-center h-full">
          {isSpinning && cards.length > 0 ? (
            <div
              ref={sliderTrackRef}
              className="flex items-center h-full"
              style={{
                transition: "none",
                transform: `translateX(-${animationOffsets.startOffset}px)`,
                willChange: "transform",
              }}
            >
              {cards.map((card, index) => {
                const isWinner = index === WINNING_INDEX;
                const glowClass = getTierGlow(card.tier);
                const bgClass = getTierBgColor(card.tier);

                return (
                  <div
                    key={card.id}
                    className="flex-shrink-0 flex flex-col items-center justify-center p-2"
                    style={{
                      width: CARD_WIDTH,
                      marginRight: CARD_MARGIN / 2,
                      marginLeft: CARD_MARGIN / 2,
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
            // Static preview
            <div className="flex items-center justify-center w-full h-full">
              <div className="flex justify-center gap-6">
                {items.slice(0, 5).map((item, index) => {
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
