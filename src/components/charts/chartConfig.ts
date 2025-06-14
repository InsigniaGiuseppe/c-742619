
import { ColorType } from 'lightweight-charts';

export const getChartConfig = (width: number) => ({
  layout: {
    background: { type: ColorType.Solid, color: 'transparent' },
    textColor: '#ffffff',
  },
  grid: {
    vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
    horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
  },
  crosshair: {
    mode: 1,
  },
  rightPriceScale: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  timeScale: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  width,
  height: 400,
});

export const candlestickSeriesOptions = {
  upColor: '#26a69a',
  downColor: '#ef5350',
  borderVisible: false,
  wickUpColor: '#26a69a',
  wickDownColor: '#ef5350',
};

export const lineSeriesOptions = {
  color: '#2962FF',
  lineWidth: 2,
};

export const areaSeriesOptions = {
  lineColor: '#2962FF',
  topColor: 'rgba(41, 98, 255, 0.3)',
  bottomColor: 'rgba(41, 98, 255, 0.05)',
};

export const volumeSeriesOptions = {
  color: 'rgba(255, 255, 255, 0.3)',
  priceFormat: {
    type: 'volume' as const,
  },
  priceScaleId: 'volume',
};
