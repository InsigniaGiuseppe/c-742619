
import React from 'react';
import { Euro, TrendingUp } from 'lucide-react';
import FormattedNumber from '@/components/FormattedNumber';
import { useUserBalance } from '@/hooks/useUserBalance';

const BalanceWidget: React.FC = () => {
  const { balance, totalAssets, loading: balanceLoading } = useUserBalance();

  return (
    <div className="flex flex-col justify-center h-full">
      <div className="flex items-center gap-2 mb-2">
        <Euro className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Liquid Balance</span>
      </div>
      <div className="text-2xl font-bold mb-3">
        {balanceLoading ? (
          <div className="h-8 w-24 bg-gray-700 animate-pulse rounded"></div>
        ) : (
          <FormattedNumber
            value={balance}
            type="currency"
            currency="EUR"
            showTooltip={false}
          />
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-blue-400" />
        <span className="text-xs text-muted-foreground">Total Assets</span>
      </div>
      <div className="text-lg font-semibold text-blue-400">
        {balanceLoading ? (
          <div className="h-6 w-20 bg-gray-700 animate-pulse rounded"></div>
        ) : (
          <FormattedNumber
            value={totalAssets}
            type="currency"
            currency="EUR"
            showTooltip={false}
          />
        )}
      </div>
    </div>
  );
};

export default BalanceWidget;
