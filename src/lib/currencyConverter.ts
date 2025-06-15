
// Currency conversion utilities
export const convertUsdToEur = (usdAmount: number, exchangeRate: number): number => {
  if (!usdAmount || !exchangeRate) return 0;
  return usdAmount * exchangeRate;
};

export const convertEurToUsd = (eurAmount: number, exchangeRate: number): number => {
  if (!eurAmount || !exchangeRate) return 0;
  return eurAmount / exchangeRate;
};

// Helper to format exchange rate display
export const getExchangeRateDisplay = (rate: number): string => {
  return `1 USD = ${rate.toFixed(4)} EUR`;
};
