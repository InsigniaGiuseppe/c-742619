
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Download, Filter, Search, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { useAdminTransactions } from '@/hooks/useAdminTransactions';
import FormattedNumber from '@/components/FormattedNumber';
import { Skeleton } from '@/components/ui/skeleton';

const EnhancedTransactionManagement: React.FC = () => {
  const { data: transactions, isLoading, error } = useAdminTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredTransactions = transactions?.filter(transaction => {
    const matchesSearch = !searchTerm || 
      transaction.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.cryptocurrencies?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || transaction.order_status === statusFilter;
    const matchesType = !typeFilter || transaction.order_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const calculateTotalVolume = () => {
    return filteredTransactions.reduce((sum, tx) => sum + (tx.total_value || 0), 0);
  };

  const calculateTotalFees = () => {
    return filteredTransactions.reduce((sum, tx) => sum + (tx.fees || 0), 0);
  };

  const exportTransactions = () => {
    const csvContent = generateTransactionCSV();
    downloadCSV(csvContent, 'transactions_export.csv');
  };

  const generateTransactionCSV = () => {
    const headers = ['ID', 'User Email', 'Cryptocurrency', 'Type', 'Amount', 'Value (USD)', 'Fees', 'Status', 'Date'];
    const rows = filteredTransactions.map(tx => [
      tx.id,
      tx.profiles?.email || 'N/A',
      tx.cryptocurrencies?.name || 'N/A',
      tx.order_type,
      tx.amount || 0,
      tx.total_value || 0,
      tx.fees || 0,
      tx.order_status,
      new Date(tx.created_at).toLocaleDateString()
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="glass glass-hover">
        <CardContent className="pt-6">
          <div className="text-center text-red-400">
            Error loading transactions: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Transaction Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass glass-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTransactions.length}</div>
          </CardContent>
        </Card>

        <Card className="glass glass-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <FormattedNumber value={calculateTotalVolume()} type="currency" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass glass-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <FormattedNumber value={calculateTotalFees()} type="currency" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass glass-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <FormattedNumber 
                value={filteredTransactions.length > 0 ? calculateTotalVolume() / filteredTransactions.length : 0} 
                type="currency" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Transaction Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users or crypto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-transparent"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={exportTransactions} variant="outline" className="glass">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Cryptocurrency</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Value (USD)</TableHead>
                  <TableHead className="text-right">Fees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-white/5">
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.profiles?.full_name || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">{transaction.profiles?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                            {transaction.cryptocurrencies?.symbol?.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{transaction.cryptocurrencies?.name}</div>
                            <div className="text-xs text-muted-foreground">{transaction.cryptocurrencies?.symbol?.toUpperCase()}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.order_type === 'buy' ? 'default' : 'secondary'}>
                          {transaction.order_type?.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <FormattedNumber value={transaction.amount || 0} type="currency" />
                      </TableCell>
                      <TableCell className="text-right">
                        <FormattedNumber value={transaction.total_value || 0} type="currency" />
                      </TableCell>
                      <TableCell className="text-right">
                        <FormattedNumber value={transaction.fees || 0} type="currency" />
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(transaction.order_status || '')}>
                          {transaction.order_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTransactionManagement;
