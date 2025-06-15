
import React from 'react';
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
    <div className="h-full w-full flex flex-col p-2 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            {isRealtime && (
              <Badge variant="outline" className="text-green-500 border-green-500">
                <Activity className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
            )}
        </div>
        <div className="space-y-1 text-right">
            <div className="flex items-center justify-end gap-2">
                <span className="text-sm text-muted-foreground">Value:</span>
                <FormattedNumber value={totalValue} type="currency" showTooltip={false} className="font-semibold text-base" />
            </div>
            <div className="flex items-center justify-end gap-2">
                <span className="text-sm text-muted-foreground">Return:</span>
                <div className={`flex items-center gap-1 font-semibold text-base ${
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
      </div>
      
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={growthData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, stroke: lineColor, strokeWidth: 2, fill: 'hsl(var(--background))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-xs text-muted-foreground">30D High</div>
          <div className="font-medium text-sm">
            <FormattedNumber 
              value={Math.max(...growthData.map(d => d.value))} 
              type="currency" 
              showTooltip={false} 
            />
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">30D Low</div>
          <div className="font-medium text-sm">
            <FormattedNumber 
              value={Math.min(...growthData.map(d => d.value))} 
              type="currency" 
              showTooltip={false} 
            />
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">30D Change</div>
          <div className={`font-medium text-sm ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
            {isProfit ? '+' : ''}{totalProfitLossPercentage.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioGrowthChart;

