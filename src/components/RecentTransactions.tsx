
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

  const getTransactionIcon = (transactionType: string) => {
    const isBuy = transactionType === 'purchase' || transactionType === 'buy' || transactionType.includes('buy');
    return isBuy ? TrendingUp : TrendingDown;
  };

  const getTransactionColor = (transactionType: string) => {
    const isBuy = transactionType === 'purchase' || transactionType === 'buy' || transactionType.includes('buy');
    return isBuy ? 'text-green-500' : 'text-red-500';
  };

  const getTransactionBgColor = (transactionType: string) => {
    const isBuy = transactionType === 'purchase' || transactionType === 'buy' || transactionType.includes('buy');
    return isBuy ? 'bg-green-500/20' : 'bg-red-500/20';
  };

  const formatTransactionType = (transactionType: string) => {
    switch (transactionType) {
      case 'purchase':
        return 'BUY';
      case 'sale':
        return 'SELL';
      case 'buy':
      case 'buy_crypto':
        return 'BUY';
      case 'sell':
      case 'sell_crypto':
        return 'SELL';
      default:
        return transactionType.toUpperCase();
    }
  };

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
            {recentTransactions.map((transaction, index) => {
              const Icon = getTransactionIcon(transaction.transaction_type);
              const transactionColor = getTransactionColor(transaction.transaction_type);
              const transactionBgColor = getTransactionBgColor(transaction.transaction_type);
              const formattedType = formatTransactionType(transaction.transaction_type);
              
              return (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 border border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${transactionBgColor}`}>
                      <Icon className={`h-4 w-4 ${transactionColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {transaction.description || `${formattedType} ${transaction.crypto?.symbol || 'CRYPTO'}`}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>
                          {new Date(transaction.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {transaction.amount && (
                          <span className="text-gray-500">
                            • {transaction.amount.toFixed(6)} {transaction.crypto?.symbol}
                          </span>
                        )}
                      </div>
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
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
