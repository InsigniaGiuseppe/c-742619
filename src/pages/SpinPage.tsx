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
import FormattedNumber from '@/components/FormattedNumber';
import { Dice6, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'sonner';

const SpinPage: React.FC = () => {
  console.log('[SpinPage] Component mounting');
  
  const { user } = useAuth();
  const { portfolio } = usePortfolio();
  const { spin, isSpinning, currentSpin, setCurrentSpin } = useSpinGame();
  
  // Fetch spin configurations separately
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
        .eq('is_active', true);

      if (error) {
        console.error('[SpinPage] Error fetching configurations:', error);
        throw error;
      }

      return data || [];
    },
  });
  
  console.log('[SpinPage] Hooks data:', {
    user: !!user,
    portfolioCount: portfolio?.length || 0,
    configurationsCount: configurations?.length || 0,
    loading,
    isSpinning
  });
  
  const [betAmount, setBetAmount] = useState([0.0001]);
  const [lastSpinResult, setLastSpinResult] = useState<any>(null);
  const [canSpin, setCanSpin] = useState(true);
  const [cooldownTime, setCooldownTime] = useState(0);

  const betAmountBtc = betAmount[0];
  const btcHolding = portfolio?.find(p => p.crypto.symbol === 'BTC');
  const btcBalance = btcHolding?.quantity || 0;
  const btcPrice = btcHolding?.crypto.current_price || 50000;
  const betAmountUsd = betAmountBtc * btcPrice;

  console.log('[SpinPage] BTC data:', {
    btcHolding: !!btcHolding,
    btcBalance,
    btcPrice,
    betAmountBtc,
    betAmountUsd
  });

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

  const getMultiplierColor = (multiplier: number) => {
    if (multiplier >= 5) return 'text-yellow-400'; // Legendary
    if (multiplier >= 3) return 'text-purple-400'; // Epic
    if (multiplier >= 1.5) return 'text-blue-400'; // Rare
    return 'text-gray-400'; // Common
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

  const generateRouletteItems = () => {
    console.log('[SpinPage] Generating roulette items with configurations:', configurations?.length);
    return configurations.map((config, index) => ({
      id: config.id,
      crypto: {
        name: config.cryptocurrencies?.name || 'Unknown',
        symbol: config.cryptocurrencies?.symbol || 'UNK',
        logo_url: config.cryptocurrencies?.logo_url
      },
      amount: betAmountBtc * config.min_multiplier,
      tier: config.reward_tier
    }));
  };

  const handleSpin = async () => {
    console.log('[SpinPage] Spin button clicked', {
      canSpin,
      btcBalance,
      betAmountBtc,
      hasConfigurations: configurations?.length > 0
    });
    
    if (!canSpin) {
      toast.error('Please wait for cooldown to finish');
      return;
    }

    if (btcBalance < betAmountBtc) {
      toast.error('Insufficient BTC balance');
      return;
    }

    setCanSpin(false);
    setCooldownTime(10); // 10-second cooldown

    console.log('[SpinPage] Executing spin...');
    const result = await spin(betAmountBtc);
    console.log('[SpinPage] Spin result:', result);
    
    if (result) {
      setLastSpinResult(result);
    }
  };

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
              tier: lastSpinResult.isWin ? (
                lastSpinResult.multiplier >= 5 ? 'legendary' :
                lastSpinResult.multiplier >= 3 ? 'epic' : 
                lastSpinResult.multiplier >= 1.5 ? 'rare' : 'common'
              ) : 'common'
            } : undefined}
            onSpinComplete={() => {
              if (lastSpinResult) {
                if (lastSpinResult.isWin) {
                  toast.success(`🎉 You won ${lastSpinResult.rewardAmount.toFixed(6)} ${lastSpinResult.rewardCrypto}!`);
                } else {
                  toast.error(`😢 You lost! Better luck next time.`);
                }
              }
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
            0.01% fee applies to all spins • ~49% chance to lose your bet
          </div>
        </CardContent>
      </Card>

      {/* Reward Tiers */}
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle>Reward Tiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {configurations.map((config) => (
              <div key={config.id} className="p-4 rounded-lg glass glass-hover">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getTierBadgeStyle(config.reward_tier)}>
                    {config.reward_tier.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {(config.probability * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {config.cryptocurrencies && (
                    <>
                      <img 
                        src={config.cryptocurrencies.logo_url} 
                        alt={config.cryptocurrencies.symbol}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="font-semibold">{config.cryptocurrencies.symbol}</span>
                    </>
                  )}
                </div>
                <div className="text-sm">
                  <div className={`font-semibold ${getMultiplierColor(config.min_multiplier)}`}>
                    {config.min_multiplier}x - {config.max_multiplier}x
                  </div>
                  <div className="text-muted-foreground">
                    {(betAmountBtc * config.min_multiplier).toFixed(6)} - {(betAmountBtc * config.max_multiplier).toFixed(6)} {config.cryptocurrencies?.symbol}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-red-900/20 border border-red-500/30">
            <div className="flex items-center justify-between mb-1">
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                LOSE
              </Badge>
              <span className="text-sm text-red-400">
                ~49%
              </span>
            </div>
            <div className="text-sm text-red-400">
              0x multiplier - You lose your BTC bet
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpinPage;
