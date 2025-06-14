import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { usePortfolio } from '@/hooks/usePortfolio';
import FormattedNumber from '@/components/FormattedNumber';
import { motion } from 'framer-motion';
import PortfolioChart from '@/components/PortfolioChart';
import RecentTransactions from '@/components/RecentTransactions';
import PortfolioOverview from '@/components/PortfolioOverview';
import { TrendingUp, TrendingDown, Wallet, DollarSign } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const { portfolio, totalValue, totalProfitLoss, totalProfitLossPercentage, loading } = usePortfolio();

  const statsCards = [
    {
      title: 'Portfolio Value',
      value: totalValue,
      type: 'currency' as const,
      icon: Wallet,
      trend: totalProfitLoss >= 0 ? 'up' : 'down',
      trendValue: totalProfitLossPercentage,
    },
    {
      title: 'Total Profit/Loss',
      value: totalProfitLoss,
      type: 'currency' as const,
      icon: totalProfitLoss >= 0 ? TrendingUp : TrendingDown,
      trend: totalProfitLoss >= 0 ? 'up' : 'down',
      trendValue: totalProfitLossPercentage,
    },
    {
      title: 'Holdings',
      value: portfolio.length,
      type: 'holdings' as const,
      icon: DollarSign,
      trend: 'neutral' as const,
      trendValue: 0,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-20 pt-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.email}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <PortfolioOverview />
          </div>
          
          <div className="space-y-6">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="glass glass-hover">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {loading ? (
                        <div className="h-8 w-24 bg-gray-700 animate-pulse rounded"></div>
                      ) : stat.type === 'holdings' ? (
                        <span className="text-2xl font-bold">{stat.value}</span>
                      ) : (
                        <FormattedNumber
                          value={stat.value}
                          type={stat.type}
                          showTooltip={false}
                          className="text-2xl font-bold"
                        />
                      )}
                    </div>
                    {stat.trend !== 'neutral' && (
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

        {/* Portfolio and Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PortfolioChart />
          <RecentTransactions />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
