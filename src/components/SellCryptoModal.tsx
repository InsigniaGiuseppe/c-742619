
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FormattedNumber from './FormattedNumber';
import CryptoLogo from './CryptoLogo';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { formatCryptoQuantity } from '@/lib/cryptoFormatters';

interface SellCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  holding: {
    cryptocurrency_id: string;
    quantity: number;
    current_value: number;
    crypto: {
      id: string;
      name: string;
      symbol: string;
      current_price: number;
      logo_url?: string;
    };
  };
}

const SellCryptoModal: React.FC<SellCryptoModalProps> = ({ isOpen, onClose, holding }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [sellAmount, setSellAmount] = useState('');
  const [sellType, setSellType] = useState<'partial' | 'full'>('partial');
  const [isLoading, setIsLoading] = useState(false);

  const handleSellTypeChange = (type: 'partial' | 'full') => {
    setSellType(type);
    if (type === 'full') {
      setSellAmount(holding.quantity.toString());
    } else {
      setSellAmount('');
    }
  };

  const handleSell = async () => {
    if (!user) {
      toast.error('Please log in to sell crypto');
      return;
    }

    const sellAmountValue = sellType === 'full' ? holding.quantity : parseFloat(sellAmount);
    
    if (sellAmountValue <= 0 || sellAmountValue > holding.quantity) {
      toast.error('Invalid sell amount');
      return;
    }

    setIsLoading(true);

    try {
      const eurValue = sellAmountValue * holding.crypto.current_price;
      const feeAmount = eurValue * 0.0035; // 0.35% fee
      
      console.log('[SellModal] Starting sell transaction:', {
        userId: user.id,
        cryptoId: holding.crypto.id,
        sellAmount: sellAmountValue,
        eurValue,
        feeAmount
      });

      // Step 1: Create trading order
      const { data: order, error: orderError } = await supabase
        .from('trading_orders')
        .insert({
          user_id: user.id,
          cryptocurrency_id: holding.crypto.id,
          order_type: 'sell',
          amount: sellAmountValue,
          price_per_unit: holding.crypto.current_price,
          total_value: eurValue,
          fees: feeAmount,
          order_status: 'completed',
          executed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (orderError) throw new Error(`Failed to create order: ${orderError.message}`);

      // Step 2: Create transaction history
      const { error: transactionError } = await supabase
        .from('transaction_history')
        .insert({
          user_id: user.id,
          cryptocurrency_id: holding.crypto.id,
          transaction_type: 'trade_sell',
          amount: sellAmountValue,
          usd_value: eurValue,
          fee_amount: feeAmount,
          status: 'completed',
          description: `SELL ${sellAmountValue.toFixed(8)} ${holding.crypto.symbol}`,
          reference_order_id: order.id
        });

      if (transactionError) throw new Error(`Failed to create transaction: ${transactionError.message}`);

      // Step 3: Update portfolio
      const { data: existingPortfolio, error: portfolioFetchError } = await supabase
        .from('user_portfolios')
        .select('*')
        .eq('user_id', user.id)
        .eq('cryptocurrency_id', holding.crypto.id)
        .single();

      if (portfolioFetchError) throw new Error(`Failed to fetch portfolio: ${portfolioFetchError.message}`);

      const newQuantity = existingPortfolio.quantity - sellAmountValue;
      const newTotalInvested = Math.max(0, existingPortfolio.total_invested - eurValue);
      const newAveragePrice = newQuantity > 0 ? newTotalInvested / newQuantity : 0;
      const newCurrentValue = newQuantity * holding.crypto.current_price;
      const newProfitLoss = newCurrentValue - newTotalInvested;
      const newProfitLossPercentage = newTotalInvested > 0 ? (newProfitLoss / newTotalInvested) * 100 : 0;

      const { error: portfolioUpdateError } = await supabase
        .from('user_portfolios')
        .update({
          quantity: newQuantity,
          average_buy_price: newAveragePrice,
          total_invested: newTotalInvested,
          current_value: newCurrentValue,
          profit_loss: newProfitLoss,
          profit_loss_percentage: newProfitLossPercentage
        })
        .eq('id', existingPortfolio.id);

      if (portfolioUpdateError) throw new Error(`Failed to update portfolio: ${portfolioUpdateError.message}`);

      // Step 4: Update user balance
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('demo_balance_usd')
        .eq('id', user.id)
        .single();

      if (profileError) throw new Error(`Failed to fetch profile: ${profileError.message}`);

      const newBalance = profile.demo_balance_usd + eurValue - feeAmount;

      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ demo_balance_usd: newBalance })
        .eq('id', user.id);

      if (balanceError) throw new Error(`Failed to update balance: ${balanceError.message}`);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['portfolio', user.id] });
      queryClient.invalidateQueries({ queryKey: ['transaction-history', user.id] });
      
      toast.success(`Successfully sold ${sellAmountValue.toFixed(8)} ${holding.crypto.symbol}`);
      
      onClose();
      setSellAmount('');
      setSellType('partial');
    } catch (error: any) {
      console.error('[SellModal] Sell failed:', error);
      toast.error(`Sell failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const sellAmountNum = sellType === 'full' ? holding.quantity : parseFloat(sellAmount) || 0;
  const sellValue = sellAmountNum * holding.crypto.current_price;
  const isValidAmount = sellAmountNum > 0 && sellAmountNum <= holding.quantity;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <CryptoLogo 
              logo_url={holding.crypto.logo_url}
              name={holding.crypto.name}
              symbol={holding.crypto.symbol}
              size="sm"
            />
            Sell {holding.crypto.symbol}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Holdings Info */}
          <div className="bg-gray-800/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Available Balance:</span>
              <span className="font-mono">{formatCryptoQuantity(holding.quantity)} {holding.crypto.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Current Price:</span>
              <FormattedNumber value={holding.crypto.current_price} type="currency" showTooltip={false} />
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Value:</span>
              <FormattedNumber value={holding.current_value} type="currency" showTooltip={false} />
            </div>
          </div>

          {/* Sell Type Selection */}
          <div className="space-y-3">
            <Label>Sell Type</Label>
            <div className="flex gap-2">
              <Button
                variant={sellType === 'partial' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSellTypeChange('partial')}
              >
                Partial
              </Button>
              <Button
                variant={sellType === 'full' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSellTypeChange('full')}
              >
                Sell All
              </Button>
            </div>
          </div>

          {/* Amount Input */}
          {sellType === 'partial' && (
            <div className="space-y-2">
              <Label htmlFor="sell-amount">Amount to Sell</Label>
              <Input
                id="sell-amount"
                type="number"
                placeholder="0.00"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                max={holding.quantity}
                step="any"
                className="font-mono"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min: 0.00000001</span>
                <span>Max: {formatCryptoQuantity(holding.quantity)}</span>
              </div>
            </div>
          )}

          {/* Transaction Summary */}
          {sellAmountNum > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-blue-400">Transaction Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Selling:</span>
                  <span className="font-mono">{formatCryptoQuantity(sellAmountNum)} {holding.crypto.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span>You'll receive:</span>
                  <FormattedNumber value={sellValue} type="currency" showTooltip={false} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Trading fee:</span>
                  <span>~0.35%</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSell}
              disabled={!isValidAmount || isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Selling...' : `Sell ${holding.crypto.symbol}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SellCryptoModal;
