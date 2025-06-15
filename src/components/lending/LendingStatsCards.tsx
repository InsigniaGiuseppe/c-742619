
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, TrendingUp, PiggyBank, DollarSign, Target, Activity } from 'lucide-react';
import FormattedNumber from '@/components/FormattedNumber';

interface LendingStatsCardsProps {
  stats: {
    totalLentValue: number;
    totalEarnedInterest: number;
    averageYield: number;
    activeLendingCount: number;
    estimatedDailyReturn: number;
    estimatedMonthlyReturn: number;
    daysSinceLastPayout: number;
    nextPayoutIn: string;
  };
  loading: boolean;
}

const LendingStatsCards: React.FC<LendingStatsCardsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(7)].map((_, i) => (
          <Card key={i} className="glass glass-hover">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 animate-pulse rounded"></div>
                <div className="h-6 bg-gray-700 animate-pulse rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Lent',
      value: <FormattedNumber value={stats.totalLentValue} type="currency" currency="EUR" showTooltip={false} className="text-2xl font-bold text-white" />,
      icon: <DollarSign className="w-5 h-5 text-blue-400" />,
      className: 'md:col-span-1'
    },
    {
      title: 'Interest Earned',
      value: <FormattedNumber value={stats.totalEarnedInterest} type="currency" currency="EUR" showTooltip={false} className="text-2xl font-bold text-green-400" />,
      icon: <TrendingUp className="w-5 h-5 text-green-400" />,
      className: 'md:col-span-1'
    },
    {
      title: 'Average APR',
      value: <span className="text-2xl font-bold text-white">{stats.averageYield.toFixed(2)}%</span>,
      icon: <Target className="w-5 h-5 text-purple-400" />,
      className: 'md:col-span-1'
    },
    {
      title: 'Active Positions',
      value: <span className="text-2xl font-bold text-white">{stats.activeLendingCount}</span>,
      icon: <Activity className="w-5 h-5 text-orange-400" />,
      className: 'md:col-span-1'
    },
    {
      title: 'Daily Return',
      value: <FormattedNumber value={stats.estimatedDailyReturn} type="currency" currency="EUR" showTooltip={false} className="text-xl font-bold text-green-400" />,
      icon: <TrendingUp className="w-4 h-4 text-green-400" />,
      className: 'md:col-span-1'
    },
    {
      title: 'Monthly Projection',
      value: <FormattedNumber value={stats.estimatedMonthlyReturn} type="currency" currency="EUR" showTooltip={false} className="text-xl font-bold text-blue-400" />,
      icon: <Calendar className="w-4 h-4 text-blue-400" />,
      className: 'md:col-span-1'
    },
    {
      title: 'Next Payout',
      value: <Badge variant="outline" className="text-orange-400 border-orange-400/20 text-sm">{stats.nextPayoutIn}</Badge>,
      icon: <Clock className="w-4 h-4 text-orange-400" />,
      className: 'md:col-span-2'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsCards.map((stat, index) => (
        <Card key={index} className={`glass glass-hover ${stat.className}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
              {stat.icon}
            </div>
            <div>{stat.value}</div>
          </CardContent>
        </Card>
      ))}
      
      {stats.daysSinceLastPayout > 0 && (
        <Card className="glass glass-hover md:col-span-2 lg:col-span-4">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Last payout was {stats.daysSinceLastPayout} day{stats.daysSinceLastPayout !== 1 ? 's' : ''} ago
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LendingStatsCards;
