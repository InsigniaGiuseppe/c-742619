
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAdminUser } from '@/hooks/useAdminUser';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import UserActions from '@/components/admin/UserActions';

const AdminUserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading, isError, error } = useAdminUser(id);

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'frozen': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'blocked': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const getKycStatusColor = (status: string | null) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      case 'not_started': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <TableRow>
      <TableCell className="font-medium text-muted-foreground w-1/3">{label}</TableCell>
      <TableCell>{value || 'N/A'}</TableCell>
    </TableRow>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <Table>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }

    if (isError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Fetching User Details</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'An unknown error occurred.'}
          </AlertDescription>
        </Alert>
      );
    }
    
    if (!user) {
        return <p className="text-center text-muted-foreground py-10">User not found.</p>
    }

    return (
      <Table>
        <TableBody>
          <DetailRow label="Full Name" value={user.full_name} />
          <DetailRow label="Username" value={user.username} />
          <DetailRow label="Email" value={user.email} />
          <DetailRow label="Account Status" value={<Badge className={getStatusColor(user.account_status)}>{user.account_status}</Badge>} />
          <DetailRow label="Account Type" value={user.account_type} />
          <DetailRow label="KYC Status" value={<Badge className={getKycStatusColor(user.kyc_status || 'not_started')}>{user.kyc_status?.replace(/_/g, ' ') || 'Not Started'}</Badge>} />
          <DetailRow label="Registered At" value={new Date(user.created_at!).toLocaleString()} />
          <DetailRow label="Last Login" value={user.last_login_date ? new Date(user.last_login_date).toLocaleString() : 'Never'} />
          <DetailRow label="Country" value={user.country} />
          <DetailRow label="Phone" value={user.phone} />
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-20 pt-24">
         <Button 
            onClick={() => navigate('/admin/users')}
            variant="outline" 
            className="glass mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to User Management
          </Button>
        <Card className="glass glass-hover">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-4">
              {isLoading ? <Skeleton className="w-40 h-8" /> : user?.full_name || user?.email}
              {!isLoading && user && <Badge className={getStatusColor(user.account_status)}>{user.account_status}</Badge>}
            </CardTitle>
            <CardDescription>
              {isLoading ? <Skeleton className="w-64 h-4" /> : `User ID: ${user?.id}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>

        {user && <UserActions user={user} />}
        
      </main>
      <Footer />
    </div>
  );
};

export default AdminUserDetailPage;
