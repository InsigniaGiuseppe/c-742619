
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { Cryptocurrency } from './useCryptocurrencies';
import { useQueryClient } from '@tanstack/react-query';

export const useTrade = (crypto: Cryptocurrency | undefined) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'ideal'>('balance');
  const [amountEUR, setAmountEUR] = useState('');
  const [amountCoin, setAmountCoin] = useState('');
  const [isProcessingTrade, setIsProcessingTrade] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [userHoldings, setUserHoldings] = useState(0);

  const fetchUserData = useCallback(async () => {
    if (!user || !crypto) return;

    try {
      // Fetch user's demo balance
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('[useTrade] Error fetching profile:', profileError);
        return;
      }

      if (profile) {
        setUserBalance(profile.demo_balance_usd || 10000);
      }

      // Fetch user's holdings for this crypto
      const { data: portfolio, error: portfolioError } = await supabase
        .from('user_portfolios')
        .select('quantity')
        .eq('user_id', user.id)
        .eq('cryptocurrency_id', crypto.id)
        .single();

      if (portfolioError && portfolioError.code !== 'PGRST116') {
        console.error('[useTrade] Error fetching portfolio:', portfolioError);
      }

      setUserHoldings(portfolio?.quantity || 0);
    } catch (error) {
      console.error('[useTrade] Unexpected error in fetchUserData:', error);
    }
  }, [user, crypto]);

  useEffect(() => {
    if (user && crypto) {
      fetchUserData();
    }
  }, [user, crypto, fetchUserData]);

  const handleAmountEURChange = (value: string) => {
    setAmountEUR(value);
    if (crypto && value) {
      const coinAmount = parseFloat(value) / crypto.current_price;
      setAmountCoin(coinAmount.toFixed(8));
    } else {
      setAmountCoin('');
    }
  };

  const handleAmountCoinChange = (value: string) => {
    setAmountCoin(value);
    if (crypto && value) {
      const eurAmount = parseFloat(value) * crypto.current_price;
      setAmountEUR(eurAmount.toFixed(2));
    } else {
      setAmountEUR('');
    }
  };

  const handleTrade = async () => {
    if (!user || !crypto || !amountEUR || !amountCoin) {
      toast.error('Please fill in all fields');
      return;
    }

    const eurValue = parseFloat(amountEUR);
    const coinAmount = parseFloat(amountCoin);
    const feeAmount = eurValue * 0.001;
    const totalCost = eurValue + feeAmount;

    console.log('[useTrade] Starting trade:', {
      user_id: user.id,
      crypto_id: crypto.id,
      trade_type: tradeType,
      eur_value: eurValue,
      coin_amount: coinAmount,
      fee_amount: feeAmount,
      total_cost: totalCost,
      user_balance: userBalance,
      user_holdings: userHoldings
    });

    if (tradeType === 'buy' && totalCost > userBalance) {
      toast.error('Insufficient balance');
      return;
    }

    if (tradeType === 'sell' && coinAmount > userHoldings) {
      toast.error('Insufficient holdings');
      return;
    }

    setIsProcessingTrade(true);

    try {
      // Step 1: Create trading order
      console.log('[useTrade] Creating trading order...');
      const { data: order, error: orderError } = await supabase
        .from('trading_orders')
        .insert({
          user_id: user.id,
          cryptocurrency_id: crypto.id,
          order_type: tradeType,
          amount: coinAmount,
          price_per_unit: crypto.current_price,
          total_value: eurValue,
          fees: feeAmount,
          order_status: 'completed',
          executed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (orderError) {
        console.error('[useTrade] Trading order error:', orderError);
        throw new Error(`Failed to create trading order: ${orderError.message}`);
      }

      console.log('[useTrade] Trading order created:', order);

      // Step 2: Create transaction history record
      console.log('[useTrade] Creating transaction history...');
      const { error: transactionError } = await supabase
        .from('transaction_history')
        .insert({
          user_id: user.id,
          cryptocurrency_id: crypto.id,
          transaction_type: tradeType,
          amount: coinAmount,
          usd_value: eurValue,
          fee_amount: feeAmount,
          status: 'completed',
          description: `${tradeType.toUpperCase()} ${coinAmount.toFixed(8)} ${crypto.symbol}`,
          reference_order_id: order.id
        });

      if (transactionError) {
        console.error('[useTrade] Transaction history error:', transactionError);
        throw new Error(`Failed to create transaction record: ${transactionError.message}`);
      }

      console.log('[useTrade] Transaction history created');

      // Step 3: Update or create portfolio entry
      console.log('[useTrade] Updating portfolio...');
      const { data: existingPortfolio, error: portfolioFetchError } = await supabase
        .from('user_portfolios')
        .select('*')
        .eq('user_id', user.id)
        .eq('cryptocurrency_id', crypto.id)
        .single();

      if (portfolioFetchError && portfolioFetchError.code !== 'PGRST116') {
        console.error('[useTrade] Portfolio fetch error:', portfolioFetchError);
        throw new Error(`Failed to fetch portfolio: ${portfolioFetchError.message}`);
      }

      if (existingPortfolio) {
        // Update existing portfolio
        const newQuantity = tradeType === 'buy' 
          ? existingPortfolio.quantity + coinAmount 
          : existingPortfolio.quantity - coinAmount;
        
        const newTotalInvested = tradeType === 'buy' 
          ? existingPortfolio.total_invested + eurValue 
          : Math.max(0, existingPortfolio.total_invested - eurValue);
        
        const newAveragePrice = newQuantity > 0 ? newTotalInvested / newQuantity : 0;
        const newCurrentValue = newQuantity * crypto.current_price;
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

        if (portfolioUpdateError) {
          console.error('[useTrade] Portfolio update error:', portfolioUpdateError);
          throw new Error(`Failed to update portfolio: ${portfolioUpdateError.message}`);
        }
      } else if (tradeType === 'buy') {
        // Create new portfolio entry
        const { error: portfolioCreateError } = await supabase
          .from('user_portfolios')
          .insert({
            user_id: user.id,
            cryptocurrency_id: crypto.id,
            quantity: coinAmount,
            average_buy_price: crypto.current_price,
            total_invested: eurValue,
            current_value: eurValue,
            profit_loss: 0,
            profit_loss_percentage: 0
          });

        if (portfolioCreateError) {
          console.error('[useTrade] Portfolio create error:', portfolioCreateError);
          throw new Error(`Failed to create portfolio entry: ${portfolioCreateError.message}`);
        }
      }

      console.log('[useTrade] Portfolio updated');

      // Step 4: Update user balance
      console.log('[useTrade] Updating user balance...');
      const newBalance = tradeType === 'buy' 
        ? userBalance - totalCost 
        : userBalance + eurValue - feeAmount;
      
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ demo_balance_usd: newBalance })
        .eq('id', user.id);

      if (balanceError) {
        console.error('[useTrade] Balance update error:', balanceError);
        throw new Error(`Failed to update balance: ${balanceError.message}`);
      }

      console.log('[useTrade] Balance updated');

      // Step 5: Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-history'] });
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
      
      toast.success(`Successfully ${tradeType === 'buy' ? 'bought' : 'sold'} ${coinAmount.toFixed(8)} ${crypto.symbol}`);
      
      setAmountEUR('');
      setAmountCoin('');
      fetchUserData();
    } catch (error: any) {
      console.error('[useTrade] Trade failed:', error);
      toast.error(`Trade failed: ${error.message}`);
    } finally {
      setIsProcessingTrade(false);
    }
  };

  return {
    user,
    tradeType,
    setTradeType,
    paymentMethod,
    setPaymentMethod,
    amountEUR,
    amountCoin,
    handleAmountEURChange,
    handleAmountCoinChange,
    isProcessingTrade,
    userBalance,
    userHoldings,
    handleTrade,
  };
};
