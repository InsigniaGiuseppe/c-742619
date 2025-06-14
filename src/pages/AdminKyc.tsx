
import React, { useState } from 'react';
import { useAdminKycSubmissions, AdminKycSubmission } from '@/hooks/useAdminKycSubmissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const statusColors: { [key: string]: string } = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
  verified: 'bg-green-500/20 text-green-300 border-green-400/30',
  rejected: 'bg-red-500/20 text-red-300 border-red-400/30',
  not_started: 'bg-gray-500/20 text-gray-300 border-gray-400/30',
};

const AdminKyc = () => {
  const { submissions, isLoading, isError, error, updateKycStatus, isUpdating } = useAdminKycSubmissions();
  const { toast } = useToast();
  const [selectedSubmission, setSelectedSubmission] = useState<AdminKycSubmission | null>(null);
  const [actionType, setActionType] = useState<'verified' | 'rejected' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const handleActionClick = (submission: AdminKycSubmission, type: 'verified' | 'rejected') => {
    setSelectedSubmission(submission);
    setActionType(type);
    setAdminNotes(submission.admin_notes || '');
  };

  const handleCloseDialog = () => {
    setSelectedSubmission(null);
    setActionType(null);
    setAdminNotes('');
  };

  const handleSubmit = async () => {
    if (!selectedSubmission || !actionType) return;
    
    try {
      await updateKycStatus({
        kycId: selectedSubmission.id,
        newStatus: actionType,
        adminNotes: adminNotes,
      });
      toast({
        title: 'Success',
        description: `KYC submission has been ${actionType}.`,
      });
      handleCloseDialog();
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e.message || `Failed to update KYC status.`,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Card className="glass">
        <CardHeader>
          <CardTitle>KYC Submissions</CardTitle>
          <CardDescription>Review and manage user KYC document submissions.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : isError ? (
            <div className="text-red-400 flex items-center gap-2"><AlertCircle className="h-4 w-4" /><span>Error: {error}</span></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div className="font-medium">{submission.profiles?.full_name || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{submission.profiles?.email}</div>
                    </TableCell>
                    <TableCell className="capitalize">{submission.document_type.replace(/_/g, ' ')}</TableCell>
                    <TableCell>{format(new Date(submission.created_at), 'MMM d, yyyy, h:mm a')}</TableCell>
                    <TableCell>
                      <Badge className={`capitalize ${statusColors[submission.status]}`}>{submission.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={submission.document_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                       {submission.status === 'pending' && (
                         <>
                          <Button size="sm" variant="outline" className="text-green-400 border-green-400 hover:bg-green-400/10 hover:text-green-300" onClick={() => handleActionClick(submission, 'verified')}>Approve</Button>
                          <Button size="sm" variant="outline" className="text-red-400 border-red-400 hover:bg-red-400/10 hover:text-red-300" onClick={() => handleActionClick(submission, 'rejected')}>Reject</Button>
                         </>
                       )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedSubmission} onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}>
        <DialogContent className="sm:max-w-[425px] glass">
          <DialogHeader>
            <DialogTitle>Confirm Action: {actionType === 'verified' ? 'Approve' : 'Reject'} KYC</DialogTitle>
            <DialogDescription>
              You are about to {actionType} the KYC submission for {selectedSubmission?.profiles?.email}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="admin-notes">Admin Notes</Label>
            <Textarea
              id="admin-notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Provide a reason for rejection or internal notes for approval..."
              className="bg-transparent"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isUpdating}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUpdating ? 'Submitting...' : `Confirm ${actionType === 'verified' ? 'Approval' : 'Rejection'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminKyc;
