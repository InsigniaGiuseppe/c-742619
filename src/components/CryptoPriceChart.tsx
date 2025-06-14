
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
  Cell,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/formatters';
import { Cryptocurrency } from '@/hooks/useCryptocurrencies';
import { Skeleton } from './ui/skeleton';
import { useBinanceChartData } from '@/hooks/useBinanceChartData';
import ChartControls, { Timeframe } from './charts/ChartControls';
import CustomTooltip, { formatXAxisTick } from './charts/CustomTooltip';

const CryptoPriceChart = ({ crypto }: { crypto: Cryptocurrency }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('7d');
  const { chartData, loading, error } = useBinanceChartData(crypto?.symbol, timeframe);
  
  const processedChartData = useMemo(() => {
    if (!chartData) return [];
    return chartData.map(d => {
      const isGain = d.close >= d.open;
      const bodyHeight = Math.abs(d.close - d.open);
      const wickBottom = Math.min(d.open, d.close) - d.low;
      const wickTop = d.high - Math.max(d.open, d.close);
      
      return {
        ...d,
        // Main candlestick body
        candleBody: isGain ? [d.open, d.close] : [d.close, d.open],
        // Wicks (shadows)
        wickLow: [d.low, Math.min(d.open, d.close)],
        wickHigh: [Math.max(d.open, d.close), d.high],
        // Colors
        bodyColor: isGain ? '#22c55e' : '#ef4444', // green for gain, red for loss
        wickColor: isGain ? '#16a34a' : '#dc2626', // darker shades for wicks
        // Additional data for tooltip
        isGain,
        bodyHeight,
        wickBottom,
        wickTop,
      };
    });
  }, [chartData]);
  
  const domain = useMemo((): [number, number] => {
    if (!chartData || chartData.length === 0) return [0, 0];
    const lows = chartData.map(d => d.low);
    const highs = chartData.map(d => d.high);
    const minLow = Math.min(...lows);
    const maxHigh = Math.max(...highs);
    const padding = (maxHigh - minLow) * 0.02; // 2% padding
    return [minLow - padding, maxHigh + padding];
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
            <ComposedChart data={processedChartData} margin={{ top: 5, right: 30, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
              <XAxis
                dataKey="time"
                tickFormatter={(tick) => formatXAxisTick(tick, timeframe)}
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={60}
                fontSize={12}
              />
              <YAxis
                orientation="right"
                domain={domain}
                tickFormatter={(tick) => formatPrice(tick)}
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
                width={80}
                fontSize={12}
              />
              <Tooltip 
                content={<CustomTooltip timeframe={timeframe} formatter={formatPrice} />} 
                cursor={{ fill: 'hsl(var(--accent) / 0.1)' }}
              />
              
              {/* Candlestick Wicks - Lower shadows */}
              <Bar 
                dataKey="wickLow" 
                barSize={1.5} 
                isAnimationActive={false}
                radius={0}
              >
                {processedChartData.map((entry, index) => (
                  <Cell key={`wick-low-${index}`} fill={entry.wickColor} />
                ))}
              </Bar>
              
              {/* Candlestick Wicks - Upper shadows */}
              <Bar 
                dataKey="wickHigh" 
                barSize={1.5} 
                isAnimationActive={false}
                radius={0}
              >
                {processedChartData.map((entry, index) => (
                  <Cell key={`wick-high-${index}`} fill={entry.wickColor} />
                ))}
              </Bar>
              
              {/* Candlestick Bodies */}
              <Bar 
                dataKey="candleBody" 
                barSize={8} 
                isAnimationActive={false}
                radius={0}
              >
                {processedChartData.map((entry, index) => (
                  <Cell 
                    key={`body-${index}`} 
                    fill={entry.bodyColor}
                    stroke={entry.bodyColor}
                    strokeWidth={entry.bodyHeight < 0.01 ? 1 : 0} // Add stroke for doji candles
                  />
                ))}
              </Bar>
              
              {crypto.current_price > 0 && (
                <ReferenceLine 
                  y={crypto.current_price} 
                  stroke="hsl(var(--primary))" 
                  strokeDasharray="3 3"
                  strokeWidth={2}
                >
                  <Label 
                    value={`Current: ${formatPrice(crypto.current_price)}`} 
                    position="insideTopRight" 
                    fill="hsl(var(--primary))" 
                    fontSize={12} 
                    offset={10}
                    className="font-semibold"
                  />
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
