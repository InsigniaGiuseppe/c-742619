
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

  // Initialize chart once
  useEffect(() => {
    if (chartContainerRef.current && !chartRef.current) {
      console.log('[TradingChartDisplay] Initializing chart');
      
      try {
        const config = getChartConfig(chartContainerRef.current.clientWidth);
        chartRef.current = createChart(chartContainerRef.current, config);
        seriesManagerRef.current = new ChartSeriesManager(chartRef.current);
        
        console.log('[TradingChartDisplay] Chart initialized successfully');
      } catch (error) {
        console.error('[TradingChartDisplay] Error initializing chart:', error);
      }

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
          console.log('[TradingChartDisplay] Cleaning up chart');
          chartRef.current.remove();
          chartRef.current = null;
          seriesManagerRef.current = null;
        }
      };
    }
  }, []);

  // Update chart data when props change
  useEffect(() => {
    if (chartRef.current && seriesManagerRef.current) {
      console.log(`[TradingChartDisplay] Updating chart: ${chartType}, ${crypto.symbol}, ${timeframe}`);
      
      try {
        // Clear existing series
        seriesManagerRef.current.clearAllSeries();

        // Generate new data
        const data = generateSampleData(crypto);
        const volumeData = generateVolumeData(data);

        // Add new series
        seriesManagerRef.current.addPriceSeries(chartType, data);
        seriesManagerRef.current.addVolumeSeries(volumeData);
        
        console.log('[TradingChartDisplay] Chart data updated successfully');
      } catch (error) {
        console.error('[TradingChartDisplay] Error updating chart data:', error);
      }
    }
  }, [chartType, crypto, timeframe]);

  return <div ref={chartContainerRef} className="w-full h-[400px]" />;
};

export default TradingChartDisplay;
