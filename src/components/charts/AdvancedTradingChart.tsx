
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cryptocurrency } from '@/hooks/useCryptocurrencies';
import TradingChartControls from './TradingChartControls';
import CryptoStatsDisplay from './CryptoStatsDisplay';
import LiveTradingChart from './LiveTradingChart';

export type ChartType = 'candlestick' | 'line' | 'area';

interface AdvancedTradingChartProps {
  crypto: Cryptocurrency;
}

const AdvancedTradingChart: React.FC<AdvancedTradingChartProps> = ({ crypto }) => {
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [timeframe, setTimeframe] = useState<'1h' | '4h' | '1d' | '1w'>('1d');

  const priceChange = crypto.price_change_24h || 0;
  const priceChangePercent = crypto.price_change_percentage_24h || 0;

  return (
    <Card className="glass glass-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold">
                {crypto.symbol.slice(0, 2).toUpperCase()}
              </div>
              {crypto.name} ({crypto.symbol.toUpperCase()})
            </CardTitle>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-2xl font-bold">${crypto.current_price.toFixed(2)}</span>
              <Badge variant={priceChange >= 0 ? 'default' : 'destructive'}>
                {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
              </Badge>
            </div>
          </div>
          <TradingChartControls
            chartType={chartType}
            timeframe={timeframe}
            onChartTypeChange={setChartType}
            onTimeframeChange={setTimeframe}
          />
        </div>
      </CardHeader>
      <CardContent>
        <LiveTradingChart 
          crypto={crypto} 
          chartType={chartType} 
          timeframe={timeframe} 
        />
        <CryptoStatsDisplay crypto={crypto} />
      </CardContent>
    </Card>
  );
};

export default AdvancedTradingChart;
