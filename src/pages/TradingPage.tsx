
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CryptoCard from '@/components/CryptoCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCryptocurrencies, Cryptocurrency } from '@/hooks/useCryptocurrencies';
import { useToast } from '@/hooks/use-toast';

const TradingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { cryptocurrencies, loading, syncPrices } = useCryptocurrencies();
  const { toast } = useToast();

  const handleSyncPrices = async () => {
    toast({
      title: "Syncing prices...",
      description: "Fetching latest cryptocurrency prices",
    });
    await syncPrices();
    toast({
      title: "Prices updated",
      description: "Latest cryptocurrency prices have been synced",
    });
  };

  const handleTrade = (crypto: Cryptocurrency) => {
    // TODO: Implement trading modal/functionality
    toast({
      title: "Trading Feature",
      description: `Trading for ${crypto.name} will be implemented soon`,
    });
  };

  const filteredCryptocurrencies = cryptocurrencies.filter(crypto =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-foreground flex flex-col">
        <Navigation />
        <main className="flex-grow container mx-auto px-4 py-20 pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading cryptocurrencies...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-20 pt-24">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="/lovable-uploads/a2c0bb3a-a47b-40bf-ba26-d79f2f9e741b.png" 
              alt="PROMPTO TRADING Logo" 
              className="w-10 h-10 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <h1 className="text-4xl font-bold">PROMPTO TRADING</h1>
              <h2 className="text-xl text-muted-foreground">Cryptocurrency Trading</h2>
            </div>
          </div>
          <p className="text-muted-foreground">Trade the most popular cryptocurrencies with real-time pricing</p>
        </div>

        {/* Search and Sync Controls */}
        <Card className="glass glass-hover mb-8">
          <CardHeader>
            <CardTitle>Market Overview</CardTitle>
            <CardDescription>Search and trade cryptocurrencies with live market data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search cryptocurrencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/80"
                />
              </div>
              <Button 
                onClick={handleSyncPrices}
                variant="outline" 
                className="glass"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Prices
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cryptocurrency Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCryptocurrencies.map((crypto) => (
            <CryptoCard
              key={crypto.id}
              crypto={crypto}
              onTrade={handleTrade}
            />
          ))}
        </div>

        {filteredCryptocurrencies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No cryptocurrencies found matching your search.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TradingPage;
