
import React from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import FormattedNumber from '@/components/FormattedNumber';
import { usePortfolio } from '@/hooks/usePortfolio';

const PortfolioValueWidget: React.FC = () => {
  const { totalValue, totalProfitLoss, totalProfitLossPercentage, loading } = usePortfolio();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Wallet className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Portfolio Value</span>
      </div>
      <div className="text-2xl font-bold">
        {loading ? (
          <div className="h-8 w-24 bg-gray-700 animate-pulse rounded"></div>
        ) : (
          <FormattedNumber
            value={totalValue}
            type="currency"
            currency="EUR"
            showTooltip={false}
          />
        )}
      </div>
      {!loading && (
        <div className={`flex items-center gap-1 text-sm ${
          totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'
        }`}>
          {totalProfitLoss >= 0 ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {Math.abs(totalProfitLossPercentage).toFixed(2)}%
        </div>
      )}
    </div>
  );
};

export default PortfolioValueWidget;
