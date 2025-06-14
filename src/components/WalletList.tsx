import React from 'react';
import { useExternalWallets, ExternalWallet } from '@/hooks/useExternalWallets';
import { useCryptocurrencies } from '@/hooks/useCryptocurrencies';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CryptoLogo from './CryptoLogo';
import { Trash2, Loader2, AlertCircle, ExternalLink, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import EditWalletModal from './EditWalletModal';

const statusStyles: { [key: string]: string } = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
  verified: 'bg-green-500/20 text-green-300 border-green-400/30',
  rejected: 'bg-red-500/20 text-red-300 border-red-400/30',
};

const WalletListItem: React.FC<{ wallet: ExternalWallet; logo_url?: string; onDelete: (id: string) => void; onEdit: (wallet: ExternalWallet) => void; isDeleting: boolean }> = ({ wallet, logo_url, onDelete, onEdit, isDeleting }) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg glass-hover">
      <div className="flex items-center gap-4">
        <CryptoLogo logo_url={logo_url} name={wallet.coin_symbol} symbol={wallet.coin_symbol} size="md" />
        <div>
          <p className="font-semibold">{wallet.wallet_label || `${wallet.coin_symbol} Wallet`}</p>
          <p className="text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-xs">{wallet.wallet_address}</p>
          <p className="text-xs text-muted-foreground">{wallet.network}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={`capitalize ${statusStyles[wallet.status]}`}>{wallet.status}</Badge>
        
        {wallet.status === 'rejected' && wallet.admin_notes && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help">
                <AlertCircle className="h-4 w-4 text-red-400" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs"><strong>Rejection Reason:</strong> {wallet.admin_notes}</p>
            </TooltipContent>
          </Tooltip>
        )}

        <span className="text-sm text-muted-foreground hidden md:block">{format(new Date(wallet.created_at), 'MMM d, yyyy')}</span>
        
        {wallet.screenshot_url && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" asChild>
                <a href={wallet.screenshot_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Screenshot</p>
            </TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => onEdit(wallet)} disabled={isDeleting}>
              <Pencil className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit Wallet</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => onDelete(wallet.id)} disabled={isDeleting}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete Wallet</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

const WalletList: React.FC = () => {
  const { wallets, isLoading, error, deleteWallet } = useExternalWallets();
  const { cryptocurrencies, loading: cryptosLoading } = useCryptocurrencies();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [editingWallet, setEditingWallet] = React.useState<ExternalWallet | null>(null);

  const cryptoMap = React.useMemo(() => {
    return new Map(cryptocurrencies.map(c => [c.symbol, c]));
  }, [cryptocurrencies]);

  const handleDelete = async (walletId: string) => {
    setDeletingId(walletId);
    try {
      await deleteWallet(walletId);
      toast({ title: 'Success', description: 'Wallet removed.' });
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
                  onDelete={handleDelete}
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
    </>
  );
};

export default WalletList;
