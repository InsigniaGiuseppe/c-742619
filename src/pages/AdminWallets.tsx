
import React, { useState, useMemo } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, AlertCircle, Wallet, Loader2, Check, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminWallets, AdminExternalWallet } from '@/hooks/useAdminWallets';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { format } from 'date-fns';

const statusStyles: { [key: string]: string } = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
  verified: 'bg-green-500/20 text-green-300 border-green-400/30',
  rejected: 'bg-red-500/20 text-red-300 border-red-400/30',
};

const AdminWallets = () => {
  const navigate = useNavigate();
  const { wallets, isLoading, isError, error, updateWalletStatus, isUpdating } = useAdminWallets();

  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<AdminExternalWallet | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [walletToUpdate, setWalletToUpdate] = useState<string | null>(null);

  const handleRejectClick = (wallet: AdminExternalWallet) => {
    setSelectedWallet(wallet);
    setRejectionModalOpen(true);
  };

  const handleApproveClick = async (wallet: AdminExternalWallet) => {
    setWalletToUpdate(wallet.id);
    try {
      await updateWalletStatus({
        walletId: wallet.id,
        newStatus: 'verified',
        adminNotes: 'Approved by admin.',
      });
      toast.success('Wallet approved successfully.');
    } catch (e: any) {
      toast.error(e.message || 'Failed to approve wallet.');
    } finally {
      setWalletToUpdate(null);
    }
  };

  const confirmRejection = async () => {
    if (!selectedWallet || !rejectionReason) return;
    setWalletToUpdate(selectedWallet.id);
    try {
      await updateWalletStatus({
        walletId: selectedWallet.id,
        newStatus: 'rejected',
        adminNotes: rejectionReason,
      });
      toast.success('Wallet rejected successfully.');
      setRejectionModalOpen(false);
      setSelectedWallet(null);
      setRejectionReason('');
    } catch (e: any)
    {
      toast.error(e.message || 'Failed to reject wallet.');
    } finally {
      setWalletToUpdate(null);
    }
  };

  const filteredWallets = useMemo(() => {
    return wallets.filter(wallet => {
      const statusMatch = statusFilter === 'all' || wallet.status === statusFilter;
      const searchLower = searchTerm.toLowerCase();
      const searchMatch = !searchTerm || 
        wallet.wallet_address.toLowerCase().includes(searchLower) ||
        wallet.user_id.toLowerCase().includes(searchLower) ||
        (wallet.profiles?.email?.toLowerCase().includes(searchLower)) ||
        (wallet.profiles?.full_name?.toLowerCase().includes(searchLower)) ||
        (wallet.wallet_label?.toLowerCase().includes(searchLower));

      return statusMatch && searchMatch;
    });
  }, [wallets, statusFilter, searchTerm]);
  
  const renderUser = (wallet: AdminExternalWallet) => {
    if (!wallet.profiles) return <span className="text-muted-foreground">{wallet.user_id}</span>;
    return (
      <div className="flex flex-col">
        <span className="font-medium">{wallet.profiles.full_name || 'N/A'}</span>
        <span className="text-xs text-muted-foreground">{wallet.profiles.email || 'N/A'}</span>
      </div>
    );
  };
  
  const renderTableContent = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton className="h-8 w-[150px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
          <TableCell><Skeleton className="h-8 w-[180px]" /></TableCell>
        </TableRow>
      ));
    }

    if (isError) {
      return (
        <TableRow>
          <TableCell colSpan={7}>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Fetching Wallets</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </TableCell>
        </TableRow>
      );
    }

    if (!filteredWallets || filteredWallets.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-10">
            No wallets match the current filters.
          </TableCell>
        </TableRow>
      );
    }

    return filteredWallets.map((wallet) => (
      <TableRow key={wallet.id} className="hover:bg-muted/5">
        <TableCell>{renderUser(wallet)}</TableCell>
        <TableCell>
          <p className="font-medium">{wallet.wallet_label || 'Unlabeled'}</p>
          <p className="text-xs text-muted-foreground">{wallet.coin_symbol}</p>
        </TableCell>
        <TableCell>
          <p className="font-mono text-sm">{wallet.wallet_address}</p>
          <p className="text-xs text-muted-foreground">{wallet.network}</p>
        </TableCell>
        <TableCell>
          <Badge className={`capitalize ${statusStyles[wallet.status]}`}>{wallet.status}</Badge>
        </TableCell>
        <TableCell className="text-xs text-muted-foreground">{format(new Date(wallet.created_at), 'MMM d, yyyy, p')}</TableCell>
        <TableCell className="text-right">
          {wallet.status === 'pending' && (
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" className="text-green-400 border-green-400/50 hover:bg-green-400/10 hover:text-green-300" onClick={() => handleApproveClick(wallet)} disabled={isUpdating}>
                {isUpdating && walletToUpdate === wallet.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Approve
              </Button>
              <Button size="sm" variant="outline" className="text-red-400 border-red-400/50 hover:bg-red-400/10 hover:text-red-300" onClick={() => handleRejectClick(wallet)} disabled={isUpdating}>
                 <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          )}
        </TableCell>
        <TableCell>
            {wallet.screenshot_url && (
                <Button variant="ghost" size="icon" asChild>
                  <a href={wallet.screenshot_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
            )}
        </TableCell>
      </TableRow>
    ));
  };
  
  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-20 pt-24">
        <Button onClick={() => navigate('/admin')} variant="outline" className="glass mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Admin Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-4">
          <Wallet className="w-10 h-10" />
          <div>
            <h1 className="text-4xl font-bold">Wallet Verifications</h1>
            <p className="text-muted-foreground">Approve or reject user-submitted external wallets.</p>
          </div>
        </div>

        <Card className="glass glass-hover">
          <CardHeader>
             <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search by user, address, label..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm bg-transparent"
              />
              <ToggleGroup
                type="single"
                value={statusFilter}
                onValueChange={(value) => {
                    if (value) setStatusFilter(value);
                }}
                className="w-full sm:w-auto"
              >
                <ToggleGroupItem value="all">All</ToggleGroupItem>
                <ToggleGroupItem value="pending">Pending</ToggleGroupItem>
                <ToggleGroupItem value="verified">Verified</ToggleGroupItem>
                <ToggleGroupItem value="rejected">Rejected</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    <TableHead>Screenshot</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renderTableContent()}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
      
      <Dialog open={rejectionModalOpen} onOpenChange={setRejectionModalOpen}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>Reject Wallet</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this wallet. This will be visible to the user.
            </DialogDescription>
          </DialogHeader>
          <Textarea 
            placeholder="e.g., Invalid address, screenshot unclear..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="bg-transparent"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectionModalOpen(false)}>Cancel</Button>
            <Button onClick={confirmRejection} disabled={!rejectionReason || isUpdating}>
              {isUpdating && walletToUpdate === selectedWallet?.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWallets;
