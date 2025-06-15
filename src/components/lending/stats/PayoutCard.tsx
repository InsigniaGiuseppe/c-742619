
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react';

interface PayoutCardProps {
  loading: boolean;
  nextPayoutIn: string;
  daysSinceLastPayout: number;
}

const PayoutCard: React.FC<PayoutCardProps> = ({ loading, nextPayoutIn, daysSinceLastPayout }) => {
  return (
    <Card className="glass glass-hover h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Payout Information</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
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
              <p className="text-xs text-muted-foreground">Next Payout</p>
              <p className="text-2xl font-bold">{nextPayoutIn}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Days Since Last Payout</p>
              <p className="text-lg font-medium">{daysSinceLastPayout}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PayoutCard;
