
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BinanceTicker {
  symbol: string;
  price: string;
  priceChangePercent: string;
  volume: string;
  count: number;
}

interface CryptoMapping {
  binance_symbol: string;
  our_symbol: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting enhanced price sync...');

    // Get our cryptocurrencies and create mapping
    const { data: cryptocurrencies, error: cryptoError } = await supabaseClient
      .from('cryptocurrencies')
      .select('symbol');

    if (cryptoError) {
      console.error('Error fetching cryptocurrencies:', cryptoError);
      throw cryptoError;
    }

    // Create mapping for Binance symbols
    const symbolMapping: CryptoMapping[] = cryptocurrencies.map(crypto => ({
      binance_symbol: `${crypto.symbol.toUpperCase()}USDT`,
      our_symbol: crypto.symbol.toUpperCase()
    }));

    console.log(`Fetching prices for ${symbolMapping.length} cryptocurrencies`);

    // Fetch 24hr ticker data from Binance
    const binanceUrl = 'https://api.binance.com/api/v3/ticker/24hr';
    const response = await fetch(binanceUrl);
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const tickers: BinanceTicker[] = await response.json();
    console.log(`Received ${tickers.length} tickers from Binance`);

    // Create a map for quick lookup
    const tickerMap = new Map<string, BinanceTicker>();
    tickers.forEach(ticker => {
      tickerMap.set(ticker.symbol, ticker);
    });

    // Update our cryptocurrency prices
    const updates = [];
    let updatedCount = 0;

    for (const mapping of symbolMapping) {
      const ticker = tickerMap.get(mapping.binance_symbol);
      
      if (ticker) {
        const currentPrice = parseFloat(ticker.price);
        const priceChange24h = parseFloat(ticker.priceChangePercent);
        const volume24h = parseFloat(ticker.volume);

        updates.push({
          symbol: mapping.our_symbol,
          current_price: currentPrice,
          price_change_percentage_24h: priceChange24h,
          volume_24h: volume24h,
          updated_at: new Date().toISOString()
        });

        updatedCount++;
      } else {
        console.log(`No price data found for ${mapping.our_symbol} (${mapping.binance_symbol})`);
      }
    }

    // Batch update cryptocurrencies
    if (updates.length > 0) {
      for (const update of updates) {
        const { error: updateError } = await supabaseClient
          .from('cryptocurrencies')
          .update({
            current_price: update.current_price,
            price_change_percentage_24h: update.price_change_percentage_24h,
            volume_24h: update.volume_24h,
            updated_at: update.updated_at
          })
          .eq('symbol', update.symbol);

        if (updateError) {
          console.error(`Error updating ${update.symbol}:`, updateError);
        }
      }
    }

    // Now update all user portfolios with new current values
    console.log('Updating user portfolios with live prices...');
    
    // Get all portfolio entries with their crypto data
    const { data: portfolios, error: portfolioFetchError } = await supabaseClient
      .from('user_portfolios')
      .select(`
        id,
        quantity,
        total_invested,
        cryptocurrency_id,
        crypto:cryptocurrencies!inner(current_price)
      `);

    if (portfolioFetchError) {
      console.error('Error fetching portfolios:', portfolioFetchError);
    } else if (portfolios) {
      // Update each portfolio entry with live current value and P&L
      for (const portfolio of portfolios) {
        const currentPrice = portfolio.crypto?.current_price || 0;
        const liveCurrentValue = portfolio.quantity * currentPrice;
        const profitLoss = liveCurrentValue - portfolio.total_invested;
        const profitLossPercentage = portfolio.total_invested > 0 ? (profitLoss / portfolio.total_invested) * 100 : 0;

        const { error: portfolioUpdateError } = await supabaseClient
          .from('user_portfolios')
          .update({
            current_value: liveCurrentValue,
            profit_loss: profitLoss,
            profit_loss_percentage: profitLossPercentage,
            updated_at: new Date().toISOString()
          })
          .eq('id', portfolio.id);

        if (portfolioUpdateError) {
          console.error(`Error updating portfolio ${portfolio.id}:`, portfolioUpdateError);
        }
      }
      
      console.log(`Updated ${portfolios.length} portfolio entries with live prices`);
    }

    console.log(`Enhanced price sync completed. Updated ${updatedCount} cryptocurrencies and portfolios.`);

    return new Response(
      JSON.stringify({
        success: true,
        updated_count: updatedCount,
        portfolios_updated: portfolios?.length || 0,
        message: 'Enhanced price sync completed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in enhanced price sync:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
