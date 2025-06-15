
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
  const candleWidth = Math.max(width * 0.6, 8); // Make candlesticks thicker
  const wickWidth = 2;
  const centerX = x + width / 2;
  const candleX = centerX - candleWidth / 2;

  // Simple approach: use the given y and height as-is from Recharts
  // Recharts already calculated these based on the data values
  const bodyTop = Math.min(y, y + height);
  const bodyBottom = Math.max(y, y + height);
  const bodyHeight = Math.max(Math.abs(bodyBottom - bodyTop), 2);

  return (
    <g>
      {/* High-Low Wick - use full height */}
      <line
        x1={centerX}
        y1={y}
        x2={centerX}
        y2={y + height}
        stroke={color}
        strokeWidth={wickWidth}
      />
      
      {/* Open-Close Body */}
      <rect
        x={candleX}
        y={bodyTop}
        width={candleWidth}
        height={bodyHeight}
        fill={isGreen ? color : 'transparent'}
        stroke={color}
        strokeWidth={2}
        rx={1}
      />
    </g>
  );
};

export default RechartsCandlestick;
