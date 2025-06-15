
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useCryptocurrencies, Cryptocurrency } from '@/hooks/useCryptocurrencies';
import { motion } from 'framer-motion';
import CryptoDetailSkeletonPage from './CryptoDetailSkeletonPage';
import CryptoPriceChart from '@/components/CryptoPriceChart';
import CryptoDetailHeader from '@/components/crypto-detail/CryptoDetailHeader';
import TradeWidget from '@/components/crypto-detail/TradeWidget';
import { useTrade } from '@/hooks/useTrade';

const CryptoDetailContent = ({ crypto }: { crypto: Cryptocurrency }) => {
  const navigate = useNavigate();
  const { userHoldings } = useTrade(crypto);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Chart Section */}
        <div className="lg:col-span-2">
          <CryptoPriceChart crypto={crypto} />
        </div>

        {/* Trading Section */}
        <div>
          <TradeWidget crypto={crypto} />
        </div>
      </div>
    </motion.div>
  )
}

const CryptoDetailPage = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const { cryptocurrencies, loading } = useCryptocurrencies();

  const crypto = cryptocurrencies.find(c => c.symbol.toLowerCase() === symbol?.toLowerCase());

  if (loading) {
    return <CryptoDetailSkeletonPage />;
  }

  if (!crypto) {
    return (
      <div className="flex items-center justify-center h-full">
        <div>Cryptocurrency not found</div>
      </div>
    );
  }

  return <CryptoDetailContent crypto={crypto} />;
};

export default CryptoDetailPage;
