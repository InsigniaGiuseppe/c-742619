
-- Fix the legendary tier configurations and adjust all probabilities
-- First, remove any existing legendary configurations that might not be working
DELETE FROM public.spin_configurations WHERE reward_tier = 'legendary';

-- Update existing probabilities to proper values (total 70% for wins, 30% for losses)
UPDATE public.spin_configurations 
SET probability = 0.25 
WHERE reward_tier = 'common';

UPDATE public.spin_configurations 
SET probability = 0.15 
WHERE reward_tier = 'rare';

UPDATE public.spin_configurations 
SET probability = 0.05 
WHERE reward_tier = 'epic';

-- Add legendary tier configurations for top 5 coins with 0.0005 probability (0.05%)
INSERT INTO public.spin_configurations (reward_tier, cryptocurrency_id, min_multiplier, max_multiplier, probability) 
SELECT 
  'legendary',
  c.id,
  8.0,
  15.0,
  0.0005
FROM public.cryptocurrencies c 
WHERE c.symbol IN ('BTC', 'ETH', 'USDT', 'BNB', 'SOL') 
AND c.is_active = true;

-- Create platform_reserves table to track reserve balance
CREATE TABLE IF NOT EXISTS public.platform_reserves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cryptocurrency_id UUID REFERENCES public.cryptocurrencies(id) NOT NULL,
  balance NUMERIC NOT NULL DEFAULT 0,
  total_fees_collected NUMERIC NOT NULL DEFAULT 0,
  total_losses_collected NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for platform reserves (admin access only)
ALTER TABLE public.platform_reserves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view platform reserves"
  ON public.platform_reserves
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Initialize BTC reserve balance
INSERT INTO public.platform_reserves (cryptocurrency_id, balance, total_fees_collected, total_losses_collected)
SELECT 
  c.id,
  0,
  0,
  0
FROM public.cryptocurrencies c 
WHERE c.symbol = 'BTC' 
AND c.is_active = true
ON CONFLICT DO NOTHING;
