
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Wifi, WifiOff } from 'lucide-react';
import { useCryptocurrencies, Cryptocurrency } from '@/hooks/useCryptocurrencies';
import CryptoCard from '@/components/CryptoCard';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import CryptoCardSkeleton from '@/components/CryptoCardSkeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const TradingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { cryptocurrencies, loading, error, refetch, isRealtimeConnected } = useCryptocurrencies();
  const navigate = useNavigate();
  const { toast } = useToast();

  const filteredCryptos = cryptocurrencies.filter(crypto =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTrade = (crypto: Cryptocurrency) => {
    navigate(`/crypto/${crypto.symbol.toLowerCase()}`);
  };

  const ConnectionStatusIndicator = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`fixed top-20 right-4 z-50 p-2 rounded-full ${isRealtimeConnected ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400 animate-pulse'}`}>
            {isRealtimeConnected ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isRealtimeConnected ? 'Real-time connection active' : 'Real-time connection lost. Prices may be outdated.'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <ConnectionStatusIndicator />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="flex-grow container mx-auto px-4 py-20 pt-24"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Cryptocurrency Trading</h1>
          <p className="text-muted-foreground text-lg">
            Trade the most popular cryptocurrencies with real-time prices
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-2xl mx-auto">
          <div className="relative flex-1 glass rounded-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search cryptocurrencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        {error && !isRealtimeConnected && (
          <div className="text-center my-4 p-3 bg-yellow-900/50 border border-yellow-400/30 rounded-lg max-w-2xl mx-auto">
            <p className="text-yellow-300 text-sm">
              <WifiOff className="inline-block mr-2 h-4 w-4" />
              {error} Showing last available data.
            </p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <CryptoCardSkeleton key={i} />
            ))}
          </div>
        ) : cryptocurrencies.length > 0 ? (
            <>
              {filteredCryptos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCryptos.map((crypto) => (
                    <CryptoCard 
                      key={crypto.id} 
                      crypto={crypto} 
                      onTrade={handleTrade}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-muted-foreground">No cryptocurrencies found matching your search.</p>
                </div>
              )}
            </>
        ) : (
          <div className="text-center">
            <p className="text-red-400 mb-4">Failed to load cryptocurrencies.</p>
            {error && <p className="text-muted-foreground mb-4">{error}</p>}
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        )}
      </motion.main>
      <Footer />
    </div>
  );
};

export default TradingPage;
