
import React from 'react';

interface CandlestickShapeProps {
  payload?: any;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

const CandlestickShape: React.FC<CandlestickShapeProps> = ({ payload, x = 0, y = 0, width = 0, height = 0 }) => {
  if (!payload || !payload.open || !payload.high || !payload.low || !payload.close) {
    return null;
  }

  const { open, high, low, close } = payload;
  const isGreen = close >= open;
  const color = isGreen ? '#10B981' : '#EF4444';
  
  // Calculate the range for proper scaling within the available height
  const priceRange = high - low;
  if (priceRange <= 0) return null;
  
  const wickX = x + width / 2;
  const bodyWidth = Math.max(width * 0.6, 2);
  const bodyX = x + (width - bodyWidth) / 2;
  
  // Calculate positions based on the chart's coordinate system
  // Recharts handles the scaling, we just need relative positions
  const topPrice = Math.max(open, close);
  const bottomPrice = Math.min(open, close);
  
  // Scale within the available height
  const highY = y + (1 - (high - low) / priceRange) * height;
  const lowY = y + height;
  const topY = y + (1 - (topPrice - low) / priceRange) * height;
  const bottomY = y + (1 - (bottomPrice - low) / priceRange) * height;
  const bodyHeight = Math.max(Math.abs(bottomY - topY), 1);

  return (
    <g>
      {/* High-Low Wick */}
      <line
        x1={wickX}
        y1={highY}
        x2={wickX}
        y2={lowY}
        stroke={color}
        strokeWidth={1}
      />
      
      {/* Open-Close Body */}
      <rect
        x={bodyX}
        y={topY}
        width={bodyWidth}
        height={bodyHeight}
        fill={isGreen ? color : 'transparent'}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
};

export default CandlestickShape;
