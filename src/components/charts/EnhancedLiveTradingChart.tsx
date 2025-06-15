
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
import OHLCCandlestick from './OHLCCandlestick';

interface EnhancedLiveTradingChartProps {
  crypto: Cryptocurrency;
  chartType: ChartType;
  timeframe: '1h' | '4h' | '1d' | '1w';
}

const EnhancedLiveTradingChart: React.FC<EnhancedLiveTradingChartProps> = ({ 
  crypto, 
  chartType, 
  timeframe 
}) => {
  const { chartData: binanceData, loading, error } = useBinanceChartData(crypto.symbol, timeframe as any);
  const [liveData, setLiveData] = useState<ChartDataPoint[]>([]);
  const lastUpdateRef = useRef<number>(0);

  // Get optimal data sampling based on timeframe
  const getOptimalDataSampling = (data: ChartDataPoint[], tf: string) => {
    if (data.length === 0) return data;

    let maxCandles: number;
    let sampleRate: number;

    switch (tf) {
      case '1h':
        maxCandles = 30; // Show ~30 candles for 1H view
        break;
      case '4h':
        maxCandles = 40; // Show ~40 candles for 4H view
        break;
      case '1d':
        maxCandles = 50; // Show ~50 candles for 1D view
        break;
      case '1w':
        maxCandles = 60; // Show ~60 candles for 1W view
        break;
      default:
        maxCandles = 40;
    }

    // Calculate sample rate to get desired number of candles
    sampleRate = Math.max(1, Math.floor(data.length / maxCandles));
    
    // Sample data at calculated intervals
    const sampledData = data.filter((_, index) => index % sampleRate === 0);
    
    // Always include the last data point for current price
    if (sampledData[sampledData.length - 1] !== data[data.length - 1]) {
      sampledData.push(data[data.length - 1]);
    }

    return sampledData;
  };

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
      const sampledData = getOptimalDataSampling(binanceData, timeframe);
      setLiveData(sampledData);
      lastUpdateRef.current = Date.now();
    }
  }, [binanceData, timeframe]);

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

      setLiveData(prev => {
        const sampledData = getOptimalDataSampling([...prev.slice(-200), newCandle], timeframe);
        return sampledData;
      });
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

  // Format time labels based on timeframe with proper granularity
  const formatTimeLabel = (timestamp: number) => {
    const date = new Date(timestamp);
    switch (timeframe) {
      case '1h':
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      case '4h':
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      case '1d':
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      case '1w':
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      default:
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
    }
  };

  // Get tick interval for X-axis based on data length and timeframe
  const getXAxisInterval = (dataLength: number) => {
    if (dataLength <= 20) return 0; // Show all ticks
    if (dataLength <= 40) return 1; // Show every other tick
    if (dataLength <= 60) return 2; // Show every 3rd tick
    return Math.floor(dataLength / 8); // Show ~8 ticks max
  };

  // Prepare chart data with proper OHLC structure
  const chartData = liveData.map((item, index) => ({
    index,
    time: item.time,
    timeLabel: formatTimeLabel(item.time),
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
    price: item.close, // For line/area charts
    ohlcData: item // Pass full OHLC data for candlestick
  }));

  // Calculate proper Y-axis domain with padding
  const allPrices = chartData.flatMap(d => [d.open, d.high, d.low, d.close]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice;
  const padding = Math.max(priceRange * 0.05, maxPrice * 0.01);
  const yAxisDomain: [number, number] = [minPrice - padding, maxPrice + padding];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-white mb-2">
            {new Date(data.time).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          {chartType === 'candlestick' && (
            <div className="space-y-1 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Open:</span>
                <span className="text-white font-mono">${data.open?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">High:</span>
                <span className="text-green-400 font-mono">${data.high?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Low:</span>
                <span className="text-red-400 font-mono">${data.low?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Close:</span>
                <span className="text-white font-mono font-semibold">${data.close?.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-600 pt-2 mt-2">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">Change:</span>
                  <span className={`font-mono ${data.close >= data.open ? 'text-green-400' : 'text-red-400'}`}>
                    {data.close >= data.open ? '+' : ''}${(data.close - data.open).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
          {(chartType === 'line' || chartType === 'area') && (
            <p className="text-sm text-gray-300">Price: ${data.price?.toFixed(2)}</p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomCandlestick = (props: any) => {
    return (
      <OHLCCandlestick 
        {...props} 
        payload={props.payload?.ohlcData} 
        yAxisDomain={yAxisDomain}
      />
    );
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart 
          data={chartData} 
          margin={{ top: 20, right: 40, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="timeLabel" 
            stroke="#9CA3AF"
            fontSize={12}
            interval={getXAxisInterval(chartData.length)}
            minTickGap={20}
            angle={timeframe === '1h' || timeframe === '4h' ? 0 : -45}
            textAnchor={timeframe === '1h' || timeframe === '4h' ? 'middle' : 'end'}
            height={timeframe === '1h' || timeframe === '4h' ? 30 : 60}
          />
          <YAxis 
            orientation="right"
            stroke="#9CA3AF"
            fontSize={12}
            domain={yAxisDomain}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Render based on chart type */}
          {chartType === 'line' && (
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              dot={false}
            />
          )}
          
          {chartType === 'area' && (
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#8B5CF6" 
              fill="#8B5CF6"
              fillOpacity={0.3}
            />
          )}
          
          {chartType === 'candlestick' && (
            <Bar 
              dataKey="high"
              shape={CustomCandlestick}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EnhancedLiveTradingChart;
