
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FormattedNumber from '@/components/FormattedNumber';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';

interface ReturnsCardProps {
  loading: boolean;
  estimatedDailyReturn: number;
  estimatedMonthlyReturn: number;
}

const ReturnsCard: React.FC<ReturnsCardProps> = ({ loading, estimatedDailyReturn, estimatedMonthlyReturn }) => {
  return (
    <Card className="glass glass-hover h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Estimated Returns</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4 pt-2">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ) : (
          <div>
            <div className="mb-2">
              <p className="text-xs text-muted-foreground">Daily</p>
              <FormattedNumber value={estimatedDailyReturn} type="currency" className="text-2xl font-bold text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Monthly (30d)</p>
              <FormattedNumber value={estimatedMonthlyReturn} type="currency" className="text-2xl font-bold text-blue-400" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReturnsCard;
