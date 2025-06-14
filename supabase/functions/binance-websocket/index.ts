
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Upgrade connection to WebSocket
  if (req.headers.get("upgrade")?.toLowerCase() !== "websocket") {
    return new Response("request isn't trying to upgrade to a websocket.", { status: 400 });
  }
  const { socket, response } = Deno.upgradeWebSocket(req);

  // Create Supabase Admin client to fetch crypto list
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const { data: cryptos, error: dbError } = await supabaseAdmin
    .from('cryptocurrencies')
    .select('symbol')
    .eq('is_active', true);

  if (dbError) {
    console.error('Database error fetching cryptos:', dbError);
    socket.close(1011, 'Database error');
    return response;
  }

  if (!cryptos || cryptos.length === 0) {
    console.log('No active cryptocurrencies found.');
    socket.close(1011, 'No active cryptocurrencies found');
    return response;
  }
  
  // Construct Binance stream URL
  const streams = cryptos.map(c => `${c.symbol.toLowerCase()}usdt@trade`).join('/');
  const binanceUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

  // Connect to Binance WebSocket
  const binanceSocket = new WebSocket(binanceUrl);

  binanceSocket.onopen = () => console.log("Connected to Binance WebSocket stream.");

  binanceSocket.onmessage = (event) => {
    // Forward every message to the connected client
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(event.data);
    }
  };

  binanceSocket.onerror = (error) => {
    console.error("Binance WebSocket error:", error);
    if (socket.readyState === WebSocket.OPEN) socket.close(1011, 'Upstream WebSocket error');
  };
  
  binanceSocket.onclose = () => {
    console.log("Disconnected from Binance WebSocket.");
    if (socket.readyState === WebSocket.OPEN) socket.close();
  };

  // Handle client disconnect
  socket.onclose = () => {
    console.log("Client disconnected, closing Binance connection.");
    if (binanceSocket.readyState === WebSocket.OPEN) binanceSocket.close();
  };

  socket.onerror = (err) => console.error("Client socket error:", err);

  return response;
});
