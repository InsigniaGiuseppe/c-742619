
import React from 'react';

interface CandlestickBarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  payload: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
}

const CandlestickBar: React.FC<CandlestickBarProps> = ({ x, y, width, height, payload }) => {
  if (!payload) return null;
  
  const { open, high, low, close } = payload;
  const isGreen = close >= open;
  const color = isGreen ? '#10B981' : '#EF4444';
  
  // Calculate positions
  const bodyHeight = Math.abs(close - open);
  const bodyY = Math.min(open, close);
  const wickTop = high;
  const wickBottom = low;
  
  // Scale factors (simplified for demo - in real implementation you'd need proper scaling)
  const priceRange = high - low;
  const pixelPerPrice = height / priceRange;
  
  const wickX = x + width / 2;
  const bodyWidth = Math.max(width * 0.8, 1);
  const bodyX = x + (width - bodyWidth) / 2;
  
  const scaledBodyHeight = bodyHeight * pixelPerPrice;
  const scaledBodyY = y + (wickTop - bodyY) * pixelPerPrice;
  const scaledWickTop = y;
  const scaledWickBottom = y + height;
  
  return (
    <g>
      {/* High-Low Wick */}
      <line
        x1={wickX}
        y1={scaledWickTop}
        x2={wickX}
        y2={scaledWickBottom}
        stroke={color}
        strokeWidth={1}
      />
      
      {/* Open-Close Body */}
      <rect
        x={bodyX}
        y={scaledBodyY}
        width={bodyWidth}
        height={Math.max(scaledBodyHeight, 1)}
        fill={isGreen ? color : 'transparent'}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
};

export default CandlestickBar;
