
import { Cryptocurrency } from '@/hooks/useCryptocurrencies';

export interface ChartDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  value: number;
}

export const generateSampleData = (crypto: Cryptocurrency): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const basePrice = crypto.current_price;
  let currentPrice = basePrice;
  
  for (let i = 0; i < 100; i++) {
    const time = Math.floor(Date.now() / 1000) - (100 - i) * 86400;
    const change = (Math.random() - 0.5) * 0.1; // Random price change
    currentPrice *= (1 + change);
    
    const high = currentPrice * (1 + Math.random() * 0.05);
    const low = currentPrice * (1 - Math.random() * 0.05);
    const open = currentPrice;
    const close = currentPrice;
    
    data.push({
      time,
      open,
      high,
      low,
      close,
      value: close // For line and area charts
    });
  }
  return data;
};

export const generateVolumeData = (data: ChartDataPoint[]) => {
  return data.map(d => ({
    time: d.time,
    value: Math.random() * 1000000, // Random volume
    color: d.close > d.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)'
  }));
};
