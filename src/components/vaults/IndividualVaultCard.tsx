
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CryptoLogo from '@/components/CryptoLogo';
import FormattedNumber from '@/components/FormattedNumber';
import { toast } from 'sonner';

interface Crypto {
  id: string;
  name: string;
  symbol: string;
  logo_url: string;
  current_price: number;
}

interface IndividualVaultCardProps {
  crypto: Crypto;
  availableBalance: number;
  onVault: (cryptoId: string, amount: number, durationDays: number) => Promise<void>;
}

const IndividualVaultCard: React.FC<IndividualVaultCardProps> = ({
  crypto,
  availableBalance,
  onVault,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('30');
  const [isVaulting, setIsVaulting] = useState(false);

  const handleVault = async () => {
    const vaultAmount = parseFloat(amount);
    const vaultDuration = parseInt(duration);

    if (!vaultAmount || vaultAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (vaultAmount > availableBalance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsVaulting(true);
    try {
      await onVault(crypto.id, vaultAmount, vaultDuration);
      setIsDialogOpen(false);
      setAmount('');
    } catch (error) {
      console.error('Vault error:', error);
    } finally {
      setIsVaulting(false);
    }
  };

  const getAPY = (days: number) => {
    // Simple APY calculation based on duration
    const baseAPY = 5; // 5% base APY
    const bonusAPY = Math.floor(days / 30) * 2; // 2% bonus per 30 days
    return Math.min(baseAPY + bonusAPY, 15); // Cap at 15%
  };

  const selectedAPY = getAPY(parseInt(duration));

  return (
    <Card className="glass glass-hover hover:bg-white/15 h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <CryptoLogo
            logo_url={crypto.logo_url}
            name={crypto.name}
            symbol={crypto.symbol}
            className="w-8 h-8"
          />
          <div>
            <div className="font-semibold">{crypto.name}</div>
            <div className="text-sm text-muted-foreground">{crypto.symbol} Vault</div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Available Balance</span>
            <div className="text-right">
              <div className="font-semibold">
                <FormattedNumber value={availableBalance} type="price" /> {crypto.symbol}
              </div>
              <div className="text-xs text-muted-foreground">
                ≈ <FormattedNumber value={availableBalance * crypto.current_price} type="currency" />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Est. APY</span>
            <span className="font-semibold text-green-400">5-15%</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Min. Duration</span>
            <span className="font-semibold">30 days</span>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full" 
              disabled={availableBalance <= 0}
            >
              {availableBalance > 0 ? 'Vault Crypto' : 'No Balance'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CryptoLogo
                  logo_url={crypto.logo_url}
                  name={crypto.name}
                  symbol={crypto.symbol}
                  className="w-6 h-6"
                />
                Vault {crypto.symbol}
              </DialogTitle>
              <DialogDescription>
                Lock your {crypto.symbol} to earn passive income with daily payouts.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Vault</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  max={availableBalance}
                  step="0.00000001"
                />
                <div className="text-xs text-muted-foreground">
                  Available: <FormattedNumber value={availableBalance} type="price" /> {crypto.symbol}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Lock Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days ({getAPY(30)}% APY)</SelectItem>
                    <SelectItem value="60">60 days ({getAPY(60)}% APY)</SelectItem>
                    <SelectItem value="90">90 days ({getAPY(90)}% APY)</SelectItem>
                    <SelectItem value="180">180 days ({getAPY(180)}% APY)</SelectItem>
                    <SelectItem value="365">365 days ({getAPY(365)}% APY)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Vault Amount</span>
                  <span>{amount || '0'} {crypto.symbol}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Duration</span>
                  <span>{duration} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Est. APY</span>
                  <span className="text-green-400">{selectedAPY}%</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span>Est. Daily Yield</span>
                  <span className="text-green-400">
                    {amount ? ((parseFloat(amount) * selectedAPY / 100) / 365).toFixed(8) : '0'} {crypto.symbol}
                  </span>
                </div>
              </div>

              <Button 
                onClick={handleVault} 
                disabled={isVaulting || !amount || parseFloat(amount) <= 0}
                className="w-full"
              >
                {isVaulting ? 'Creating Vault...' : 'Confirm Vault'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default IndividualVaultCard;
