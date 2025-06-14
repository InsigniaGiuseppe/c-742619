
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
  ResponsiveContainer 
} from 'recharts';
import { Cryptocurrency } from '@/hooks/useCryptocurrencies';
import { useBinanceChartData, ChartDataPoint } from '@/hooks/useBinanceChartData';
import { ChartType } from './AdvancedTradingChart';

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
    const lastCandle = liveData[liveData.length - 1];
    
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

  // Prepare chart data with volume
  const chartData = liveData.map((item, index) => ({
    time: new Date(item.time).toLocaleDateString(),
    timeMs: item.time,
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
    volume: Math.random() * 1000000, // Placeholder volume data
    price: item.close
  }));

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
          <p className="text-sm text-gray-300">Volume: {data.volume?.toLocaleString()}</p>
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
            domain={['dataMin - 50', 'dataMax + 50']}
          />
          <YAxis 
            yAxisId="volume"
            orientation="left"
            stroke="#9CA3AF"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Volume bars */}
          <Bar 
            yAxisId="volume"
            dataKey="volume" 
            fill="#374151" 
            opacity={0.3}
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
            <Line 
              yAxisId="price"
              type="monotone" 
              dataKey="close" 
              stroke="#10B981" 
              strokeWidth={2}
              dot={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LiveTradingChart;
