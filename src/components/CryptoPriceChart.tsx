
import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Label,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/formatters';
import { Cryptocurrency } from '@/hooks/useCryptocurrencies';
import { Skeleton } from './ui/skeleton';
import { useBinanceChartData } from '@/hooks/useBinanceChartData';
import ChartControls, { Timeframe } from './charts/ChartControls';
import CustomCandle from './charts/CustomCandle';
import CustomTooltip, { formatXAxisTick } from './charts/CustomTooltip';

const CryptoPriceChart = ({ crypto }: { crypto: Cryptocurrency }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('7d');
  const { chartData, loading, error } = useBinanceChartData(crypto?.symbol, timeframe);
  
  const domain = useMemo((): [number, number] => {
    if (!chartData || chartData.length === 0) return [0, 0];
    const lows = chartData.map(d => d.low);
    const highs = chartData.map(d => d.high);
    return [
      Math.min(...lows),
      Math.max(...highs)
    ];
  }, [chartData]);

  if (!crypto) {
    return <Card className="glass glass-hover h-full flex items-center justify-center"><p>No crypto data available.</p></Card>;
  }

  return (
    <Card className="glass glass-hover h-full">
      <CardContent className="pt-6 h-full flex flex-col">
        <ChartControls timeframe={timeframe} setTimeframe={setTimeframe} />

        <div className="flex-grow mt-4 -mx-4">
        {loading ? (
          <div className="w-full h-[400px] flex flex-col justify-between">
            <Skeleton className="w-full h-4/5" />
            <div className="flex justify-between mt-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="w-12 h-4" />)}
            </div>
          </div>
        ) : error ? (
            <div className="w-full h-[400px] flex items-center justify-center text-destructive text-center p-4">
              <p>Could not load chart data for {crypto.name}. <br/> ({error})</p>
            </div>
        ) : chartData.length === 0 ? (
           <div className="w-full h-[400px] flex items-center justify-center text-muted-foreground">No chart data available for this timeframe.</div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData} margin={{ top: 5, right: 30, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
              <XAxis
                dataKey="time"
                tickFormatter={(tick) => formatXAxisTick(tick, timeframe)}
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={80}
              />
              <YAxis
                orientation="right"
                dataKey="close"
                domain={domain}
                tickFormatter={(tick) => formatPrice(tick)}
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip 
                content={<CustomTooltip timeframe={timeframe} formatter={formatPrice} />} 
                cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
              />
              <Bar dataKey="close" shape={<CustomCandle />} />
              {crypto.current_price > 0 && (
                <ReferenceLine y={crypto.current_price} stroke="hsl(var(--primary))" strokeDasharray="3 3">
                  <Label value="Current Price" position="insideTopLeft" fill="hsl(var(--primary))" fontSize={12} dy={-10} />
                </ReferenceLine>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CryptoPriceChart;
