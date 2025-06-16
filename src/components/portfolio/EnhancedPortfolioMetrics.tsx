
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  PieChart, 
  Shield, 
  Award,
  Coins
} from 'lucide-react';
import FormattedNumber from '@/components/FormattedNumber';
import { useEnhancedPortfolio } from '@/hooks/useEnhancedPortfolio';

const EnhancedPortfolioMetrics = () => {
  const { data: portfolioData, isLoading, error } = useEnhancedPortfolio();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="glass glass-hover animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-8 bg-gray-300 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !portfolioData) {
    return (
      <Card className="glass glass-hover border-red-500/20">
        <CardContent className="p-6 text-center">
          <p className="text-red-400">Failed to load enhanced portfolio metrics</p>
        </CardContent>
      </Card>
    );
  }

  const {
    totalValue,
    totalInvested,
    totalProfitLoss,
    totalProfitLossPercentage,
    realizedPnl,
    unrealizedPnl,
    tradingValue,
    spinRewardsValue,
    lendingValue,
    vaultValue,
    diversificationScore,
    riskScore,
    performanceMetrics
  } = portfolioData;

  const metrics = [
    {
      title: 'Total Portfolio Value',
      value: totalValue,
      type: 'currency' as const,
      icon: PieChart,
      description: 'All assets combined',
      trend: totalProfitLoss >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'Total P&L',
      value: totalProfitLoss,
      type: 'currency' as const,
      icon: totalProfitLoss >= 0 ? TrendingUp : TrendingDown,
      description: `${totalProfitLossPercentage >= 0 ? '+' : ''}${totalProfitLossPercentage.toFixed(2)}%`,
      trend: totalProfitLoss >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'Realized Gains',
      value: realizedPnl,
      type: 'currency' as const,
      icon: Award,
      description: 'From completed trades',
      trend: realizedPnl >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'Unrealized P&L',
      value: unrealizedPnl,
      type: 'currency' as const,
      icon: Target,
      description: 'Current holdings',
      trend: unrealizedPnl >= 0 ? 'positive' : 'negative'
    }
  ];

  const allocationMetrics = [
    {
      title: 'Trading Portfolio',
      value: tradingValue,
      percentage: totalValue > 0 ? (tradingValue / totalValue) * 100 : 0,
      icon: Activity,
      color: 'bg-blue-500'
    },
    {
      title: 'Spin Rewards',
      value: spinRewardsValue,
      percentage: totalValue > 0 ? (spinRewardsValue / totalValue) * 100 : 0,
      icon: Coins,
      color: 'bg-purple-500'
    },
    {
      title: 'Lending',
      value: lendingValue,
      percentage: totalValue > 0 ? (lendingValue / totalValue) * 100 : 0,
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      title: 'Vaults',
      value: vaultValue,
      percentage: totalValue > 0 ? (vaultValue / totalValue) * 100 : 0,
      icon: Shield,
      color: 'bg-yellow-500'
    }
  ];

  const getRiskLevel = (score: number) => {
    if (score < 30) return { label: 'Low', color: 'text-green-500' };
    if (score < 60) return { label: 'Medium', color: 'text-yellow-500' };
    return { label: 'High', color: 'text-red-500' };
  };

  const riskLevel = getRiskLevel(riskScore);

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="glass glass-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${
                  metric.trend === 'positive' ? 'text-green-500' : 
                  metric.trend === 'negative' ? 'text-red-500' : 
                  'text-muted-foreground'
                }`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <FormattedNumber
                    value={metric.value}
                    type={metric.type}
                    showTooltip={false}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Portfolio Allocation */}
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle>Portfolio Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {allocationMetrics.map((allocation) => {
              const Icon = allocation.icon;
              return (
                <div key={allocation.title} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{allocation.title}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {allocation.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="space-y-1">
                    <Progress value={allocation.percentage} className="h-2" />
                    <div className="text-lg font-semibold">
                      <FormattedNumber value={allocation.value} type="currency" showTooltip={false} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Risk & Performance Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass glass-hover">
          <CardHeader>
            <CardTitle>Risk Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Risk Score</span>
                <span className={`text-sm font-medium ${riskLevel.color}`}>
                  {riskLevel.label} ({riskScore.toFixed(0)}/100)
                </span>
              </div>
              <Progress value={riskScore} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Diversification</span>
                <span className="text-sm font-medium text-blue-500">
                  {diversificationScore.toFixed(0)}/100
                </span>
              </div>
              <Progress value={diversificationScore} className="h-2" />
            </div>

            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground">
                Volatility: {performanceMetrics.volatility.toFixed(2)}%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass glass-hover">
          <CardHeader>
            <CardTitle>Performance Highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {performanceMetrics.bestPerformer && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-green-500">Best Performer</h4>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{performanceMetrics.bestPerformer.crypto?.symbol}</span>
                  <Badge variant="default" className="text-green-500 bg-green-500/10">
                    +{performanceMetrics.bestPerformer.profit_loss_percentage.toFixed(2)}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {performanceMetrics.bestPerformer.crypto?.name}
                </p>
              </div>
            )}
            
            {performanceMetrics.worstPerformer && 
             performanceMetrics.bestPerformer?.id !== performanceMetrics.worstPerformer?.id && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-red-500">Needs Attention</h4>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{performanceMetrics.worstPerformer.crypto?.symbol}</span>
                  <Badge variant="destructive" className="bg-red-500/10">
                    {performanceMetrics.worstPerformer.profit_loss_percentage.toFixed(2)}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {performanceMetrics.worstPerformer.crypto?.name}
                </p>
              </div>
            )}

            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground">
                Average Return: {performanceMetrics.avgReturn.toFixed(2)}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedPortfolioMetrics;
