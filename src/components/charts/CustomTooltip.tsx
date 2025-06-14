
import { formatPrice } from '@/lib/formatters';

export const formatXAxisTick = (tick: number, timeframe: string) => {
  const date = new Date(tick);
  
  switch (timeframe) {
    case '1h':
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    case '1d':
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    case '7d':
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    case '30d':
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    case '1y':
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        year: '2-digit' 
      });
    default:
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
  }
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: any;
  timeframe: string;
  formatter: (value: number) => string;
}

const CustomTooltip = ({ active, payload, label, timeframe, formatter }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    switch (timeframe) {
      case '1h':
      case '1d':
        return date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      default:
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
    }
  };

  const change = data.close - data.open;
  const changePercent = data.open > 0 ? (change / data.open) * 100 : 0;
  const isPositive = change >= 0;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
      <p className="text-gray-300 text-sm font-medium mb-2">
        {formatDateTime(data.time)}
      </p>
      <div className="space-y-1 text-sm">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <span className="text-gray-400">Open:</span>
          <span className="text-white font-mono">{formatter(data.open)}</span>
          
          <span className="text-gray-400">High:</span>
          <span className="text-green-400 font-mono">{formatter(data.high)}</span>
          
          <span className="text-gray-400">Low:</span>
          <span className="text-red-400 font-mono">{formatter(data.low)}</span>
          
          <span className="text-gray-400">Close:</span>
          <span className="text-white font-mono font-semibold">{formatter(data.close)}</span>
        </div>
        
        <div className="border-t border-gray-700 pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Change:</span>
            <div className="text-right">
              <div className={`font-mono font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{formatter(change)}
              </div>
              <div className={`text-xs font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomTooltip;
