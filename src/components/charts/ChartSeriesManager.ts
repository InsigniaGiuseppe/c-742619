
import { IChartApi, ISeriesApi, CandlestickData, LineData, HistogramData } from 'lightweight-charts';
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
      this.currentSeries = this.chart.addSeries('Candlestick', candlestickSeriesOptions);
      this.currentSeries.setData(data as CandlestickData[]);
    } else if (chartType === 'line') {
      this.currentSeries = this.chart.addSeries('Line', lineSeriesOptions);
      this.currentSeries.setData(data.map(d => ({ time: d.time, value: d.close }) as LineData));
    } else if (chartType === 'area') {
      this.currentSeries = this.chart.addSeries('Area', areaSeriesOptions);
      this.currentSeries.setData(data.map(d => ({ time: d.time, value: d.close }) as LineData));
    }

    return this.currentSeries;
  }

  addVolumeSeries(volumeData: Array<{ time: number; value: number; color: string }>) {
    // Remove existing volume series if any
    if (this.volumeSeries) {
      this.chart.removeSeries(this.volumeSeries);
    }

    this.volumeSeries = this.chart.addSeries('Histogram', volumeSeriesOptions);
    this.volumeSeries.setData(volumeData as HistogramData[]);
    
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
