
import React, { useState } from 'react';
import { Euro, ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FormattedNumber from '@/components/FormattedNumber';
import { useUserBalance } from '@/hooks/useUserBalance';
import DepositModal from '@/components/modals/DepositModal';
import WithdrawModal from '@/components/modals/WithdrawModal';

const EnhancedBalanceWidget: React.FC = () => {
  const { balance, loading: balanceLoading } = useUserBalance();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  return (
    <div className="flex flex-col justify-center h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Euro className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Available Balance</span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setShowDepositModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <ArrowDown className="w-4 h-4 mr-1" />
            Deposit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowWithdrawModal(true)}
            className="border-red-400 text-red-400 hover:bg-red-400/10"
          >
            <ArrowUp className="w-4 h-4 mr-1" />
            Withdraw
          </Button>
        </div>
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

      <DepositModal 
        open={showDepositModal} 
        onOpenChange={setShowDepositModal} 
      />
      <WithdrawModal 
        open={showWithdrawModal} 
        onOpenChange={setShowWithdrawModal} 
      />
    </div>
  );
};

export default EnhancedBalanceWidget;
