
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import FormattedNumber from '@/components/FormattedNumber';
import { usePortfolio } from '@/hooks/usePortfolio';

const ProfitLossWidget: React.FC = () => {
  const { totalProfitLoss, totalProfitLossPercentage, loading } = usePortfolio();

  const Icon = totalProfitLoss >= 0 ? TrendingUp : TrendingDown;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 ${totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`} />
        <span className="text-sm text-muted-foreground">Total Profit/Loss</span>
      </div>
      <div className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {loading ? (
          <div className="h-8 w-24 bg-gray-700 animate-pulse rounded"></div>
        ) : (
          <FormattedNumber
            value={totalProfitLoss}
            type="currency"
            currency="EUR"
            showTooltip={false}
          />
        )}
      </div>
      {!loading && (
        <div className={`text-sm ${totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {totalProfitLoss >= 0 ? '+' : ''}{totalProfitLossPercentage.toFixed(2)}%
        </div>
      )}
    </div>
  );
};

export default ProfitLossWidget;
