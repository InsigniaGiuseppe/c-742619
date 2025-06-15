
-- Add legendary tier configurations and adjust probabilities to include losing chance
-- First, adjust existing probabilities to make room for legendary and losing chances

-- Update existing configurations to have lower probabilities
UPDATE public.spin_configurations 
SET probability = 0.35 
WHERE reward_tier = 'common';

UPDATE public.spin_configurations 
SET probability = 0.12 
WHERE reward_tier = 'rare';

UPDATE public.spin_configurations 
SET probability = 0.04 
WHERE reward_tier = 'epic';

-- Add legendary tier configurations for top 5 coins
INSERT INTO public.spin_configurations (reward_tier, cryptocurrency_id, min_multiplier, max_multiplier, probability) 
SELECT 
  'legendary',
  c.id,
  5.0,
  10.0,
  0.005
FROM public.cryptocurrencies c 
WHERE c.symbol IN ('BTC', 'ETH', 'USDT', 'BNB', 'SOL') 
AND c.is_active = true;
