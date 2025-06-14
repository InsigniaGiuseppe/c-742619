
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Calendar, TrendingUp, Activity, Target } from 'lucide-react';
import PortfolioMetrics from './PortfolioMetrics';
import PortfolioAllocation from './PortfolioAllocation';
import { usePortfolio } from '@/hooks/usePortfolio';

const AdvancedPortfolioAnalytics = () => {
  const { portfolio, totalValue, totalProfitLoss } = usePortfolio();
  const [timeRange, setTimeRange] = useState('7d');

  // Generate sample historical data for demonstration
  const generateHistoricalData = () => {
    const data = [];
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const baseValue = totalValue - totalProfitLoss; // Starting value
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      // Simulate portfolio growth
      const progress = i / (days - 1);
      const currentValue = baseValue + (totalProfitLoss * progress) + (Math.random() - 0.5) * baseValue * 0.02;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.max(0, currentValue),
        profit: currentValue - baseValue,
      });
    }
    return data;
  };

  const historicalData = generateHistoricalData();

  return (
    <div className="space-y-6">
      <PortfolioMetrics />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="glass glass-hover">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Portfolio Performance
                </CardTitle>
                <div className="flex gap-2">
                  {['7d', '30d', '90d'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        timeRange === range
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="value" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="value">Portfolio Value</TabsTrigger>
                  <TabsTrigger value="profit">Profit/Loss</TabsTrigger>
                </TabsList>
                
                <TabsContent value="value" className="space-y-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="rgba(255, 255, 255, 0.5)"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="rgba(255, 255, 255, 0.5)"
                        fontSize={12}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Portfolio Value']}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#3B82F6"
                        fill="rgba(59, 130, 246, 0.1)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </TabsContent>
                
                <TabsContent value="profit" className="space-y-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="rgba(255, 255, 255, 0.5)"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="rgba(255, 255, 255, 0.5)"
                        fontSize={12}
                        tickFormatter={(value) => `$${value.toFixed(0)}`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                        formatter={(value: number) => [
                          `${value >= 0 ? '+' : ''}$${value.toFixed(2)}`, 
                          'Profit/Loss'
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke={totalProfitLoss >= 0 ? "#10B981" : "#EF4444"}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <PortfolioAllocation />
        </div>
      </div>
    </div>
  );
};

export default AdvancedPortfolioAnalytics;
