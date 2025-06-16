
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
  isWin: boolean;
  tier?: string;
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

      // Fetch active spin configurations
      const { data: spinConfigs, error: configError } = await supabase
        .from('spin_configurations')
        .select(`
          *,
          cryptocurrencies(symbol, name, current_price, logo_url)
        `)
        .eq('is_active', true);

      if (configError) {
        console.error('[useSpinGame] Error fetching spin configs:', configError);
        throw new Error('Failed to load spin configurations');
      }

      if (!spinConfigs || spinConfigs.length === 0) {
        throw new Error('No active spin configurations found');
      }

      // Calculate probabilities (total should be 70% for wins, 30% for loss)
      const totalWinProbability = spinConfigs.reduce((sum, config) => sum + Number(config.probability), 0);
      const loseProbability = 0.30;
      
      console.log('[useSpinGame] Total win probability:', totalWinProbability, 'Lose probability:', loseProbability);

      // Generate random number to determine outcome
      const random = Math.random();
      
      const btcPrice = btcPortfolio.crypto.current_price;
      const betValueUsd = betAmount * btcPrice;
      const feeAmount = betAmount * 0.0001; // 0.01% fee
      const totalDeduction = betAmount + feeAmount;

      // Check if player loses (30% chance)
      if (random > totalWinProbability) {
        console.log('[useSpinGame] Player lost, no reward');
        
        // Create losing transaction record
        const { error: lossError } = await supabase
          .from('transaction_history')
          .insert({
            user_id: session.user.id,
            cryptocurrency_id: btcPortfolio.cryptocurrency_id,
            transaction_type: 'spin_bet',
            amount: -totalDeduction,
            usd_value: -betValueUsd * (1 + 0.0001),
            description: `Spin loss: ${betAmount} BTC + ${feeAmount.toFixed(8)} BTC fee`,
            status: 'completed'
          });

        if (lossError) {
          console.error('[useSpinGame] Error creating loss transaction:', lossError);
          throw new Error('Failed to process loss transaction');
        }

        // Update BTC portfolio balance
        const newBtcQuantity = Math.max(0, btcPortfolio.quantity - totalDeduction);
        const { error: btcUpdateError } = await supabase
          .from('user_portfolios')
          .update({ quantity: newBtcQuantity })
          .eq('id', btcPortfolio.id);

        if (btcUpdateError) {
          console.error('[useSpinGame] Error updating BTC portfolio:', btcUpdateError);
          throw new Error('Failed to update BTC balance');
        }

        // Update platform reserves
        await updatePlatformReserves(btcPortfolio.cryptocurrency_id, totalDeduction, betAmount, feeAmount);

        const lossResult: SpinResult = {
          multiplier: 0,
          rewardCrypto: 'LOSS',
          rewardAmount: 0,
          rewardValue: 0,
          isWin: false,
          tier: 'loss'
        };

        setCurrentSpin(lossResult);
        await refetchPortfolio();
        return lossResult;
      }

      // Player wins - select reward using weighted random
      let cumulativeProbability = 0;
      let selectedConfig = spinConfigs[0];
      
      for (const config of spinConfigs) {
        cumulativeProbability += Number(config.probability);
        if (random <= cumulativeProbability) {
          selectedConfig = config;
          break;
        }
      }

      // Calculate reward
      const multiplier = Number(selectedConfig.min_multiplier) + 
        Math.random() * (Number(selectedConfig.max_multiplier) - Number(selectedConfig.min_multiplier));

      const rewardValueUsd = betValueUsd * multiplier;
      const rewardCryptoPrice = Number(selectedConfig.cryptocurrencies.current_price);
      const rewardAmount = rewardValueUsd / rewardCryptoPrice;

      const spinResult: SpinResult = {
        multiplier,
        rewardCrypto: selectedConfig.cryptocurrencies.symbol,
        rewardAmount,
        rewardValue: rewardValueUsd,
        isWin: true,
        tier: selectedConfig.reward_tier
      };

      console.log('[useSpinGame] Spin result calculated:', spinResult);

      // Create bet transaction (debit)
      const { error: debitError } = await supabase
        .from('transaction_history')
        .insert({
          user_id: session.user.id,
          cryptocurrency_id: btcPortfolio.cryptocurrency_id,
          transaction_type: 'spin_bet',
          amount: -totalDeduction,
          usd_value: -betValueUsd * (1 + 0.0001),
          description: `Spin bet: ${betAmount} BTC + ${feeAmount.toFixed(8)} BTC fee`,
          status: 'completed'
        });

      if (debitError) {
        console.error('[useSpinGame] Error creating debit transaction:', debitError);
        throw new Error('Failed to process bet transaction');
      }

      // Create reward transaction (credit)
      const { error: creditError } = await supabase
        .from('transaction_history')
        .insert({
          user_id: session.user.id,
          cryptocurrency_id: selectedConfig.cryptocurrency_id,
          transaction_type: 'spin_reward',
          amount: rewardAmount,
          usd_value: rewardValueUsd,
          description: `Spin reward: ${rewardAmount.toFixed(8)} ${selectedConfig.cryptocurrencies.symbol}`,
          status: 'completed'
        });

      if (creditError) {
        console.error('[useSpinGame] Error creating credit transaction:', creditError);
        throw new Error('Failed to process reward transaction');
      }

      // Update BTC portfolio (subtract bet + fee)
      const newBtcQuantity = Math.max(0, btcPortfolio.quantity - totalDeduction);
      const { error: btcUpdateError } = await supabase
        .from('user_portfolios')
        .update({ quantity: newBtcQuantity })
        .eq('id', btcPortfolio.id);

      if (btcUpdateError) {
        console.error('[useSpinGame] Error updating BTC portfolio:', btcUpdateError);
        throw new Error('Failed to update BTC balance');
      }

      // Update platform reserves (only fee for winners)
      await updatePlatformReserves(btcPortfolio.cryptocurrency_id, feeAmount, 0, feeAmount);

      // Handle reward crypto portfolio
      await handleRewardCrypto(selectedConfig, rewardAmount, rewardValueUsd, rewardCryptoPrice);

      setCurrentSpin(spinResult);
      await refetchPortfolio();

      return spinResult;

    } catch (error) {
      console.error('[useSpinGame] Spin failed:', error);
      toast.error(`Spin failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    } finally {
      setIsSpinning(false);
    }
  };

  // Helper function to update platform reserves
  const updatePlatformReserves = async (cryptoId: string, totalAmount: number, lossAmount: number, feeAmount: number) => {
    try {
      const { data: currentReserve, error: fetchError } = await supabase
        .from('platform_reserves')
        .select('balance, total_losses_collected, total_fees_collected')
        .eq('cryptocurrency_id', cryptoId)
        .single();

      if (fetchError) {
        console.error('[useSpinGame] Error fetching reserve:', fetchError);
        return;
      }

      const { error: updateError } = await supabase
        .from('platform_reserves')
        .update({ 
          balance: Number(currentReserve.balance) + totalAmount,
          total_losses_collected: Number(currentReserve.total_losses_collected) + lossAmount,
          total_fees_collected: Number(currentReserve.total_fees_collected) + feeAmount,
          updated_at: new Date().toISOString()
        })
        .eq('cryptocurrency_id', cryptoId);

      if (updateError) {
        console.error('[useSpinGame] Error updating reserves:', updateError);
      }
    } catch (error) {
      console.error('[useSpinGame] Reserve update failed:', error);
    }
  };

  // Helper function to handle reward crypto portfolio
  const handleRewardCrypto = async (selectedConfig: any, rewardAmount: number, rewardValueUsd: number, rewardCryptoPrice: number) => {
    const rewardCryptoPortfolio = portfolio?.find(p => p.cryptocurrency_id === selectedConfig.cryptocurrency_id);

    if (rewardCryptoPortfolio) {
      // Update existing portfolio
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
      // Create new portfolio entry with validation
      const userId = session?.user.id;
      const cryptocurrency_id = selectedConfig.cryptocurrency_id;

      if (!userId || !cryptocurrency_id || !rewardAmount || !rewardCryptoPrice) {
        console.error('[useSpinGame] Missing required values for portfolio creation');
        throw new Error('Invalid reward data');
      }

      console.log('[useSpinGame] Creating new portfolio entry:', {
        user_id: userId,
        cryptocurrency_id,
        quantity: rewardAmount,
        average_buy_price: rewardCryptoPrice,
        total_invested: rewardValueUsd,
        is_spin_reward: true
      });

      const { error: createError } = await supabase
        .from('user_portfolios')
        .insert({
          user_id: userId,
          cryptocurrency_id,
          quantity: rewardAmount,
          average_buy_price: rewardCryptoPrice,
          total_invested: rewardValueUsd,
          current_value: rewardValueUsd,
          profit_loss: 0,
          profit_loss_percentage: 0,
          is_spin_reward: true
        });

      if (createError) {
        console.error('[useSpinGame] Error creating reward portfolio:', createError);
        throw new Error('Failed to create reward balance');
      }
    }
  };

  return {
    spin,
    isSpinning,
    currentSpin,
    setCurrentSpin
  };
};
