
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { usePortfolio } from '@/hooks/usePortfolio';
import { formatCurrency } from '@/lib/formatters';

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

const PortfolioChart = () => {
  const { portfolio, loading, totalValue } = usePortfolio();

  if (loading) {
    return (
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle>Portfolio Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div>Loading...</div>
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
          <div className="flex items-center justify-center h-64 text-gray-400">
            No portfolio data available
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 p-3 rounded border border-gray-600">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-300">
            Value: {formatCurrency(data.value)}
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
        <CardTitle>Portfolio Distribution</CardTitle>
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
        
        <div className="mt-4 space-y-2">
          {chartData.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between text-sm p-2 rounded-md bg-white/5">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.name}</span>
              </div>
              <span>{formatCurrency(item.value)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioChart;
