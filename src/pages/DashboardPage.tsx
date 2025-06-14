
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PortfolioChart from '@/components/PortfolioChart';
import RecentTransactions from '@/components/RecentTransactions';
import FormattedNumber from '@/components/FormattedNumber';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

const DashboardPage = () => {
  const { user } = useAuth();
  const { totalValue, totalProfitLoss, totalProfitLossPercentage, loading } = usePortfolio();
  const [demoBalance, setDemoBalance] = React.useState(0);

  React.useEffect(() => {
    if (user) {
      fetchDemoBalance();
    }
  }, [user]);

  const fetchDemoBalance = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setDemoBalance(data.demo_balance_usd || 10000);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="flex-grow container mx-auto px-4 py-20 pt-24"
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track your portfolio performance and recent activities</p>
        </div>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
            <Card className="glass glass-hover border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
                <Wallet className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {loading ? (
                    <div className="h-8 bg-gray-800 rounded animate-pulse"></div>
                  ) : (
                    <FormattedNumber
                      value={totalValue}
                      type="currency"
                      className="text-2xl font-bold"
                    />
                  )}
                  <p className="text-xs text-muted-foreground">
                    Total crypto holdings
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
            <Card className={`glass glass-hover border-l-4 ${totalProfitLoss >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total P&L</CardTitle>
                {totalProfitLoss >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {loading ? (
                    <div className="h-8 bg-gray-800 rounded animate-pulse"></div>
                  ) : (
                    <FormattedNumber
                      value={totalProfitLoss}
                      type="currency"
                      className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}
                    />
                  )}
                  <p className="text-xs text-muted-foreground">
                    {loading ? '...' : (
                      <FormattedNumber
                        value={totalProfitLossPercentage}
                        type="percentage"
                        showTooltip={false}
                      />
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
            <Card className="glass glass-hover border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Demo Balance</CardTitle>
                <DollarSign className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <FormattedNumber
                    value={demoBalance}
                    type="currency"
                    className="text-2xl font-bold"
                  />
                  <p className="text-xs text-muted-foreground">
                    Available for trading
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
            <Card className="glass glass-hover border-l-4 border-l-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
                <DollarSign className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <FormattedNumber
                    value={demoBalance + totalValue}
                    type="currency"
                    className="text-2xl font-bold"
                  />
                  <p className="text-xs text-muted-foreground">
                    Balance + Holdings
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts and Transactions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2">
            <PortfolioChart />
          </div>
          <RecentTransactions />
        </motion.div>
      </motion.main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
