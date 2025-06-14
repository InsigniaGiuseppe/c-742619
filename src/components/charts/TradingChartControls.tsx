
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartType } from './ChartSeriesManager';

interface TradingChartControlsProps {
  chartType: ChartType;
  timeframe: '1h' | '4h' | '1d' | '1w';
  onChartTypeChange: (type: ChartType) => void;
  onTimeframeChange: (timeframe: '1h' | '4h' | '1d' | '1w') => void;
}

const TradingChartControls: React.FC<TradingChartControlsProps> = ({
  chartType,
  timeframe,
  onChartTypeChange,
  onTimeframeChange
}) => {
  return (
    <div className="flex items-center gap-2">
      <Select value={chartType} onValueChange={onChartTypeChange}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="candlestick">Candlestick</SelectItem>
          <SelectItem value="line">Line</SelectItem>
          <SelectItem value="area">Area</SelectItem>
        </SelectContent>
      </Select>
      <Select value={timeframe} onValueChange={onTimeframeChange}>
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1h">1H</SelectItem>
          <SelectItem value="4h">4H</SelectItem>
          <SelectItem value="1d">1D</SelectItem>
          <SelectItem value="1w">1W</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TradingChartControls;
