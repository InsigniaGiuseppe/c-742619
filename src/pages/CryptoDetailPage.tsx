
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCryptocurrencies } from '@/hooks/useCryptocurrencies';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const CryptoDetailPage = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { cryptocurrencies, loading } = useCryptocurrencies();
  const { user } = useAuth();
  
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amountEUR, setAmountEUR] = useState('');
  const [amountCoin, setAmountCoin] = useState('');
  const [isProcessingTrade, setIsProcessingTrade] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [userHoldings, setUserHoldings] = useState(0);

  const crypto = cryptocurrencies.find(c => c.symbol.toLowerCase() === symbol?.toLowerCase());

  const timeframes = [
    { label: '1H', value: '1h' },
    { label: '4H', value: '4h' },
    { label: '1D', value: '1d' },
    { label: '7D', value: '7d' },
    { label: 'All', value: 'all' }
  ];

  // Mock chart data - in real implementation, this would come from price_history table
  const generateMockChartData = () => {
    const basePrice = crypto?.current_price || 50000;
    const data = [];
    for (let i = 30; i >= 0; i--) {
      const variation = (Math.random() - 0.5) * 0.1;
      data.push({
        time: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
        price: basePrice * (1 + variation * i * 0.01)
      });
    }
    return data;
  };

  const chartData = generateMockChartData();

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, crypto]);

  const fetchUserData = async () => {
    if (!user || !crypto) return;

    // Fetch user's demo balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('demo_balance_usd')
      .eq('id', user.id)
      .single();

    if (profile) {
      setUserBalance(profile.demo_balance_usd || 0);
    }

    // Fetch user's holdings for this crypto
    const { data: portfolio } = await supabase
      .from('user_portfolios')
      .select('quantity')
      .eq('user_id', user.id)
      .eq('cryptocurrency_id', crypto.id)
      .single();

    if (portfolio) {
      setUserHoldings(portfolio.quantity || 0);
    }
  };

  const handleAmountEURChange = (value: string) => {
    setAmountEUR(value);
    if (crypto && value) {
      const coinAmount = parseFloat(value) / crypto.current_price;
      setAmountCoin(coinAmount.toFixed(8));
    } else {
      setAmountCoin('');
    }
  };

  const handleAmountCoinChange = (value: string) => {
    setAmountCoin(value);
    if (crypto && value) {
      const eurAmount = parseFloat(value) * crypto.current_price;
      setAmountEUR(eurAmount.toFixed(2));
    } else {
      setAmountEUR('');
    }
  };

  const handleTrade = async () => {
    if (!user || !crypto || !amountEUR || !amountCoin) {
      toast.error('Please fill in all fields');
      return;
    }

    const eurValue = parseFloat(amountEUR);
    const coinAmount = parseFloat(amountCoin);

    if (tradeType === 'buy' && eurValue > userBalance) {
      toast.error('Insufficient balance');
      return;
    }

    if (tradeType === 'sell' && coinAmount > userHoldings) {
      toast.error('Insufficient holdings');
      return;
    }

    setIsProcessingTrade(true);

    try {
      // Create trading order
      const { data: order, error: orderError } = await supabase
        .from('trading_orders')
        .insert({
          user_id: user.id,
          cryptocurrency_id: crypto.id,
          order_type: tradeType,
          amount: coinAmount,
          price_per_unit: crypto.current_price,
          total_value: eurValue,
          fees: eurValue * 0.001, // 0.1% fee
          order_status: 'completed',
          executed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create transaction history
      await supabase
        .from('transaction_history')
        .insert({
          user_id: user.id,
          cryptocurrency_id: crypto.id,
          transaction_type: tradeType,
          amount: coinAmount,
          usd_value: eurValue,
          fee_amount: eurValue * 0.001,
          status: 'completed',
          description: `${tradeType.toUpperCase()} ${coinAmount} ${crypto.symbol}`,
          reference_order_id: order.id
        });

      // Update user portfolio
      const { data: existingPortfolio } = await supabase
        .from('user_portfolios')
        .select('*')
        .eq('user_id', user.id)
        .eq('cryptocurrency_id', crypto.id)
        .single();

      if (existingPortfolio) {
        const newQuantity = tradeType === 'buy' 
          ? existingPortfolio.quantity + coinAmount
          : existingPortfolio.quantity - coinAmount;
        
        const newTotalInvested = tradeType === 'buy'
          ? existingPortfolio.total_invested + eurValue
          : Math.max(0, existingPortfolio.total_invested - eurValue);

        const newAveragePrice = newQuantity > 0 ? newTotalInvested / newQuantity : 0;

        await supabase
          .from('user_portfolios')
          .update({
            quantity: newQuantity,
            average_buy_price: newAveragePrice,
            total_invested: newTotalInvested,
            current_value: newQuantity * crypto.current_price,
            profit_loss: (newQuantity * crypto.current_price) - newTotalInvested,
            profit_loss_percentage: newTotalInvested > 0 ? (((newQuantity * crypto.current_price) - newTotalInvested) / newTotalInvested) * 100 : 0
          })
          .eq('id', existingPortfolio.id);
      } else if (tradeType === 'buy') {
        await supabase
          .from('user_portfolios')
          .insert({
            user_id: user.id,
            cryptocurrency_id: crypto.id,
            quantity: coinAmount,
            average_buy_price: crypto.current_price,
            total_invested: eurValue,
            current_value: eurValue,
            profit_loss: 0,
            profit_loss_percentage: 0
          });
      }

      // Update user balance
      const newBalance = tradeType === 'buy' 
        ? userBalance - eurValue - (eurValue * 0.001)
        : userBalance + eurValue - (eurValue * 0.001);

      await supabase
        .from('profiles')
        .update({ demo_balance_usd: newBalance })
        .eq('id', user.id);

      toast.success(`Successfully ${tradeType === 'buy' ? 'bought' : 'sold'} ${coinAmount} ${crypto.symbol}`);
      
      // Reset form and refresh data
      setAmountEUR('');
      setAmountCoin('');
      fetchUserData();

    } catch (error) {
      console.error('Trade error:', error);
      toast.error('Trade failed. Please try again.');
    } finally {
      setIsProcessingTrade(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!crypto) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div>Cryptocurrency not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="container mx-auto px-4 py-20 pt-24">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/trading')}
          className="mb-6 text-white hover:text-white/80"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Trading
        </Button>

        {/* Coin Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
              {crypto.symbol.substring(0, 2)}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{crypto.name}</h1>
              <p className="text-gray-400">{crypto.symbol.toUpperCase()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold">${crypto.current_price.toLocaleString()}</span>
            <Badge 
              variant={crypto.price_change_percentage_24h && crypto.price_change_percentage_24h >= 0 ? "default" : "destructive"}
              className="flex items-center gap-1"
            >
              {crypto.price_change_percentage_24h && crypto.price_change_percentage_24h >= 0 ? 
                <TrendingUp className="h-3 w-3" /> : 
                <TrendingDown className="h-3 w-3" />
              }
              {crypto.price_change_percentage_24h?.toFixed(2)}%
            </Badge>
          </div>
          
          {crypto.market_cap && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Market Cap: </span>
                <span>${crypto.market_cap.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-400">24h Volume: </span>
                <span>${crypto.volume_24h?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-400">Your Holdings: </span>
                <span>{userHoldings.toFixed(8)} {crypto.symbol}</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Price Chart</CardTitle>
                  <div className="flex gap-2">
                    {timeframes.map((tf) => (
                      <Button
                        key={tf.value}
                        variant={selectedTimeframe === tf.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTimeframe(tf.value)}
                      >
                        {tf.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#8B5CF6" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Trading Section */}
          <div>
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle>Trade {crypto.symbol}</CardTitle>
                <p className="text-sm text-gray-400">
                  Demo Balance: ${userBalance.toFixed(2)}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={tradeType === 'buy' ? "default" : "outline"}
                    onClick={() => setTradeType('buy')}
                    className="flex-1"
                  >
                    Buy
                  </Button>
                  <Button
                    variant={tradeType === 'sell' ? "default" : "outline"}
                    onClick={() => setTradeType('sell')}
                    className="flex-1"
                  >
                    Sell
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">Amount (USD)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amountEUR}
                      onChange={(e) => handleAmountEURChange(e.target.value)}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Amount ({crypto.symbol})</label>
                    <Input
                      type="number"
                      placeholder="0.00000000"
                      value={amountCoin}
                      onChange={(e) => handleAmountCoinChange(e.target.value)}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>

                  {amountEUR && (
                    <div className="p-3 bg-gray-800 rounded">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Price per {crypto.symbol}:</span>
                          <span>${crypto.current_price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fee (0.1%):</span>
                          <span>${(parseFloat(amountEUR) * 0.001).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span>${(parseFloat(amountEUR) + (parseFloat(amountEUR) * 0.001)).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleTrade}
                    disabled={!amountEUR || !amountCoin || isProcessingTrade || !user}
                    className="w-full"
                  >
                    {isProcessingTrade ? 'Processing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${crypto.symbol}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CryptoDetailPage;
