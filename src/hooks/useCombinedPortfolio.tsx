
import { usePortfolio } from '@/hooks/usePortfolio';
import { useLending } from '@/hooks/useLending';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { convertUsdToEur } from '@/lib/currencyConverter';

export interface CombinedPortfolioItem {
  cryptocurrency_id: string;
  crypto: {
    id: string;
    name: string;
    symbol: string;
    current_price: number;
    price_change_percentage_24h?: number;
    logo_url?: string;
  };
  trading: {
    quantity: number;
    value: number;
    percentage: number;
  };
  lending: {
    quantity: number;
    value: number;
    percentage: number;
    yield: number;
  };
  total: {
    quantity: number;
    value: number;
    percentage: number;
  };
}

export const useCombinedPortfolio = () => {
  const { portfolio, totalValue: tradingTotal, loading: portfolioLoading } = usePortfolio();
  const { lendingPositions, loading: lendingLoading } = useLending();
  const { exchangeRate } = useExchangeRate();

  const loading = portfolioLoading || lendingLoading;

  // Convert lending positions to EUR
  const lendingPositionsEur = lendingPositions.map(position => ({
    ...position,
    amount_lent: convertUsdToEur(position.amount_lent, exchangeRate),
    original_amount_lent: convertUsdToEur(position.original_amount_lent, exchangeRate),
    total_interest_earned: convertUsdToEur(position.total_interest_earned, exchangeRate),
    crypto: {
      ...position.crypto,
      current_price: convertUsdToEur(position.crypto.current_price, exchangeRate)
    }
  }));

  // Calculate total lending value
  const lendingTotal = lendingPositionsEur.reduce((sum, position) => {
    return sum + (position.amount_lent * position.crypto.current_price);
  }, 0);

  const grandTotal = tradingTotal + lendingTotal;

  // Combine trading and lending data by cryptocurrency
  const combinedData: CombinedPortfolioItem[] = [];

  // Add trading positions
  portfolio.forEach(item => {
    const existingIndex = combinedData.findIndex(
      combined => combined.cryptocurrency_id === item.cryptocurrency_id
    );

    if (existingIndex >= 0) {
      // Update existing entry
      combinedData[existingIndex].trading = {
        quantity: item.quantity,
        value: item.current_value,
        percentage: grandTotal > 0 ? (item.current_value / grandTotal) * 100 : 0
      };
      combinedData[existingIndex].total.quantity += item.quantity;
      combinedData[existingIndex].total.value += item.current_value;
    } else {
      // Create new entry
      combinedData.push({
        cryptocurrency_id: item.cryptocurrency_id,
        crypto: {
          ...item.crypto,
          price_change_percentage_24h: item.crypto.price_change_percentage_24h || 0
        },
        trading: {
          quantity: item.quantity,
          value: item.current_value,
          percentage: grandTotal > 0 ? (item.current_value / grandTotal) * 100 : 0
        },
        lending: {
          quantity: 0,
          value: 0,
          percentage: 0,
          yield: 0
        },
        total: {
          quantity: item.quantity,
          value: item.current_value,
          percentage: grandTotal > 0 ? (item.current_value / grandTotal) * 100 : 0
        }
      });
    }
  });

  // Add lending positions
  lendingPositionsEur.forEach(position => {
    const lendingValue = position.amount_lent * position.crypto.current_price;
    const existingIndex = combinedData.findIndex(
      combined => combined.cryptocurrency_id === position.cryptocurrency_id
    );

    if (existingIndex >= 0) {
      // Update existing entry
      combinedData[existingIndex].lending = {
        quantity: position.amount_lent,
        value: lendingValue,
        percentage: grandTotal > 0 ? (lendingValue / grandTotal) * 100 : 0,
        yield: position.annual_interest_rate * 100
      };
      combinedData[existingIndex].total.quantity += position.amount_lent;
      combinedData[existingIndex].total.value += lendingValue;
    } else {
      // Create new entry
      combinedData.push({
        cryptocurrency_id: position.cryptocurrency_id,
        crypto: {
          id: position.crypto.id,
          name: position.crypto.name,
          symbol: position.crypto.symbol,
          current_price: convertUsdToEur(position.crypto.current_price, exchangeRate),
          price_change_percentage_24h: 0,
          logo_url: position.crypto.logo_url
        },
        trading: {
          quantity: 0,
          value: 0,
          percentage: 0
        },
        lending: {
          quantity: position.amount_lent,
          value: lendingValue,
          percentage: grandTotal > 0 ? (lendingValue / grandTotal) * 100 : 0,
          yield: position.annual_interest_rate * 100
        },
        total: {
          quantity: position.amount_lent,
          value: lendingValue,
          percentage: grandTotal > 0 ? (lendingValue / grandTotal) * 100 : 0
        }
      });
    }
  });

  // Recalculate total percentages
  combinedData.forEach(item => {
    item.total.percentage = grandTotal > 0 ? (item.total.value / grandTotal) * 100 : 0;
  });

  // Sort by total value descending
  combinedData.sort((a, b) => b.total.value - a.total.value);

  return {
    combinedPortfolio: combinedData,
    totals: {
      trading: tradingTotal,
      lending: lendingTotal,
      combined: grandTotal
    },
    loading
  };
};
