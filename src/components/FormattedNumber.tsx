
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatCurrency, formatPrice, formatMarketCap, CurrencyType, LocaleType } from '@/lib/formatters';

interface FormattedNumberProps {
  value: number;
  type?: 'currency' | 'price' | 'marketCap' | 'percentage';
  currency?: CurrencyType;
  locale?: LocaleType;
  showTooltip?: boolean;
  compact?: boolean;
  className?: string;
}

const FormattedNumber: React.FC<FormattedNumberProps> = ({
  value,
  type = 'currency',
  currency = 'USD',
  locale = 'en-US',
  showTooltip = true,
  compact = false,
  className = ''
}) => {
  const formatValue = () => {
    switch (type) {
      case 'price':
        return formatPrice(value, currency);
      case 'marketCap':
        return formatMarketCap(value);
      case 'percentage':
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(2)}%`;
      default:
        return formatCurrency(value, { currency, locale, compact });
    }
  };

  const getFullValue = () => {
    if (type === 'percentage') {
      return `${value.toFixed(4)}%`;
    }
    return formatCurrency(value, { currency, locale, compact: false });
  };

  const formattedValue = formatValue();
  const fullValue = getFullValue();
  
  // Show tooltip if the value is compacted or if explicitly requested
  const shouldShowTooltip = showTooltip && (compact || Math.abs(value) >= 1000);

  if (!shouldShowTooltip) {
    return <span className={className}>{formattedValue}</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`cursor-help underline decoration-dotted decoration-1 underline-offset-2 ${className}`}>
            {formattedValue}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{fullValue}</p>
          {type === 'marketCap' && (
            <p className="text-xs text-muted-foreground mt-1">Market Capitalization</p>
          )}
          {type === 'price' && value < 0.01 && (
            <p className="text-xs text-muted-foreground mt-1">Micro-price asset</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FormattedNumber;
