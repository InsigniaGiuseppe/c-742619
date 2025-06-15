
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Percent } from 'lucide-react';

interface PerformanceCardProps {
  loading: boolean;
  averageYield: number;
  activeLendingCount: number;
}

const PerformanceCard: React.FC<PerformanceCardProps> = ({ loading, averageYield, activeLendingCount }) => {
  return (
    <Card className="glass glass-hover h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Performance</CardTitle>
        <Percent className="h-4 w-4 text-muted-foreground" />
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
              <p className="text-xs text-muted-foreground">Average APR</p>
              <p className="text-2xl font-bold">{averageYield.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Positions</p>
              <p className="text-lg font-medium">{activeLendingCount}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceCard;
