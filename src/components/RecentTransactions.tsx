
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { TrendingUp, TrendingDown } from 'lucide-react';
import FormattedNumber from './FormattedNumber';

const RecentTransactions = () => {
  const { transactions, loading } = useTransactionHistory();

  if (loading) {
    return (
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-800 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentTransactions = transactions.slice(0, 10);

  return (
    <Card className="glass glass-hover">
      <CardHeader>
        <CardTitle className="text-xl">Recent Transactions</CardTitle>
        <p className="text-sm text-muted-foreground">
          {recentTransactions.length} recent activities
        </p>
      </CardHeader>
      <CardContent>
        {recentTransactions.length === 0 ? (
          <div className="text-gray-400 text-center py-12 space-y-2">
            <div className="text-lg">No transactions yet</div>
            <div className="text-sm">Start trading to see your activity here</div>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction, index) => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 border border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    transaction.transaction_type === 'buy' ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {transaction.transaction_type === 'buy' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {transaction.description || `${transaction.transaction_type.toUpperCase()} ${transaction.crypto?.symbol}`}
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(transaction.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <FormattedNumber
                    value={transaction.usd_value || 0}
                    type="currency"
                    showTooltip={false}
                    className="font-semibold"
                  />
                  <div>
                    <Badge 
                      variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
