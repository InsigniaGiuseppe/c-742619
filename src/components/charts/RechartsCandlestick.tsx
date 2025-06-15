
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
  const candleWidth = Math.max(width * 0.7, 4); // Make candlesticks thicker
  const wickWidth = 1;
  const centerX = x + width / 2;
  const candleX = centerX - candleWidth / 2;

  // For proper positioning, we need to calculate relative positions within the given height
  // The y coordinate represents the top of the chart area for this data point
  // height represents the total height allocated for this data point's range
  
  const priceRange = high - low;
  if (priceRange <= 0) {
    // If no price movement, draw a horizontal line
    return (
      <g>
        <line
          x1={centerX - candleWidth / 2}
          y1={y + height / 2}
          x2={centerX + candleWidth / 2}
          y2={y + height / 2}
          stroke={color}
          strokeWidth={2}
        />
      </g>
    );
  }

  // Calculate positions relative to the price range
  const topPrice = Math.max(open, close);
  const bottomPrice = Math.min(open, close);
  
  // Calculate Y positions (remember Y increases downward in SVG)
  const highY = y + ((high - high) / priceRange) * height; // Always at the top
  const lowY = y + ((low - high) / priceRange) * height;   // Always at the bottom
  const topY = y + ((topPrice - high) / priceRange) * height;
  const bottomY = y + ((bottomPrice - high) / priceRange) * height;
  
  const bodyHeight = Math.max(Math.abs(bottomY - topY), 2); // Minimum height for visibility

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
        y={Math.min(topY, bottomY)}
        width={candleWidth}
        height={bodyHeight}
        fill={isGreen ? color : 'transparent'}
        stroke={color}
        strokeWidth={1}
        rx={1} // Slight rounding for better appearance
      />
    </g>
  );
};

export default RechartsCandlestick;
