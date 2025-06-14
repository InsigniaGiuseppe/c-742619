
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Cryptocurrency {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  market_cap?: number;
  volume_24h?: number;
  price_change_24h?: number;
  price_change_percentage_24h?: number;
  logo_url?: string;
  description?: string;
}

export const useCryptocurrencies = () => {
  const [cryptocurrencies, setCryptocurrencies] = useState<Cryptocurrency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCryptocurrencies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cryptocurrencies')
        .select('*')
        .eq('is_active', true)
        .order('market_cap', { ascending: false });

      if (error) {
        setError(error.message);
        return;
      }

      setCryptocurrencies(data || []);
    } catch (err) {
      setError('Failed to fetch cryptocurrencies');
    } finally {
      setLoading(false);
    }
  };

  const syncPrices = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('coinmarketcap-sync');
      
      if (error) {
        console.error('Error syncing prices:', error);
        return;
      }

      console.log('Prices synced:', data);
      await fetchCryptocurrencies(); // Refresh data
    } catch (error) {
      console.error('Error calling sync function:', error);
    }
  };

  useEffect(() => {
    fetchCryptocurrencies();
  }, []);

  return {
    cryptocurrencies,
    loading,
    error,
    refetch: fetchCryptocurrencies,
    syncPrices
  };
};
