
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { Cryptocurrency } from './useCryptocurrencies';

export const useTrade = (crypto: Cryptocurrency | undefined) => {
  const { user } = useAuth();
  
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'ideal'>('balance');
  const [amountEUR, setAmountEUR] = useState('');
  const [amountCoin, setAmountCoin] = useState('');
  const [isProcessingTrade, setIsProcessingTrade] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [userHoldings, setUserHoldings] = useState(0);

  const fetchUserData = useCallback(async () => {
    if (!user || !crypto) return;

    // Fetch user's demo balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      setUserBalance(profile.demo_balance_usd || 10000);
    }

    // Fetch user's holdings for this crypto
    const { data: portfolio } = await supabase
      .from('user_portfolios')
      .select('quantity')
      .eq('user_id', user.id)
      .eq('cryptocurrency_id', crypto.id)
      .single();

    setUserHoldings(portfolio?.quantity || 0);
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

    if (tradeType === 'buy' && eurValue > userBalance) {
      toast.error('Insufficient balance');
      return;
    }

    if (tradeType === 'sell' && coinAmount > userHoldings) {
      toast.error('Insufficient holdings');
      return;
    }

    setIsProcessingTrade(true);

    try {
      const { data: order, error: orderError } = await supabase
        .from('trading_orders')
        .insert({
          user_id: user.id,
          cryptocurrency_id: crypto.id,
          order_type: tradeType,
          amount: coinAmount,
          price_per_unit: crypto.current_price,
          total_value: eurValue,
          fees: eurValue * 0.001,
          order_status: 'completed',
          executed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (orderError) throw orderError;

      await supabase.from('transaction_history').insert({
        user_id: user.id,
        cryptocurrency_id: crypto.id,
        transaction_type: tradeType,
        amount: coinAmount,
        usd_value: eurValue,
        fee_amount: eurValue * 0.001,
        status: 'completed',
        description: `${tradeType.toUpperCase()} ${coinAmount} ${crypto.symbol}`,
        reference_order_id: order.id
      });

      const { data: existingPortfolio } = await supabase
        .from('user_portfolios')
        .select('*')
        .eq('user_id', user.id)
        .eq('cryptocurrency_id', crypto.id)
        .single();

      if (existingPortfolio) {
        const newQuantity = tradeType === 'buy' ? existingPortfolio.quantity + coinAmount : existingPortfolio.quantity - coinAmount;
        const newTotalInvested = tradeType === 'buy' ? existingPortfolio.total_invested + eurValue : Math.max(0, existingPortfolio.total_invested - eurValue);
        const newAveragePrice = newQuantity > 0 ? newTotalInvested / newQuantity : 0;
        await supabase.from('user_portfolios').update({
          quantity: newQuantity,
          average_buy_price: newAveragePrice,
          total_invested: newTotalInvested,
          current_value: newQuantity * crypto.current_price,
          profit_loss: (newQuantity * crypto.current_price) - newTotalInvested,
          profit_loss_percentage: newTotalInvested > 0 ? (((newQuantity * crypto.current_price) - newTotalInvested) / newTotalInvested) * 100 : 0
        }).eq('id', existingPortfolio.id);
      } else if (tradeType === 'buy') {
        await supabase.from('user_portfolios').insert({
          user_id: user.id,
          cryptocurrency_id: crypto.id,
          quantity: coinAmount,
          average_buy_price: crypto.current_price,
          total_invested: eurValue,
          current_value: eurValue,
          profit_loss: 0,
          profit_loss_percentage: 0
        });
      }

      const newBalance = tradeType === 'buy' ? userBalance - eurValue - (eurValue * 0.001) : userBalance + eurValue - (eurValue * 0.001);
      await supabase.from('profiles').update({ demo_balance_usd: newBalance }).eq('id', user.id);
      
      toast.success(`Successfully ${tradeType === 'buy' ? 'bought' : 'sold'} ${coinAmount} ${crypto.symbol}`);
      
      setAmountEUR('');
      setAmountCoin('');
      fetchUserData();
    } catch (error: any) {
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
