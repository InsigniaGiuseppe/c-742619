
import { IChartApi } from 'lightweight-charts';
import { ChartDataPoint } from './chartDataUtils';
import { 
  candlestickSeriesOptions, 
  lineSeriesOptions, 
  areaSeriesOptions, 
  volumeSeriesOptions 
} from './chartConfig';

export type ChartType = 'candlestick' | 'line' | 'area';

export class ChartSeriesManager {
  private chart: IChartApi;

  constructor(chart: IChartApi) {
    this.chart = chart;
  }

  addPriceSeries(chartType: ChartType, data: ChartDataPoint[]) {
    if (chartType === 'candlestick') {
      const series = this.chart.addCandlestickSeries(candlestickSeriesOptions);
      series.setData(data);
      return series;
    } else if (chartType === 'line') {
      const series = this.chart.addLineSeries(lineSeriesOptions);
      series.setData(data.map(d => ({ time: d.time, value: d.close })));
      return series;
    } else if (chartType === 'area') {
      const series = this.chart.addAreaSeries(areaSeriesOptions);
      series.setData(data.map(d => ({ time: d.time, value: d.close })));
      return series;
    }
  }

  addVolumeSeries(volumeData: Array<{ time: number; value: number; color: string }>) {
    const volumeSeries = this.chart.addHistogramSeries(volumeSeriesOptions);
    volumeSeries.setData(volumeData);
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });
    return volumeSeries;
  }

  clearAllSeries() {
    // Note: In lightweight-charts v4+, we need to track series manually
    // This is a simplified approach - in production, you'd want to track series references
    try {
      // Clear the chart by removing all series (implementation depends on version)
      // For now, we'll rely on the chart recreation in the parent component
    } catch (error) {
      console.warn('Could not clear series:', error);
    }
  }
}
