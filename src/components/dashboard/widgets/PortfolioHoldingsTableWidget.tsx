
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PortfolioHoldingsTable from '@/components/PortfolioHoldingsTable';
import { TrendingUp } from 'lucide-react';

const PortfolioHoldingsTableWidget: React.FC = () => {
  return (
    <Card className="glass glass-hover hover:bg-white/15">
      <CardHeader>
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <div>
            <CardTitle>Holdings Details</CardTitle>
            <CardDescription>Your current cryptocurrency positions</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <PortfolioHoldingsTable />
      </CardContent>
    </Card>
  );
};

export default PortfolioHoldingsTableWidget;
