
export type CurrencyType = 'USD' | 'EUR' | 'BTC' | 'ETH' | 'crypto';
export type LocaleType = 'en-US' | 'nl-NL';

interface FormatOptions {
  currency?: CurrencyType;
  locale?: LocaleType;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  compact?: boolean;
}

export const formatCurrency = (
  amount: number,
  options: FormatOptions = {}
): string => {
  const {
    currency = 'USD',
    locale = 'en-US',
    minimumFractionDigits,
    maximumFractionDigits,
    compact = false
  } = options;

  if (isNaN(amount) || amount === null || amount === undefined) {
    return currency === 'USD' ? '$0.00' : currency === 'EUR' ? '€0,00' : '0';
  }

  // Handle compact notation for large numbers
  if (compact && Math.abs(amount) >= 1000000) {
    return formatCompactCurrency(amount, currency, locale);
  }

  // Crypto formatting
  if (currency === 'BTC' || currency === 'ETH' || currency === 'crypto') {
    return formatCrypto(amount, currency, locale);
  }

  // Fiat currency formatting
  const formatOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: minimumFractionDigits ?? 2,
    maximumFractionDigits: maximumFractionDigits ?? 2,
  };

  try {
    return new Intl.NumberFormat(locale, formatOptions).format(amount);
  } catch (error) {
    // Fallback formatting
    return currency === 'EUR' 
      ? `€${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
      : `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
};

const formatCompactCurrency = (amount: number, currency: CurrencyType, locale: LocaleType): string => {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  
  if (absAmount >= 1e12) {
    const value = amount / 1e12;
    return `${sign}${formatCurrency(Math.abs(value), { currency, locale })}T`;
  } else if (absAmount >= 1e9) {
    const value = amount / 1e9;
    return `${sign}${formatCurrency(Math.abs(value), { currency, locale })}B`;
  } else if (absAmount >= 1e6) {
    const value = amount / 1e6;
    return `${sign}${formatCurrency(Math.abs(value), { currency, locale })}M`;
  } else if (absAmount >= 1e3) {
    const value = amount / 1e3;
    return `${sign}${formatCurrency(Math.abs(value), { currency, locale })}K`;
  }
  
  return formatCurrency(amount, { currency, locale });
};

const formatCrypto = (amount: number, currency: CurrencyType, locale: LocaleType): string => {
  // Determine decimal places based on amount size
  let decimals = 8;
  const absAmount = Math.abs(amount);
  
  if (absAmount >= 1) {
    decimals = 4;
  } else if (absAmount >= 0.01) {
    decimals = 6;
  } else if (absAmount >= 0.0001) {
    decimals = 8;
  }

  const formatOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
    useGrouping: true,
  };

  const formattedNumber = new Intl.NumberFormat(locale, formatOptions).format(amount);
  
  // Remove trailing zeros
  const cleanNumber = formattedNumber.replace(/\.?0+$/, '');
  
  if (currency === 'BTC') return `${cleanNumber} BTC`;
  if (currency === 'ETH') return `${cleanNumber} ETH`;
  return cleanNumber;
};

export const formatPrice = (price: number, currency: CurrencyType = 'USD'): string => {
  if (currency === 'crypto' || currency === 'BTC' || currency === 'ETH') {
    return formatCrypto(price, currency, 'en-US');
  }
  
  if (price < 0.01) {
    return formatCurrency(price, { currency, maximumFractionDigits: 6 });
  } else if (price < 1) {
    return formatCurrency(price, { currency, maximumFractionDigits: 4 });
  } else {
    return formatCurrency(price, { currency });
  }
};

export const formatMarketCap = (marketCap: number): string => {
  return formatCurrency(marketCap, { currency: 'USD', compact: true });
};

export const formatPercentage = (percentage: number): string => {
  if (isNaN(percentage) || percentage === null || percentage === undefined) {
    return '0.00%';
  }
  
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(2)}%`;
};
