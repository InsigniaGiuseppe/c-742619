
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
    // Remove existing price series if any
    if (this.currentSeries) {
      this.chart.removeSeries(this.currentSeries);
    }

    if (chartType === 'candlestick') {
      this.currentSeries = this.chart.addSeries({ type: 'Candlestick', ...candlestickSeriesOptions });
      const candlestickData = data.map(d => ({
        time: d.time as any,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close
      })) as CandlestickData[];
      this.currentSeries.setData(candlestickData);
    } else if (chartType === 'line') {
      this.currentSeries = this.chart.addSeries({ type: 'Line', ...lineSeriesOptions });
      const lineData = data.map(d => ({ time: d.time as any, value: d.close })) as LineData[];
      this.currentSeries.setData(lineData);
    } else if (chartType === 'area') {
      this.currentSeries = this.chart.addSeries({ type: 'Area', ...areaSeriesOptions });
      const areaData = data.map(d => ({ time: d.time as any, value: d.close })) as LineData[];
      this.currentSeries.setData(areaData);
    }

    return this.currentSeries;
  }

  addVolumeSeries(volumeData: Array<{ time: number; value: number; color: string }>) {
    // Remove existing volume series if any
    if (this.volumeSeries) {
      this.chart.removeSeries(this.volumeSeries);
    }

    this.volumeSeries = this.chart.addSeries({ type: 'Histogram', ...volumeSeriesOptions });
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
    
    return this.volumeSeries;
  }

  clearAllSeries() {
    if (this.currentSeries) {
      this.chart.removeSeries(this.currentSeries);
      this.currentSeries = null;
    }
    if (this.volumeSeries) {
      this.chart.removeSeries(this.volumeSeries);
      this.volumeSeries = null;
    }
  }
}
