
import React, { useState, useEffect, useRef } from 'react';
import { 
  ComposedChart, 
  Line, 
  Area, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Cryptocurrency } from '@/hooks/useCryptocurrencies';
import { useBinanceChartData, ChartDataPoint } from '@/hooks/useBinanceChartData';
import { ChartType } from './AdvancedTradingChart';
import CandlestickShape from './CandlestickShape';

interface LiveTradingChartProps {
  crypto: Cryptocurrency;
  chartType: ChartType;
  timeframe: '1h' | '4h' | '1d' | '1w';
}

const LiveTradingChart: React.FC<LiveTradingChartProps> = ({ 
  crypto, 
  chartType, 
  timeframe 
}) => {
  const { chartData: binanceData, loading, error } = useBinanceChartData(crypto.symbol, timeframe as any);
  const [liveData, setLiveData] = useState<ChartDataPoint[]>([]);
  const lastUpdateRef = useRef<number>(0);

  // Convert timeframe to update interval (in milliseconds)
  const getUpdateInterval = (tf: string) => {
    switch (tf) {
      case '1h': return 60000; // 1 minute
      case '4h': return 900000; // 15 minutes  
      case '1d': return 3600000; // 1 hour
      case '1w': return 14400000; // 4 hours
      default: return 3600000;
    }
  };

  // Update live data when binance data changes
  useEffect(() => {
    if (binanceData.length > 0) {
      setLiveData([...binanceData]);
      lastUpdateRef.current = Date.now();
    }
  }, [binanceData]);

  // Handle live price updates with proper candlestick logic
  useEffect(() => {
    if (liveData.length === 0) return;

    const updateInterval = getUpdateInterval(timeframe);
    const now = Date.now();
    
    // Only update if enough time has passed for a new candle
    if (now - lastUpdateRef.current >= updateInterval) {
      // Create a new candle
      const newCandle: ChartDataPoint = {
        time: now,
        open: crypto.current_price,
        high: crypto.current_price,
        low: crypto.current_price,
        close: crypto.current_price,
      };

      setLiveData(prev => [...prev.slice(-99), newCandle]); // Keep last 100 candles
      lastUpdateRef.current = now;
    } else {
      // Update current candle
      setLiveData(prev => {
        const newData = [...prev];
        const currentCandle = newData[newData.length - 1];
        
        if (currentCandle) {
          currentCandle.close = crypto.current_price;
          currentCandle.high = Math.max(currentCandle.high, crypto.current_price);
          currentCandle.low = Math.min(currentCandle.low, crypto.current_price);
        }
        
        return newData;
      });
    }
  }, [crypto.current_price, timeframe, liveData.length]);

  if (loading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="text-gray-400">Loading chart data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="text-red-400">Error loading chart: {error}</div>
      </div>
    );
  }

  // Prepare chart data with calculated domains
  const chartData = liveData.map((item, index) => {
    // Generate stable volume based on price and index
    const priceRange = Math.max(item.high - item.low, 0.01);
    const baseVolume = priceRange * crypto.current_price * 1000;
    const stableVol = baseVolume * (0.8 + (index % 5) * 0.1); // Vary by 10-30% of base
    
    return {
      time: new Date(item.time).toLocaleDateString(),
      timeMs: item.time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: stableVol,
      price: item.close,
      isGreen: item.close >= item.open
    };
  });

  // Calculate proper domains for Y-axes
  const allPrices = chartData.flatMap(d => [d.open, d.high, d.low, d.close]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice;
  const pricePadding = priceRange * 0.05; // 5% padding
  
  const allVolumes = chartData.map(d => d.volume);
  const maxVolume = Math.max(...allVolumes);
  const minVolume = Math.min(...allVolumes);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-600 shadow-lg">
          <p className="font-medium text-white">{label}</p>
          {chartType === 'candlestick' && (
            <>
              <p className="text-sm text-gray-300">Open: ${data.open?.toFixed(2)}</p>
              <p className="text-sm text-gray-300">High: ${data.high?.toFixed(2)}</p>
              <p className="text-sm text-gray-300">Low: ${data.low?.toFixed(2)}</p>
              <p className="text-sm text-gray-300">Close: ${data.close?.toFixed(2)}</p>
            </>
          )}
          {(chartType === 'line' || chartType === 'area') && (
            <p className="text-sm text-gray-300">Price: ${data.price?.toFixed(2)}</p>
          )}
          <p className="text-sm text-gray-300">Volume: {data.volume?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <YAxis 
            yAxisId="price"
            orientation="right"
            stroke="#9CA3AF"
            fontSize={12}
            domain={[minPrice - pricePadding, maxPrice + pricePadding]}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
          />
          <YAxis 
            yAxisId="volume"
            orientation="left"
            stroke="#9CA3AF"
            fontSize={12}
            domain={[0, maxVolume * 1.1]}
            tickFormatter={(value) => (value / 1000).toFixed(0) + 'K'}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Volume bars with reduced opacity */}
          <Bar 
            yAxisId="volume"
            dataKey="volume" 
            fill="#374151" 
            opacity={0.15}
            stroke="none"
          />
          
          {/* Price display based on chart type */}
          {chartType === 'line' && (
            <Line 
              yAxisId="price"
              type="monotone" 
              dataKey="price" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              dot={false}
            />
          )}
          
          {chartType === 'area' && (
            <Area 
              yAxisId="price"
              type="monotone" 
              dataKey="price" 
              stroke="#8B5CF6" 
              fill="#8B5CF6"
              fillOpacity={0.3}
            />
          )}
          
          {chartType === 'candlestick' && (
            <Bar 
              yAxisId="price"
              dataKey="close"
              shape={(props: any) => <CandlestickShape {...props} />}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LiveTradingChart;
