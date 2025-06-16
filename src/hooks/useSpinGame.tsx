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

      // Calculate total win probability (should be 70% total)
      const totalWinProbability = spinConfigs.reduce((sum, config) => sum + Number(config.probability), 0);
      const loseProbability = 0.30; // Fixed 30% lose chance
      
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
        
        // Create losing transaction
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

        // Update BTC portfolio (subtract bet + fee)
        const newBtcQuantity = btcPortfolio.quantity - totalDeduction;
        const { error: btcUpdateError } = await supabase
          .from('user_portfolios')
          .update({ quantity: newBtcQuantity })
          .eq('id', btcPortfolio.id);

        if (btcUpdateError) {
          console.error('[useSpinGame] Error updating BTC portfolio:', btcUpdateError);
          throw new Error('Failed to update BTC balance');
        }

        // Update reserve balance with losses and fees
        const { data: currentReserve, error: fetchReserveError } = await supabase
          .from('platform_reserves')
          .select('balance, total_losses_collected, total_fees_collected')
          .eq('cryptocurrency_id', btcPortfolio.cryptocurrency_id)
          .single();

        if (fetchReserveError) {
          console.error('[useSpinGame] Error fetching reserve balance:', fetchReserveError);
        } else if (currentReserve) {
          const { error: reserveError } = await supabase
            .from('platform_reserves')
            .update({ 
              balance: Number(currentReserve.balance) + totalDeduction,
              total_losses_collected: Number(currentReserve.total_losses_collected) + betAmount,
              total_fees_collected: Number(currentReserve.total_fees_collected) + feeAmount,
              updated_at: new Date().toISOString()
            })
            .eq('cryptocurrency_id', btcPortfolio.cryptocurrency_id);

          if (reserveError) {
            console.error('[useSpinGame] Error updating reserve balance:', reserveError);
          }
        }

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

      const multiplier = Number(selectedConfig.min_multiplier) + 
        Math.random() * (Number(selectedConfig.max_multiplier) - Number(selectedConfig.min_multiplier));

      const rewardValueUsd = betValueUsd * multiplier;
      const rewardAmount = rewardValueUsd / Number(selectedConfig.cryptocurrencies.current_price);

      const spinResult: SpinResult = {
        multiplier,
        rewardCrypto: selectedConfig.cryptocurrencies.symbol,
        rewardAmount,
        rewardValue: rewardValueUsd,
        isWin: true,
        tier: selectedConfig.reward_tier
      };

      console.log('[useSpinGame] Spin result calculated:', spinResult);

      // Create debit transaction (bet + fee)
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

      // Create credit transaction (reward)
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
      const newBtcQuantity = btcPortfolio.quantity - totalDeduction;
      const { error: btcUpdateError } = await supabase
        .from('user_portfolios')
        .update({ quantity: newBtcQuantity })
        .eq('id', btcPortfolio.id);

      if (btcUpdateError) {
        console.error('[useSpinGame] Error updating BTC portfolio:', btcUpdateError);
        throw new Error('Failed to update BTC balance');
      }

      // Update reserve balance with fee only (winners don't contribute to losses)
      const { data: currentReserve, error: fetchReserveError } = await supabase
        .from('platform_reserves')
        .select('balance, total_fees_collected')
        .eq('cryptocurrency_id', btcPortfolio.cryptocurrency_id)
        .single();

      if (fetchReserveError) {
        console.error('[useSpinGame] Error fetching reserve balance:', fetchReserveError);
      } else if (currentReserve) {
        const { error: reserveError } = await supabase
          .from('platform_reserves')
          .update({ 
            balance: Number(currentReserve.balance) + feeAmount,
            total_fees_collected: Number(currentReserve.total_fees_collected) + feeAmount,
            updated_at: new Date().toISOString()
          })
          .eq('cryptocurrency_id', btcPortfolio.cryptocurrency_id);

        if (reserveError) {
          console.error('[useSpinGame] Error updating reserve balance:', reserveError);
        }
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
        // First, check if the portfolio entry already exists (in case of race condition)
        const { data: existingPortfolio, error: checkError } = await supabase
          .from('user_portfolios')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('cryptocurrency_id', selectedConfig.cryptocurrency_id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows found
          console.error('[useSpinGame] Error checking existing portfolio:', checkError);
        }

        if (existingPortfolio) {
          // Portfolio exists, update it
          const newQuantity = existingPortfolio.quantity + rewardAmount;
          const { error: updateError } = await supabase
            .from('user_portfolios')
            .update({ quantity: newQuantity })
            .eq('id', existingPortfolio.id);

          if (updateError) {
            console.error('[useSpinGame] Error updating existing portfolio:', updateError);
            throw new Error('Failed to update reward balance');
          }
        } else {
          // Create new portfolio entry with better error handling
          const userId = session.user.id;
          const cryptocurrency_id = selectedConfig.cryptocurrency_id;
          const avg_price = Number(selectedConfig.cryptocurrencies.current_price);
          const rewardAmt = rewardAmount;
          const rewardValUsd = rewardValueUsd;

          // Defensive value checks
          if (
            !userId || typeof userId !== 'string' ||
            !cryptocurrency_id || typeof cryptocurrency_id !== 'string' ||
            typeof avg_price !== 'number' || !isFinite(avg_price) || avg_price <= 0 ||
            typeof rewardAmt !== 'number' || !isFinite(rewardAmt) || rewardAmt <= 0 ||
            typeof rewardValUsd !== 'number' || !isFinite(rewardValUsd) || rewardValUsd <= 0
          ) {
            console.error("[useSpinGame] CRITICAL: Invalid values for portfolio insert", {
              userId,
              cryptocurrency_id,
              avg_price,
              rewardAmt,
              rewardValUsd,
              selectedConfig: JSON.stringify(selectedConfig, null, 2)
            });
            
            // Log the specific validation failures
            const validationErrors = [];
            if (!userId || typeof userId !== 'string') validationErrors.push('Invalid user_id');
            if (!cryptocurrency_id || typeof cryptocurrency_id !== 'string') validationErrors.push('Invalid cryptocurrency_id');
            if (typeof avg_price !== 'number' || !isFinite(avg_price) || avg_price <= 0) validationErrors.push(`Invalid avg_price: ${avg_price}`);
            if (typeof rewardAmt !== 'number' || !isFinite(rewardAmt) || rewardAmt <= 0) validationErrors.push(`Invalid rewardAmt: ${rewardAmt}`);
            if (typeof rewardValUsd !== 'number' || !isFinite(rewardValUsd) || rewardValUsd <= 0) validationErrors.push(`Invalid rewardValUsd: ${rewardValUsd}`);
            
            toast.error(`Data validation failed: ${validationErrors.join(', ')}`);
            throw new Error('Invalid data for portfolio creation');
          }

          console.log("[useSpinGame] Creating new portfolio entry", {
            user_id: userId,
            cryptocurrency_id,
            quantity: rewardAmt,
            average_buy_price: avg_price,
            total_invested: rewardValUsd,
            current_value: rewardValUsd
          });

          const { error: createError, data: createData } = await supabase
            .from('user_portfolios')
            .insert({
              user_id: userId,
              cryptocurrency_id,
              quantity: rewardAmt,
              average_buy_price: avg_price,
              total_invested: rewardValUsd,
              current_value: rewardValUsd,
              profit_loss: 0,
              profit_loss_percentage: 0
            })
            .select()
            .single();

          if (createError) {
            console.error('[useSpinGame] Portfolio INSERT failed:', {
              error: createError,
              code: createError.code,
              message: createError.message,
              details: createError.details,
              hint: createError.hint,
              insertData: {
                user_id: userId,
                cryptocurrency_id,
                quantity: rewardAmt,
                average_buy_price: avg_price,
                total_invested: rewardValUsd,
                current_value: rewardValUsd
              }
            });
            
            // More specific error messages based on error code
            if (createError.code === '23505') {
              toast.error('Portfolio entry already exists. Please refresh and try again.');
            } else if (createError.code === '23503') {
              toast.error('Invalid cryptocurrency. Please refresh and try again.');
            } else if (createError.code === '42501') {
              toast.error('Permission denied. Please contact support.');
            } else {
              toast.error(`Database error: ${createError.message || 'Failed to create portfolio entry'}`);
            }
            
            throw new Error(`Failed to create reward balance: ${createError.message}`);
          }
          
          if (createData) {
            console.log("[useSpinGame] Portfolio created successfully:", createData);
          }
        }
      }

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

  return {
    spin,
    isSpinning,
    currentSpin,
    setCurrentSpin
  };
};