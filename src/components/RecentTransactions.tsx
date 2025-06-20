
import React, { useState, useEffect } from 'react';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTransactionHistory, Transaction } from '@/hooks/useTransactionHistory';
import { Settings, ArrowUp, ArrowDown, PiggyBank } from 'lucide-react';
import FormattedNumber from './FormattedNumber';
import CryptoLogo from './CryptoLogo';
import { format } from 'date-fns';
import TransactionDetailModal from './TransactionDetailModal';

const RecentTransactions = () => {
  const { transactions, loading, refetch } = useTransactionHistory();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Auto-refresh transactions every 10 seconds to catch new lending transactions
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('[RecentTransactions] Auto-refreshing transactions');
      refetch();
    }, 10000);

    return () => clearInterval(interval);
  }, [refetch]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-gray-800 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const recentTransactions = transactions.slice(0, 10);

  const getTransactionBgColor = (transactionType: string) => {
    if (transactionType.includes('lending')) {
      return 'bg-purple-500/30';
    }
    if (transactionType.includes('admin')) {
      return 'bg-blue-500/30';
    }
    
    const isBuy = transactionType === 'trade_buy' || transactionType === 'purchase' || transactionType === 'buy' || transactionType.includes('buy');
    return isBuy ? 'bg-green-500/30' : 'bg-red-500/30';
  };

  const formatTransactionType = (transactionType: string) => {
    if (transactionType.includes('lending')) {
      if (transactionType === 'lending_start') return 'LEND';
      if (transactionType === 'lending_cancelled') return 'LEND CANCELLED';
      if (transactionType === 'lending_repayment') return 'LEND REPAID';
      if (transactionType === 'lending_interest') return 'LEND INTEREST';
    }
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
        return transactionType.toUpperCase().replace(/_/g, ' ');
    }
  };

  const getTransactionIcon = (transactionType: string) => {
    if (transactionType.includes('admin')) {
      return <Settings className="h-3 w-3 text-blue-500" />;
    }
    if (transactionType.includes('lending')) {
      return <PiggyBank className="h-3 w-3 text-purple-500" />;
    }
    
    const isBuy = transactionType === 'trade_buy' || transactionType === 'purchase' || transactionType === 'buy' || transactionType.includes('buy');
    return isBuy ? 
      <ArrowUp className="h-3 w-3 text-green-500" /> : 
      <ArrowDown className="h-3 w-3 text-red-500" />;
  };

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="py-2 px-4 shrink-0">
        <CardTitle className="text-base">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-y-auto">
        {recentTransactions.length === 0 ? (
          <div className="text-gray-400 text-center py-8 space-y-2">
            <div className="text-base">No transactions yet</div>
            <div className="text-sm">Start trading to see your activity here</div>
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {recentTransactions.map((transaction) => {
              const transactionBgColor = getTransactionBgColor(transaction.transaction_type);
              const formattedType = formatTransactionType(transaction.transaction_type);
              const transactionIcon = getTransactionIcon(transaction.transaction_type);
              
              const isAdminTransaction = transaction.transaction_type.includes('admin');
              const isLendingTransaction = transaction.transaction_type.includes('lending');
              
              return (
                <button 
                  key={transaction.id} 
                  onClick={() => setSelectedTransaction(transaction)}
                  className="w-full flex items-center justify-between p-2 bg-white/5 rounded-md hover:bg-white/10 transition-all duration-200 border border-white/10 text-left"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className={`p-1.5 rounded-full ${transactionBgColor} flex items-center justify-center relative flex-shrink-0`}>
                      {isAdminTransaction ? (
                        <Settings className="h-4 w-4 text-blue-500" />
                      ) : transaction.crypto ? (
                        <>
                          <CryptoLogo 
                            logo_url={transaction.crypto.logo_url}
                            name={transaction.crypto.name}
                            symbol={transaction.crypto.symbol}
                            size="sm"
                          />
                          <div className="absolute -top-1 -right-1 bg-gray-900 rounded-full p-0.5 border border-gray-600">
                            {transactionIcon}
                          </div>
                        </>
                      ) : isLendingTransaction ? (
                        <PiggyBank className="h-4 w-4 text-purple-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold">?</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate text-xs">
                        {transaction.description || `${formattedType} ${transaction.crypto?.symbol || 'CRYPTO'}`}
                      </p>
                      <span className="text-xs text-gray-400">
                        {format(new Date(transaction.created_at), "MMM d, hh:mm a")}
                      </span>
                    </div>
                  </div>
                  <div className="text-right space-y-0.5 flex-shrink-0 ml-1">
                    <FormattedNumber
                      value={transaction.eur_value || 0}
                      type="currency"
                      currency="EUR"
                      showTooltip={false}
                      className="font-semibold text-xs"
                    />
                    <div>
                      <Badge 
                        variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                        className="text-[10px] h-4 px-1.5"
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
      <TransactionDetailModal 
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
};

export default RecentTransactions;
