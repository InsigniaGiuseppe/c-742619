
import React from 'react';
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
import { generateSampleData, generateVolumeData } from './chartDataUtils';
import { ChartType } from './ChartSeriesManager';

interface RechartsTradingChartProps {
  crypto: Cryptocurrency;
  chartType: ChartType;
  timeframe: '1h' | '4h' | '1d' | '1w';
}

const RechartsTradingChart: React.FC<RechartsTradingChartProps> = ({ 
  crypto, 
  chartType, 
  timeframe 
}) => {
  const data = generateSampleData(crypto);
  const volumeData = generateVolumeData(data);

  // Combine price and volume data
  const chartData = data.map((item, index) => ({
    time: new Date(item.time * 1000).toLocaleDateString(),
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
    volume: volumeData[index]?.value || 0,
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

export default RechartsTradingChart;
