
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
  const { spin, isSpinning, currentSpin, setCurrentSpin } = useSpinGame();
  
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
        .order('probability', { ascending: false });

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

  // Cooldown timer effect
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

  // Handle spin result modal display
  useEffect(() => {
    if (lastSpinResult && !isSpinning) {
      // Show modal after animation completes
      const timer = setTimeout(() => {
        setShowResultModal(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [lastSpinResult, isSpinning]);

  const generateRouletteItems = () => {
    const items = configurations.map((config) => ({
      id: config.id,
      crypto: {
        name: config.cryptocurrencies?.name || 'Unknown',
        symbol: config.cryptocurrencies?.symbol || 'UNK',
        logo_url: config.cryptocurrencies?.logo_url
      },
      amount: betAmountBtc * config.min_multiplier,
      tier: config.reward_tier
    }));

    // Add loss option
    items.push({
      id: 'loss',
      crypto: {
        name: 'Loss',
        symbol: 'LOSS',
        logo_url: undefined
      },
      amount: 0,
      tier: 'loss'
    });

    return items;
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

    // Start cooldown immediately
    setCanSpin(false);
    setCooldownTime(10);

    console.log('[SpinPage] Starting spin...');
    const result = await spin(betAmountBtc);
    
    if (result) {
      console.log('[SpinPage] Spin completed:', result);
      setLastSpinResult(result);
    } else {
      // If spin failed, reset cooldown
      setCanSpin(true);
      setCooldownTime(0);
    }
  };

  // Group configurations for display
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

  const winningRouletteItem = lastSpinResult ? {
    id: "winner",
    crypto: {
      name: lastSpinResult.rewardCrypto,
      symbol: lastSpinResult.rewardCrypto,
      logo_url: configurations.find(c => c.cryptocurrencies?.symbol === lastSpinResult.rewardCrypto)?.cryptocurrencies?.logo_url
    },
    amount: lastSpinResult.rewardAmount,
    tier: lastSpinResult.tier || (
      lastSpinResult.isWin
        ? lastSpinResult.multiplier >= 8
          ? "legendary"
          : lastSpinResult.multiplier >= 3
          ? "epic"
          : lastSpinResult.multiplier >= 1.5
          ? "rare"
          : "common"
        : "loss"
    )
  } : undefined;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Dice6 className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-bold">VaultSpin</h1>
        </div>
        <p className="text-muted-foreground">
          Spin the roulette to win cryptocurrency rewards! Bet BTC and win from the top cryptocurrencies.
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

        {/* Quick Stats */}
        <div className="glass glass-hover p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Game Statistics</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Win Rate:</span>
              <span className="text-green-400">70%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Loss Rate:</span>
              <span className="text-red-400">30%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">House Fee:</span>
              <span>0.01%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Multiplier:</span>
              <span className="text-yellow-400">15x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Roulette & Controls */}
      <div className="glass glass-hover p-6 rounded-xl">
        <SpinRoulette
          items={generateRouletteItems()}
          isSpinning={isSpinning}
          winningItem={winningRouletteItem}
          onSpinComplete={() => {
            console.log('[SpinPage] Roulette animation completed');
          }}
        />
        
        <div className="mt-6">
          <SpinControls
            isSpinning={isSpinning}
            canSpin={canSpin}
            btcBalance={btcBalance}
            betAmountBtc={betAmountBtc}
            loading={loading}
            cooldownTime={cooldownTime}
            handleSpin={handleSpin}
          />
        </div>

        {btcBalance < betAmountBtc && (
          <div className="text-center text-red-400 text-sm mt-4">
            Insufficient BTC balance. You need at least {betAmountBtc.toFixed(6)} BTC to spin.
          </div>
        )}

        <div className="text-center text-xs text-muted-foreground mt-2">
          0.01% fee applies to all spins • 30% chance to lose your bet
        </div>
      </div>

      {/* Reward Tiers */}
      <RewardTiers 
        groupedConfigurations={groupedConfigurations} 
        betAmountBtc={betAmountBtc} 
      />

      {/* Result Modal */}
      <SpinResultModal
        isOpen={showResultModal}
        onClose={() => {
          setShowResultModal(false);
          setLastSpinResult(null);
          setCurrentSpin(null);
        }}
        result={lastSpinResult}
      />
    </div>
  );
};

export default SpinPage;
