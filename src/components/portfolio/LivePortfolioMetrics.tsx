
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, Target, DollarSign } from 'lucide-react';
import FormattedNumber from '@/components/FormattedNumber';
import { usePortfolio } from '@/hooks/usePortfolio';

const LivePortfolioMetrics = () => {
  const { portfolio, totalValue, totalProfitLoss, totalProfitLossPercentage } = usePortfolio();

  // Calculate advanced metrics
  const totalInvested = portfolio.reduce((sum, item) => sum + item.total_invested, 0);
  const diversificationScore = portfolio.length > 0 ? Math.min(100, (portfolio.length / 10) * 100) : 0;
  
  const metrics = [
    {
      title: 'Total Invested',
      value: totalInvested,
      type: 'currency' as const,
      icon: Target,
      description: 'Total amount invested',
      subtext: 'Purchase value'
    },
    {
      title: 'Live Value',
      value: totalValue,
      type: 'currency' as const,
      icon: DollarSign,
      description: 'Current market value',
      subtext: 'Real-time pricing',
      trend: totalValue > totalInvested ? 'positive' : totalValue < totalInvested ? 'negative' : 'neutral'
    },
    {
      title: 'Total P&L',
      value: totalProfitLoss,
      type: 'currency' as const,
      icon: totalProfitLoss >= 0 ? TrendingUp : TrendingDown,
      description: `${totalProfitLossPercentage >= 0 ? '+' : ''}${totalProfitLossPercentage.toFixed(2)}%`,
      trend: totalProfitLoss >= 0 ? 'positive' : 'negative',
      subtext: totalProfitLoss >= 0 ? 'Profit' : 'Loss'
    },
    {
      title: 'Diversification',
      value: diversificationScore,
      type: 'percentage' as const,
      icon: Activity,
      description: `${portfolio.length} assets`,
      subtext: 'Portfolio spread'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
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
                <div className={`text-2xl font-bold ${
                  metric.trend === 'positive' ? 'text-green-500' : 
                  metric.trend === 'negative' ? 'text-red-500' : 
                  'text-white'
                }`}>
                  {metric.type === 'percentage' ? (
                    `${metric.value.toFixed(0)}%`
                  ) : (
                    <FormattedNumber
                      value={Math.abs(metric.value)}
                      type={metric.type}
                      showTooltip={false}
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
                {metric.subtext && (
                  <p className="text-xs text-muted-foreground opacity-70">
                    {metric.subtext}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default LivePortfolioMetrics;
