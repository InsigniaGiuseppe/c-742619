
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useCryptocurrencies } from '@/hooks/useCryptocurrencies';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SpinResult {
  multiplier: number;
  rewardCrypto: string;
  rewardAmount: number;
  rewardValue: number;
}

export const useSpinGame = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentSpin, setCurrentSpin] = useState<SpinResult | null>(null);
  const { session } = useAuth();
  const { portfolio, refetch: refetchPortfolio } = usePortfolio();
  const { cryptocurrencies } = useCryptocurrencies();

  const spin = async (betAmount: number): Promise<SpinResult | null> => {
    if (!session) {
      toast.error('Please log in to play');
      return null;
    }

    if (isSpinning) {
      toast.error('Please wait for current spin to complete');
      return null;
    }

    const btcPortfolio = portfolio?.find(p => p.crypto.symbol === 'BTC');
    if (!btcPortfolio || btcPortfolio.quantity < betAmount) {
      toast.error('Insufficient BTC balance');
      return null;
    }

    setIsSpinning(true);

    try {
      console.log('[useSpinGame] Starting spin with bet amount:', betAmount);

      const { data: spinConfigs, error: configError } = await supabase
        .from('spin_configurations')
        .select(`
          *,
          cryptocurrencies(symbol, name, current_price)
        `)
        .eq('is_active', true);

      if (configError) {
        console.error('[useSpinGame] Error fetching spin configs:', configError);
        throw new Error('Failed to load spin configurations');
      }

      if (!spinConfigs || spinConfigs.length === 0) {
        throw new Error('No active spin configurations found');
      }

      // Calculate weighted random selection
      const totalProbability = spinConfigs.reduce((sum, config) => sum + Number(config.probability), 0);
      const random = Math.random() * totalProbability;
      
      let cumulativeProbability = 0;
      let selectedConfig = spinConfigs[0];
      
      for (const config of spinConfigs) {
        cumulativeProbability += Number(config.probability);
        if (random <= cumulativeProbability) {
          selectedConfig = config;
          break;
        }
      }

      const multiplier = Number(selectedConfig.min_multiplier) + 
        Math.random() * (Number(selectedConfig.max_multiplier) - Number(selectedConfig.min_multiplier));

      const btcPrice = btcPortfolio.crypto.current_price;
      const betValueUsd = betAmount * btcPrice;
      const rewardValueUsd = betValueUsd * multiplier;
      const rewardAmount = rewardValueUsd / Number(selectedConfig.cryptocurrencies.current_price);

      const spinResult: SpinResult = {
        multiplier,
        rewardCrypto: selectedConfig.cryptocurrencies.symbol,
        rewardAmount,
        rewardValue: rewardValueUsd
      };

      console.log('[useSpinGame] Spin result calculated:', spinResult);

      // Create debit transaction (bet) - now works with fixed constraint
      const { data: debitTransaction, error: debitError } = await supabase
        .from('transaction_history')
        .insert({
          user_id: session.user.id,
          cryptocurrency_id: btcPortfolio.cryptocurrency_id,
          transaction_type: 'spin_bet',
          amount: -betAmount,
          usd_value: -betValueUsd,
          description: `Spin bet: ${betAmount} BTC`,
          status: 'completed'
        })
        .select()
        .single();

      if (debitError) {
        console.error('[useSpinGame] Error creating debit transaction:', debitError);
        throw new Error(`Failed to process bet transaction: ${debitError.message}`);
      }

      // Create credit transaction (reward) - now works with fixed constraint
      const { data: creditTransaction, error: creditError } = await supabase
        .from('transaction_history')
        .insert({
          user_id: session.user.id,
          cryptocurrency_id: selectedConfig.cryptocurrency_id,
          transaction_type: 'spin_reward',
          amount: rewardAmount,
          usd_value: rewardValueUsd,
          description: `Spin reward: ${rewardAmount.toFixed(8)} ${selectedConfig.cryptocurrencies.symbol}`,
          status: 'completed'
        })
        .select()
        .single();

      if (creditError) {
        console.error('[useSpinGame] Error creating credit transaction:', creditError);
        throw new Error('Failed to process reward transaction');
      }

      // Record the spin game
      const { error: spinGameError } = await supabase
        .from('spin_games')
        .insert({
          user_id: session.user.id,
          bet_amount_btc: betAmount,
          bet_amount_usd: betValueUsd,
          reward_cryptocurrency_id: selectedConfig.cryptocurrency_id,
          reward_amount: rewardAmount,
          reward_usd_value: rewardValueUsd,
          multiplier,
          spin_result_data: {
            selected_config: selectedConfig,
            random_value: random,
            total_probability: totalProbability
          },
          transaction_debit_id: debitTransaction.id,
          transaction_credit_id: creditTransaction.id
        });

      if (spinGameError) {
        console.error('[useSpinGame] Error recording spin game:', spinGameError);
      }

      // Update BTC portfolio (subtract bet)
      const newBtcQuantity = btcPortfolio.quantity - betAmount;
      const { error: btcUpdateError } = await supabase
        .from('user_portfolios')
        .update({ quantity: newBtcQuantity })
        .eq('id', btcPortfolio.id);

      if (btcUpdateError) {
        console.error('[useSpinGame] Error updating BTC portfolio:', btcUpdateError);
        throw new Error('Failed to update BTC balance');
      }

      // Update or create reward crypto portfolio
      const rewardCryptoPortfolio = portfolio?.find(p => p.cryptocurrency_id === selectedConfig.cryptocurrency_id);

      if (rewardCryptoPortfolio) {
        const newQuantity = rewardCryptoPortfolio.quantity + rewardAmount;
        const { error: updateError } = await supabase
          .from('user_portfolios')
          .update({ quantity: newQuantity })
          .eq('id', rewardCryptoPortfolio.id);

        if (updateError) {
          console.error('[useSpinGame] Error updating reward portfolio:', updateError);
          throw new Error('Failed to update reward balance');
        }
      } else {
        const { error: createError } = await supabase
          .from('user_portfolios')
          .insert({
            user_id: session.user.id,
            cryptocurrency_id: selectedConfig.cryptocurrency_id,
            quantity: rewardAmount,
            average_buy_price: Number(selectedConfig.cryptocurrencies.current_price),
            total_invested: rewardValueUsd,
            current_value: rewardValueUsd,
            profit_loss: 0,
            profit_loss_percentage: 0
          });

        if (createError) {
          console.error('[useSpinGame] Error creating reward portfolio:', createError);
          throw new Error('Failed to create reward balance');
        }
      }

      setCurrentSpin(spinResult);
      await refetchPortfolio();

      toast.success(`Spin complete! Won ${rewardAmount.toFixed(8)} ${selectedConfig.cryptocurrencies.symbol}`);
      
      return spinResult;

    } catch (error) {
      console.error('[useSpinGame] Spin failed:', error);
      toast.error(`Spin failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    } finally {
      setIsSpinning(false);
    }
  };

  return {
    spin,
    isSpinning,
    currentSpin,
    setCurrentSpin
  };
};
