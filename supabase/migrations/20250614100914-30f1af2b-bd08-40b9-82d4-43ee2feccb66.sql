
-- Create users/profiles table for PROMPTO TRADING
CREATE TABLE public.trading_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  country TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  account_balance DECIMAL(15,2) DEFAULT 0.00,
  total_invested DECIMAL(15,2) DEFAULT 0.00,
  total_profit_loss DECIMAL(15,2) DEFAULT 0.00,
  risk_tolerance TEXT DEFAULT 'medium' CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create cryptocurrencies table
CREATE TABLE public.cryptocurrencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  current_price DECIMAL(15,8) NOT NULL,
  market_cap DECIMAL(20,2),
  volume_24h DECIMAL(20,2),
  price_change_24h DECIMAL(10,4),
  price_change_percentage_24h DECIMAL(8,4),
  circulating_supply DECIMAL(20,2),
  total_supply DECIMAL(20,2),
  max_supply DECIMAL(20,2),
  logo_url TEXT,
  description TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create trading orders table
CREATE TABLE public.trading_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES trading_users(id) ON DELETE CASCADE,
  cryptocurrency_id UUID NOT NULL REFERENCES cryptocurrencies(id),
  order_type TEXT NOT NULL CHECK (order_type IN ('buy', 'sell')),
  order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'completed', 'cancelled', 'failed')),
  amount DECIMAL(15,8) NOT NULL,
  price_per_unit DECIMAL(15,8) NOT NULL,
  total_value DECIMAL(15,2) NOT NULL,
  fees DECIMAL(15,2) DEFAULT 0.00,
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user portfolios table
CREATE TABLE public.user_portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES trading_users(id) ON DELETE CASCADE,
  cryptocurrency_id UUID NOT NULL REFERENCES cryptocurrencies(id),
  quantity DECIMAL(15,8) NOT NULL DEFAULT 0,
  average_buy_price DECIMAL(15,8) NOT NULL DEFAULT 0,
  total_invested DECIMAL(15,2) NOT NULL DEFAULT 0,
  current_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  profit_loss DECIMAL(15,2) NOT NULL DEFAULT 0,
  profit_loss_percentage DECIMAL(8,4) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, cryptocurrency_id)
);

-- Create transactions history table
CREATE TABLE public.transaction_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES trading_users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'trade_buy', 'trade_sell', 'fee')),
  cryptocurrency_id UUID REFERENCES cryptocurrencies(id),
  amount DECIMAL(15,8),
  usd_value DECIMAL(15,2),
  fee_amount DECIMAL(15,2) DEFAULT 0.00,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  reference_order_id UUID REFERENCES trading_orders(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create price history table for charts
CREATE TABLE public.price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cryptocurrency_id UUID NOT NULL REFERENCES cryptocurrencies(id),
  price DECIMAL(15,8) NOT NULL,
  volume DECIMAL(20,2),
  market_cap DECIMAL(20,2),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create watchlist table
CREATE TABLE public.user_watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES trading_users(id) ON DELETE CASCADE,
  cryptocurrency_id UUID NOT NULL REFERENCES cryptocurrencies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, cryptocurrency_id)
);

-- Enable RLS on all tables
ALTER TABLE public.trading_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cryptocurrencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watchlist ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trading_users
CREATE POLICY "Users can view their own profile" ON trading_users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON trading_users
  FOR UPDATE USING (id = auth.uid());

-- Create RLS policies for cryptocurrencies (public read)
CREATE POLICY "Anyone can view cryptocurrencies" ON cryptocurrencies
  FOR SELECT USING (true);

-- Create RLS policies for trading_orders
CREATE POLICY "Users can view their own orders" ON trading_orders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own orders" ON trading_orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own orders" ON trading_orders
  FOR UPDATE USING (user_id = auth.uid());

-- Create RLS policies for user_portfolios
CREATE POLICY "Users can view their own portfolio" ON user_portfolios
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own portfolio" ON user_portfolios
  FOR ALL USING (user_id = auth.uid());

-- Create RLS policies for transaction_history
CREATE POLICY "Users can view their own transactions" ON transaction_history
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own transactions" ON transaction_history
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create RLS policies for price_history (public read)
CREATE POLICY "Anyone can view price history" ON price_history
  FOR SELECT USING (true);

-- Create RLS policies for user_watchlist
CREATE POLICY "Users can manage their own watchlist" ON user_watchlist
  FOR ALL USING (user_id = auth.uid());

-- Insert some sample cryptocurrencies
INSERT INTO public.cryptocurrencies (symbol, name, current_price, market_cap, volume_24h, price_change_24h, price_change_percentage_24h, logo_url) VALUES
('BTC', 'Bitcoin', 45000.00, 850000000000, 25000000000, 1250.50, 2.85, 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'),
('ETH', 'Ethereum', 3200.00, 380000000000, 12000000000, -85.75, -2.61, 'https://cryptologos.cc/logos/ethereum-eth-logo.png'),
('BNB', 'Binance Coin', 425.00, 65000000000, 1800000000, 12.30, 2.98, 'https://cryptologos.cc/logos/bnb-bnb-logo.png'),
('ADA', 'Cardano', 0.58, 20000000000, 650000000, 0.025, 4.50, 'https://cryptologos.cc/logos/cardano-ada-logo.png'),
('SOL', 'Solana', 110.00, 45000000000, 2200000000, -3.50, -3.08, 'https://cryptologos.cc/logos/solana-sol-logo.png');

-- Create test user with credentials
INSERT INTO public.trading_users (id, email, username, password_hash, full_name, account_balance, verification_status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'test@prompto.trading', 'testuser', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test User', 10000.00, 'verified');

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trading_users_updated_at BEFORE UPDATE ON trading_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cryptocurrencies_updated_at BEFORE UPDATE ON cryptocurrencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trading_orders_updated_at BEFORE UPDATE ON trading_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_portfolios_updated_at BEFORE UPDATE ON user_portfolios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
