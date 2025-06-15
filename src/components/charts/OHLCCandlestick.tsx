
import React from 'react';

interface OHLCCandlestickProps {
  x: number;
  y: number;
  width: number;
  height: number;
  payload: {
    open: number;
    high: number;
    low: number;
    close: number;
    time: number;
  };
  // Chart bounds for proper scaling
  yAxisDomain: [number, number];
}

const OHLCCandlestick: React.FC<OHLCCandlestickProps> = ({ 
  x, 
  y, 
  width, 
  height, 
  payload,
  yAxisDomain 
}) => {
  if (!payload || typeof payload.open !== 'number' || typeof payload.high !== 'number' || 
      typeof payload.low !== 'number' || typeof payload.close !== 'number') {
    return null;
  }

  const { open, high, low, close } = payload;
  const [minPrice, maxPrice] = yAxisDomain;
  const priceRange = maxPrice - minPrice;
  
  if (priceRange === 0) return null;

  // Calculate positions based on price range
  const getYPosition = (price: number) => {
    const priceRatio = (price - minPrice) / priceRange;
    return y + height - (priceRatio * height); // Invert Y since SVG Y increases downward
  };

  const highY = getYPosition(high);
  const lowY = getYPosition(low);
  const openY = getYPosition(open);
  const closeY = getYPosition(close);

  // Determine candle color and body dimensions
  const isGreen = close >= open;
  const color = isGreen ? '#10B981' : '#EF4444'; // Green or Red
  
  // Calculate candle width (80% of available width, min 4px, max 20px)
  const candleWidth = Math.max(Math.min(width * 0.8, 20), 4);
  const centerX = x + width / 2;
  const candleX = centerX - candleWidth / 2;
  
  // Body dimensions
  const bodyTop = Math.min(openY, closeY);
  const bodyBottom = Math.max(openY, closeY);
  const bodyHeight = Math.max(bodyBottom - bodyTop, 1); // Minimum 1px height

  return (
    <g>
      {/* High-Low Wick */}
      <line
        x1={centerX}
        y1={highY}
        x2={centerX}
        y2={lowY}
        stroke={color}
        strokeWidth={1}
      />
      
      {/* Open-Close Body */}
      <rect
        x={candleX}
        y={bodyTop}
        width={candleWidth}
        height={bodyHeight}
        fill={isGreen ? color : color}
        stroke={color}
        strokeWidth={1}
        rx={0.5}
      />
      
      {/* For doji candles (open = close), add a horizontal line */}
      {Math.abs(open - close) < (priceRange * 0.001) && (
        <line
          x1={candleX}
          y1={openY}
          x2={candleX + candleWidth}
          y2={openY}
          stroke={color}
          strokeWidth={2}
        />
      )}
    </g>
  );
};

export default OHLCCandlestick;
