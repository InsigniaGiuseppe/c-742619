
import React from 'react';

interface CandlestickProps {
  payload?: any;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

const RechartsCandlestick: React.FC<CandlestickProps> = ({ 
  payload, 
  x = 0, 
  y = 0, 
  width = 0, 
  height = 0 
}) => {
  if (!payload || !payload.open || !payload.high || !payload.low || !payload.close) {
    return null;
  }

  const { open, high, low, close } = payload;
  const isGreen = close >= open;
  const color = isGreen ? '#10B981' : '#EF4444';
  
  // Calculate candlestick dimensions
  const candleWidth = Math.max(width * 0.6, 8);
  const wickWidth = 2;
  const centerX = x + width / 2;
  const candleX = centerX - candleWidth / 2;

  // Calculate the price range for this data point
  const priceRange = high - low;
  const pixelsPerPrice = height / priceRange;

  // Calculate Y positions for each price level
  // y represents the top of the chart area (high price)
  // y + height represents the bottom (low price)
  const highY = y;
  const lowY = y + height;
  const openY = y + (high - open) * pixelsPerPrice;
  const closeY = y + (high - close) * pixelsPerPrice;

  // Body dimensions
  const bodyTop = Math.min(openY, closeY);
  const bodyBottom = Math.max(openY, closeY);
  const bodyHeight = Math.max(Math.abs(bodyBottom - bodyTop), 2);

  return (
    <g>
      {/* High-Low Wick */}
      <line
        x1={centerX}
        y1={highY}
        x2={centerX}
        y2={lowY}
        stroke={color}
        strokeWidth={wickWidth}
      />
      
      {/* Open-Close Body */}
      <rect
        x={candleX}
        y={bodyTop}
        width={candleWidth}
        height={bodyHeight}
        fill={isGreen ? color : 'white'}
        stroke={color}
        strokeWidth={2}
        rx={1}
      />
    </g>
  );
};

export default RechartsCandlestick;
