// Script to reset user portfolio profit/loss
// Usage: npx ts-node scripts/reset_pnl.ts [--clear-gains]

// Polyfill localStorage for Node environment
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); }
  } as any;
}

import { supabase } from '../src/integrations/supabase/client';
import type { Database } from '../src/integrations/supabase/types';

// Type for user_portfolios rows
 type PortfolioRow = Database['public']['Tables']['user_portfolios']['Row'];

async function resetPortfolios() {
  console.log('Fetching user portfolios...');
  const { data, error } = await supabase
    .from('user_portfolios')
    .select('*');

  if (error) {
    throw new Error(`Failed to fetch portfolios: ${error.message}`);
  }

  if (!data) {
    console.log('No portfolios found.');
    return;
  }

  for (const row of data as PortfolioRow[]) {
    const { error: updateError } = await supabase
      .from('user_portfolios')
      .update({
        total_invested: row.current_value,
        profit_loss: 0,
        profit_loss_percentage: 0,
      })
      .eq('id', row.id);

    if (updateError) {
      console.error(`Failed to update portfolio ${row.id}:`, updateError.message);
    } else {
      console.log(`Reset portfolio ${row.id}`);
    }
  }
}

async function clearRealizedGains() {
  console.log('Clearing realized_gains table...');
  const { error } = await supabase.from('realized_gains').delete().neq('id', '');
  if (error) {
    console.error('Failed to clear realized gains:', error.message);
  } else {
    console.log('All realized gains removed.');
  }
}

async function main() {
  const clearGains = process.argv.includes('--clear-gains');
  await resetPortfolios();
  if (clearGains) {
    await clearRealizedGains();
  }
  console.log('Reset complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
