
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import FormattedNumber from './FormattedNumber';
import CryptoLogo from './CryptoLogo';
import { useTrade } from '@/hooks/useTrade';
import { formatCryptoQuantity } from '@/lib/cryptoFormatters';

interface SellCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  holding: {
    cryptocurrency_id: string;
    quantity: number;
    current_value: number;
    crypto: {
      id: string;
      name: string;
      symbol: string;
      current_price: number;
      logo_url?: string;
    };
  };
}

const SellCryptoModal: React.FC<SellCryptoModalProps> = ({ isOpen, onClose, holding }) => {
  const [sellAmount, setSellAmount] = useState('');
  const [sellType, setSellType] = useState<'partial' | 'full'>('partial');
  const { 
    selectedCrypto, 
    setSelectedCrypto, 
    amount, 
    setAmount, 
    tradeType, 
    setTradeType,
    handleTrade, 
    isLoading 
  } = useTrade();

  const handleSellTypeChange = (type: 'partial' | 'full') => {
    setSellType(type);
    if (type === 'full') {
      setSellAmount(holding.quantity.toString());
    } else {
      setSellAmount('');
    }
  };

  const handleSell = async () => {
    const sellAmountValue = sellType === 'full' ? holding.quantity : parseFloat(sellAmount);
    
    if (sellAmountValue <= 0 || sellAmountValue > holding.quantity) {
      return;
    }

    try {
      // Set up the trade parameters
      setSelectedCrypto(holding.cryptocurrency_id);
      setAmount(sellAmountValue.toString());
      setTradeType('sell');
      
      // Execute the trade
      await handleTrade();
      
      onClose();
      setSellAmount('');
      setSellType('partial');
    } catch (error) {
      console.error('Error selling crypto:', error);
    }
  };

  const sellAmountNum = sellType === 'full' ? holding.quantity : parseFloat(sellAmount) || 0;
  const sellValue = sellAmountNum * holding.crypto.current_price;
  const isValidAmount = sellAmountNum > 0 && sellAmountNum <= holding.quantity;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <CryptoLogo 
              logo_url={holding.crypto.logo_url}
              name={holding.crypto.name}
              symbol={holding.crypto.symbol}
              size="sm"
            />
            Sell {holding.crypto.symbol}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Holdings Info */}
          <div className="bg-gray-800/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Available Balance:</span>
              <span className="font-mono">{formatCryptoQuantity(holding.quantity)} {holding.crypto.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Current Price:</span>
              <FormattedNumber value={holding.crypto.current_price} type="currency" showTooltip={false} />
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Value:</span>
              <FormattedNumber value={holding.current_value} type="currency" showTooltip={false} />
            </div>
          </div>

          {/* Sell Type Selection */}
          <div className="space-y-3">
            <Label>Sell Type</Label>
            <div className="flex gap-2">
              <Button
                variant={sellType === 'partial' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSellTypeChange('partial')}
              >
                Partial
              </Button>
              <Button
                variant={sellType === 'full' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSellTypeChange('full')}
              >
                Sell All
              </Button>
            </div>
          </div>

          {/* Amount Input */}
          {sellType === 'partial' && (
            <div className="space-y-2">
              <Label htmlFor="sell-amount">Amount to Sell</Label>
              <Input
                id="sell-amount"
                type="number"
                placeholder="0.00"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                max={holding.quantity}
                step="any"
                className="font-mono"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min: 0.00000001</span>
                <span>Max: {formatCryptoQuantity(holding.quantity)}</span>
              </div>
            </div>
          )}

          {/* Transaction Summary */}
          {sellAmountNum > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-blue-400">Transaction Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Selling:</span>
                  <span className="font-mono">{formatCryptoQuantity(sellAmountNum)} {holding.crypto.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span>You'll receive:</span>
                  <FormattedNumber value={sellValue} type="currency" showTooltip={false} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Trading fee:</span>
                  <span>~0.1%</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSell}
              disabled={!isValidAmount || isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Selling...' : `Sell ${holding.crypto.symbol}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SellCryptoModal;
