
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useUserBalance } from '@/hooks/useUserBalance';
import FormattedNumber from '@/components/FormattedNumber';
import { motion } from 'framer-motion';
import RecentTransactions from '@/components/RecentTransactions';
import PortfolioOverview from '@/components/PortfolioOverview';
import { TrendingUp, TrendingDown, Wallet, Euro } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const { portfolio, totalValue, totalProfitLoss, totalProfitLossPercentage, loading } = usePortfolio();
  const { balance, loading: balanceLoading } = useUserBalance();

  const statsCards = [
    {
      title: 'Available Balance',
      value: balance,
      type: 'currency' as const,
      icon: Euro,
      trend: 'neutral' as const,
      trendValue: 0,
      loading: balanceLoading,
    },
    {
      title: 'Portfolio Value',
      value: totalValue,
      type: 'currency' as const,
      icon: Wallet,
      trend: totalProfitLoss >= 0 ? 'up' : 'down',
      trendValue: totalProfitLossPercentage,
      loading: loading,
    },
    {
      title: 'Total Profit/Loss',
      value: totalProfitLoss,
      type: 'currency' as const,
      icon: totalProfitLoss >= 0 ? TrendingUp : TrendingDown,
      trend: totalProfitLoss >= 0 ? 'up' : 'down',
      trendValue: totalProfitLossPercentage,
      loading: loading,
    },
    {
      title: 'Holdings',
      value: portfolio.length,
      type: 'holdings' as const,
      icon: Euro,
      trend: 'neutral' as const,
      trendValue: 0,
      loading: loading,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 md:px-6 lg:px-8 py-20 pt-24">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
            <img 
              src="/lovable-uploads/3765d287-ffd3-40d5-8628-4f8191064138.png" 
              alt="PROMPTO TRADING Logo" 
              className="w-8 h-8 md:w-10 md:h-10 object-contain"
            />
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">TRADING DASHBOARD</h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            Welcome back, {user?.email}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="lg:col-span-2">
            <PortfolioOverview />
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="glass glass-hover">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg md:text-2xl font-bold">
                      {stat.loading ? (
                        <div className="h-6 md:h-8 w-16 md:w-24 bg-gray-700 animate-pulse rounded"></div>
                      ) : stat.type === 'holdings' ? (
                        <span className="text-lg md:text-2xl font-bold">{stat.value}</span>
                      ) : (
                        <FormattedNumber
                          value={stat.value}
                          type={stat.type}
                          currency="EUR"
                          showTooltip={false}
                          className="text-lg md:text-2xl font-bold"
                        />
                      )}
                    </div>
                    {stat.trend !== 'neutral' && !stat.loading && (
                      <p className={`text-xs flex items-center gap-1 mt-1 ${
                        stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {stat.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(stat.trendValue).toFixed(2)}%
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions Only */}
        <div className="grid grid-cols-1 gap-6 md:gap-8">
          <RecentTransactions />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
