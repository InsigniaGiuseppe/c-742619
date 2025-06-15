
import React from 'react';
import PortfolioHoldingsTable from '@/components/PortfolioHoldingsTable';
import { useRealtimePortfolio } from '@/hooks/useRealtimePortfolio';

const PortfolioHoldingsTableWidget: React.FC = () => {
  const { portfolio, isRealtime } = useRealtimePortfolio();

  return <PortfolioHoldingsTable portfolio={portfolio} isRealtime={isRealtime} />;
};

export default PortfolioHoldingsTableWidget;
