
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUp, Euro, Bitcoin } from 'lucide-react';
import { toast } from 'sonner';
import { usePortfolio } from '@/hooks/usePortfolio';

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type WithdrawType = 'selection' | 'eur' | 'crypto';

const WithdrawModal: React.FC<WithdrawModalProps> = ({ open, onOpenChange }) => {
  const { portfolio } = usePortfolio();
  const [withdrawType, setWithdrawType] = useState<WithdrawType>('selection');
  const [amount, setAmount] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock verified wallets - in real app, fetch from useExternalWallets
  const verifiedWallets = [
    { id: '1', label: 'My BTC Wallet', address: '1A1zP1eP5Q...', coin: 'BTC' },
    { id: '2', label: 'Personal ETH', address: '0x742d35Cc...', coin: 'ETH' },
  ];

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (withdrawType === 'eur') {
        toast.success(`EUR withdrawal of €${amount} initiated to your verified bank account`);
      } else {
        const crypto = portfolio?.find(p => p.crypto.id === selectedCrypto);
        toast.success(`${crypto?.crypto.symbol} withdrawal of ${amount} initiated to your verified wallet`);
      }
      
      resetModal();
    } catch (error) {
      toast.error('Withdrawal failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setWithdrawType('selection');
    setAmount('');
    setSelectedCrypto('');
    setSelectedWallet('');
    onOpenChange(false);
  };

  const renderSelectionStep = () => (
    <div className="space-y-4">
      <p className="text-center text-muted-foreground mb-6">
        What would you like to withdraw?
      </p>
      
      <div className="grid gap-3">
        <Button
          variant="outline"
          onClick={() => setWithdrawType('eur')}
          className="h-20 flex flex-col gap-2 hover:bg-blue-50/10 hover:border-blue-500/30"
        >
          <Euro className="w-8 h-8 text-blue-400" />
          <span className="font-medium">EUR</span>
          <span className="text-xs text-muted-foreground">To bank account</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setWithdrawType('crypto')}
          className="h-20 flex flex-col gap-2 hover:bg-orange-50/10 hover:border-orange-500/30"
        >
          <Bitcoin className="w-8 h-8 text-orange-400" />
          <span className="font-medium">Crypto</span>
          <span className="text-xs text-muted-foreground">To external wallet</span>
        </Button>
      </div>
    </div>
  );

  const renderEurWithdraw = () => (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-400 mb-2">
          Funds will be sent to your verified bank account.
        </p>
        <p className="text-sm text-muted-foreground font-mono">
          IBAN: NL91 ABNA 0417 1643 00
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="eur-amount">Amount (EUR)</Label>
        <Input
          id="eur-amount"
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="1"
          step="0.01"
        />
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => setWithdrawType('selection')}
          className="flex-1"
        >
          Back
        </Button>
        <Button 
          onClick={handleWithdraw}
          disabled={loading || !amount}
          className="flex-1"
        >
          {loading ? 'Processing...' : 'Confirm Withdrawal'}
        </Button>
      </div>
    </div>
  );

  const renderCryptoWithdraw = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select Cryptocurrency</Label>
        <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
          <SelectTrigger>
            <SelectValue placeholder="Choose crypto to withdraw" />
          </SelectTrigger>
          <SelectContent>
            {portfolio?.map((item) => (
              <SelectItem key={item.crypto.id} value={item.crypto.id}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.crypto.symbol}</span>
                  <span className="text-muted-foreground">
                    ({item.quantity.toFixed(6)} available)
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Select Verified Wallet</Label>
        <Select value={selectedWallet} onValueChange={setSelectedWallet}>
          <SelectTrigger>
            <SelectValue placeholder="Choose wallet address" />
          </SelectTrigger>
          <SelectContent>
            {verifiedWallets
              .filter(wallet => !selectedCrypto || wallet.coin === portfolio?.find(p => p.crypto.id === selectedCrypto)?.crypto.symbol)
              .map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{wallet.label}</span>
                    <span className="text-xs text-muted-foreground">{wallet.address}</span>
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="crypto-amount">Amount</Label>
        <Input
          id="crypto-amount"
          type="number"
          placeholder="0.00000000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0.00000001"
          step="0.00000001"
        />
        {selectedCrypto && (
          <p className="text-xs text-muted-foreground">
            Network: {portfolio?.find(p => p.crypto.id === selectedCrypto)?.crypto.symbol === 'BTC' ? 'Bitcoin' : 'Ethereum'}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => setWithdrawType('selection')}
          className="flex-1"
        >
          Back
        </Button>
        <Button 
          onClick={handleWithdraw}
          disabled={loading || !amount || !selectedCrypto || !selectedWallet}
          className="flex-1"
        >
          {loading ? 'Processing...' : 'Confirm Withdrawal'}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(open) => !open && resetModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUp className="w-5 h-5 text-red-400" />
            Withdraw Funds
          </DialogTitle>
        </DialogHeader>
        
        {withdrawType === 'selection' && renderSelectionStep()}
        {withdrawType === 'eur' && renderEurWithdraw()}
        {withdrawType === 'crypto' && renderCryptoWithdraw()}
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawModal;
