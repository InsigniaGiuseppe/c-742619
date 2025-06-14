
import { useState, useEffect, useCallback } from 'react';

type Timeframe = '1h' | '1d' | '7d' | '30d' | '1y' | 'all';

export interface ChartDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

const getBinanceParams = (timeframe: Timeframe): { interval: string; limit?: number; startTime?: number } => {
  const now = Date.now();
  switch (timeframe) {
    case '1h':
      // Binance `1m` interval, limit 60 for 1 hour.
      return { interval: '1m', limit: 60 };
    case '1d':
      // Binance `15m` interval, 96 points for 24 hours.
      return { interval: '15m', limit: 96 };
    case '7d':
      // Binance `2h` interval, 84 points for 7 days.
      return { interval: '2h', limit: 84 };
    case '30d':
      // Binance `8h` interval, 90 points for 30 days.
      return { interval: '8h', limit: 90 };
    case '1y':
       // Binance `1d` interval, 365 points for 1 year.
      return { interval: '1d', limit: 365 };
    case 'all':
    default:
       // Binance `1w` interval, max limit is 1000.
      return { interval: '1w', limit: 1000 };
  }
};

export const useBinanceChartData = (symbol: string | undefined, timeframe: Timeframe) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChartData = useCallback(async () => {
    if (!symbol) return;

    setLoading(true);
    setError(null);
    try {
      const { interval, limit } = getBinanceParams(timeframe);
      const binanceSymbol = `${symbol.toUpperCase()}USDT`;
      const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}${limit ? `&limit=${limit}` : ''}`;
      
      console.log(`[useBinanceChartData] Fetching from: ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.msg || `Failed to fetch chart data from Binance: ${response.statusText}`);
      }
      const data: [number, string, string, string, string, ...any[]][] = await response.json();
      
      const processedData = data.map(([time, open, high, low, close]) => ({
        time: time,
        open: parseFloat(open),
        high: parseFloat(high),
        low: parseFloat(low),
        close: parseFloat(close),
      }));
      
      console.log(`[useBinanceChartData] Fetched and processed ${processedData.length} data points.`);
      setChartData(processedData);

    } catch (err: any) {
      console.error('[useBinanceChartData] Error fetching chart data:', err);
      setError(err.message || 'Could not load chart data.');
      setChartData([]); // Clear data on error
    } finally {
      setLoading(false);
    }
  }, [symbol, timeframe]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  return { chartData, loading, error };
};
