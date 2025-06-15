
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CryptoLogo from "@/components/CryptoLogo";
import FormattedNumber from "@/components/FormattedNumber";

interface RewardTiersProps {
  groupedConfigurations: Record<string, any>;
  betAmountBtc: number;
}

const getTierGlow = (tier: string) => {
  switch (tier) {
    case 'legendary': return 'shadow-[0_0_20px_rgba(255,215,0,0.6)] ring-2 ring-yellow-400/30';
    case 'epic': return 'shadow-[0_0_16px_rgba(168,85,247,0.6)] ring-2 ring-purple-400/30';
    case 'rare': return 'shadow-[0_0_12px_rgba(59,130,246,0.6)] ring-2 ring-blue-400/30';
    case 'common': return 'shadow-[0_0_8px_rgba(156,163,175,0.4)] ring-1 ring-gray-400/20';
    default: return '';
  }
};

const getTierBadgeStyle = (tier: string) => {
  switch (tier) {
    case 'legendary': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'epic': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'rare': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

const getMultiplierColor = (min_multiplier: number) => {
  if (min_multiplier >= 8) return 'text-yellow-400';
  if (min_multiplier >= 3) return 'text-purple-400';
  if (min_multiplier >= 1.5) return 'text-blue-400';
  return 'text-gray-400';
};

const RewardTiers: React.FC<RewardTiersProps> = ({ groupedConfigurations, betAmountBtc }) => {
  return (
    <Card className="glass glass-hover">
      <CardHeader>
        <CardTitle>Reward Tiers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(groupedConfigurations).map(([symbol, configs]) => (
            <div key={symbol} className="space-y-3">
              {configs.map((config) => (
                <div key={config.id} className={`p-4 rounded-xl glass glass-hover ${getTierGlow(config.reward_tier)} transition-all duration-300 relative`}>
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={getTierBadgeStyle(config.reward_tier)}>
                      {config.reward_tier.toUpperCase()}
                    </Badge>
                    <span className={`text-xs ${config.reward_tier === 'legendary' ? 'text-yellow-400 font-bold' : 'text-muted-foreground'}`}>
                      {(config.probability * 100).toFixed(2)}%
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
        <div className="mt-6 p-4 rounded-xl bg-red-900/20 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.4)]">
          <div className="flex items-center justify-between mb-3">
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">LOSE</Badge>
            <span className="text-sm text-red-400">30%</span>
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
  );
};

export default RewardTiers;
