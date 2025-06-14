
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import FormattedNumber from './FormattedNumber';
import { useRealtimePortfolio } from '@/hooks/useRealtimePortfolio';

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5A2B', '#6366F1'];

const EnhancedPortfolioChart = () => {
  const { 
    portfolio, 
    loading, 
    totalValue, 
    totalProfitLoss, 
    totalProfitLossPercentage,
    isRealtime 
  } = useRealtimePortfolio();

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

  if (portfolio.length === 0) {
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

  const chartData = portfolio.map((item, index) => ({
    name: item.crypto.symbol,
    value: item.current_value,
    percentage: totalValue > 0 ? (item.current_value / totalValue) * 100 : 0,
    color: COLORS[index % COLORS.length]
  }));

  const isProfit = totalProfitLoss >= 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-600 shadow-lg">
          <p className="font-medium text-white">{data.name}</p>
          <p className="text-sm text-gray-300">
            Value: <FormattedNumber value={data.value} type="currency" showTooltip={false} />
          </p>
          <p className="text-sm text-gray-300">
            {data.percentage.toFixed(1)}%
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
            <FormattedNumber value={totalValue} type="currency" showTooltip={false} className="font-semibold" />
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
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ percentage }) => `${percentage.toFixed(1)}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="mt-6 space-y-3">
          {chartData.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium">{item.name}</span>
                <span className="text-xs text-muted-foreground">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
              <FormattedNumber value={item.value} type="currency" showTooltip={false} className="font-semibold" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedPortfolioChart;
