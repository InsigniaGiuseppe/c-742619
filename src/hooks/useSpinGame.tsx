
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePortfolio } from '@/hooks/usePortfolio';
import { toast } from 'sonner';

interface SpinConfiguration {
  id: string;
  reward_tier: string;
  cryptocurrency_id: string;
  min_multiplier: number;
  max_multiplier: number;
  probability: number;
  crypto?: {
    name: string;
    symbol: string;
    current_price: number;
    logo_url?: string;
  };
}

interface SpinResult {
  reward_amount: number;
  reward_cryptocurrency_id: string;
  reward_usd_value: number;
  multiplier: number;
  crypto: {
    name: string;
    symbol: string;
    logo_url?: string;
  };
}

export const useSpinGame = () => {
  const { user } = useAuth();
  const { portfolio, refetch: refetchPortfolio } = usePortfolio();
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [configurations, setConfigurations] = useState<SpinConfiguration[]>([]);

  const fetchConfigurations = async () => {
    console.log('[useSpinGame] Fetching spin configurations');
    try {
      const { data, error } = await supabase
        .from('spin_configurations')
        .select(`
          *,
          crypto:cryptocurrencies(
            name,
            symbol,
            current_price,
            logo_url
          )
        `)
        .eq('is_active', true)
        .order('reward_tier');

      console.log('[useSpinGame] Configurations query result:', { data, error });
      
      if (error) throw error;
      setConfigurations(data || []);
    } catch (error: any) {
      console.error('[useSpinGame] Error fetching spin configurations:', error);
      toast.error('Failed to load game configurations');
    }
  };

  const generateSpinResult = (betAmountBtc: number): SpinResult | null => {
    console.log('[useSpinGame] Generating spin result with configurations:', configurations.length);
    
    if (configurations.length === 0) return null;

    // Generate random number to determine tier
    const random = Math.random();
    let cumulativeProbability = 0;
    let selectedConfig: SpinConfiguration | null = null;

    for (const config of configurations) {
      cumulativeProbability += config.probability;
      if (random <= cumulativeProbability) {
        selectedConfig = config;
        break;
      }
    }

    console.log('[useSpinGame] Selected configuration:', selectedConfig);

    if (!selectedConfig || !selectedConfig.crypto) return null;

    // Generate multiplier within tier range
    const multiplier = selectedConfig.min_multiplier + 
      Math.random() * (selectedConfig.max_multiplier - selectedConfig.min_multiplier);

    // Calculate reward based on bet amount and multiplier
    const btcPrice = portfolio?.find(p => p.crypto.symbol === 'BTC')?.crypto.current_price || 50000;
    const betAmountUsd = betAmountBtc * btcPrice;
    const rewardUsdValue = betAmountUsd * multiplier;
    const rewardAmount = rewardUsdValue / selectedConfig.crypto.current_price;

    const result = {
      reward_amount: rewardAmount,
      reward_cryptocurrency_id: selectedConfig.cryptocurrency_id,
      reward_usd_value: rewardUsdValue,
      multiplier,
      crypto: selectedConfig.crypto
    };

    console.log('[useSpinGame] Generated spin result:', result);
    return result;
  };

  const executeSpin = async (betAmountBtc: number): Promise<SpinResult | null> => {
    console.log('[useSpinGame] Executing spin with bet amount:', betAmountBtc);
    
    if (!user) {
      console.error('[useSpinGame] User not authenticated');
      toast.error('User not authenticated');
      return null;
    }

    setLoading(true);
    setSpinning(true);

    try {
      // Check if user has enough BTC
      const btcHolding = portfolio?.find(p => p.crypto.symbol === 'BTC');
      console.log('[useSpinGame] BTC holding:', btcHolding);
      
      if (!btcHolding || btcHolding.quantity < betAmountBtc) {
        toast.error('Insufficient BTC balance');
        return null;
      }

      const spinResult = generateSpinResult(betAmountBtc);
      if (!spinResult) {
        toast.error('Failed to generate spin result');
        return null;
      }

      const btcPrice = btcHolding.crypto.current_price || 50000;
      const betAmountUsd = betAmountBtc * btcPrice;

      console.log('[useSpinGame] Creating transactions...');

      // Start database transaction
      const { data: btcCrypto } = await supabase
        .from('cryptocurrencies')
        .select('id')
        .eq('symbol', 'BTC')
        .single();

      if (!btcCrypto) {
        throw new Error('BTC cryptocurrency not found');
      }

      // Create debit transaction for BTC bet
      const { data: debitTransaction, error: debitError } = await supabase
        .from('transaction_history')
        .insert({
          user_id: user.id,
          cryptocurrency_id: btcCrypto.id,
          transaction_type: 'spin_bet',
          amount: betAmountBtc,
          usd_value: betAmountUsd,
          status: 'completed',
          description: `VaultSpin bet of ${betAmountBtc} BTC`
        })
        .select()
        .single();

      console.log('[useSpinGame] Debit transaction result:', { debitTransaction, debitError });
      if (debitError) throw debitError;

      // Create credit transaction for reward
      const { data: creditTransaction, error: creditError } = await supabase
        .from('transaction_history')
        .insert({
          user_id: user.id,
          cryptocurrency_id: spinResult.reward_cryptocurrency_id,
          transaction_type: 'spin_reward',
          amount: spinResult.reward_amount,
          usd_value: spinResult.reward_usd_value,
          status: 'completed',
          description: `VaultSpin reward of ${spinResult.reward_amount} ${spinResult.crypto.symbol}`
        })
        .select()
        .single();

      console.log('[useSpinGame] Credit transaction result:', { creditTransaction, creditError });
      if (creditError) throw creditError;

      // Record the spin game
      const { error: spinError } = await supabase
        .from('spin_games')
        .insert({
          user_id: user.id,
          bet_amount_btc: betAmountBtc,
          bet_amount_usd: betAmountUsd,
          reward_cryptocurrency_id: spinResult.reward_cryptocurrency_id,
          reward_amount: spinResult.reward_amount,
          reward_usd_value: spinResult.reward_usd_value,
          multiplier: spinResult.multiplier,
          transaction_debit_id: debitTransaction.id,
          transaction_credit_id: creditTransaction.id,
          spin_result_data: {
            tier: 'calculated_from_multiplier',
            random_seed: Math.random()
          }
        });

      console.log('[useSpinGame] Spin game record result:', { spinError });
      if (spinError) throw spinError;

      console.log('[useSpinGame] Updating portfolios...');

      // Update BTC portfolio (deduct bet)
      const newBtcQuantity = btcHolding.quantity - betAmountBtc;
      const newBtcValue = newBtcQuantity * btcPrice;

      if (newBtcQuantity > 0) {
        await supabase
          .from('user_portfolios')
          .update({
            quantity: newBtcQuantity,
            current_value: newBtcValue,
            profit_loss: newBtcValue - btcHolding.total_invested,
            profit_loss_percentage: btcHolding.total_invested > 0 
              ? ((newBtcValue - btcHolding.total_invested) / btcHolding.total_invested) * 100 
              : 0
          })
          .eq('user_id', user.id)
          .eq('cryptocurrency_id', btcCrypto.id);
      } else {
        await supabase
          .from('user_portfolios')
          .delete()
          .eq('user_id', user.id)
          .eq('cryptocurrency_id', btcCrypto.id);
      }

      // Update reward cryptocurrency portfolio (add reward)
      const existingRewardHolding = portfolio?.find(p => p.crypto.id === spinResult.reward_cryptocurrency_id);
      
      if (existingRewardHolding) {
        const newQuantity = existingRewardHolding.quantity + spinResult.reward_amount;
        const newValue = newQuantity * (existingRewardHolding.crypto.current_price || 0);
        
        await supabase
          .from('user_portfolios')
          .update({
            quantity: newQuantity,
            current_value: newValue,
            profit_loss: newValue - existingRewardHolding.total_invested,
            profit_loss_percentage: existingRewardHolding.total_invested > 0 
              ? ((newValue - existingRewardHolding.total_invested) / existingRewardHolding.total_invested) * 100 
              : 0
          })
          .eq('user_id', user.id)
          .eq('cryptocurrency_id', spinResult.reward_cryptocurrency_id);
      } else {
        // Create new portfolio entry for reward cryptocurrency
        const rewardCryptoPrice = configurations.find(c => c.cryptocurrency_id === spinResult.reward_cryptocurrency_id)?.crypto?.current_price || 0;
        await supabase
          .from('user_portfolios')
          .insert({
            user_id: user.id,
            cryptocurrency_id: spinResult.reward_cryptocurrency_id,
            quantity: spinResult.reward_amount,
            average_buy_price: rewardCryptoPrice,
            total_invested: 0, // This is a reward, not an investment
            current_value: spinResult.reward_usd_value,
            profit_loss: spinResult.reward_usd_value,
            profit_loss_percentage: 0
          });
      }

      // Simulate spin animation time
      await new Promise(resolve => setTimeout(resolve, 3000));

      refetchPortfolio();
      toast.success(`You won ${spinResult.reward_amount.toFixed(6)} ${spinResult.crypto.symbol}!`);
      
      console.log('[useSpinGame] Spin execution completed successfully');
      return spinResult;

    } catch (error: any) {
      console.error('[useSpinGame] Spin execution error:', error);
      toast.error(`Spin failed: ${error.message}`);
      return null;
    } finally {
      setLoading(false);
      setSpinning(false);
    }
  };

  return {
    configurations,
    loading,
    spinning,
    fetchConfigurations,
    executeSpin
  };
};
