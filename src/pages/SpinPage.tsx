import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useSpinGame } from "@/hooks/useSpinGame";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dice6 } from "lucide-react";
import SpinRoulette from "@/components/SpinRoulette";
import SpinResultModal from "@/components/SpinResultModal";
import BetControls from "@/components/spin/BetControls";
import RewardTiers from "@/components/spin/RewardTiers";
import SpinControls from "@/components/spin/SpinControls";
import { toast } from "sonner";

const SpinPage: React.FC = () => {
  console.log('[SpinPage] Component mounting');
  
  const { user } = useAuth();
  const { portfolio } = usePortfolio();
  const { spin, currentSpin, setCurrentSpin } = useSpinGame();
  
  // Local spinning state for animation control
  const [isSpinning, setIsSpinning] = useState(false);
  const [pendingResult, setPendingResult] = useState<any>(null);
  
  const { data: configurations = [], isLoading: loading } = useQuery({
    queryKey: ['spin_configurations'],
    queryFn: async () => {
      console.log('[SpinPage] Fetching spin configurations');
      const { data, error } = await supabase
        .from('spin_configurations')
        .select(`
          *,
          cryptocurrencies(symbol, name, current_price, logo_url)
        `)
        .eq('is_active', true)
        .order('reward_tier', { ascending: true });

      if (error) {
        console.error('[SpinPage] Error fetching configurations:', error);
        throw error;
      }

      return data || [];
    },
  });
  
  const [betAmount, setBetAmount] = useState([0.001]);
  const [lastSpinResult, setLastSpinResult] = useState<any>(null);
  const [canSpin, setCanSpin] = useState(true);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);

  const betAmountBtc = betAmount[0];
  const btcHolding = portfolio?.find(p => p.crypto.symbol === 'BTC');
  const btcBalance = btcHolding?.quantity || 0;
  const btcPrice = btcHolding?.crypto.current_price || 50000;
  const betAmountUsd = betAmountBtc * btcPrice;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            setCanSpin(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownTime]);

  // Show result modal when animation completes
  const handleSpinComplete = () => {
    console.log('[SpinPage] Spin animation complete');
    setIsSpinning(false);
    
    if (pendingResult) {
      setLastSpinResult(pendingResult);
      setPendingResult(null);
      
      // Show modal after a short delay
      setTimeout(() => {
        setShowResultModal(true);
      }, 500);
    }
  };

  const getMultiplierColor = (multiplier: number) => {
    if (multiplier >= 8) return 'text-yellow-400';
    if (multiplier >= 3) return 'text-purple-400';
    if (multiplier >= 1.5) return 'text-blue-400';
    return 'text-gray-400';
  };

  const getTierBadgeStyle = (tier: string) => {
    switch (tier) {
      case 'legendary':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'epic':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'rare':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTierGlow = (tier: string) => {
    switch (tier) {
      case 'legendary':
        return 'shadow-[0_0_20px_rgba(255,215,0,0.6)] ring-2 ring-yellow-400/30';
      case 'epic':
        return 'shadow-[0_0_16px_rgba(168,85,247,0.6)] ring-2 ring-purple-400/30';
      case 'rare':
        return 'shadow-[0_0_12px_rgba(59,130,246,0.6)] ring-2 ring-blue-400/30';
      case 'common':
        return 'shadow-[0_0_8px_rgba(156,163,175,0.4)] ring-1 ring-gray-400/20';
      default:
        return '';
    }
  };

  const generateRouletteItems = () => {
    const allTierItems = configurations.map((config, index) => ({
      id: config.id,
      crypto: {
        name: config.cryptocurrencies?.name || 'Unknown',
        symbol: config.cryptocurrencies?.symbol || 'UNK',
        logo_url: config.cryptocurrencies?.logo_url
      },
      amount: betAmountBtc * config.min_multiplier,
      tier: config.reward_tier
    }));

    allTierItems.push({
      id: 'loss',
      crypto: {
        name: 'Loss',
        symbol: 'LOSS',
        logo_url: undefined
      },
      amount: 0,
      tier: 'loss'
    });

    return allTierItems;
  };

  const handleSpin = async () => {
    if (!canSpin) {
      toast.error('Please wait for cooldown to finish');
      return;
    }

    if (btcBalance < betAmountBtc) {
      toast.error('Insufficient BTC balance');
      return;
    }

    if (isSpinning) {
      toast.error('Please wait for the current spin to complete');
      return;
    }

    setCanSpin(false);
    setCooldownTime(10);
    setIsSpinning(true); // Set spinning state immediately
    
    console.log('[SpinPage] Starting spin');

    const result = await spin(betAmountBtc);
    
    if (result) {
      console.log('[SpinPage] Spin result received:', result);
      setPendingResult(result);
      // Keep isSpinning true - it will be set to false by handleSpinComplete
    } else {
      // If spin failed, reset state
      setIsSpinning(false);
    }
  };

  // Group configurations by cryptocurrency and tier
  const groupedConfigurations = configurations.reduce((acc, config) => {
    const symbol = config.cryptocurrencies?.symbol || 'UNK';
    if (!acc[symbol]) {
      acc[symbol] = [];
    }
    acc[symbol].push(config);
    return acc;
  }, {} as Record<string, typeof configurations>);

  // Sort tiers within each crypto group
  Object.keys(groupedConfigurations).forEach(symbol => {
    groupedConfigurations[symbol].sort((a, b) => {
      const tierOrder = { 'common': 0, 'rare': 1, 'epic': 2, 'legendary': 3 };
      return tierOrder[a.reward_tier] - tierOrder[b.reward_tier];
    });
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to access VaultSpin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Dice6 className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-bold">VaultSpin</h1>
        </div>
        <p className="text-muted-foreground">
          Spin the roulette to win cryptocurrency rewards! Bet BTC and win from the top 5 coins.
        </p>
      </div>

      {/* Balance & Bet Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BetControls
          btcHolding={btcHolding}
          btcBalance={btcBalance}
          btcPrice={btcPrice}
          betAmount={betAmount}
          setBetAmount={setBetAmount}
        />
      </div>

      {/* Roulette & Controls */}
      <div className="glass glass-hover p-6 rounded-xl">
        <SpinRoulette
          items={generateRouletteItems()}
          isSpinning={isSpinning}
          winningItem={pendingResult ? {
            id: "winner",
            crypto: {
              name: pendingResult.rewardCrypto,
              symbol: pendingResult.rewardCrypto,
              logo_url: undefined
            },
            amount: pendingResult.rewardAmount,
            tier: pendingResult.tier || (
              pendingResult.isWin
                ? pendingResult.multiplier >= 8
                  ? "legendary"
                  : pendingResult.multiplier >= 3
                  ? "epic"
                  : pendingResult.multiplier >= 1.5
                  ? "rare"
                  : "common"
                : "loss"
            )
          } : undefined}
          onSpinComplete={handleSpinComplete}
        />
        <SpinControls
          isSpinning={isSpinning}
          canSpin={canSpin}
          btcBalance={btcBalance}
          betAmountBtc={betAmountBtc}
          loading={loading}
          cooldownTime={cooldownTime}
          handleSpin={handleSpin}
        />
        {btcBalance < betAmountBtc && (
          <div className="text-center text-red-400 text-sm">
            Insufficient BTC balance. You need at least {betAmountBtc.toFixed(6)} BTC to spin.
          </div>
        )}
        <div className="text-center text-xs text-muted-foreground">
          0.01% fee applies to all spins • 30% chance to lose your bet
        </div>
      </div>

      {/* Reward Tiers */}
      <RewardTiers groupedConfigurations={groupedConfigurations} betAmountBtc={betAmountBtc} />

      {/* Result Modal */}
      <SpinResultModal
        isOpen={showResultModal}
        onClose={() => {
          setShowResultModal(false);
          setLastSpinResult(null);
        }}
        result={
          lastSpinResult
            ? { ...lastSpinResult, rewardValue: lastSpinResult.rewardValue }
            : null
        }
      />
    </div>
  );
};

export default SpinPage;