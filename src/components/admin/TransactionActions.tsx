
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useUpdateTransactionStatus } from '@/hooks/useAdminTransactions';
import { Enums } from '@/integrations/supabase/types';
import { CheckCircle, XCircle } from 'lucide-react';

interface TransactionActionsProps {
  orderId: string;
  currentStatus: Enums<'order_status_type'> | null;
}

const TransactionActions: React.FC<TransactionActionsProps> = ({ orderId, currentStatus }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [action, setAction] = useState<'completed' | 'rejected' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const { mutate: updateStatus, isPending } = useUpdateTransactionStatus();

  const handleActionClick = (newAction: 'completed' | 'rejected') => {
    setAction(newAction);
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!action) return;
    updateStatus({ orderId, status: action, adminNotes });
    setIsDialogOpen(false);
    setAdminNotes('');
  };

  if (currentStatus !== 'pending') {
    return null; // Don't show actions for non-pending orders
  }

  return (
    <>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="text-green-500 border-green-500 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-500/10" onClick={() => handleActionClick('completed')}>
          <CheckCircle className="w-4 h-4 mr-2" />
          Approve
        </Button>
        <Button size="sm" variant="outline" className="text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10" onClick={() => handleActionClick('rejected')}>
          <XCircle className="w-4 h-4 mr-2" />
          Reject
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>Confirm Transaction {action === 'completed' ? 'Approval' : 'Rejection'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
            <Textarea
              id="admin-notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Provide a reason or notes for this action..."
              className="bg-transparent"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="glass">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit} disabled={isPending} className="button-gradient">
              {isPending ? 'Submitting...' : `Confirm ${action === 'completed' ? 'Approval' : 'Rejection'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TransactionActions;
