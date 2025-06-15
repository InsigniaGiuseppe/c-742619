
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, TrendingUp, PiggyBank } from 'lucide-react';
import FormattedNumber from '@/components/FormattedNumber';

interface LendingStatsCardProps {
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

const LendingStatsCard: React.FC<LendingStatsCardProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5" />
            Lending Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-700 animate-pulse rounded"></div>
                <div className="h-6 bg-gray-700 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass glass-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="w-5 h-5" />
          Lending Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Lent</p>
            <FormattedNumber
              value={stats.totalLentValue}
              type="currency"
              currency="EUR"
              showTooltip={false}
              className="text-lg font-semibold"
            />
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Interest Earned</p>
            <FormattedNumber
              value={stats.totalEarnedInterest}
              type="currency"
              currency="EUR"
              showTooltip={false}
              className="text-lg font-semibold text-green-500"
            />
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Average APR</p>
            <div className="text-lg font-semibold">
              {stats.averageYield.toFixed(2)}%
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Active Positions</p>
            <div className="text-lg font-semibold">
              {stats.activeLendingCount}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <p className="text-sm text-muted-foreground">Daily Return</p>
            </div>
            <FormattedNumber
              value={stats.estimatedDailyReturn}
              type="currency"
              currency="EUR"
              showTooltip={false}
              className="text-base font-semibold text-green-500"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <p className="text-sm text-muted-foreground">Monthly Projection</p>
            </div>
            <FormattedNumber
              value={stats.estimatedMonthlyReturn}
              type="currency"
              currency="EUR"
              showTooltip={false}
              className="text-base font-semibold text-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <p className="text-sm text-muted-foreground">Next Payout</p>
            </div>
            <Badge variant="outline" className="text-orange-500 border-orange-500/20">
              {stats.nextPayoutIn}
            </Badge>
          </div>
        </div>

        {stats.daysSinceLastPayout > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-sm text-muted-foreground">
              Last payout was {stats.daysSinceLastPayout} day{stats.daysSinceLastPayout !== 1 ? 's' : ''} ago
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LendingStatsCard;
