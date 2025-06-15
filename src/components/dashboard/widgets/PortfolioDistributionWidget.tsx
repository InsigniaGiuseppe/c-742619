
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from 'lucide-react';
import PortfolioAllocation from '@/components/portfolio/PortfolioAllocation';

const PortfolioDistributionWidget: React.FC = () => {
  return (
    <Card className="glass glass-hover hover:bg-white/15">
      <CardHeader>
        <div className="flex items-center gap-3">
          <PieChart className="w-5 h-5 text-purple-400" />
          <div>
            <CardTitle>Portfolio Distribution</CardTitle>
            <CardDescription>Asset allocation breakdown</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <PortfolioAllocation />
      </CardContent>
    </Card>
  );
};

export default PortfolioDistributionWidget;
