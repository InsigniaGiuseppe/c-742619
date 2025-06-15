
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Euro, TrendingDown } from 'lucide-react';
import { useUserBalance } from '@/hooks/useUserBalance';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useLending } from '@/hooks/useLending';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import FormattedNumber from '@/components/FormattedNumber';
import { toast } from 'sonner';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { convertEurToUsd } from '@/lib/currencyConverter';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const { balance, totalAssets, refetch: refetchBalance } = useUserBalance();
  const { liquidValue, lendingValue } = usePortfolio();
  const { lendingPositions } = useLending();
  const { exchangeRate } = useExchangeRate();
  
  const hasActiveLending = lendingPositions.length > 0;
  const hasLiquidAssets = liquidValue > 0;
  const maxWithdrawable = balance; // Only liquid EUR balance can be withdrawn

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setError('');
    }
  }, [isOpen]);

  const handleWithdraw = async () => {
    if (!user) {
      setError('Authentication required');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (withdrawAmount > maxWithdrawable) {
      setError(`Insufficient liquid balance. Maximum withdrawable: €${maxWithdrawable.toFixed(2)}`);
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      console.log('[WithdrawModal] Processing withdrawal:', {
        userId: user.id,
        amountEur: withdrawAmount,
        currentBalance: balance,
        maxWithdrawable,
        exchangeRate
      });

      // Get current balance to ensure we have the latest data
      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('demo_balance_usd')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error('Failed to fetch current balance');
      }

      const currentBalanceUsd = currentProfile.demo_balance_usd || 0;
      // Convert EUR withdrawal to USD for storage (no fees)
      const withdrawAmountUsd = convertEurToUsd(withdrawAmount, exchangeRate);
      const newBalanceUsd = currentBalanceUsd - withdrawAmountUsd;

      console.log('[WithdrawModal] Balance calculation:', {
        currentBalanceUsd,
        withdrawAmountUsd,
        newBalanceUsd
      });

      if (newBalanceUsd < 0) {
        throw new Error('Insufficient funds for withdrawal');
      }

      // Update the user's balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ demo_balance_usd: newBalanceUsd })
        .eq('id', user.id);

      if (updateError) {
        throw new Error('Failed to update balance');
      }

      // Record the withdrawal transaction with correct transaction type
      const { error: transactionError } = await supabase
        .from('transaction_history')
        .insert({
          user_id: user.id,
          transaction_type: 'withdrawal', // Use standard transaction type
          amount: withdrawAmount,
          usd_value: withdrawAmountUsd,
          fee_amount: 0, // No fees for EUR withdrawals
          status: 'completed',
          description: `EUR withdrawal: €${withdrawAmount.toFixed(2)}`
        });

      if (transactionError) {
        console.error('[WithdrawModal] Transaction recording failed:', transactionError);
        // Don't throw here as the main operation succeeded
      }

      toast.success(`Successfully withdrew €${withdrawAmount.toFixed(2)}`);
      
      // Refresh balance data
      await refetchBalance();
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();

    } catch (error: any) {
      console.error('[WithdrawModal] Withdrawal failed:', error);
      setError(error.message || 'Withdrawal failed');
      toast.error(`Withdrawal failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Euro className="w-5 h-5" />
            Withdraw EUR
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Balance Overview */}
          <div className="bg-slate-900 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Liquid Balance:</span>
              <FormattedNumber value={balance} type="currency" currency="EUR" />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Assets:</span>
              <FormattedNumber value={totalAssets} type="currency" currency="EUR" />
            </div>
            {hasActiveLending && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">In Lending:</span>
                <FormattedNumber value={lendingValue} type="currency" currency="EUR" className="text-purple-400" />
              </div>
            )}
            {hasLiquidAssets && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">In Crypto:</span>
                <FormattedNumber value={liquidValue} type="currency" currency="EUR" className="text-blue-400" />
              </div>
            )}
          </div>

          {/* Warnings */}
          {(hasActiveLending || hasLiquidAssets) && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {hasActiveLending && hasLiquidAssets && (
                  <>You have assets in lending positions and cryptocurrency. Only your liquid EUR balance can be withdrawn directly.</>
                )}
                {hasActiveLending && !hasLiquidAssets && (
                  <>You have active lending positions. Cancel lending positions first to access those funds.</>
                )}
                {!hasActiveLending && hasLiquidAssets && (
                  <>You have cryptocurrency holdings. Sell your crypto first to convert to EUR before withdrawing.</>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* No Fees Notice */}
          <Alert>
            <Euro className="h-4 w-4" />
            <AlertDescription>
              EUR withdrawals are processed with no fees.
            </AlertDescription>
          </Alert>

          {/* Withdrawal Form */}
          <div className="space-y-2">
            <Label htmlFor="amount">Withdrawal Amount (EUR)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max={maxWithdrawable}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in EUR"
              disabled={isProcessing}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: €0.01</span>
              <span>Max: <FormattedNumber value={maxWithdrawable} type="currency" currency="EUR" /></span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={isProcessing || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxWithdrawable}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Withdraw €{amount || '0'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawModal;
