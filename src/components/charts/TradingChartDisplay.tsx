
import React from 'react';
import { Cryptocurrency } from '@/hooks/useCryptocurrencies';
import { ChartType } from './ChartSeriesManager';
import RechartsTradingChart from './RechartsTradingChart';

interface TradingChartDisplayProps {
  crypto: Cryptocurrency;
  chartType: ChartType;
  timeframe: '1h' | '4h' | '1d' | '1w';
}

const TradingChartDisplay: React.FC<TradingChartDisplayProps> = ({ 
  crypto, 
  chartType, 
  timeframe 
}) => {
  return <RechartsTradingChart crypto={crypto} chartType={chartType} timeframe={timeframe} />;
};

export default TradingChartDisplay;
