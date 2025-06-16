-- Create table to store realized gains from crypto sales
CREATE TABLE public.realized_gains (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cryptocurrency_id uuid NOT NULL REFERENCES public.cryptocurrencies(id) ON DELETE CASCADE,
  quantity_sold numeric NOT NULL CHECK (quantity_sold > 0),
  total_cost_basis numeric NOT NULL,
  total_sale_value numeric NOT NULL,
  realized_pnl numeric NOT NULL,
  details jsonb,
  sold_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.realized_gains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their realized gains"
  ON public.realized_gains FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their realized gains"
  ON public.realized_gains FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_realized_gains_user_id ON public.realized_gains(user_id);
CREATE INDEX idx_realized_gains_crypto_id ON public.realized_gains(cryptocurrency_id);
CREATE INDEX idx_realized_gains_sold_at ON public.realized_gains(sold_at);

CREATE TRIGGER update_realized_gains_updated_at
  BEFORE UPDATE ON public.realized_gains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
