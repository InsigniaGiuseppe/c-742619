
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';
import { Cryptocurrency } from '@/hooks/useCryptocurrencies';
import { getChartConfig } from './chartConfig';
import { generateSampleData, generateVolumeData, ChartDataPoint } from './chartDataUtils';
import { ChartSeriesManager, ChartType } from './ChartSeriesManager';

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
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesManagerRef = useRef<ChartSeriesManager | null>(null);

  useEffect(() => {
    if (chartContainerRef.current) {
      const config = getChartConfig(chartContainerRef.current.clientWidth);
      chartRef.current = createChart(chartContainerRef.current, config);
      seriesManagerRef.current = new ChartSeriesManager(chartRef.current);

      const handleResize = () => {
        if (chartRef.current && chartContainerRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
        }
      };
    }
  }, []);

  useEffect(() => {
    if (chartRef.current && seriesManagerRef.current) {
      // Remove existing series by recreating the chart
      if (chartContainerRef.current) {
        chartRef.current.remove();
        const config = getChartConfig(chartContainerRef.current.clientWidth);
        chartRef.current = createChart(chartContainerRef.current, config);
        seriesManagerRef.current = new ChartSeriesManager(chartRef.current);
      }

      const data = generateSampleData(crypto);
      const volumeData = generateVolumeData(data);

      // Add price series
      seriesManagerRef.current.addPriceSeries(chartType, data);
      
      // Add volume series
      seriesManagerRef.current.addVolumeSeries(volumeData);
    }
  }, [chartType, crypto, timeframe]);

  return <div ref={chartContainerRef} className="w-full" />;
};

export default TradingChartDisplay;
