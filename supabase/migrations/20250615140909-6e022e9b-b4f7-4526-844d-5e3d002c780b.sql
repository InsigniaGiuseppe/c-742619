
-- Create spin game configurations table
CREATE TABLE public.spin_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reward_tier TEXT NOT NULL,
  cryptocurrency_id UUID REFERENCES public.cryptocurrencies(id) NOT NULL,
  min_multiplier NUMERIC NOT NULL DEFAULT 0.1,
  max_multiplier NUMERIC NOT NULL DEFAULT 2.0,
  probability NUMERIC NOT NULL CHECK (probability >= 0 AND probability <= 1),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create spin games table to track individual spins
CREATE TABLE public.spin_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  bet_amount_btc NUMERIC NOT NULL CHECK (bet_amount_btc > 0),
  bet_amount_usd NUMERIC NOT NULL CHECK (bet_amount_usd > 0),
  reward_cryptocurrency_id UUID REFERENCES public.cryptocurrencies(id) NOT NULL,
  reward_amount NUMERIC NOT NULL CHECK (reward_amount >= 0),
  reward_usd_value NUMERIC NOT NULL CHECK (reward_usd_value >= 0),
  multiplier NUMERIC NOT NULL CHECK (multiplier >= 0),
  spin_result_data JSONB,
  transaction_debit_id UUID REFERENCES public.transaction_history(id),
  transaction_credit_id UUID REFERENCES public.transaction_history(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for spin games
ALTER TABLE public.spin_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own spin games"
  ON public.spin_games
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spin games"
  ON public.spin_games
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for spin configurations (public read)
ALTER TABLE public.spin_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view spin configurations"
  ON public.spin_configurations
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Insert default spin configurations for top 5 coins
INSERT INTO public.spin_configurations (reward_tier, cryptocurrency_id, min_multiplier, max_multiplier, probability) 
SELECT 
  'common',
  c.id,
  0.8,
  1.2,
  0.4
FROM public.cryptocurrencies c 
WHERE c.symbol IN ('BTC', 'ETH', 'USDT', 'BNB', 'SOL') 
AND c.is_active = true;

INSERT INTO public.spin_configurations (reward_tier, cryptocurrency_id, min_multiplier, max_multiplier, probability) 
SELECT 
  'rare',
  c.id,
  1.5,
  3.0,
  0.15
FROM public.cryptocurrencies c 
WHERE c.symbol IN ('BTC', 'ETH', 'USDT', 'BNB', 'SOL') 
AND c.is_active = true;

INSERT INTO public.spin_configurations (reward_tier, cryptocurrency_id, min_multiplier, max_multiplier, probability) 
SELECT 
  'epic',
  c.id,
  3.0,
  5.0,
  0.05
FROM public.cryptocurrencies c 
WHERE c.symbol IN ('BTC', 'ETH', 'USDT', 'BNB', 'SOL') 
AND c.is_active = true;

-- Add spin-related transaction types (extend existing transaction_history usage)
-- Note: We'll use these transaction types in the application:
-- 'spin_bet' - for BTC deduction
-- 'spin_reward' - for reward addition
-- 'spin_loss' - for tracking losses (optional)

-- Create index for performance
CREATE INDEX idx_spin_games_user_id_created_at ON public.spin_games(user_id, created_at DESC);
CREATE INDEX idx_spin_configurations_active ON public.spin_configurations(is_active, reward_tier);
