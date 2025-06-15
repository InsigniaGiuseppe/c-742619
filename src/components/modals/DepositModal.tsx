
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DepositModal: React.FC<DepositModalProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setLoading(true);
    try {
      const depositAmount = parseFloat(amount);
      
      // Get current balance
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('demo_balance_usd')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      const currentBalance = currentProfile.demo_balance_usd || 0;
      const newBalance = currentBalance + depositAmount;

      console.log('[DepositModal] Deposit transaction:', {
        currentBalance,
        depositAmount,
        newBalance,
        userId: user.id
      });

      // Update user balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ demo_balance_usd: newBalance })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Create transaction history entry
      const { error: transactionError } = await supabase
        .from('transaction_history')
        .insert({
          user_id: user.id,
          transaction_type: 'deposit_ideal',
          usd_value: depositAmount,
          status: 'completed',
          description: `iDEAL deposit of €${amount}`
        });

      if (transactionError) {
        console.error('Transaction history error:', transactionError);
        // Don't throw here as the deposit succeeded
      }

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Deposit of €${amount} completed successfully`);
      setAmount('');
      onOpenChange(false);
      
      // Force refresh of user balance
      window.location.reload();
    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.error(`Deposit failed: ${error.message}`);
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
                  <div className="w-12 h-8 bg-white rounded flex items-center justify-center px-2">
                    <svg viewBox="0 0 100 40" className="w-full h-full">
                      <rect width="100" height="40" fill="#ff69b4" rx="4"/>
                      <text x="50" y="24" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">iDEAL</text>
                    </svg>
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
