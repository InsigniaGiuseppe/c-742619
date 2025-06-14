
import { 
  IChartApi, 
  ISeriesApi, 
  CandlestickData, 
  LineData, 
  HistogramData,
  CandlestickSeriesPartialOptions,
  LineSeriesPartialOptions,
  AreaSeriesPartialOptions,
  HistogramSeriesPartialOptions
} from 'lightweight-charts';
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
  private currentSeries: ISeriesApi<any> | null = null;
  private volumeSeries: ISeriesApi<any> | null = null;

  constructor(chart: IChartApi) {
    this.chart = chart;
  }

  addPriceSeries(chartType: ChartType, data: ChartDataPoint[]) {
    console.log(`[ChartSeriesManager] Adding ${chartType} series with ${data.length} data points`);
    
    // Remove existing price series if any
    if (this.currentSeries) {
      this.chart.removeSeries(this.currentSeries);
      this.currentSeries = null;
    }

    if (chartType === 'candlestick') {
      this.currentSeries = this.chart.addSeries('candlestick', candlestickSeriesOptions as CandlestickSeriesPartialOptions);
      const candlestickData = data.map(d => ({
        time: d.time as any,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close
      })) as CandlestickData[];
      this.currentSeries.setData(candlestickData);
    } else if (chartType === 'line') {
      this.currentSeries = this.chart.addSeries('line', lineSeriesOptions as LineSeriesPartialOptions);
      const lineData = data.map(d => ({ time: d.time as any, value: d.close })) as LineData[];
      this.currentSeries.setData(lineData);
    } else if (chartType === 'area') {
      this.currentSeries = this.chart.addSeries('area', areaSeriesOptions as AreaSeriesPartialOptions);
      const areaData = data.map(d => ({ time: d.time as any, value: d.close })) as LineData[];
      this.currentSeries.setData(areaData);
    }

    console.log(`[ChartSeriesManager] Successfully added ${chartType} series`);
    return this.currentSeries;
  }

  addVolumeSeries(volumeData: Array<{ time: number; value: number; color: string }>) {
    console.log(`[ChartSeriesManager] Adding volume series with ${volumeData.length} data points`);
    
    // Remove existing volume series if any
    if (this.volumeSeries) {
      this.chart.removeSeries(this.volumeSeries);
      this.volumeSeries = null;
    }

    this.volumeSeries = this.chart.addSeries('histogram', volumeSeriesOptions as HistogramSeriesPartialOptions);
    const histogramData = volumeData.map(d => ({
      time: d.time as any,
      value: d.value,
      color: d.color
    })) as HistogramData[];
    this.volumeSeries.setData(histogramData);
    
    this.volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });
    
    console.log('[ChartSeriesManager] Successfully added volume series');
    return this.volumeSeries;
  }

  clearAllSeries() {
    console.log('[ChartSeriesManager] Clearing all series');
    
    if (this.currentSeries) {
      this.chart.removeSeries(this.currentSeries);
      this.currentSeries = null;
    }
    if (this.volumeSeries) {
      this.chart.removeSeries(this.volumeSeries);
      this.volumeSeries = null;
    }
    
    console.log('[ChartSeriesManager] All series cleared');
  }
}
