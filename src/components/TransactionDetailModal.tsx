
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Transaction } from '@/hooks/useTransactionHistory';
import FormattedNumber from './FormattedNumber';
import CryptoLogo from './CryptoLogo';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { ScrollArea } from './ui/scroll-area';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const formatTransactionType = (transactionType: string) => {
    if (transactionType.includes('lending')) {
      if (transactionType === 'lending_start') return 'Lend';
      if (transactionType === 'lending_cancelled') return 'Lend Cancelled';
      if (transactionType === 'lending_repayment') return 'Lend Repaid';
      if (transactionType === 'lending_interest') return 'Lend Interest';
    }
    switch (transactionType) {
      case 'trade_buy':
      case 'purchase':
      case 'buy':
      case 'buy_crypto':
        return 'Buy';
      case 'trade_sell':
      case 'sale':
      case 'sell':
      case 'sell_crypto':
        return 'Sell';
      case 'admin_add':
        return 'Admin Add';
      case 'admin_remove':
        return 'Admin Remove';
      case 'admin_balance_add':
        return 'Admin Deposit';
      case 'admin_balance_remove':
        return 'Admin Withdrawal';
      default:
        return transactionType.toUpperCase().replace(/_/g, ' ');
    }
  };

  const isBuy = transaction.transaction_type.includes('buy');
  const pricePerCoin = (transaction.eur_value && transaction.amount) ? transaction.eur_value / transaction.amount : null;

  return (
    <Dialog open={!!transaction} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md bg-background border-slate-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {transaction.crypto && (
              <CryptoLogo logo_url={transaction.crypto.logo_url} name={transaction.crypto.name} symbol={transaction.crypto.symbol} size="sm" />
            )}
            Transaction Details
          </DialogTitle>
          <DialogDescription>
            Full details for transaction ID: {transaction.id.slice(0, 8)}...
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-3 py-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium">{formatTransactionType(transaction.transaction_type)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>{transaction.status}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Date & Time</span>
              <span className="font-medium">{format(new Date(transaction.created_at), "MMM d, yyyy 'at' hh:mm a")}</span>
            </div>
            {transaction.crypto && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Asset</span>
                <span className="font-medium">{transaction.crypto.name} ({transaction.crypto.symbol})</span>
              </div>
            )}
            {transaction.amount != null && (
               <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{isBuy ? 'Amount Received' : 'Amount Sold'}</span>
                <FormattedNumber value={transaction.amount} className="font-medium" />
              </div>
            )}
            {transaction.eur_value != null && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{isBuy ? 'Value (EUR)' : 'Value (EUR)'}</span>
                <FormattedNumber value={transaction.eur_value} type="currency" currency="EUR" className="font-medium" />
              </div>
            )}
            {pricePerCoin != null && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Price per coin</span>
                <FormattedNumber value={pricePerCoin} type="currency" currency="EUR" className="font-medium" />
              </div>
            )}
             {transaction.eur_fee_amount != null && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Fee</span>
                <FormattedNumber value={transaction.eur_fee_amount} type="currency" currency="EUR" className="font-medium text-red-400" />
              </div>
            )}
             <div className="pt-2">
              <span className="text-muted-foreground text-xs">Description</span>
              <p className="font-medium mt-1 p-2 bg-slate-900 rounded">{transaction.description || 'No description provided.'}</p>
            </div>
             <div className="pt-2">
              <span className="text-muted-foreground text-xs">Transaction ID</span>
              <p className="font-mono text-xs mt-1 p-2 bg-slate-900 rounded break-all">{transaction.id}</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailModal;
