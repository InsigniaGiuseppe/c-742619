
import React from 'react';
import { Euro } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';

const HoldingsWidget: React.FC = () => {
  const { portfolio, loading } = usePortfolio();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Euro className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Holdings</span>
      </div>
      <div className="text-2xl font-bold">
        {loading ? (
          <div className="h-8 w-16 bg-gray-700 animate-pulse rounded"></div>
        ) : (
          <span>{portfolio.length}</span>
        )}
      </div>
      <div className="text-sm text-muted-foreground">
        Active positions
      </div>
    </div>
  );
};

export default HoldingsWidget;
