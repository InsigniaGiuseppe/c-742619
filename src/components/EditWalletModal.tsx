
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ExternalWallet, useExternalWallets } from '@/hooks/useExternalWallets';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const walletSchema = z.object({
  wallet_label: z.string().optional(),
  wallet_address: z.string().min(1, 'Wallet address is required.'),
  network: z.string().min(1, 'Network is required.'),
});

type WalletFormData = z.infer<typeof walletSchema>;

interface EditWalletModalProps {
  wallet: ExternalWallet | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditWalletModal: React.FC<EditWalletModalProps> = ({ wallet, isOpen, onClose }) => {
  const { updateWallet } = useExternalWallets();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<WalletFormData>({
    resolver: zodResolver(walletSchema),
  });

  useEffect(() => {
    if (wallet) {
      reset({
        wallet_label: wallet.wallet_label || '',
        wallet_address: wallet.wallet_address,
        network: wallet.network,
      });
    }
  }, [wallet, reset]);

  const onSubmit = async (data: WalletFormData) => {
    if (!wallet) return;
    setIsUpdating(true);
    try {
      await updateWallet({
        id: wallet.id,
        ...data,
      });
      toast({ title: 'Success', description: 'Wallet updated successfully. It will be reviewed again.' });
      onClose();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update wallet.', variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!wallet) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] glass">
        <DialogHeader>
          <DialogTitle>Edit Wallet</DialogTitle>
          <DialogDescription>
            Make changes to your wallet. Updating will reset its status to pending for re-verification.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="wallet_label">Label (Optional)</Label>
            <Input id="wallet_label" {...register('wallet_label')} className="bg-transparent" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wallet_address">Address</Label>
            <Input id="wallet_address" {...register('wallet_address')} className="bg-transparent" />
            {errors.wallet_address && <p className="text-red-500 text-sm px-1">{errors.wallet_address.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="network">Network</Label>
            <Input id="network" {...register('network')} className="bg-transparent" />
            {errors.network && <p className="text-red-500 text-sm px-1">{errors.network.message}</p>}
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isUpdating}>Cancel</Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditWalletModal;
