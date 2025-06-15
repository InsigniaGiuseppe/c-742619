
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Vault, Lock } from 'lucide-react';
import CryptoLogo from '@/components/CryptoLogo';
import FormattedNumber from '@/components/FormattedNumber';

interface IndividualVaultCardProps {
  crypto: {
    id: string;
    name: string;
    symbol: string;
    logo_url?: string;
    current_price: number;
  };
  availableBalance: number;
  onVault: (cryptoId: string, amount: number, durationDays: number) => void;
}

const IndividualVaultCard: React.FC<IndividualVaultCardProps> = ({
  crypto,
  availableBalance,
  onVault
}) => {
  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // APY rates based on duration and crypto type
  const getApyForDuration = (days: number) => {
    const topCoins = ['BTC', 'ETH', 'USDT', 'SOL'];
    const isTopCoin = topCoins.includes(crypto.symbol.toUpperCase());
    
    switch (days) {
      case 30:
        return isTopCoin ? 4.5 : 3.0;
      case 60:
        return isTopCoin ? 6.0 : 4.5;
      case 90:
        return isTopCoin ? 8.0 : 6.0;
      default:
        return 0;
    }
  };

  const durationOptions = [
    { days: 30, label: '30 Days' },
    { days: 60, label: '60 Days' },
    { days: 90, label: '90 Days' }
  ];

  const currentApy = selectedDuration ? getApyForDuration(parseInt(selectedDuration)) : 0;
  const vaultAmount = parseFloat(amount) || 0;
  const estimatedReturn = vaultAmount * (currentApy / 100) * (parseInt(selectedDuration) || 0) / 365;

  const handleVault = async () => {
    if (!selectedDuration || !amount || vaultAmount <= 0 || vaultAmount > availableBalance) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onVault(crypto.id, vaultAmount, parseInt(selectedDuration));
      setAmount('');
      setSelectedDuration('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canVault = selectedDuration && amount && vaultAmount > 0 && vaultAmount <= availableBalance;

  return (
    <Card className="glass glass-hover hover:bg-white/15">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <CryptoLogo 
            logo_url={crypto.logo_url}
            name={crypto.name}
            symbol={crypto.symbol}
            size="lg"
          />
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-white">
              <Vault className="w-5 h-5" />
              {crypto.symbol} Vault
            </CardTitle>
            <p className="text-sm text-muted-foreground">{crypto.name}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Available Balance */}
        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Available Balance:</span>
            <div className="text-right">
              <p className="font-semibold text-white">{availableBalance.toFixed(6)} {crypto.symbol}</p>
              <FormattedNumber 
                value={availableBalance * crypto.current_price} 
                type="currency" 
                showTooltip={false} 
                className="text-xs text-muted-foreground" 
              />
            </div>
          </div>
        </div>

        {/* Duration Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Lock Duration</label>
          <Select value={selectedDuration} onValueChange={setSelectedDuration}>
            <SelectTrigger className="bg-black/20 border-white/20">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map((option) => (
                <SelectItem key={option.days} value={option.days.toString()}>
                  <div className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30">
                      {getApyForDuration(option.days)}% APY
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Amount to Vault</label>
          <div className="relative">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={availableBalance}
              step="0.000001"
              className="bg-black/20 border-white/20 pr-20"
              placeholder="0.000000"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAmount(availableBalance.toString())}
              className="absolute right-1 top-1 h-8 px-2 text-xs text-green-400 hover:text-green-300"
            >
              MAX
            </Button>
          </div>
          {amount && vaultAmount > availableBalance && (
            <p className="text-xs text-red-400">Insufficient balance</p>
          )}
        </div>

        {/* Estimated Returns */}
        {selectedDuration && vaultAmount > 0 && vaultAmount <= availableBalance && (
          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">APY:</span>
                <span className="text-green-400 font-semibold">{currentApy}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Return:</span>
                <span className="text-green-400 font-semibold">
                  +{estimatedReturn.toFixed(6)} {crypto.symbol}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total at Maturity:</span>
                <span className="text-white font-semibold">
                  {(vaultAmount + estimatedReturn).toFixed(6)} {crypto.symbol}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Vault Button */}
        <Button
          onClick={handleVault}
          disabled={!canVault || isSubmitting}
          className="w-full bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
        >
          <Lock className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Vaulting...' : 'Lock in Vault'}
        </Button>

        {availableBalance === 0 && (
          <p className="text-xs text-center text-muted-foreground">
            No {crypto.symbol} available to vault
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default IndividualVaultCard;
