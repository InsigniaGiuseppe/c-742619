import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, subHours } from 'date-fns';
import { Cryptocurrency } from '@/hooks/useCryptocurrencies';
import { formatPrice } from '@/lib/formatters';

interface ChartDataPoint {
  time: Date;
  ohlc: [number, number, number, number]; // Open, High, Low, Close
}

const timeframes = [
  { label: '1H', value: '1h' },
  { label: '4H', value: '4h' },
  { label: '1D', value: '1d' },
  { label: '7D', value: '7d' },
  { label: 'All', value: 'all' }
];

const CustomCandle = (props: any) => {
  const { x, y, width, height, payload } = props;
  const [open, high, low, close] = payload.ohlc;
  const isGrowing = close >= open;
  const color = isGrowing ? '#22c55e' : '#ef4444'; // Using hex for green-500 and red-500
  const ratio = Math.abs(height / (open - close));

  if (open === close) {
    return <line x1={x} y1={y} x2={x + width} y2={y} stroke={color} style={{ strokeWidth: 2 }} />;
  }

  return (
    <g>
      <path
        d={`M${x + width / 2},${y} L${x + width / 2},${y + ratio * Math.abs(high - Math.max(open, close))}`}
        stroke={color}
      />
      <path
        d={`M${x + width / 2},${y + height} L${x + width / 2},${y + height - ratio * Math.abs(low - Math.min(open, close))}`}
        stroke={color}
      />
      <rect x={x} y={y + (isGrowing ? ratio * Math.abs(close - open) : 0)} width={width} height={Math.max(1, ratio * Math.abs(open - close))} fill={color} />
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const ohlc = data.ohlc;
    return (
      <div className="p-2 bg-background/90 backdrop-blur-sm border rounded-lg shadow-lg text-sm">
        <p className="label font-bold mb-2">{`${format(new Date(label), 'PPpp')}`}</p>
        <p className="text-muted-foreground">Open: <span className="font-mono text-foreground">{formatPrice(ohlc[0])}</span></p>
        <p className="text-muted-foreground">High: <span className="font-mono text-foreground">{formatPrice(ohlc[1])}</span></p>
        <p className="text-muted-foreground">Low: <span className="font-mono text-foreground">{formatPrice(ohlc[2])}</span></p>
        <p className="text-muted-foreground">Close: <span className="font-mono text-foreground">{formatPrice(ohlc[3])}</span></p>
      </div>
    );
  }
  return null;
};

const generateMockCandlestickData = (basePrice: number, timeframe: string): ChartDataPoint[] => {
    const now = new Date();
    let data: ChartDataPoint[] = [];
    let points = 24;
    let subtractFn: (date: Date, amount: number) => Date = subHours;
    let step = 1;

    switch (timeframe) {
        case '1h': points = 12; step = 5; subtractFn = (d, a) => subHours(d, a * 5 / 60); break;
        case '4h': points = 24; step = 10; subtractFn = (d, a) => subHours(d, a * 10 / 60); break;
        case '1d': points = 24; step = 1; subtractFn = subHours; break;
        case '7d': points = 7; step = 1; subtractFn = subDays; break;
        case 'all': default: points = 30; step = 1; subtractFn = subDays; break;
    }

    let lastClose = basePrice;
    for (let i = points - 1; i >= 0; i--) {
        // Using sine waves for deterministic, predictable mock data
        const volatility = 0.02;
        const open = lastClose * (1 + (Math.sin(i * 0.5) * volatility - volatility / 2) * 0.5);
        const close = open * (1 + (Math.sin(i * 0.7) * volatility - volatility / 2));
        const high = Math.max(open, close) * (1 + Math.abs(Math.sin(i * 1.3)) * 0.01);
        const low = Math.min(open, close) * (1 - Math.abs(Math.sin(i * 1.7)) * 0.01);
        
        data.push({
            time: subtractFn(now, i * step),
            ohlc: [open, high, low, close]
        });
        lastClose = close;
    }
    return data;
};


const CryptoPriceChart = ({ crypto }: { crypto: Cryptocurrency }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    if (crypto) {
      setChartData(generateMockCandlestickData(crypto.current_price, selectedTimeframe));
    }
  }, [crypto, selectedTimeframe]);

  const yDomain = useMemo(() => {
    if (!chartData.length) return [0, 0];
    const lows = chartData.map(d => d.ohlc[2]);
    const highs = chartData.map(d => d.ohlc[1]);
    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  }, [chartData]);
  
  const xTickFormatter = (time: Date) => {
    switch (selectedTimeframe) {
        case '1h':
        case '4h': return format(time, 'HH:mm');
        case '1d': return format(time, 'MMM d');
        case '7d': return format(time, 'MMM d');
        default: return format(time, 'MMM d, yy');
    }
  };

  return (
    <Card className="glass glass-hover">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <CardTitle>Price Chart</CardTitle>
          <div className="flex gap-2">
            {timeframes.map((tf) => (
              <Button
                key={tf.value}
                variant={selectedTimeframe === tf.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeframe(tf.value)}
              >
                {tf.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsla(var(--muted-foreground), 0.2)" />
            <XAxis
              dataKey="time"
              tickFormatter={xTickFormatter}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              orientation="right"
              domain={yDomain}
              tickFormatter={(value) => formatPrice(value)}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsla(var(--muted-foreground), 0.1)' }} />
            <Bar
              dataKey="ohlc"
              shape={<CustomCandle />}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CryptoPriceChart;
