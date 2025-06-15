import { useState, useEffect } from 'react';

interface ExchangeRateData {
  EUR: number;
  lastUpdated: number;
}

export const useExchangeRate = () => {
  const [exchangeRate, setExchangeRate] = useState<number>(0.85); // Fallback rate
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExchangeRate = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first (10 minutes)
      const cachedData = localStorage.getItem('exchangeRate');
      if (cachedData) {
        const parsed: ExchangeRateData = JSON.parse(cachedData);
        const now = Date.now();
        const cacheAge = now - parsed.lastUpdated;
        const tenMinutes = 10 * 60 * 1000;

        if (cacheAge < tenMinutes) {
          setExchangeRate(parsed.EUR);
          setLoading(false);
          return;
        }
      }

      // Fetch fresh rate
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rate');
      }

      const data = await response.json();
      const eurRate = data.rates.EUR;

      if (eurRate && typeof eurRate === 'number') {
        setExchangeRate(eurRate);
        
        // Cache the result
        const cacheData: ExchangeRateData = {
          EUR: eurRate,
          lastUpdated: Date.now()
        };
        localStorage.setItem('exchangeRate', JSON.stringify(cacheData));
      } else {
        throw new Error('Invalid exchange rate data');
      }
    } catch (err) {
      console.error('Exchange rate fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Try to use cached data as fallback
      const cachedData = localStorage.getItem('exchangeRate');
      if (cachedData) {
        const parsed: ExchangeRateData = JSON.parse(cachedData);
        setExchangeRate(parsed.EUR);
      }
      // Otherwise keep the fallback rate of 0.85
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRate();
    
    // Refresh every 10 minutes
    const interval = setInterval(fetchExchangeRate, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    exchangeRate,
    loading,
    error,
    refetch: fetchExchangeRate
  };
};
