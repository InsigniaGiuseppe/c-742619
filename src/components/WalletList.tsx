
import React from 'react';
import { useExternalWallets, ExternalWallet } from '@/hooks/useExternalWallets';
import { useCryptocurrencies } from '@/hooks/useCryptocurrencies';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import EditWalletModal from './EditWalletModal';
import WalletListItem from './WalletListItem';

const WalletList: React.FC = () => {
  const { wallets, isLoading, error, deleteWallet } = useExternalWallets();
  const { cryptocurrencies, loading: cryptosLoading } = useCryptocurrencies();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [editingWallet, setEditingWallet] = React.useState<ExternalWallet | null>(null);
  const [walletToDelete, setWalletToDelete] = React.useState<ExternalWallet | null>(null);

  const cryptoMap = React.useMemo(() => {
    return new Map(cryptocurrencies.map(c => [c.symbol, c]));
  }, [cryptocurrencies]);

  const handleDelete = async (walletId: string) => {
    setDeletingId(walletId);
    try {
      await deleteWallet(walletId);
      toast({ title: 'Success', description: 'Wallet removed.' });
      setWalletToDelete(null);
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to remove wallet.', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (wallet: ExternalWallet) => {
    setEditingWallet(wallet);
  };

  const handleCloseModal = () => {
    setEditingWallet(null);
  };
  
  const handleRequestDelete = (wallet: ExternalWallet) => {
    setWalletToDelete(wallet);
  };

  if (isLoading || cryptosLoading) {
    return (
      <Card className="glass">
        <CardHeader><CardTitle>My Wallets</CardTitle></CardHeader>
        <CardContent className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass">
        <CardHeader><CardTitle>My Wallets</CardTitle></CardHeader>
        <CardContent className="text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>Error loading wallets: {error}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass">
        <CardHeader>
          <CardTitle>My Wallets</CardTitle>
        </CardHeader>
        <CardContent>
          {wallets.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">You have not added any external wallets yet.</p>
          ) : (
            <div className="space-y-4">
              {wallets.map(wallet => (
                <WalletListItem 
                  key={wallet.id}
                  wallet={wallet}
                  logo_url={cryptoMap.get(wallet.coin_symbol)?.logo_url}
                  onDelete={handleRequestDelete}
                  onEdit={handleEdit}
                  isDeleting={deletingId === wallet.id}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <EditWalletModal
        wallet={editingWallet}
        isOpen={!!editingWallet}
        onClose={handleCloseModal}
      />
      <AlertDialog open={!!walletToDelete} onOpenChange={(isOpen) => !isOpen && setWalletToDelete(null)}>
        <AlertDialogContent className="glass">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your{' '}
              <span className="font-bold text-foreground">
                {walletToDelete?.wallet_label || `${walletToDelete?.coin_symbol} Wallet`}
              </span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setWalletToDelete(null)} disabled={!!deletingId}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => walletToDelete && handleDelete(walletToDelete.id)} 
              disabled={!!deletingId}
            >
              {deletingId === walletToDelete?.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WalletList;
