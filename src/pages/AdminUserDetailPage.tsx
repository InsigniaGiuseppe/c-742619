
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAdminUser } from '@/hooks/useAdminUser';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, User, CreditCard, FileText, Activity } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserActions from '@/components/admin/UserActions';
import UserActivityLog from '@/components/admin/UserActivityLog';

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

  const renderPersonalInfo = () => {
    if (isLoading) {
      return (
        <Table>
          <TableBody>
            {Array.from({ length: 12 }).map((_, i) => (
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
      <div className="space-y-6">
        <Table>
          <TableBody>
            <DetailRow label="User ID" value={<code className="text-xs bg-muted px-2 py-1 rounded">{user.id}</code>} />
            <DetailRow label="Full Name" value={user.full_name ? String(user.full_name) : null} />
            <DetailRow label="Username" value={user.username ? String(user.username) : null} />
            <DetailRow label="Email" value={user.email ? String(user.email) : null} />
            <DetailRow label="Account Status" value={<Badge className={getStatusColor(user.account_status)}>{user.account_status}</Badge>} />
            <DetailRow label="Account Type" value={user.account_type ? String(user.account_type) : null} />
            <DetailRow label="KYC Status" value={<Badge className={getKycStatusColor(user.kyc_status || 'not_started')}>{user.kyc_status?.replace(/_/g, ' ') || 'Not Started'}</Badge>} />
            <DetailRow label="Is Admin" value={user.is_admin ? <Badge className="bg-purple-500/20 text-purple-400">Yes</Badge> : 'No'} />
            <DetailRow label="Date of Birth" value={user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'Not provided'} />
            <DetailRow label="Phone" value={user.phone ? String(user.phone) : null} />
            <DetailRow label="Address" value={user.address ? String(user.address) : null} />
            <DetailRow label="City" value={user.city ? String(user.city) : null} />
            <DetailRow label="Postal Code" value={user.postal_code ? String(user.postal_code) : null} />
            <DetailRow label="Country" value={user.country ? String(user.country) : null} />
            <DetailRow label="Demo Balance (USD)" value={user.demo_balance_usd ? `$${Number(user.demo_balance_usd).toLocaleString()}` : '$0'} />
            <DetailRow label="Registered At" value={new Date(user.created_at!).toLocaleString()} />
            <DetailRow label="Last Updated" value={new Date(user.updated_at!).toLocaleString()} />
            <DetailRow label="Last Login" value={user.last_login_date ? new Date(user.last_login_date).toLocaleString() : 'Never'} />
            <DetailRow label="Last Login IP" value={user.last_login_ip ? String(user.last_login_ip) : 'N/A'} />
            <DetailRow label="2FA Enabled" value={user.two_factor_enabled ? <Badge className="bg-green-500/20 text-green-400">Yes</Badge> : 'No'} />
            <DetailRow label="IBAN" value={user.bank_details_iban ? String(user.bank_details_iban) : 'Not provided'} />
          </TableBody>
        </Table>
      </div>
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

        <div className="space-y-6">
          <Card className="glass glass-hover">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-4">
                {isLoading ? <Skeleton className="w-40 h-8" /> : user?.full_name || user?.email}
                {!isLoading && user && <Badge className={getStatusColor(user.account_status)}>{user.account_status}</Badge>}
              </CardTitle>
              <CardDescription>
                {isLoading ? <Skeleton className="w-64 h-4" /> : `Comprehensive user profile and activity overview`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Personal Info
                  </TabsTrigger>
                  <TabsTrigger value="financial" className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Financial
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Activity Log
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="personal" className="mt-6">
                  {renderPersonalInfo()}
                </TabsContent>
                
                <TabsContent value="financial" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="glass">
                      <CardHeader>
                        <CardTitle className="text-lg">Account Balance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          ${user?.demo_balance_usd ? Number(user.demo_balance_usd).toLocaleString() : '0'}
                        </div>
                        <p className="text-sm text-muted-foreground">Demo trading balance</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="glass">
                      <CardHeader>
                        <CardTitle className="text-lg">Payment Info</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-muted-foreground">IBAN:</span>
                            <p className="font-mono text-sm">{user?.bank_details_iban || 'Not provided'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="activity" className="mt-6">
                  {user && <UserActivityLog userId={user.id} />}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {user && <UserActions user={user} />}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminUserDetailPage;
