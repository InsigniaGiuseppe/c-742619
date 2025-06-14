
import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/formatters';
import { Cryptocurrency } from '@/hooks/useCryptocurrencies';
import { Skeleton } from './ui/skeleton';
import { format } from 'date-fns';
import clsx from 'clsx';

type Timeframe = '1h' | '1d' | '7d' | '30d' | '1y' | 'all';

interface ChartDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

const timeRangeMap: Record<Timeframe, string> = {
  '1h': '1',
  '1d': '1',
  '7d': '7',
  '30d': '30',
  '1y': '365',
  'all': 'max',
};

const formatXAxisTick = (tick: number, timeframe: Timeframe) => {
  const date = new Date(tick);
  switch (timeframe) {
    case '1h':
    case '1d':
      return format(date, 'HH:mm');
    case '7d':
    case '30d':
      return format(date, 'MMM d');
    case '1y':
    case 'all':
      return format(date, 'MMM yy');
    default:
      return format(date, 'MMM d');
  }
};

const CustomTooltip = ({ active, payload, label, timeframe }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-4 bg-background/80 backdrop-blur-sm border border-border rounded-lg shadow-lg">
        <p className="label text-sm text-muted-foreground">{formatXAxisTick(label, timeframe)}</p>
        <div className="mt-2 space-y-1 text-sm">
          <p><strong>Open:</strong> {formatPrice(data.open)}</p>
          <p><strong>High:</strong> {formatPrice(data.high)}</p>
          <p><strong>Low:</strong> {formatPrice(data.low)}</p>
          <p><strong>Close:</strong> {formatPrice(data.close)}</p>
        </div>
      </div>
    );
  }
  return null;
};

const CustomCandle = (props: any) => {
  const { x, y, width, height, low, high, open, close } = props;
  const isGain = close >= open;
  const fill = isGain ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))';
  const stroke = isGain ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))';

  const candleWidth = width * 0.7; // Make candles 70% of the available space
  const xOffset = x + (width - candleWidth) / 2;
  
  const yBody = isGain ? y + height * (1 - (close - low) / (high - low)) : y + height * (1 - (open - low) / (high - low));
  const bodyHeight = height * (Math.abs(open - close) / (high - low));

  return (
    <g>
      {/* Wick */}
      <line x1={x + width / 2} y1={y} x2={x + width / 2} y2={y + height} stroke={stroke} strokeWidth={1.5} />
      {/* Body */}
      <rect x={xOffset} y={yBody} width={candleWidth} height={Math.max(bodyHeight, 1)} fill={fill} />
    </g>
  );
};


const CryptoPriceChart = ({ crypto }: { crypto: Cryptocurrency }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('7d');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChartData = useCallback(async (selectedTimeframe: Timeframe) => {
    setLoading(true);
    setError(null);
    try {
      // CoinGecko API requires 'bitcoin' for BTC, not the UUID
      const coinId = crypto.name.toLowerCase(); 
      const days = timeRangeMap[selectedTimeframe];
      const url = `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || `Failed to fetch chart data: ${response.statusText}`);
      }
      const data: [number, number, number, number, number][] = await response.json();
      
      const processedData = data.map(([time, open, high, low, close]) => ({ time, open, high, low, close }));

      // For 1h, filter data for the last hour
      if(selectedTimeframe === '1h') {
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        setChartData(processedData.filter(d => d.time > oneHourAgo));
      } else {
        setChartData(processedData);
      }

    } catch (err: any) {
      setError(err.message || 'Could not load chart data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [crypto.name]);

  useEffect(() => {
    fetchChartData(timeframe);
  }, [timeframe, fetchChartData]);

  const domain: [number, number] = [
    Math.min(...chartData.map(d => d.low)),
    Math.max(...chartData.map(d => d.high))
  ];

  return (
    <Card className="glass glass-hover h-full">
      <CardContent className="pt-6 h-full flex flex-col">
        <div className="flex justify-end mb-4">
          <ToggleGroup
            type="single"
            defaultValue="7d"
            value={timeframe}
            onValueChange={(value: Timeframe) => {
              if (value) setTimeframe(value);
            }}
            aria-label="Chart timeframe"
          >
            <ToggleGroupItem value="1h" aria-label="1 hour">1H</ToggleGroupItem>
            <ToggleGroupItem value="1d" aria-label="1 day">1D</ToggleGroupItem>
            <ToggleGroupItem value="7d" aria-label="7 days">7D</ToggleGroupItem>
            <ToggleGroupItem value="30d" aria-label="30 days">30D</ToggleGroupItem>
            <ToggleGroupItem value="1y" aria-label="1 year">1Y</ToggleGroupItem>
            <ToggleGroupItem value="all" aria-label="All time">All</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex-grow">
        {loading ? (
          <div className="w-full h-[400px] flex flex-col justify-between">
            <Skeleton className="w-full h-4/5" />
            <div className="flex justify-between mt-2">
              <Skeleton className="w-12 h-4" />
              <Skeleton className="w-12 h-4" />
              <Skeleton className="w-12 h-4" />
              <Skeleton className="w-12 h-4" />
              <Skeleton className="w-12 h-4" />
            </div>
          </div>
        ) : error ? (
            <div className="w-full h-[400px] flex items-center justify-center text-destructive">{error}</div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
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
              />
              <Tooltip content={<CustomTooltip timeframe={timeframe} />} cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}/>
              <Bar dataKey="close" shape={<CustomCandle />} />
              <ReferenceLine y={crypto.current_price} stroke="hsl(var(--primary))" strokeDasharray="3 3">
                <YAxis.Label value="Current Price" position="insideTopLeft" fill="hsl(var(--primary))" fontSize={12} />
              </ReferenceLine>
            </ComposedChart>
          </ResponsiveContainer>
        )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CryptoPriceChart;
