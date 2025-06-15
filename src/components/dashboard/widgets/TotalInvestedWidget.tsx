
import React from 'react';
import { Target } from 'lucide-react';
import FormattedNumber from '@/components/FormattedNumber';
import { usePortfolio } from '@/hooks/usePortfolio';

const TotalInvestedWidget: React.FC = () => {
  const { totalInvested, loading } = usePortfolio();

  return (
    <div className="flex flex-col justify-center h-full">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Total Invested</span>
      </div>
      <div className="text-2xl font-bold mt-2">
        {loading ? (
          <div className="h-8 w-24 bg-gray-700 animate-pulse rounded"></div>
        ) : (
          <FormattedNumber
            value={totalInvested}
            type="currency"
            currency="EUR"
            showTooltip={false}
          />
        )}
      </div>
       <div className="text-sm text-muted-foreground mt-1">
        Your capital at work
      </div>
    </div>
  );
};

export default TotalInvestedWidget;
