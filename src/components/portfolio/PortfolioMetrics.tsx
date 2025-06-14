
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Target, PieChart } from 'lucide-react';
import FormattedNumber from '@/components/FormattedNumber';
import { usePortfolio } from '@/hooks/usePortfolio';

const PortfolioMetrics = () => {
  const { portfolio, totalValue, totalProfitLoss, totalProfitLossPercentage } = usePortfolio();

  // Calculate advanced metrics
  const totalInvested = portfolio.reduce((sum, item) => sum + item.total_invested, 0);
  const bestPerformer = portfolio.reduce((best, current) => 
    current.profit_loss_percentage > (best?.profit_loss_percentage || -Infinity) ? current : best
  , portfolio[0]);
  
  const worstPerformer = portfolio.reduce((worst, current) => 
    current.profit_loss_percentage < (worst?.profit_loss_percentage || Infinity) ? current : worst
  , portfolio[0]);

  const diversificationScore = portfolio.length > 0 ? Math.min(100, (portfolio.length / 10) * 100) : 0;
  
  const metrics = [
    {
      title: 'Total Invested',
      value: totalInvested,
      type: 'currency' as const,
      icon: Target,
      description: 'Total amount invested'
    },
    {
      title: 'Current Value',
      value: totalValue,
      type: 'currency' as const,
      icon: PieChart,
      description: 'Current portfolio value'
    },
    {
      title: 'Total Return',
      value: totalProfitLoss,
      type: 'currency' as const,
      icon: totalProfitLoss >= 0 ? TrendingUp : TrendingDown,
      description: `${totalProfitLossPercentage >= 0 ? '+' : ''}${totalProfitLossPercentage.toFixed(2)}%`,
      trend: totalProfitLoss >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'Diversification',
      value: diversificationScore,
      type: 'percentage' as const,
      icon: Activity,
      description: `${portfolio.length} assets`
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
                <div className="text-2xl font-bold">
                  {metric.type === 'percentage' ? (
                    `${metric.value.toFixed(0)}%`
                  ) : (
                    <FormattedNumber
                      value={metric.value}
                      type={metric.type}
                      showTooltip={false}
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Highlights */}
      {portfolio.length > 0 && (
        <Card className="glass glass-hover">
          <CardHeader>
            <CardTitle>Performance Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bestPerformer && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-green-500">Best Performer</h4>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{bestPerformer.crypto.symbol.toUpperCase()}</span>
                    <Badge variant="default" className="text-green-500">
                      +{bestPerformer.profit_loss_percentage.toFixed(2)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{bestPerformer.crypto.name}</p>
                </div>
              )}
              
              {worstPerformer && bestPerformer?.id !== worstPerformer?.id && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-red-500">Needs Attention</h4>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{worstPerformer.crypto.symbol.toUpperCase()}</span>
                    <Badge variant="destructive">
                      {worstPerformer.profit_loss_percentage.toFixed(2)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{worstPerformer.crypto.name}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PortfolioMetrics;
