import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, AlertCircle, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuditLogs, AdminAuditLogEntry } from '@/hooks/useAdminAuditLogs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AdminAuditLog = () => {
  const navigate = useNavigate();
  const { data: logs, isLoading, isError, error } = useAdminAuditLogs();

  const getActionTypeColor = (actionType: string) => {
    if (actionType.includes('update')) return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    if (actionType.includes('create')) return 'bg-green-500/20 text-green-400 border border-green-500/30';
    if (actionType.includes('delete') || actionType.includes('block')) return 'bg-red-500/20 text-red-400 border border-red-500/30';
    return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  };
  
  const renderUser = (user: AdminAuditLogEntry['admin'] | AdminAuditLogEntry['target_user']) => {
    if (!user) return <span className="text-muted-foreground">N/A</span>;
    return (
      <div className="flex flex-col">
        <span className="font-medium">{user.full_name || 'N/A'}</span>
        <span className="text-xs text-muted-foreground">{user.email || 'N/A'}</span>
      </div>
    );
  };

  const renderTableContent = () => {
    if (isLoading) {
      return Array.from({ length: 10 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton className="h-4 w-full" /></TableCell>
          <TableCell><Skeleton className="h-8 w-[150px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
          <TableCell><Skeleton className="h-8 w-[150px]" /></TableCell>
          <TableCell><Skeleton className="h-12 w-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
        </TableRow>
      ));
    }

    if (isError) {
      return (
        <TableRow>
          <TableCell colSpan={6}>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Fetching Logs</AlertTitle>
              <AlertDescription>
                {error.message}
              </AlertDescription>
            </Alert>
          </TableCell>
        </TableRow>
      );
    }

    if (!logs || logs.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-10">
            No audit logs found.
          </TableCell>
        </TableRow>
      );
    }

    return logs.map((log) => (
      <TableRow key={log.id} className="hover:bg-muted/5">
        <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
        <TableCell>{renderUser(log.admin)}</TableCell>
        <TableCell><Badge className={getActionTypeColor(log.action_type)}>{log.action_type}</Badge></TableCell>
        <TableCell>{renderUser(log.target_user)}</TableCell>
        <TableCell>
          <pre className="bg-background/50 p-2 rounded-md text-xs whitespace-pre-wrap">
            {JSON.stringify(log.details, null, 2)}
          </pre>
        </TableCell>
        <TableCell>{log.ip_address}</TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-20 pt-24">
        <Button 
          onClick={() => navigate('/admin')}
          variant="outline" 
          className="glass mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Admin Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-4">
          <History className="w-10 h-10" />
          <div>
            <h1 className="text-4xl font-bold">Admin Audit Log</h1>
            <p className="text-muted-foreground">A chronological log of all administrator actions.</p>
          </div>
        </div>

        <Card className="glass glass-hover">
          <CardHeader>
            <CardTitle>Recent Actions</CardTitle>
            <CardDescription>Showing the last 100 recorded actions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target User</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>IP Address</TableHead>
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
    </div>
  );
};

export default AdminAuditLog;
