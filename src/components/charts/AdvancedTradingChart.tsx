
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Cryptocurrency } from '@/hooks/useCryptocurrencies';
import { useBinanceChartData } from '@/hooks/useBinanceChartData';
import ChartControls, { Timeframe } from './ChartControls';
import { formatPrice } from '@/lib/formatters';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  LineChart, 
  CandlestickChart,
  Activity,
  Volume2
} from 'lucide-react';

interface AdvancedTradingChartProps {
  crypto: Cryptocurrency;
}

type ChartType = 'candlestick' | 'line' | 'area' | 'volume';
type Indicator = 'sma' | 'ema' | 'rsi' | 'macd' | 'bb';

const AdvancedTradingChart: React.FC<AdvancedTradingChartProps> = ({ crypto }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<'Candlestick' | 'Line' | 'Area'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  
  const [timeframe, setTimeframe] = useState<Timeframe>('7d');
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [activeIndicators, setActiveIndicators] = useState<Set<Indicator>>(new Set());
  const [showVolume, setShowVolume] = useState(true);

  const { chartData, loading, error } = useBinanceChartData(crypto?.symbol, timeframe);

  // Calculate technical indicators
  const processedData = useMemo(() => {
    if (!chartData || chartData.length === 0) return { candlestickData: [], lineData: [], volumeData: [] };

    const candlestickData = chartData.map(d => ({
      time: (d.time / 1000) as UTCTimestamp,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    const lineData = chartData.map(d => ({
      time: (d.time / 1000) as UTCTimestamp,
      value: d.close,
    }));

    const volumeData = chartData.map((d, index) => ({
      time: (d.time / 1000) as UTCTimestamp,
      value: Math.random() * 1000000, // Simulated volume data
      color: d.close >= d.open ? '#22c55e' : '#ef4444',
    }));

    return { candlestickData, lineData, volumeData };
  }, [chartData]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#a1a1aa',
      },
      grid: {
        vertLines: { color: '#27272a' },
        horzLines: { color: '#27272a' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#6366f1',
          width: 1,
          style: 2,
        },
        horzLine: {
          color: '#6366f1',
          width: 1,
          style: 2,
        },
      },
      rightPriceScale: {
        borderColor: '#27272a',
        textColor: '#a1a1aa',
      },
      timeScale: {
        borderColor: '#27272a',
        textColor: '#a1a1aa',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: false,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Update chart data and type
  useEffect(() => {
    if (!chartRef.current || !processedData.candlestickData.length) return;

    // Remove existing series
    if (mainSeriesRef.current) {
      chartRef.current.removeSeries(mainSeriesRef.current);
    }
    if (volumeSeriesRef.current) {
      chartRef.current.removeSeries(volumeSeriesRef.current);
    }

    // Add main series based on chart type
    if (chartType === 'candlestick') {
      const candlestickSeries = chartRef.current.addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderUpColor: '#16a34a',
        borderDownColor: '#dc2626',
        wickUpColor: '#16a34a',
        wickDownColor: '#dc2626',
      });
      candlestickSeries.setData(processedData.candlestickData);
      mainSeriesRef.current = candlestickSeries;
    } else if (chartType === 'line') {
      const lineSeries = chartRef.current.addLineSeries({
        color: '#6366f1',
        lineWidth: 2,
      });
      lineSeries.setData(processedData.lineData);
      mainSeriesRef.current = lineSeries;
    } else if (chartType === 'area') {
      const areaSeries = chartRef.current.addAreaSeries({
        topColor: 'rgba(99, 102, 241, 0.4)',
        bottomColor: 'rgba(99, 102, 241, 0.1)',
        lineColor: '#6366f1',
        lineWidth: 2,
      });
      areaSeries.setData(processedData.lineData);
      mainSeriesRef.current = areaSeries;
    }

    // Add volume series if enabled
    if (showVolume && chartType !== 'volume') {
      const volumeSeries = chartRef.current.addHistogramSeries({
        color: '#a1a1aa',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'volume',
      });
      volumeSeries.setData(processedData.volumeData);
      volumeSeriesRef.current = volumeSeries;

      chartRef.current.priceScale('volume').applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });
    }

    // Fit content
    chartRef.current.timeScale().fitContent();
  }, [processedData, chartType, showVolume]);

  const toggleIndicator = (indicator: Indicator) => {
    const newIndicators = new Set(activeIndicators);
    if (newIndicators.has(indicator)) {
      newIndicators.delete(indicator);
    } else {
      newIndicators.add(indicator);
    }
    setActiveIndicators(newIndicators);
  };

  const currentPrice = crypto.current_price;
  const priceChange = crypto.price_change_24h || 0;
  const priceChangePercent = crypto.price_change_percentage_24h || 0;

  return (
    <Card className="glass glass-hover h-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold">
                {crypto.symbol.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span>{crypto.name}</span>
                <span className="text-muted-foreground ml-2">({crypto.symbol.toUpperCase()})</span>
              </div>
            </CardTitle>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-2xl font-bold">{formatPrice(currentPrice)}</span>
              <Badge variant={priceChange >= 0 ? 'default' : 'destructive'} className="flex items-center gap-1">
                {priceChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
              </Badge>
            </div>
          </div>
          
          <ChartControls timeframe={timeframe} setTimeframe={setTimeframe} />
        </div>

        <Separator className="my-4" />

        {/* Chart Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Chart Type */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Chart:</span>
            <ToggleGroup type="single" value={chartType} onValueChange={(value: ChartType) => value && setChartType(value)}>
              <ToggleGroupItem value="candlestick" aria-label="Candlestick" size="sm">
                <CandlestickChart className="w-4 h-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="line" aria-label="Line" size="sm">
                <LineChart className="w-4 h-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="area" aria-label="Area" size="sm">
                <BarChart3 className="w-4 h-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Volume Toggle */}
          <Button
            variant={showVolume ? "default" : "outline"}
            size="sm"
            onClick={() => setShowVolume(!showVolume)}
          >
            <Volume2 className="w-4 h-4 mr-1" />
            Volume
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Technical Indicators */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Indicators:</span>
            <div className="flex gap-1">
              {(['sma', 'ema', 'rsi', 'macd', 'bb'] as Indicator[]).map((indicator) => (
                <Button
                  key={indicator}
                  variant={activeIndicators.has(indicator) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleIndicator(indicator)}
                  className="text-xs"
                >
                  {indicator.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="h-[500px] flex items-center justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Activity className="w-5 h-5 animate-spin" />
              Loading chart data...
            </div>
          </div>
        ) : error ? (
          <div className="h-[500px] flex items-center justify-center">
            <div className="text-center text-destructive">
              <p>Failed to load chart data</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div ref={chartContainerRef} className="w-full" />
            
            {/* Chart Overlay Information */}
            <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 text-sm">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">O:</span> {formatPrice(processedData.candlestickData[processedData.candlestickData.length - 1]?.open || 0)}
                </div>
                <div>
                  <span className="text-muted-foreground">H:</span> {formatPrice(processedData.candlestickData[processedData.candlestickData.length - 1]?.high || 0)}
                </div>
                <div>
                  <span className="text-muted-foreground">L:</span> {formatPrice(processedData.candlestickData[processedData.candlestickData.length - 1]?.low || 0)}
                </div>
                <div>
                  <span className="text-muted-foreground">C:</span> {formatPrice(processedData.candlestickData[processedData.candlestickData.length - 1]?.close || 0)}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedTradingChart;
