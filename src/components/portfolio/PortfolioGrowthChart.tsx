
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import FormattedNumber from '@/components/FormattedNumber';
import { useRealtimePortfolio } from '@/hooks/useRealtimePortfolio';

const PortfolioGrowthChart = () => {
  const { 
    totalValue, 
    totalProfitLoss, 
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
    <div className="h-full w-full flex flex-col">
      <div className="flex-1 min-h-[150px]">
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
    </div>
  );
};

export default PortfolioGrowthChart;
