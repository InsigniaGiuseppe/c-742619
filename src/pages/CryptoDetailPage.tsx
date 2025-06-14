
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useCryptocurrencies } from '@/hooks/useCryptocurrencies';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import CryptoDetailSkeletonPage from './CryptoDetailSkeletonPage';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatPrice, formatCurrency, formatPercentage } from '@/lib/formatters';
import CryptoLogo from '@/components/CryptoLogo';
import FormattedNumber from '@/components/FormattedNumber';

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const CryptoDetailPage = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { cryptocurrencies, loading } = useCryptocurrencies();
  const { user } = useAuth();
  
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'ideal'>('balance');
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

  const chartData = crypto ? generateMockChartData() : [];

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
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      setUserBalance(profile.demo_balance_usd || 10000);
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
    return <CryptoDetailSkeletonPage />;
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
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-20 pt-24"
      >
        <Button 
          variant="ghost" 
          onClick={() => navigate('/trading')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Trading
        </Button>

        {/* Coin Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <CryptoLogo 
              logo_url={crypto.logo_url}
              name={crypto.name}
              symbol={crypto.symbol}
              size="lg"
            />
            <div>
              <h1 className="text-3xl font-bold">{crypto.name}</h1>
              <p className="text-muted-foreground">{crypto.symbol.toUpperCase()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold">{formatPrice(crypto.current_price)}</span>
            <Badge 
              variant={crypto.price_change_percentage_24h && crypto.price_change_percentage_24h >= 0 ? "default" : "destructive"}
              className="flex items-center gap-1 text-base"
            >
              {crypto.price_change_percentage_24h && crypto.price_change_percentage_24h >= 0 ? 
                <TrendingUp className="h-4 w-4" /> : 
                <TrendingDown className="h-4 w-4" />
              }
              {formatPercentage(crypto.price_change_percentage_24h || 0)}
            </Badge>
          </div>
          
          {crypto.market_cap && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Market Cap: </span>
                <span>{formatCurrency(crypto.market_cap, { compact: true })}</span>
              </div>
              <div>
                <span className="text-muted-foreground">24h Volume: </span>
                <span>{formatCurrency(crypto.volume_24h || 0, { compact: true })}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Your Holdings: </span>
                <span>{userHoldings.toFixed(8)} {crypto.symbol}</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <Card className="glass glass-hover">
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
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
                  <LineChart data={chartData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsla(var(--muted-foreground), 0.2)" />
                    <XAxis 
                      dataKey="time" 
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => formatPrice(value)}
                    />
                    <ChartTooltip 
                      cursor={false}
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Line 
                      dataKey="price" 
                      type="monotone"
                      stroke="var(--color-price)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Trading Section */}
          <div>
            <Card className="glass glass-hover">
              <CardHeader>
                <CardTitle>Trade {crypto.symbol}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Demo Balance: {formatCurrency(userBalance)}
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

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Payment Method</label>
                    <ToggleGroup
                      type="single"
                      value={paymentMethod}
                      onValueChange={(value) => {
                        if (value) {
                          setPaymentMethod(value as 'balance' | 'ideal');
                          if (value === 'ideal') {
                            toast.info("iDEAL payments are for demo purposes and not yet functional.");
                          }
                        }
                      }}
                      className="grid grid-cols-2"
                    >
                      <ToggleGroupItem value="balance" aria-label="Pay with balance">
                        Pay with Balance
                      </ToggleGroupItem>
                      <ToggleGroupItem value="ideal" aria-label="Pay with iDEAL">
                        Pay with iDEAL
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Amount (USD)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amountEUR}
                      onChange={(e) => handleAmountEURChange(e.target.value)}
                      className="bg-transparent"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Amount ({crypto.symbol})</label>
                    <Input
                      type="number"
                      placeholder="0.00000000"
                      value={amountCoin}
                      onChange={(e) => handleAmountCoinChange(e.target.value)}
                      className="bg-transparent"
                    />
                  </div>

                  {amountEUR && (
                    <div className="p-3 bg-white/5 rounded-lg text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price</span>
                        <span>{formatPrice(crypto.current_price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fee (0.1%)</span>
                        <span>{formatCurrency(parseFloat(amountEUR) * 0.001, { maximumFractionDigits: 4 })}</span>
                      </div>
                      <div className="flex justify-between font-bold text-base border-t border-white/10 pt-2 mt-2">
                        <span>Total</span>
                        <span>{formatCurrency(parseFloat(amountEUR) * 1.001)}</span>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleTrade}
                    disabled={!amountEUR || !amountCoin || isProcessingTrade || !user || paymentMethod === 'ideal'}
                    className="w-full"
                  >
                    {isProcessingTrade ? 'Processing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${crypto.symbol}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.main>
      <Footer />
    </div>
  );
};

export default CryptoDetailPage;
