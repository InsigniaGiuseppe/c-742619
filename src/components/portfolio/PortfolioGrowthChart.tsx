
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import FormattedNumber from '@/components/FormattedNumber';
import { useRealtimePortfolio } from '@/hooks/useRealtimePortfolio';

const PortfolioGrowthChart = () => {
  const { 
    totalValue, 
    totalProfitLoss, 
    totalProfitLossPercentage,
    isRealtime 
  } = useRealtimePortfolio();

  // Generate mock historical data for the growth chart
  const generateGrowthData = () => {
    const data = [];
    const days = 30;
    const baseValue = Math.max(10000, totalValue - totalProfitLoss); // Starting value
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Create a growth trend with some volatility
      const progress = (days - i) / days;
      const trend = baseValue + (totalProfitLoss * progress);
      const volatility = (Math.random() - 0.5) * (baseValue * 0.02); // 2% volatility
      const value = Math.max(0, trend + volatility);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: parseFloat(value.toFixed(2)),
        timestamp: date.getTime()
      });
    }
    
    // Ensure the last value matches current total
    if (data.length > 0) {
      data[data.length - 1].value = totalValue;
    }
    
    return data;
  };

  const growthData = generateGrowthData();
  const isProfit = totalProfitLoss >= 0;
  const lineColor = isProfit ? '#10B981' : '#EF4444';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-600 shadow-lg">
          <p className="font-medium text-white">{label}</p>
          <p className="text-sm text-gray-300">
            Value: <FormattedNumber value={data.value} type="currency" showTooltip={false} />
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="glass glass-hover">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Portfolio Growth</span>
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
            <span className="text-sm text-muted-foreground">Current Value:</span>
            <FormattedNumber value={totalValue} type="currency" showTooltip={false} className="font-semibold" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Return:</span>
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
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={growthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={lineColor}
              strokeWidth={3}
              dot={{ fill: lineColor, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: lineColor }}
            />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-muted-foreground">30D High</div>
            <div className="font-medium">
              <FormattedNumber 
                value={Math.max(...growthData.map(d => d.value))} 
                type="currency" 
                showTooltip={false} 
              />
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">30D Low</div>
            <div className="font-medium">
              <FormattedNumber 
                value={Math.min(...growthData.map(d => d.value))} 
                type="currency" 
                showTooltip={false} 
              />
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">30D Change</div>
            <div className={`font-medium ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
              {isProfit ? '+' : ''}{totalProfitLossPercentage.toFixed(1)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioGrowthChart;
