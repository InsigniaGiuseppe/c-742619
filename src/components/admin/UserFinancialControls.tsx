
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Minus, Wallet, Coins } from 'lucide-react';
import { useCryptocurrencies } from '@/hooks/useCryptocurrencies';
import { usePortfolio } from '@/hooks/usePortfolio';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FormattedNumber from '@/components/FormattedNumber';
import { formatCryptoQuantity, formatCryptoValue } from '@/lib/cryptoFormatters';

interface UserFinancialControlsProps {
  userId: string;
}

const UserFinancialControls: React.FC<UserFinancialControlsProps> = ({ userId }) => {
  const { cryptocurrencies } = useCryptocurrencies();
  const { portfolio, refetch: refetchPortfolio } = usePortfolio();
  const [selectedCrypto, setSelectedCrypto] = useState<string>('');
  const [cryptoAmount, setCryptoAmount] = useState<string>('');
  const [balanceAmount, setBalanceAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddCrypto = async () => {
    if (!selectedCrypto || !cryptoAmount || parseFloat(cryptoAmount) <= 0) {
      toast.error('Please select a cryptocurrency and enter a valid amount');
      return;
    }

    setIsProcessing(true);
    try {
      // Get the current price of the selected cryptocurrency
      const { data: cryptoData, error: cryptoError } = await supabase
        .from('cryptocurrencies')
        .select('current_price')
        .eq('id', selectedCrypto)
        .single();

      if (cryptoError) throw cryptoError;

      const quantity = parseFloat(cryptoAmount);
      const currentPrice = cryptoData.current_price;
      const currentValue = quantity * currentPrice;

      const { error } = await supabase
        .from('user_portfolios')
        .upsert({
          user_id: userId,
          cryptocurrency_id: selectedCrypto,
          quantity: quantity,
          average_buy_price: currentPrice,
          total_invested: currentValue,
          current_value: currentValue,
          profit_loss: 0,
          profit_loss_percentage: 0,
        }, {
          onConflict: 'user_id,cryptocurrency_id'
        });

      if (error) throw error;

      toast.success('Cryptocurrency added successfully');
      setSelectedCrypto('');
      setCryptoAmount('');
      refetchPortfolio();
    } catch (error: any) {
      toast.error(`Failed to add cryptocurrency: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveCrypto = async (cryptoId: string) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('user_portfolios')
        .delete()
        .eq('user_id', userId)
        .eq('cryptocurrency_id', cryptoId);

      if (error) throw error;

      toast.success('Cryptocurrency removed successfully');
      refetchPortfolio();
    } catch (error: any) {
      toast.error(`Failed to remove cryptocurrency: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAdjustBalance = async (action: 'add' | 'remove') => {
    if (!balanceAmount || parseFloat(balanceAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    try {
      // First get current balance using the correct field name
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('demo_balance_usd')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      const currentBalance = currentProfile.demo_balance_usd || 0;
      const adjustmentAmount = parseFloat(balanceAmount);
      const newBalance = action === 'add' 
        ? currentBalance + adjustmentAmount 
        : Math.max(0, currentBalance - adjustmentAmount);

      const { error } = await supabase
        .from('profiles')
        .update({ demo_balance_usd: newBalance })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`Balance ${action === 'add' ? 'increased' : 'decreased'} successfully`);
      setBalanceAmount('');
    } catch (error: any) {
      toast.error(`Failed to adjust balance: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Portfolio */}
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Current Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent>
          {portfolio.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No cryptocurrency holdings</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolio.map((holding) => (
                  <TableRow key={holding.cryptocurrency_id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {holding.crypto?.logo_url ? (
                          <img 
                            src={holding.crypto.logo_url} 
                            alt={holding.crypto.symbol}
                            className="w-8 h-8 rounded-full"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                            {holding.crypto?.symbol?.slice(0, 2).toUpperCase() || 'CR'}
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{holding.crypto?.name || 'Unknown'}</div>
                          <div className="text-xs text-muted-foreground">{holding.crypto?.symbol?.toUpperCase() || 'N/A'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono">
                        {formatCryptoQuantity(holding.quantity)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <FormattedNumber 
                        value={holding.current_value} 
                        type="currency"
                        showTooltip={false}
                        className="font-mono"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveCrypto(holding.cryptocurrency_id)}
                        disabled={isProcessing}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Cryptocurrency */}
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Add Cryptocurrency
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="crypto-select">Cryptocurrency</Label>
              <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cryptocurrency" />
                </SelectTrigger>
                <SelectContent>
                  {cryptocurrencies.map((crypto) => (
                    <SelectItem key={crypto.id} value={crypto.id}>
                      <div className="flex items-center gap-2">
                        {crypto.logo_url && (
                          <img 
                            src={crypto.logo_url} 
                            alt={crypto.symbol}
                            className="w-4 h-4 rounded-full"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <span className="font-medium">{crypto.symbol.toUpperCase()}</span>
                        <span className="text-muted-foreground">{crypto.name}</span>
                      </div>
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
                className="bg-transparent"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAddCrypto}
                disabled={isProcessing || !selectedCrypto || !cryptoAmount}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Crypto
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance Management */}
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Balance Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="balance-amount">Amount (USD)</Label>
              <Input
                id="balance-amount"
                type="number"
                placeholder="0.00"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                className="bg-transparent"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => handleAdjustBalance('add')}
                disabled={isProcessing || !balanceAmount}
                className="w-full"
                variant="default"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => handleAdjustBalance('remove')}
                disabled={isProcessing || !balanceAmount}
                className="w-full"
                variant="destructive"
              >
                <Minus className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserFinancialControls;
