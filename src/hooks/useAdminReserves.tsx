
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { convertUsdToEur } from '@/lib/currencyConverter';

export interface ReserveAsset {
  asset_symbol: string;
  asset_name: string;
  reserve_amount: number;
  eur_value: number;
  last_updated: string;
  status: 'OK' | 'Low' | 'Critical';
  logo_url?: string;
}

const fetchReserves = async (exchangeRate: number): Promise<{
  reserves: ReserveAsset[];
  totalValue: number;
  totalCryptoValue: number;
  totalEurValue: number;
}> => {
  console.log('[useAdminReserves] Fetching platform reserves with exchange rate:', exchangeRate);

  // Define the main cryptocurrencies we track
  const mainCryptos = ['BTC', 'ETH', 'SOL', 'USDT'];
  
  // Initialize default reserves (these would be set by admin in production)
  const defaultReserves = [
    { symbol: 'BTC', name: 'Bitcoin', amount: 100 },
    { symbol: 'ETH', name: 'Ethereum', amount: 1000 },
    { symbol: 'SOL', name: 'Solana', amount: 5000 },
    { symbol: 'USDT', name: 'Tether', amount: 500000 },
  ];

  // Fetch crypto prices and info
  const { data: cryptoData, error: cryptoError } = await supabase
    .from('cryptocurrencies')
    .select('symbol, name, current_price, logo_url')
    .in('symbol', mainCryptos.map(c => c.toLowerCase()));

  if (cryptoError) {
    console.error('[useAdminReserves] Error fetching crypto data:', cryptoError);
    throw cryptoError;
  }

  console.log('[useAdminReserves] Fetched crypto data:', cryptoData);

  // Calculate total user holdings to subtract from reserves
  const { data: portfolioData } = await supabase
    .from('user_portfolios')
    .select(`
      cryptocurrency_id,
      quantity,
      crypto:cryptocurrencies(symbol, current_price)
    `)
    .gt('quantity', 0);

  // Calculate total crypto holdings per asset
  const userHoldings: Record<string, number> = {};
  portfolioData?.forEach(portfolio => {
    const symbol = portfolio.crypto?.symbol?.toUpperCase();
    if (symbol) {
      userHoldings[symbol] = (userHoldings[symbol] || 0) + portfolio.quantity;
    }
  });

  console.log('[useAdminReserves] User holdings:', userHoldings);

  // Fetch total EUR from all user balances
  const { data: profileData } = await supabase
    .from('profiles')
    .select('demo_balance_usd');

  const totalUserBalanceUsd = profileData?.reduce((sum, profile) => 
    sum + (profile.demo_balance_usd || 0), 0) || 0;

  const totalUserBalanceEur = convertUsdToEur(totalUserBalanceUsd, exchangeRate);

  console.log('[useAdminReserves] Total user balance USD:', totalUserBalanceUsd, 'EUR:', totalUserBalanceEur);

  // Build reserves array
  const reserves: ReserveAsset[] = [];
  let totalCryptoValue = 0;

  // Add crypto reserves with proper EUR value calculation
  defaultReserves.forEach(reserve => {
    const cryptoInfo = cryptoData?.find(c => c.symbol.toLowerCase() === reserve.symbol.toLowerCase());
    const userHolding = userHoldings[reserve.symbol] || 0;
    const actualReserve = Math.max(0, reserve.amount - userHolding);
    
    // Calculate EUR value: crypto amount * USD price * EUR exchange rate
    const priceUsd = cryptoInfo?.current_price || 0;
    const eurValue = actualReserve * convertUsdToEur(priceUsd, exchangeRate);

    console.log(`[useAdminReserves] ${reserve.symbol}: actualReserve=${actualReserve}, priceUsd=${priceUsd}, eurValue=${eurValue}`);

    totalCryptoValue += eurValue;

    // Determine status based on reserve levels
    let status: 'OK' | 'Low' | 'Critical' = 'OK';
    const reserveRatio = actualReserve / reserve.amount;
    if (reserveRatio < 0.1) status = 'Critical';
    else if (reserveRatio < 0.3) status = 'Low';

    reserves.push({
      asset_symbol: reserve.symbol,
      asset_name: cryptoInfo?.name || reserve.name,
      reserve_amount: actualReserve,
      eur_value: eurValue,
      last_updated: 'just now',
      status,
      logo_url: cryptoInfo?.logo_url,
    });
  });

  // Add EUR reserve (platform liquidity minus user balances)
  const platformEurReserve = 10000000; // €10M initial platform liquidity
  const actualEurReserve = Math.max(0, platformEurReserve - totalUserBalanceEur);
  
  let eurStatus: 'OK' | 'Low' | 'Critical' = 'OK';
  const eurRatio = actualEurReserve / platformEurReserve;
  if (eurRatio < 0.1) eurStatus = 'Critical';
  else if (eurRatio < 0.3) eurStatus = 'Low';

  reserves.push({
    asset_symbol: 'EUR',
    asset_name: 'Euro',
    reserve_amount: actualEurReserve,
    eur_value: actualEurReserve,
    last_updated: 'just now',
    status: eurStatus,
  });

  const totalValue = totalCryptoValue + actualEurReserve;

  console.log('[useAdminReserves] Final reserves:', reserves);
  console.log('[useAdminReserves] Total values - crypto:', totalCryptoValue, 'eur:', actualEurReserve, 'total:', totalValue);

  return {
    reserves,
    totalValue,
    totalCryptoValue,
    totalEurValue: actualEurReserve,
  };
};

export const useAdminReserves = () => {
  const { exchangeRate } = useExchangeRate();

  const query = useQuery({
    queryKey: ['admin-reserves', exchangeRate],
    queryFn: () => fetchReserves(exchangeRate),
    enabled: !!exchangeRate,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });

  console.log('[useAdminReserves] Query result:', {
    data: query.data,
    loading: query.isLoading,
    error: query.error,
    exchangeRate
  });

  return {
    reserves: query.data?.reserves || [],
    totalValue: query.data?.totalValue || 0,
    totalCryptoValue: query.data?.totalCryptoValue || 0,
    totalEurValue: query.data?.totalEurValue || 0,
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
  };
};
