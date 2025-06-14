
import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi } from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Cryptocurrency } from '@/hooks/useCryptocurrencies';

interface AdvancedTradingChartProps {
  crypto: Cryptocurrency;
}

const AdvancedTradingChart: React.FC<AdvancedTradingChartProps> = ({ crypto }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area'>('candlestick');
  const [timeframe, setTimeframe] = useState<'1h' | '4h' | '1d' | '1w'>('1d');

  // Generate sample OHLCV data
  const generateSampleData = () => {
    const data = [];
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

  useEffect(() => {
    if (chartContainerRef.current) {
      chartRef.current = createChart(chartContainerRef.current, {
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
        width: chartContainerRef.current.clientWidth,
        height: 400,
      });

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
    if (chartRef.current) {
      // Clear existing series
      chartRef.current.removeSeries = chartRef.current.removeSeries || function() {};
      
      const data = generateSampleData();

      if (chartType === 'candlestick') {
        const candlestickSeries = chartRef.current.addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
        });
        candlestickSeries.setData(data);
      } else if (chartType === 'line') {
        const lineSeries = chartRef.current.addLineSeries({
          color: '#2962FF',
          lineWidth: 2,
        });
        lineSeries.setData(data.map(d => ({ time: d.time, value: d.close })));
      } else if (chartType === 'area') {
        const areaSeries = chartRef.current.addAreaSeries({
          lineColor: '#2962FF',
          topColor: 'rgba(41, 98, 255, 0.3)',
          bottomColor: 'rgba(41, 98, 255, 0.05)',
        });
        areaSeries.setData(data.map(d => ({ time: d.time, value: d.close })));
      }

      // Add volume series
      const volumeSeries = chartRef.current.addHistogramSeries({
        color: 'rgba(255, 255, 255, 0.3)',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'volume',
      });

      const volumeData = data.map(d => ({
        time: d.time,
        value: Math.random() * 1000000, // Random volume
        color: d.close > d.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)'
      }));
      
      volumeSeries.setData(volumeData);
      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });
    }
  }, [chartType, crypto, timeframe]);

  const priceChange = crypto.price_change_24h || 0;
  const priceChangePercent = crypto.price_change_percentage_24h || 0;

  return (
    <Card className="glass glass-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold">
                {crypto.symbol.slice(0, 2).toUpperCase()}
              </div>
              {crypto.name} ({crypto.symbol.toUpperCase()})
            </CardTitle>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-2xl font-bold">${crypto.current_price.toFixed(2)}</span>
              <Badge variant={priceChange >= 0 ? 'default' : 'destructive'}>
                {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="candlestick">Candlestick</SelectItem>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="area">Area</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
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
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartContainerRef} className="w-full" />
        
        {/* Technical Indicators */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Market Cap:</span>
            <div className="font-semibold">${(crypto.market_cap || 0).toLocaleString()}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Volume 24h:</span>
            <div className="font-semibold">${(crypto.volume_24h || 0).toLocaleString()}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Price Change 24h:</span>
            <div className={`font-semibold ${priceChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedTradingChart;
