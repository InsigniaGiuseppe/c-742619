
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, PiggyBank } from 'lucide-react';
import FormattedNumber from './FormattedNumber';
import CryptoLogo from './CryptoLogo';
import { useRealtimePortfolio } from '@/hooks/useRealtimePortfolio';
import { useCombinedPortfolio } from '@/hooks/useCombinedPortfolio';

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5A2B', '#6366F1'];

const EnhancedPortfolioChart = () => {
  const { 
    totalProfitLoss, 
    totalProfitLossPercentage,
    isRealtime 
  } = useRealtimePortfolio();
  
  const { combinedPortfolio, totals, loading } = useCombinedPortfolio();

  if (loading) {
    return (
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle>Portfolio Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse">Loading portfolio data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (combinedPortfolio.length === 0) {
    return (
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle>Portfolio Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-2">
            <div className="text-lg">No portfolio data available</div>
            <div className="text-sm">Start trading to see your portfolio distribution</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = combinedPortfolio.map((item, index) => ({
    name: item.crypto.symbol,
    value: item.total.value,
    percentage: item.total.percentage,
    color: COLORS[index % COLORS.length],
    logo_url: item.crypto.logo_url,
    fullName: item.crypto.name,
    trading: item.trading,
    lending: item.lending,
    hasLending: item.lending.value > 0
  }));

  const isProfit = totalProfitLoss >= 0;

  return (
    <Card className="glass glass-hover">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Portfolio Distribution</span>
          <div className="flex items-center gap-2">
            {isRealtime && (
              <Badge variant="outline" className="text-green-500 border-green-500">
                <Activity className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
            )}
          </div>
        </CardTitle>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Value:</span>
            <FormattedNumber value={totals.combined} type="currency" showTooltip={false} className="font-semibold" />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Trading: <FormattedNumber value={totals.trading} type="currency" showTooltip={false} /></span>
            <span>Lending: <FormattedNumber value={totals.lending} type="currency" showTooltip={false} /></span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total P/L:</span>
            <div className={`flex items-center gap-1 font-semibold ${
              isProfit ? 'text-green-500' : 'text-red-500'
            }`}>
              {isProfit ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <FormattedNumber value={Math.abs(totalProfitLoss)} type="currency" showTooltip={false} />
              <span className="text-xs">
                ({isProfit ? '+' : ''}{totalProfitLossPercentage.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-xs text-muted-foreground mb-4">
            Combined trading and lending positions
          </div>
          
          {chartData.map((item, index) => (
            <div key={item.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CryptoLogo 
                    logo_url={item.logo_url}
                    name={item.fullName}
                    symbol={item.name}
                    size="sm"
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{item.name}</span>
                      {item.hasLending && (
                        <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/20 text-green-400">
                          <PiggyBank className="w-3 h-3 mr-1" />
                          {item.lending.yield.toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{item.fullName}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm">
                    <FormattedNumber value={item.value} type="currency" showTooltip={false} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.percentage.toFixed(1)}%
                    {item.trading.value > 0 && item.lending.value > 0 && (
                      <div className="text-xs">
                        T: {item.trading.percentage.toFixed(1)}% | L: {item.lending.percentage.toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                {/* Trading portion */}
                {item.trading.value > 0 && (
                  <div 
                    className="h-full rounded-full transition-all duration-300 ease-out absolute left-0"
                    style={{
                      width: `${item.trading.percentage}%`,
                      backgroundColor: item.color,
                      boxShadow: `0 0 8px ${item.color}40`
                    }}
                  />
                )}
                
                {/* Lending portion with pattern */}
                {item.lending.value > 0 && (
                  <div 
                    className="h-full rounded-full transition-all duration-300 ease-out absolute"
                    style={{
                      left: `${item.trading.percentage}%`,
                      width: `${item.lending.percentage}%`,
                      backgroundColor: item.color,
                      opacity: 0.7,
                      backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)`,
                      boxShadow: `0 0 6px ${item.color}30`
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedPortfolioChart;
