
import React from 'react';
import { format } from 'date-fns';

type Timeframe = '1h' | '1d' | '7d' | '30d' | '1y' | 'all';

export const formatXAxisTick = (tick: number, timeframe: Timeframe) => {
  const date = new Date(tick);
  switch (timeframe) {
    case '1h':
    case '1d':
      return format(date, 'HH:mm');
    case '7d':
    case '30d':
      return format(date, 'MMM d');
    case '1y':
    case 'all':
      return format(date, 'MMM yy');
    default:
      return format(date, 'MMM d');
  }
};

const CustomTooltip = ({ active, payload, label, timeframe, formatter }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-4 bg-background/80 backdrop-blur-sm border border-border rounded-lg shadow-lg">
        <p className="label text-sm text-muted-foreground">{formatXAxisTick(label, timeframe)}</p>
        <div className="mt-2 space-y-1 text-sm">
          <p><strong>Open:</strong> {formatter(data.open)}</p>
          <p><strong>High:</strong> {formatter(data.high)}</p>
          <p><strong>Low:</strong> {formatter(data.low)}</p>
          <p><strong>Close:</strong> {formatter(data.close)}</p>
        </div>
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
