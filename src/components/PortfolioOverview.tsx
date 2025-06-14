
import React from 'react';
import EnhancedPortfolioChart from './EnhancedPortfolioChart';
import PortfolioHoldingsTable from './PortfolioHoldingsTable';
import { useRealtimePortfolio } from '@/hooks/useRealtimePortfolio';

const PortfolioOverview = () => {
  const { portfolio, isRealtime } = useRealtimePortfolio();

  return (
    <div className="space-y-6">
      <EnhancedPortfolioChart />
      <PortfolioHoldingsTable portfolio={portfolio} isRealtime={isRealtime} />
    </div>
  );
};

export default PortfolioOverview;
