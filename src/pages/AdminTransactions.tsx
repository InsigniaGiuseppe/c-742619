import React from 'react';
import { useAdminTransactions, TransactionWithDetails } from '@/hooks/useAdminTransactions';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import TransactionActions from '@/components/admin/TransactionActions';
import { ScrollArea } from '@/components/ui/scroll-area';

const getStatusBadgeClass = (status: string | null) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300/50';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-300/50';
    case 'rejected':
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300/50';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-400/50';
  }
};

const AdminTransactions = () => {
  const { data: transactions, isLoading, error } = useAdminTransactions();

  const renderSkeleton = () => (
    <TableRow>
      {[...Array(8)].map((_, i) => (
        <TableCell key={i}><Skeleton className="h-8 w-full bg-gray-500/20" /></TableCell>
      ))}
    </TableRow>
  );

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="glass">
          <CardHeader>
            <div className="flex items-center gap-4">
              <TrendingUp className="w-8 h-8 text-orange-400" />
              <div>
                <CardTitle className="text-2xl">Transaction Monitoring</CardTitle>
                <CardDescription>Review and manage all trading orders on the platform.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}
            <ScrollArea className="h-[600px] w-full border border-border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Total Value (USD)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(10)].map((_, i) => renderSkeleton())
                  ) : (
                    transactions?.map((tx: TransactionWithDetails) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div className="font-medium">{tx.profiles?.full_name || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">{tx.profiles?.email}</div>
                        </TableCell>
                        <TableCell>{format(new Date(tx.created_at!), 'PPpp')}</TableCell>
                        <TableCell className="capitalize">{tx.order_type}</TableCell>
                        <TableCell>{tx.cryptocurrencies?.name} ({tx.cryptocurrencies?.symbol})</TableCell>
                        <TableCell className="text-right">{tx.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${tx.total_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell>
                           <Badge variant="outline" className={getStatusBadgeClass(tx.order_status)}>
                            {tx.order_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                           <TransactionActions orderId={tx.id} currentStatus={tx.order_status} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
            {!isLoading && transactions?.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">No transactions found.</div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminTransactions;
