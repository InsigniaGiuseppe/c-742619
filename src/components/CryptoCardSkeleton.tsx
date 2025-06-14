
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const CryptoCardSkeleton: React.FC = () => {
  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
            <div>
              <div className="h-5 w-16 bg-white/10 rounded animate-pulse mb-1" />
              <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-5 w-12 bg-white/10 rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="h-8 w-32 bg-white/10 rounded animate-pulse mb-2" />
            <div className="h-4 w-40 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="h-9 w-full bg-white/10 rounded-md animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
};

export default CryptoCardSkeleton;
