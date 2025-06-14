
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
    console.log('[useTrade] Running fetchUserData for user and crypto', { userId: user.id, cryptoId: crypto.id });

    try {
      // Fetch user's account balance
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

    console.log('[useTrade] Initiating trade with params:', {
      userId: user.id,
      cryptoId: crypto.id,
      tradeType,
      eurValue,
      coinAmount,
      userBalance,
      userHoldings,
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
    const logPrefix = `[Trade-Step]`;

    try {
      // Step 1: Create trading order
      console.log(`${logPrefix} 1. Inserting into trading_orders...`);
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

      console.log(`${logPrefix} 1. Result:`, { order, orderError });
      if (orderError) throw new Error(`Failed at trading_orders: ${orderError.message}`);
      if (!order) throw new Error('Trading order creation returned no data.');

      // Step 2: Create transaction history record with correct transaction_type
      console.log(`${logPrefix} 2. Inserting into transaction_history...`);
      const transactionType = tradeType === 'buy' ? 'trade_buy' : 'trade_sell';
      
      const { data: transaction, error: transactionError } = await supabase
        .from('transaction_history')
        .insert({
          user_id: user.id,
          cryptocurrency_id: crypto.id,
          transaction_type: transactionType,
          amount: coinAmount,
          usd_value: eurValue,
          fee_amount: feeAmount,
          status: 'completed',
          description: `${tradeType.toUpperCase()} ${coinAmount.toFixed(8)} ${crypto.symbol}`,
          reference_order_id: order.id
        })
        .select()
        .single();
      
      console.log(`${logPrefix} 2. Result:`, { transaction, transactionError });
      if (transactionError) throw new Error(`Failed at transaction_history: ${transactionError.message}`);
      if (!transaction) throw new Error('Transaction history creation returned no data.');

      // Step 3: Update or create portfolio entry
      console.log(`${logPrefix} 3. Fetching existing portfolio for update...`);
      const { data: existingPortfolio, error: portfolioFetchError } = await supabase
        .from('user_portfolios')
        .select('*')
        .eq('user_id', user.id)
        .eq('cryptocurrency_id', crypto.id)
        .single();

      console.log(`${logPrefix} 3. Fetch Result:`, { existingPortfolio, portfolioFetchError });
      if (portfolioFetchError && portfolioFetchError.code !== 'PGRST116') {
        throw new Error(`Failed to fetch portfolio for update: ${portfolioFetchError.message}`);
      }

      if (existingPortfolio) {
        console.log(`${logPrefix} 3a. Updating existing portfolio...`);
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

        const { data: updatedPortfolio, error: portfolioUpdateError } = await supabase
          .from('user_portfolios')
          .update({
            quantity: newQuantity,
            average_buy_price: newAveragePrice,
            total_invested: newTotalInvested,
            current_value: newCurrentValue,
            profit_loss: newProfitLoss,
            profit_loss_percentage: newProfitLossPercentage
          })
          .eq('id', existingPortfolio.id)
          .select()
          .single();

        console.log(`${logPrefix} 3a. Update Result:`, { updatedPortfolio, portfolioUpdateError });
        if (portfolioUpdateError) throw new Error(`Failed to update portfolio: ${portfolioUpdateError.message}`);
      } else if (tradeType === 'buy') {
        console.log(`${logPrefix} 3b. Creating new portfolio entry...`);
        const { data: newPortfolio, error: portfolioCreateError } = await supabase
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
          })
          .select()
          .single();
        
        console.log(`${logPrefix} 3b. Create Result:`, { newPortfolio, portfolioCreateError });
        if (portfolioCreateError) throw new Error(`Failed to create portfolio entry: ${portfolioCreateError.message}`);
      }

      // Step 4: Update user balance
      console.log(`${logPrefix} 4. Updating user balance...`);
      const newBalance = tradeType === 'buy' 
        ? userBalance - totalCost 
        : userBalance + eurValue - feeAmount;
      
      const { data: updatedProfile, error: balanceError } = await supabase
        .from('profiles')
        .update({ demo_balance_usd: newBalance })
        .eq('id', user.id)
        .select()
        .single();

      console.log(`${logPrefix} 4. Update Result:`, { updatedProfile, balanceError });
      if (balanceError) throw new Error(`Failed to update balance: ${balanceError.message}`);

      // Step 5: Invalidate queries to refresh data
      const portfolioQueryKey = ['portfolio', user.id];
      const historyQueryKey = ['transaction-history', user.id];
      console.log(`${logPrefix} 5. Invalidating queries with keys:`, { portfolioQueryKey, historyQueryKey });
      
      queryClient.invalidateQueries({ queryKey: portfolioQueryKey });
      queryClient.invalidateQueries({ queryKey: historyQueryKey });
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
