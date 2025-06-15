
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FormattedNumber from '@/components/FormattedNumber';
import { Skeleton } from '@/components/ui/skeleton';
import { Banknote } from 'lucide-react';

interface TotalLentCardProps {
  loading: boolean;
  totalLentValue: number;
  totalEarnedInterest: number;
}

const TotalLentCard: React.FC<TotalLentCardProps> = ({ loading, totalLentValue, totalEarnedInterest }) => {
  return (
    <Card className="glass glass-hover h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Lending Overview</CardTitle>
        <Banknote className="h-4 w-4 text-muted-foreground" />
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
              <p className="text-xs text-muted-foreground">Total Value Lent</p>
              <FormattedNumber value={totalLentValue} type="currency" className="text-2xl font-bold" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Interest Earned</p>
              <FormattedNumber value={totalEarnedInterest} type="currency" className="text-lg font-medium text-green-500" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TotalLentCard;
