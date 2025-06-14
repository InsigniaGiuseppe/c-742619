
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
      const { error } = await supabase.functions.invoke('coinmarketcap-sync');
      
      if (error) {
        console.error('Error syncing prices:', error);
        // We don't set a user-facing error for a background sync, just log it.
        return;
      }

      console.log('Price sync function invoked. Real-time subscription will handle UI updates.');
      // No need to call fetchCryptocurrencies() here, the real-time listener will catch the changes.
    } catch (error) {
      console.error('Error calling sync function:', error);
    }
  };

  useEffect(() => {
    // Fetch initial data
    fetchCryptocurrencies();

    // Set up a 30-second interval for syncing prices as a fallback
    const syncInterval = setInterval(() => {
      syncPrices();
    }, 30000); // 30 seconds

    // Set up real-time subscription for instant updates
    const channel = supabase
      .channel('cryptocurrencies-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'cryptocurrencies' },
        (payload) => {
          const updatedCrypto = payload.new as Cryptocurrency;
          setCryptocurrencies((currentCryptos) =>
            currentCryptos.map((crypto) =>
              crypto.id === updatedCrypto.id ? updatedCrypto : crypto
            )
          );
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to real-time crypto updates!');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Real-time channel error:', err);
          setError('Real-time connection failed. Prices may be outdated.');
        }
      });
      
    // Cleanup on unmount
    return () => {
      clearInterval(syncInterval);
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    cryptocurrencies,
    loading,
    error,
    refetch: fetchCryptocurrencies,
  };
};
