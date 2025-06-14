
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const CMC_API_KEY = Deno.env.get('CMC_API_KEY')
    if (!CMC_API_KEY) {
      throw new Error('CoinMarketCap API key not configured')
    }

    // Get latest cryptocurrency data from CoinMarketCap
    const response = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=BTC,ETH,USDT,BNB,SOL,USDC,XRP,TON,DOGE,ADA,AVAX,SHIB,TRX,DOT,WBTC,LINK,MATIC,LTC,BCH,ICP,UNI,DAI,ETC,RNDR,KAS', {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('CMC API Response:', data)

    // Update cryptocurrency prices in database
    for (const [symbol, coinData] of Object.entries(data.data)) {
      const quote = (coinData as any).quote.USD
      
      const { error } = await supabaseClient
        .from('cryptocurrencies')
        .update({
          current_price: quote.price,
          market_cap: quote.market_cap,
          volume_24h: quote.volume_24h,
          price_change_24h: quote.change_24h,
          price_change_percentage_24h: quote.percent_change_24h,
          updated_at: new Date().toISOString()
        })
        .eq('symbol', symbol)

      if (error) {
        console.error(`Error updating ${symbol}:`, error)
      }
    }

    return new Response(
      JSON.stringify({ success: true, updated: Object.keys(data.data).length }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
