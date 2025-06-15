// Currency conversion utilities
export const convertUsdToEur = (usdAmount: number, exchangeRate: number): number => {
  if (!usdAmount || !exchangeRate) return 0;
  return usdAmount * exchangeRate;
};

/**
 * Convert EUR to USD using the provided exchange rate
 * @param eurAmount - Amount in EUR
 * @param exchangeRate - EUR to USD exchange rate (EUR per USD)
 * @returns Amount in USD
 */
export const convertEurToUsd = (eurAmount: number, exchangeRate: number): number => {
  if (!exchangeRate || exchangeRate <= 0) {
    console.warn('[convertEurToUsd] Invalid exchange rate, using default 1.1');
    return eurAmount * 1.1; // Fallback rate
  }
  
  // If exchangeRate is 0.866 (EUR per USD), then 1 EUR = 1/0.866 USD = 1.155 USD
  const usdAmount = eurAmount / exchangeRate;
  return Number(usdAmount.toFixed(8));
};

// Helper to format exchange rate display
export const getExchangeRateDisplay = (rate: number): string => {
  return `1 USD = ${rate.toFixed(4)} EUR`;
};
