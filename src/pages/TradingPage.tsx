
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Wifi, WifiOff, LayoutGrid, List } from 'lucide-react';
import { useCryptocurrencies, Cryptocurrency } from '@/hooks/useCryptocurrencies';
import CryptoCard from '@/components/CryptoCard';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import CryptoCardSkeleton from '@/components/CryptoCardSkeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import TopMovers from '@/components/TopMovers';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import CryptoTable from '@/components/CryptoTable';
import CryptoTableRowSkeleton from '@/components/CryptoTableRowSkeleton';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TradeSheet from '@/components/TradeSheet';

const TradingPage = () => {
  console.log('[TradingPage] Component mounting');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Cryptocurrency; direction: 'ascending' | 'descending' } | null>({ key: 'market_cap_rank', direction: 'ascending' });
  const [selectedCryptoForTrade, setSelectedCryptoForTrade] = useState<Cryptocurrency | null>(null);
  
  const { cryptocurrencies, loading, error, refetch, isRealtimeConnected } = useCryptocurrencies();
  
  console.log('[TradingPage] Cryptocurrencies data:', {
    count: cryptocurrencies?.length || 0,
    loading,
    error,
    isRealtimeConnected
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const filteredCryptos = cryptocurrencies.filter(crypto =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCryptos = useMemo(() => {
    let sortableItems = [...filteredCryptos];
    if (sortConfig) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue == null) return 1;
        if (bValue == null) return -1;

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredCryptos, sortConfig]);

  const requestSort = (key: keyof Cryptocurrency) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleTrade = (crypto: Cryptocurrency) => {
    setSelectedCryptoForTrade(crypto);
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
    <>
      <ConnectionStatusIndicator />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/lovable-uploads/3765d287-ffd3-40d5-8628-4f8191064138.png"
              alt="COINS Logo" 
              className="w-12 h-12 object-contain"
            />
            <h1 className="text-4xl font-bold">COINS</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Trade the most popular cryptocurrencies with real-time prices
          </p>
        </div>

        <TopMovers cryptocurrencies={cryptocurrencies} />

        <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-2xl mx-auto items-center">
          <div className="relative flex-1 glass rounded-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search cryptocurrencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
            />
          </div>
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => { if (value) setViewMode(value as 'grid' | 'list') }} className="glass p-1 rounded-md">
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
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
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <CryptoCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="glass rounded-lg p-0.5">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>24h %</TableHead>
                    <TableHead>Market Cap</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <CryptoTableRowSkeleton key={i} />
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        ) : cryptocurrencies.length > 0 ? (
            <>
              {filteredCryptos.length > 0 ? (
                viewMode === 'grid' ? (
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
                  <div className="glass rounded-lg p-0.5">
                    <CryptoTable cryptos={sortedCryptos} onTrade={handleTrade} onSort={requestSort} sortConfig={sortConfig} />
                  </div>
                )
              ) : (
                <div className="text-center py-16">
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
      </motion.div>
      <TradeSheet
        crypto={selectedCryptoForTrade}
        open={!!selectedCryptoForTrade}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCryptoForTrade(null);
          }
        }}
      />
    </>
  );
};

export default TradingPage;
