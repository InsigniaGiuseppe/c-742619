
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Minus, DollarSign, TrendingUp, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FormattedNumber from '@/components/FormattedNumber';
import { useCryptocurrencies } from '@/hooks/useCryptocurrencies';

interface UserFinancialControlsProps {
  user: any;
  portfolio?: any[];
}

const UserFinancialControls: React.FC<UserFinancialControlsProps> = ({ user, portfolio = [] }) => {
  const { toast } = useToast();
  const { data: cryptocurrencies } = useCryptocurrencies();
  const [balanceAction, setBalanceAction] = useState<'add' | 'remove'>('add');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [cryptoAction, setCryptoAction] = useState<'add' | 'remove'>('add');

  const handleBalanceUpdate = () => {
    if (!balanceAmount || isNaN(Number(balanceAmount))) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid number',
        variant: 'destructive',
      });
      return;
    }

    // TODO: Implement actual balance update API call
    toast({
      title: 'Balance Updated',
      description: `${balanceAction === 'add' ? 'Added' : 'Removed'} $${balanceAmount} ${balanceAction === 'add' ? 'to' : 'from'} user balance`,
    });
    setBalanceAmount('');
  };

  const handleCryptoUpdate = () => {
    if (!selectedCrypto || !cryptoAmount || isNaN(Number(cryptoAmount))) {
      toast({
        title: 'Invalid Input',
        description: 'Please select a cryptocurrency and enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    // TODO: Implement actual crypto holding update API call
    toast({
      title: 'Holdings Updated',
      description: `${cryptoAction === 'add' ? 'Added' : 'Removed'} ${cryptoAmount} ${selectedCrypto} ${cryptoAction === 'add' ? 'to' : 'from'} user portfolio`,
    });
    setCryptoAmount('');
    setSelectedCrypto('');
  };

  const totalPortfolioValue = portfolio.reduce((sum, holding) => sum + holding.current_value, 0);

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <div className="text-sm text-muted-foreground">Demo Balance</div>
              <div className="text-2xl font-bold">
                <FormattedNumber 
                  value={user?.demo_balance_usd || 0} 
                  type="currency" 
                  showTooltip={false} 
                />
              </div>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <div className="text-sm text-muted-foreground">Portfolio Value</div>
              <div className="text-2xl font-bold">
                <FormattedNumber 
                  value={totalPortfolioValue} 
                  type="currency" 
                  showTooltip={false} 
                />
              </div>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <div className="text-sm text-muted-foreground">Total Assets</div>
              <div className="text-2xl font-bold">
                <FormattedNumber 
                  value={(user?.demo_balance_usd || 0) + totalPortfolioValue} 
                  type="currency" 
                  showTooltip={false} 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance Management */}
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Balance Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="balance-action">Action</Label>
                <Select value={balanceAction} onValueChange={(value: 'add' | 'remove') => setBalanceAction(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add Funds</SelectItem>
                    <SelectItem value="remove">Remove Funds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="balance-amount">Amount (USD)</Label>
                <Input
                  id="balance-amount"
                  type="number"
                  placeholder="0.00"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleBalanceUpdate} className="button-gradient">
                  {balanceAction === 'add' ? <Plus className="w-4 h-4 mr-2" /> : <Minus className="w-4 h-4 mr-2" />}
                  Update Balance
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crypto Holdings Management */}
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Cryptocurrency Holdings Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="crypto-action">Action</Label>
                <Select value={cryptoAction} onValueChange={(value: 'add' | 'remove') => setCryptoAction(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add Holdings</SelectItem>
                    <SelectItem value="remove">Remove Holdings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="crypto-select">Cryptocurrency</Label>
                <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select crypto" />
                  </SelectTrigger>
                  <SelectContent>
                    {cryptocurrencies?.map((crypto) => (
                      <SelectItem key={crypto.id} value={crypto.symbol}>
                        {crypto.symbol} - {crypto.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="crypto-amount">Amount</Label>
                <Input
                  id="crypto-amount"
                  type="number"
                  placeholder="0.00"
                  value={cryptoAmount}
                  onChange={(e) => setCryptoAmount(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleCryptoUpdate} className="button-gradient w-full">
                  {cryptoAction === 'add' ? <Plus className="w-4 h-4 mr-2" /> : <Minus className="w-4 h-4 mr-2" />}
                  Update Holdings
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Holdings Table */}
      {portfolio.length > 0 && (
        <Card className="glass glass-hover">
          <CardHeader>
            <CardTitle>Current Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Current Price</TableHead>
                    <TableHead className="text-right">Market Value</TableHead>
                    <TableHead className="text-right">P/L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolio.map((holding) => (
                    <TableRow key={holding.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{holding.crypto.symbol}</span>
                          <span className="text-sm text-muted-foreground">{holding.crypto.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <FormattedNumber value={holding.quantity} type="crypto" showTooltip={false} />
                      </TableCell>
                      <TableCell className="text-right">
                        <FormattedNumber value={holding.crypto.current_price} type="currency" showTooltip={false} />
                      </TableCell>
                      <TableCell className="text-right">
                        <FormattedNumber value={holding.current_value} type="currency" showTooltip={false} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={holding.profit_loss >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                          {holding.profit_loss >= 0 ? '+' : ''}{holding.profit_loss_percentage.toFixed(2)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserFinancialControls;
