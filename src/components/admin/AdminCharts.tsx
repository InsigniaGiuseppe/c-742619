
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, ComposedChart } from 'recharts';
import { TrendingUp, Users, DollarSign, BarChart as BarChartIcon } from 'lucide-react';

interface AdminChartsProps {
  dailyTradingVolume: Array<{ date: string; volume: number; trades: number }>;
  userGrowth: Array<{ date: string; users: number }>;
  aumGrowth: Array<{ date: string; aum: number }>;
  totalTradesData: Array<{ date: string; trades: number }>;
}

const AdminCharts: React.FC<AdminChartsProps> = ({ dailyTradingVolume, userGrowth, aumGrowth, totalTradesData }) => {
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Trading Volume Chart */}
      <Card className="glass glass-hover">
        <CardHeader>
          <div className="flex items-center gap-4">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <div>
              <CardTitle>Daily Trading Volume</CardTitle>
              <CardDescription>Volume over the last 30 days</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTradingVolume} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  formatter={(value) => [formatCurrency(value as number), 'Volume']}
                />
                <Bar 
                  dataKey="volume" 
                  fill="hsl(var(--primary))" 
                  opacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Total Trades Chart */}
      <Card className="glass glass-hover">
        <CardHeader>
          <div className="flex items-center gap-4">
            <BarChartIcon className="w-6 h-6 text-cyan-400" />
            <div>
              <CardTitle>Total Trades</CardTitle>
              <CardDescription>Trade count over the last 30 days</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={totalTradesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  formatter={(value) => [value, 'Trades']}
                />
                <Line 
                  type="monotone" 
                  dataKey="trades" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
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
          <ChartContainer config={chartConfig} className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  formatter={(value) => [value, 'Users']}
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
      <Card className="glass glass-hover">
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
          <ChartContainer config={chartConfig} className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aumGrowth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
