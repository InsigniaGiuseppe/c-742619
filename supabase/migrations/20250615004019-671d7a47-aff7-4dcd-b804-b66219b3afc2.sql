
-- Create user_lending table to track active lending positions
CREATE TABLE public.user_lending (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cryptocurrency_id UUID NOT NULL REFERENCES public.cryptocurrencies(id) ON DELETE CASCADE,
  amount_lent NUMERIC NOT NULL CHECK (amount_lent > 0),
  original_amount_lent NUMERIC NOT NULL CHECK (original_amount_lent > 0),
  annual_interest_rate NUMERIC NOT NULL DEFAULT 0.03 CHECK (annual_interest_rate >= 0 AND annual_interest_rate <= 1),
  total_interest_earned NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  lending_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  lending_cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lending_interest_payments table for tracking daily payouts
CREATE TABLE public.lending_interest_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_lending_id UUID NOT NULL REFERENCES public.user_lending(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cryptocurrency_id UUID NOT NULL REFERENCES public.cryptocurrencies(id) ON DELETE CASCADE,
  interest_amount NUMERIC NOT NULL CHECK (interest_amount > 0),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  transaction_id UUID REFERENCES public.transaction_history(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for user_lending
ALTER TABLE public.user_lending ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own lending positions" 
  ON public.user_lending 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lending positions" 
  ON public.user_lending 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lending positions" 
  ON public.user_lending 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add RLS policies for lending_interest_payments
ALTER TABLE public.lending_interest_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own interest payments" 
  ON public.lending_interest_payments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can create interest payments" 
  ON public.lending_interest_payments 
  FOR INSERT 
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_user_lending_user_id ON public.user_lending(user_id);
CREATE INDEX idx_user_lending_status ON public.user_lending(status);
CREATE INDEX idx_lending_payments_user_id ON public.lending_interest_payments(user_id);
CREATE INDEX idx_lending_payments_date ON public.lending_interest_payments(payment_date);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_user_lending_updated_at
  BEFORE UPDATE ON public.user_lending
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
