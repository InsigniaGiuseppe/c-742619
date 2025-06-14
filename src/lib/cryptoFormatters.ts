
export const formatCryptoQuantity = (
  amount: number,
  decimals: number = 8
): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0';
  }

  // Determine decimal places based on amount size
  let displayDecimals = decimals;
  const absAmount = Math.abs(amount);
  
  if (absAmount >= 1) {
    displayDecimals = 4;
  } else if (absAmount >= 0.01) {
    displayDecimals = 6;
  } else if (absAmount >= 0.0001) {
    displayDecimals = 8;
  }

  const formatOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: displayDecimals,
    useGrouping: true,
  };

  const formattedNumber = new Intl.NumberFormat('en-US', formatOptions).format(amount);
  
  // Remove trailing zeros after decimal point
  return formattedNumber.replace(/\.?0+$/, '');
};

export const formatCryptoValue = (
  quantity: number,
  price: number,
  currency: string = 'USD'
): string => {
  const value = quantity * price;
  
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
  
  return value.toFixed(2);
};
