
-- Update legendary tier win chance to 1%
UPDATE public.spin_configurations
SET probability = 0.01
WHERE reward_tier = 'legendary';

-- Optionally, you may need to rebalance loss/common/rare/epic probabilities if the total does not sum to 1 (100%). If you want automatic rebalancing, let me know, otherwise this only increases Legendary win chance.
