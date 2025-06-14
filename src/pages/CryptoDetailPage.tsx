
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useCryptocurrencies } from '@/hooks/useCryptocurrencies';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import CryptoDetailSkeletonPage from './CryptoDetailSkeletonPage';
import CryptoPriceChart from '@/components/CryptoPriceChart';
import CryptoDetailHeader from '@/components/crypto-detail/CryptoDetailHeader';
import TradeWidget from '@/components/crypto-detail/TradeWidget';
import { useTrade } from '@/hooks/useTrade';

const CryptoDetailPage = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { cryptocurrencies, loading } = useCryptocurrencies();

  const crypto = cryptocurrencies.find(c => c.symbol.toLowerCase() === symbol?.toLowerCase());
  
  // The useTrade hook now requires a defined crypto, so we call it inside the conditional render
  // We'll need userHoldings for the header, so we must lift the hook call
  const { userHoldings } = useTrade(crypto);


  if (loading) {
    return <CryptoDetailSkeletonPage />;
  }

  if (!crypto) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div>Cryptocurrency not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-20 pt-24"
      >
        <Button 
          variant="ghost" 
          onClick={() => navigate('/trading')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Trading
        </Button>

        <CryptoDetailHeader crypto={crypto} userHoldings={userHoldings} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <CryptoPriceChart crypto={crypto} />
          </div>

          {/* Trading Section */}
          <div>
            <TradeWidget crypto={crypto} />
          </div>
        </div>
      </motion.main>
      <Footer />
    </div>
  );
};

export default CryptoDetailPage;
