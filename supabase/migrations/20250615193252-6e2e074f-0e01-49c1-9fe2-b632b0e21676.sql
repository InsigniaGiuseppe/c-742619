
-- Complete platform reset - this will clear ALL user data
-- WARNING: This will delete all user portfolios, lending positions, vaults, transactions, etc.

-- Clear all user portfolios
DELETE FROM user_portfolios;

-- Clear all lending positions
DELETE FROM user_lending;

-- Clear all lending interest payments
DELETE FROM lending_interest_payments;

-- Clear all user vaults
DELETE FROM user_vaults;

-- Clear all vault payouts
DELETE FROM vault_payouts;

-- Clear all transaction history
DELETE FROM transaction_history;

-- Clear all trading orders
DELETE FROM trading_orders;

-- Clear all spin games
DELETE FROM spin_games;

-- Reset all user demo balances to 0 (complete reset)
UPDATE profiles 
SET demo_balance_usd = 0;

-- Clear user watchlists
DELETE FROM user_watchlist;

-- Clear user sessions
DELETE FROM user_sessions;

-- Reset user settings to defaults
DELETE FROM user_settings;

-- Clear any security events
DELETE FROM security_events_log;
