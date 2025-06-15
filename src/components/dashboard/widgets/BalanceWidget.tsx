
import React from 'react';
import { Euro } from 'lucide-react';
import FormattedNumber from '@/components/FormattedNumber';
import { useUserBalance } from '@/hooks/useUserBalance';

const BalanceWidget: React.FC = () => {
  const { balance, loading: balanceLoading } = useUserBalance();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Euro className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Available Balance</span>
      </div>
      <div className="text-2xl font-bold">
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
    </div>
  );
};

export default BalanceWidget;
