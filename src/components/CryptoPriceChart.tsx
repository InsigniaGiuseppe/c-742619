
import React from 'react';
import { Cryptocurrency } from '@/hooks/useCryptocurrencies';
import AdvancedTradingChart from './charts/AdvancedTradingChart';

const CryptoPriceChart = ({ crypto }: { crypto: Cryptocurrency }) => {
  return <AdvancedTradingChart crypto={crypto} />;
};

export default CryptoPriceChart;
