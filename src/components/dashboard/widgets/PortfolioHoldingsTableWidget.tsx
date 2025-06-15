
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PortfolioHoldingsTable from '@/components/PortfolioHoldingsTable';
import { TrendingUp } from 'lucide-react';
import { useRealtimePortfolio } from '@/hooks/useRealtimePortfolio';

const PortfolioHoldingsTableWidget: React.FC = () => {
  const { portfolio = [], isRealtime } = useRealtimePortfolio();

  return (
    <PortfolioHoldingsTable portfolio={portfolio} isRealtime={isRealtime} />
  );
};

export default PortfolioHoldingsTableWidget;
