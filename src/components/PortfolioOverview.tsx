
import React from 'react';
import AdvancedPortfolioAnalytics from './portfolio/AdvancedPortfolioAnalytics';
import PortfolioHoldingsTable from './PortfolioHoldingsTable';
import { useRealtimePortfolio } from '@/hooks/useRealtimePortfolio';

const PortfolioOverview = () => {
  const { portfolio, isRealtime } = useRealtimePortfolio();

  return (
    <div className="space-y-6">
      <AdvancedPortfolioAnalytics />
      <PortfolioHoldingsTable portfolio={portfolio} isRealtime={isRealtime} />
    </div>
  );
};

export default PortfolioOverview;
