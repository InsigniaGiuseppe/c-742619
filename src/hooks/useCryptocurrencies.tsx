
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Cryptocurrency {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  market_cap?: number;
  market_cap_rank?: number;
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
  const [isSupabaseRealtimeConnected, setIsSupabaseRealtimeConnected] = useState(false);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const supabaseChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
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

  const setupSupabaseSubscription = () => {
    // Clean up existing channel first
    if (supabaseChannelRef.current) {
      supabase.removeChannel(supabaseChannelRef.current).catch(err => console.error("Failed to remove channel", err));
      supabaseChannelRef.current = null;
    }
    
    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // Create a new channel with a unique name
    const channelName = `cryptocurrencies-changes-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'cryptocurrencies' },
        (payload) => {
          console.log('Supabase real-time update received:', payload.new);
          const updatedCrypto = payload.new as Cryptocurrency;
          setCryptocurrencies((currentCryptos) =>
            currentCryptos.map((crypto) =>
              crypto.id === updatedCrypto.id ? { ...crypto, ...updatedCrypto } : crypto
            )
          );
        }
      )
      .subscribe((status, err) => {
        console.log('Supabase subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to Supabase real-time updates!');
          setIsSupabaseRealtimeConnected(true);
          if (error && error.startsWith('Real-time connection failed')) {
            setError(null);
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Supabase real-time channel error:', status, err);
          setIsSupabaseRealtimeConnected(false);
          setError('Real-time connection failed. Prices may be outdated.');
          
          // Only retry if we don't already have a retry scheduled
          if (!retryTimeoutRef.current) {
            console.log('Attempting to reconnect Supabase real-time channel in 5 seconds...');
            retryTimeoutRef.current = window.setTimeout(() => {
              retryTimeoutRef.current = null;
              setupSupabaseSubscription();
            }, 5000);
          }
        } else if (status === 'CLOSED') {
          console.log('Supabase real-time channel closed.');
          setIsSupabaseRealtimeConnected(false);
        }
      });

    supabaseChannelRef.current = channel;
  };

  const setupWebSocket = () => {
    const supabaseProjectId = "murvbwhegsauxlkgzcvo";
    const wsUrl = `wss://${supabaseProjectId}.supabase.co/functions/v1/binance-websocket`;
    
    // Ensure we don't create duplicate connections
    if (webSocketRef.current && webSocketRef.current.readyState < 2) { // 0=CONNECTING, 1=OPEN
      return;
    }
    
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
        console.log("Connected to price-feed WebSocket.");
        setIsWebSocketConnected(true);
    };

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.stream && message.data) {
            const { s: binanceSymbol, p: price } = message.data;
            // Assuming symbols are like 'BTCUSDT'
            const cryptoSymbol = binanceSymbol.replace(/USDT$/, '');

            setCryptocurrencies(currentCryptos => {
                const cryptoIndex = currentCryptos.findIndex(c => c.symbol.toUpperCase() === cryptoSymbol.toUpperCase());
                if (cryptoIndex === -1) return currentCryptos;

                const newCryptos = [...currentCryptos];
                const updatedCrypto = { ...newCryptos[cryptoIndex], current_price: parseFloat(price) };
                newCryptos[cryptoIndex] = updatedCrypto;
                return newCryptos;
            });
        }
    };
    
    socket.onclose = () => {
        console.log("Disconnected from price-feed WebSocket. Reconnecting in 5s...");
        setIsWebSocketConnected(false);
        webSocketRef.current = null;
        setTimeout(setupWebSocket, 5000);
    };

    socket.onerror = (error) => {
        console.error("Price-feed WebSocket error:", error);
        setIsWebSocketConnected(false);
        socket.close(); // This will trigger onclose and the reconnect logic
    };
    
    webSocketRef.current = socket;
  };

  useEffect(() => {
    fetchCryptocurrencies();
    setupSupabaseSubscription();
    setupWebSocket();

    const syncInterval = setInterval(() => {
      syncPrices();
    }, 10000); // Reduced from 30 seconds to 10 seconds
      
    return () => {
      clearInterval(syncInterval);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (supabaseChannelRef.current) {
        supabase.removeChannel(supabaseChannelRef.current).catch(err => console.error("Failed to remove channel on unmount", err));
      }
      if (webSocketRef.current) {
        // Prevent reconnect logic from firing on unmount
        webSocketRef.current.onclose = null; 
        webSocketRef.current.close();
      }
    };
  }, []);

  const value = { cryptocurrencies, loading, error, isRealtimeConnected: isSupabaseRealtimeConnected || isWebSocketConnected, refetch: fetchCryptocurrencies };

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
