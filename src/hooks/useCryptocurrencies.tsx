
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
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

interface CryptocurrenciesContextValue {
  cryptocurrencies: Cryptocurrency[];
  loading: boolean;
  error: string | null;
  isRealtimeConnected: boolean;
  refetch: () => Promise<void>;
}

const CryptocurrenciesContext = createContext<CryptocurrenciesContextValue | undefined>(undefined);

export const CryptocurrenciesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cryptocurrencies, setCryptocurrencies] = useState<Cryptocurrency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);

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
        return;
      }

      console.log('Price sync function invoked. Real-time subscription will handle UI updates.');
    } catch (error) {
      console.error('Error calling sync function:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (channelRef.current) {
        supabase.removeChannel(channelRef.current).catch(err => console.error("Failed to remove channel", err));
        channelRef.current = null;
    }
    if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
    }

    const channel = supabase
      .channel('cryptocurrencies-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'cryptocurrencies' },
        (payload) => {
          console.log('Real-time update received:', payload.new);
          const updatedCrypto = payload.new as Cryptocurrency;
          setCryptocurrencies((currentCryptos) =>
            currentCryptos.map((crypto) =>
              crypto.id === updatedCrypto.id ? { ...crypto, ...updatedCrypto } : crypto
            )
          );
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to real-time crypto updates!');
          setIsRealtimeConnected(true);
          if (error && error.startsWith('Real-time connection failed')) {
            setError(null);
          }
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Real-time channel error:', status, err);
          setIsRealtimeConnected(false);
          setError('Real-time connection failed. Prices may be outdated.');
          
          console.log('Attempting to reconnect real-time channel in 5 seconds...');
          retryTimeoutRef.current = window.setTimeout(() => {
            setupRealtimeSubscription();
          }, 5000);
        }
        if (status === 'CLOSED') {
            console.log('Real-time channel closed.');
            setIsRealtimeConnected(false);
        }
      });

      channelRef.current = channel;
  };


  useEffect(() => {
    fetchCryptocurrencies();
    setupRealtimeSubscription();

    const syncInterval = setInterval(() => {
      syncPrices();
    }, 30000);
      
    return () => {
      clearInterval(syncInterval);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current).catch(err => console.error("Failed to remove channel on unmount", err));
      }
    };
  }, []);

  const value = { cryptocurrencies, loading, error, isRealtimeConnected, refetch: fetchCryptocurrencies };

  return (
    <CryptocurrenciesContext.Provider value={value}>
      {children}
    </CryptocurrenciesContext.Provider>
  );
};

export const useCryptocurrencies = () => {
  const context = useContext(CryptocurrenciesContext);
  if (context === undefined) {
    throw new Error('useCryptocurrencies must be used within a CryptocurrenciesProvider');
  }
  return context;
};
