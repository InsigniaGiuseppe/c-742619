
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, DollarSign } from 'lucide-react';

interface AdminChartsProps {
  dailyTradingVolume: Array<{ date: string; volume: number; trades: number }>;
  userGrowth: Array<{ date: string; users: number }>;
  aumGrowth: Array<{ date: string; aum: number }>;
}

const AdminCharts: React.FC<AdminChartsProps> = ({ dailyTradingVolume, userGrowth, aumGrowth }) => {
  const chartConfig = {
    volume: {
      label: "Trading Volume",
    },
    trades: {
      label: "Trades",
    },
    users: {
      label: "Users",
    },
    aum: {
      label: "AUM",
    },
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Daily Trading Volume Chart */}
      <Card className="glass glass-hover lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-4">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <div>
              <CardTitle>Daily Trading Volume</CardTitle>
              <CardDescription>Volume and trade count over the last 30 days</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTradingVolume}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  className="text-muted-foreground"
                />
                <YAxis 
                  yAxisId="volume"
                  orientation="left"
                  tickFormatter={formatCurrency}
                  className="text-muted-foreground"
                />
                <YAxis 
                  yAxisId="trades"
                  orientation="right"
                  className="text-muted-foreground"
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  labelFormatter={(value) => formatDate(value as string)}
                  formatter={(value, name) => [
                    name === 'volume' ? formatCurrency(value as number) : value,
                    name === 'volume' ? 'Volume' : 'Trades'
                  ]}
                />
                <Bar 
                  yAxisId="volume"
                  dataKey="volume" 
                  fill="hsl(var(--primary))" 
                  opacity={0.8}
                />
                <Line 
                  yAxisId="trades"
                  type="monotone" 
                  dataKey="trades" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* User Growth Chart */}
      <Card className="glass glass-hover">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Users className="w-6 h-6 text-blue-400" />
            <div>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>Total registered users over time</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  className="text-muted-foreground"
                />
                <YAxis className="text-muted-foreground" />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  labelFormatter={(value) => formatDate(value as string)}
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* AUM Growth Chart */}
      <Card className="glass glass-hover lg:col-span-2 xl:col-span-3">
        <CardHeader>
          <div className="flex items-center gap-4">
            <DollarSign className="w-6 h-6 text-green-400" />
            <div>
              <CardTitle>Assets Under Management (AUM)</CardTitle>
              <CardDescription>Total customer assets managed over time</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aumGrowth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tickFormatter={formatCurrency}
                  className="text-muted-foreground"
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  labelFormatter={(value) => formatDate(value as string)}
                  formatter={(value) => [formatCurrency(value as number), 'AUM']}
                />
                <Line 
                  type="monotone" 
                  dataKey="aum" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCharts;
