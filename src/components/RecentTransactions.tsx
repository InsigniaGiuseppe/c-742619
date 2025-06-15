
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { Settings, ArrowUp, ArrowDown } from 'lucide-react';
import FormattedNumber from './FormattedNumber';
import CryptoLogo from './CryptoLogo';

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

  const getTransactionBgColor = (transactionType: string) => {
    // Admin transactions get blue background
    if (transactionType.includes('admin')) {
      return 'bg-blue-500/30';
    }
    
    const isBuy = transactionType === 'trade_buy' || transactionType === 'purchase' || transactionType === 'buy' || transactionType.includes('buy');
    return isBuy ? 'bg-green-500/30' : 'bg-red-500/30';
  };

  const formatTransactionType = (transactionType: string) => {
    switch (transactionType) {
      case 'trade_buy':
      case 'purchase':
      case 'buy':
      case 'buy_crypto':
        return 'BUY';
      case 'trade_sell':
      case 'sale':
      case 'sell':
      case 'sell_crypto':
        return 'SELL';
      case 'admin_add':
        return 'ADMIN ADD';
      case 'admin_remove':
        return 'ADMIN REMOVE';
      case 'admin_balance_add':
        return 'ADMIN DEPOSIT';
      case 'admin_balance_remove':
        return 'ADMIN WITHDRAWAL';
      default:
        return transactionType.toUpperCase().replace('_', ' ');
    }
  };

  const getTransactionIcon = (transactionType: string) => {
    if (transactionType.includes('admin')) {
      return <Settings className="h-3 w-3 text-blue-500" />;
    }
    
    const isBuy = transactionType === 'trade_buy' || transactionType === 'purchase' || transactionType === 'buy' || transactionType.includes('buy');
    return isBuy ? 
      <ArrowUp className="h-3 w-3 text-green-500" /> : 
      <ArrowDown className="h-3 w-3 text-red-500" />;
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
              const transactionBgColor = getTransactionBgColor(transaction.transaction_type);
              const formattedType = formatTransactionType(transaction.transaction_type);
              const transactionIcon = getTransactionIcon(transaction.transaction_type);
              
              // For admin transactions, show Settings icon; for crypto transactions, show coin logo
              const isAdminTransaction = transaction.transaction_type.includes('admin');
              const isBuyTransaction = transaction.transaction_type === 'trade_buy' || transaction.transaction_type === 'purchase' || transaction.transaction_type === 'buy' || transaction.transaction_type.includes('buy');
              
              return (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 border border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${transactionBgColor} flex items-center justify-center relative`}>
                      {isAdminTransaction ? (
                        <Settings className="h-5 w-5 text-blue-500" />
                      ) : transaction.crypto ? (
                        <>
                          <CryptoLogo 
                            logo_url={transaction.crypto.logo_url}
                            name={transaction.crypto.name}
                            symbol={transaction.crypto.symbol}
                            size="sm"
                          />
                          {/* Direction indicator overlay */}
                          <div className="absolute -top-1 -right-1 bg-gray-900 rounded-full p-1 border border-gray-600">
                            {transactionIcon}
                          </div>
                        </>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold">
                          ?
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">
                          {transaction.description || `${formattedType} ${transaction.crypto?.symbol || 'CRYPTO'}`}
                        </p>
                        {!isAdminTransaction && (
                          <Badge 
                            variant={isBuyTransaction ? 'default' : 'destructive'}
                            className="text-xs px-2 py-0.5"
                          >
                            {isBuyTransaction ? 'BUY' : 'SELL'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>
                          {new Date(transaction.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {transaction.amount && transaction.crypto && (
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
