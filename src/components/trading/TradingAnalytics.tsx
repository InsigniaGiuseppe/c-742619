
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  DollarSign,
  Calendar,
  Target
} from 'lucide-react';
import FormattedNumber from '@/components/FormattedNumber';

interface TradingStats {
  totalTrades: number;
  winRate: number;
  totalVolume: number;
  avgTradeSize: number;
  bestTrade: number;
  worstTrade: number;
  profitableTrades: number;
  losingTrades: number;
  recentPerformance: Array<{
    date: string;
    pnl: number;
    volume: number;
  }>;
}

const TradingAnalytics = () => {
  const { user } = useAuth();

  const { data: tradingStats, isLoading } = useQuery({
    queryKey: ['trading-analytics', user?.id],
    queryFn: async (): Promise<TradingStats> => {
      if (!user) throw new Error('User not authenticated');

      // Fetch trading orders
      const { data: orders, error: ordersError } = await supabase
        .from('trading_orders')
        .select('*')
        .eq('user_id', user.id)
        .eq('order_status', 'completed')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch realized gains
      const { data: gains, error: gainsError } = await supabase
        .from('realized_gains')
        .select('*')
        .eq('user_id', user.id)
        .order('sold_at', { ascending: false });

      if (gainsError) throw gainsError;

      // Calculate statistics
      const totalTrades = orders?.length || 0;
      const totalVolume = orders?.reduce((sum, order) => sum + Number(order.total_value), 0) || 0;
      const avgTradeSize = totalTrades > 0 ? totalVolume / totalTrades : 0;

      const profitableTrades = gains?.filter(gain => gain.realized_pnl > 0).length || 0;
      const losingTrades = gains?.filter(gain => gain.realized_pnl < 0).length || 0;
      const winRate = totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0;

      const bestTrade = gains?.reduce((best, gain) => 
        gain.realized_pnl > best ? gain.realized_pnl : best, 0) || 0;
      const worstTrade = gains?.reduce((worst, gain) => 
        gain.realized_pnl < worst ? gain.realized_pnl : worst, 0) || 0;

      // Calculate recent performance (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentGains = gains?.filter(gain => 
        new Date(gain.sold_at) >= thirtyDaysAgo) || [];

      const recentPerformance = recentGains.reduce((acc, gain) => {
        const date = new Date(gain.sold_at).toISOString().split('T')[0];
        const existing = acc.find(item => item.date === date);
        
        if (existing) {
          existing.pnl += gain.realized_pnl;
          existing.volume += gain.total_sale_value;
        } else {
          acc.push({
            date,
            pnl: gain.realized_pnl,
            volume: gain.total_sale_value
          });
        }
        
        return acc;
      }, [] as Array<{ date: string; pnl: number; volume: number; }>);

      return {
        totalTrades,
        winRate,
        totalVolume,
        avgTradeSize,
        bestTrade,
        worstTrade,
        profitableTrades,
        losingTrades,
        recentPerformance: recentPerformance.slice(0, 7) // Last 7 trading days
      };
    },
    enabled: !!user,
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
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

  if (!tradingStats) {
    return (
      <Card className="glass glass-hover">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No trading data available</p>
        </CardContent>
      </Card>
    );
  }

  const {
    totalTrades,
    winRate,
    totalVolume,
    avgTradeSize,
    bestTrade,
    worstTrade,
    profitableTrades,
    losingTrades,
    recentPerformance
  } = tradingStats;

  const metrics = [
    {
      title: 'Total Trades',
      value: totalTrades,
      type: 'number' as const,
      icon: BarChart3,
      description: 'Completed orders'
    },
    {
      title: 'Win Rate',
      value: winRate,
      type: 'percentage' as const,
      icon: Target,
      description: `${profitableTrades} wins, ${losingTrades} losses`,
      trend: winRate >= 50 ? 'positive' : 'negative'
    },
    {
      title: 'Total Volume',
      value: totalVolume,
      type: 'currency' as const,
      icon: DollarSign,
      description: 'All-time trading volume'
    },
    {
      title: 'Average Trade Size',
      value: avgTradeSize,
      type: 'currency' as const,
      icon: Calendar,
      description: 'Per transaction'
    },
    {
      title: 'Best Trade',
      value: bestTrade,
      type: 'currency' as const,
      icon: TrendingUp,
      description: 'Highest realized gain',
      trend: 'positive'
    },
    {
      title: 'Worst Trade',
      value: Math.abs(worstTrade),
      type: 'currency' as const,
      icon: TrendingDown,
      description: 'Largest realized loss',
      trend: 'negative'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Trading Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    `${metric.value.toFixed(1)}%`
                  ) : metric.type === 'number' ? (
                    metric.value.toLocaleString()
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

      {/* Performance Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass glass-hover">
          <CardHeader>
            <CardTitle>Win Rate Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Win Rate</span>
                <span className={`text-sm font-medium ${
                  winRate >= 60 ? 'text-green-500' : 
                  winRate >= 40 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {winRate.toFixed(1)}%
                </span>
              </div>
              <Progress value={winRate} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{profitableTrades}</div>
                <div className="text-xs text-muted-foreground">Winning Trades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{losingTrades}</div>
                <div className="text-xs text-muted-foreground">Losing Trades</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass glass-hover">
          <CardHeader>
            <CardTitle>Recent Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPerformance.length > 0 ? (
              <div className="space-y-2">
                {recentPerformance.slice(0, 5).map((day, index) => (
                  <div key={day.date} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {new Date(day.date).toLocaleDateString()}
                    </span>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        day.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {day.pnl >= 0 ? '+' : ''}
                        <FormattedNumber value={day.pnl} type="currency" showTooltip={false} />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Vol: <FormattedNumber value={day.volume} type="currency" showTooltip={false} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                No recent trading activity
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trading Insights */}
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle>Trading Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-500">
                {totalTrades > 0 ? ((profitableTrades / totalTrades) * 100).toFixed(0) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
              <div className="text-xs text-muted-foreground">
                {winRate >= 60 ? 'Excellent' : winRate >= 40 ? 'Good' : 'Needs Improvement'}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-500">
                <FormattedNumber value={avgTradeSize} type="currency" showTooltip={false} />
              </div>
              <div className="text-sm text-muted-foreground">Avg Trade Size</div>
              <div className="text-xs text-muted-foreground">
                {avgTradeSize > 1000 ? 'Large positions' : avgTradeSize > 100 ? 'Medium positions' : 'Small positions'}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-500">
                <FormattedNumber value={totalVolume} type="currency" showTooltip={false} />
              </div>
              <div className="text-sm text-muted-foreground">Total Volume</div>
              <div className="text-xs text-muted-foreground">
                {totalVolume > 10000 ? 'High activity' : totalVolume > 1000 ? 'Moderate activity' : 'Low activity'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingAnalytics;
