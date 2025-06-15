
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
import { Badge } from '@/components/ui/badge';
import { ArrowDown, CreditCard, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DepositModal: React.FC<DepositModalProps> = ({ open, onOpenChange }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      // Simulate deposit process
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Deposit of €${amount} initiated via iDEAL`);
      setAmount('');
      onOpenChange(false);
    } catch (error) {
      toast.error('Deposit failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowDown className="w-5 h-5 text-green-500" />
            Top Up Balance
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Payment Methods */}
          <div className="space-y-3">
            <Label>Payment Method</Label>
            <div className="grid gap-2">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50/10 border-green-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">iD</span>
                  </div>
                  <span className="font-medium">iDEAL</span>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Available
                </Badge>
              </div>
              
              {/* Future payment methods */}
              <div className="flex items-center justify-between p-3 border rounded-lg opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <Building2 className="w-8 h-8 text-muted-foreground" />
                  <span className="text-muted-foreground">SEPA Transfer</span>
                </div>
                <Badge variant="outline" className="text-muted-foreground">
                  Coming Soon
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-8 h-8 text-muted-foreground" />
                  <span className="text-muted-foreground">Credit Card</span>
                </div>
                <Badge variant="outline" className="text-muted-foreground">
                  Coming Soon
                </Badge>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (EUR)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="0.01"
            />
            <p className="text-xs text-muted-foreground">
              Minimum deposit: €1.00
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeposit}
              disabled={loading || !amount}
              className="flex-1 bg-green-500 hover:bg-green-600"
            >
              {loading ? 'Processing...' : `Deposit €${amount || '0.00'}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DepositModal;
