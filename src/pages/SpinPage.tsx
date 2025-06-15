
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useSpinGame } from '@/hooks/useSpinGame';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SpinRoulette from '@/components/SpinRoulette';
import SpinResultModal from '@/components/SpinResultModal';
import CryptoLogo from '@/components/CryptoLogo';
import FormattedNumber from '@/components/FormattedNumber';
import { Dice6, Clock } from 'lucide-react';
import { toast } from 'sonner';

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
        .order('reward_tier', { ascending: true });

      if (error) {
        console.error('[SpinPage] Error fetching configurations:', error);
        throw error;
      }

      return data || [];
    },
  });
  
  const [betAmount, setBetAmount] = useState([0.0001]);
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

  // Show result modal when spin completes
  useEffect(() => {
    if (lastSpinResult && !isSpinning) {
      setTimeout(() => {
        setShowResultModal(true);
      }, 1000); // Small delay after animation completes
    }
  }, [lastSpinResult, isSpinning]);

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

    setCanSpin(false);
    setCooldownTime(10);

    const result = await spin(betAmountBtc);
    
    if (result) {
      setLastSpinResult(result);
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
        <Card className="glass glass-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                {btcHolding?.crypto.logo_url ? (
                  <img 
                    src={btcHolding.crypto.logo_url} 
                    alt="Bitcoin"
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold text-white">
                    ₿
                  </div>
                )}
                <span>Your BTC Balance</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <FormattedNumber value={btcBalance} type="price" /> BTC
            </div>
            <div className="text-sm text-muted-foreground">
              ≈ <FormattedNumber value={btcBalance * btcPrice} type="currency" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass glass-hover">
          <CardHeader>
            <CardTitle>Bet Amount</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">BTC Amount</span>
                <span className="font-mono">{betAmountBtc.toFixed(6)} BTC</span>
              </div>
              <Slider
                value={betAmount}
                onValueChange={setBetAmount}
                min={0.00005}
                max={Math.min(0.005, btcBalance)}
                step={0.00001}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0.00005 BTC</span>
                <span>{Math.min(0.005, btcBalance).toFixed(6)} BTC</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Bet Value</div>
              <div className="font-semibold">
                <FormattedNumber value={betAmountUsd} type="currency" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roulette */}
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle>Spin the Roulette</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SpinRoulette
            items={generateRouletteItems()}
            isSpinning={isSpinning}
            winningItem={lastSpinResult ? {
              id: 'winner',
              crypto: {
                name: lastSpinResult.rewardCrypto,
                symbol: lastSpinResult.rewardCrypto,
                logo_url: undefined
              },
              amount: lastSpinResult.rewardAmount,
              tier: lastSpinResult.tier || (
                lastSpinResult.isWin ? (
                  lastSpinResult.multiplier >= 8 ? 'legendary' :
                  lastSpinResult.multiplier >= 3 ? 'epic' : 
                  lastSpinResult.multiplier >= 1.5 ? 'rare' : 'common'
                ) : 'loss'
              )
            } : undefined}
            onSpinComplete={() => {
              // Animation complete, modal will show automatically via useEffect
            }}
          />

          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={handleSpin}
              disabled={isSpinning || !canSpin || btcBalance < betAmountBtc || loading}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white min-w-48"
            >
              {isSpinning ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Spinning...
                </div>
              ) : cooldownTime > 0 ? (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Wait {cooldownTime}s
                </div>
              ) : (
                `Spin for ${betAmountBtc.toFixed(6)} BTC`
              )}
            </Button>
          </div>

          {btcBalance < betAmountBtc && (
            <div className="text-center text-red-400 text-sm">
              Insufficient BTC balance. You need at least {betAmountBtc.toFixed(6)} BTC to spin.
            </div>
          )}

          <div className="text-center text-xs text-muted-foreground">
            0.01% fee applies to all spins • 30% chance to lose your bet
          </div>
        </CardContent>
      </Card>

      {/* Reward Tiers - Card-based design with crypto icons */}
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle>Reward Tiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(groupedConfigurations).map(([symbol, configs]) => (
              <div key={symbol} className="space-y-3">
                {/* Crypto Header */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <CryptoLogo
                      symbol={symbol}
                      logo_url={configs[0]?.cryptocurrencies?.logo_url}
                      name={configs[0]?.cryptocurrencies?.name || symbol}
                      size="md"
                      className="w-8 h-8"
                    />
                    <span className="font-bold text-lg">{symbol}</span>
                  </div>
                </div>
                
                {/* Tier Cards */}
                {configs.map((config) => (
                  <div key={config.id} className={`p-4 rounded-xl glass glass-hover ${getTierGlow(config.reward_tier)} transition-all duration-300`}>
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={getTierBadgeStyle(config.reward_tier)}>
                        {config.reward_tier.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {(config.probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="text-center space-y-2">
                      <CryptoLogo
                        symbol={symbol}
                        logo_url={config.cryptocurrencies?.logo_url}
                        name={config.cryptocurrencies?.name || symbol}
                        size="lg"
                        className="w-12 h-12 mx-auto"
                      />
                      
                      <div>
                        <div className={`font-bold text-lg ${getMultiplierColor(config.min_multiplier)}`}>
                          {config.min_multiplier}x - {config.max_multiplier}x
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {(betAmountBtc * config.min_multiplier).toFixed(6)} - {(betAmountBtc * config.max_multiplier).toFixed(6)} {symbol}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          {/* Loss Card */}
          <div className="mt-6 p-4 rounded-xl bg-red-900/20 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.4)]">
            <div className="flex items-center justify-between mb-3">
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                LOSE
              </Badge>
              <span className="text-sm text-red-400">
                30%
              </span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-2xl">
                ✗
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-400">0x multiplier</div>
                <div className="text-sm text-red-400">You lose your BTC bet</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Result Modal */}
      <SpinResultModal
        isOpen={showResultModal}
        onClose={() => {
          setShowResultModal(false);
          setLastSpinResult(null);
        }}
        result={lastSpinResult}
      />
    </div>
  );
};

export default SpinPage;
