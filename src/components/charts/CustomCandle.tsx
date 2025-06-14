
import React from 'react';

const CustomCandle = (props: any) => {
  const { x, y, width, height, low, high, open, close } = props;
  const isGain = close >= open;
  const fill = isGain ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))';
  const stroke = isGain ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))';

  const candleWidth = width * 0.7;
  const xOffset = x + (width - candleWidth) / 2;
  
  const yBody = isGain ? y + height * (1 - (close - low) / (high - low)) : y + height * (1 - (open - low) / (high - low));
  const bodyHeight = height * (Math.abs(open - close) / (high - low));

  return (
    <g>
      {/* Wick */}
      <line x1={x + width / 2} y1={y} x2={x + width / 2} y2={y + height} stroke={stroke} strokeWidth={1.5} />
      {/* Body */}
      <rect x={xOffset} y={yBody} width={candleWidth} height={Math.max(bodyHeight, 1)} fill={fill} />
    </g>
  );
};

export default CustomCandle;
