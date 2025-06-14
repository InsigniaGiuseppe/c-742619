
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { User, Shield, CheckCircle, Clock, XCircle } from 'lucide-react';

interface PersonalInfoSectionProps {
  user: any;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ user }) => {
  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'not_started': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getKycIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <TableRow>
      <TableCell className="font-medium text-muted-foreground w-1/3">{label}</TableCell>
      <TableCell>{value || 'Not provided'}</TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <DetailRow label="Full Name" value={user?.full_name} />
              <DetailRow label="Username" value={user?.username} />
              <DetailRow label="Email" value={user?.email} />
              <DetailRow label="Phone" value={user?.phone} />
              <DetailRow label="Date of Birth" value={user?.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : null} />
              <DetailRow 
                label="Account Type" 
                value={
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-400">
                    {user?.account_type || 'Standard'}
                  </Badge>
                } 
              />
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                {getKycIcon(user?.kyc_status || 'not_started')}
                <div>
                  <div className="font-medium">KYC Verification</div>
                  <div className="text-sm text-muted-foreground">
                    Identity verification status
                  </div>
                </div>
              </div>
              <Badge className={getKycStatusColor(user?.kyc_status || 'not_started')}>
                {user?.kyc_status?.replace(/_/g, ' ') || 'Not Started'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4" />
                <div>
                  <div className="font-medium">Two-Factor Authentication</div>
                  <div className="text-sm text-muted-foreground">
                    Extra security for your account
                  </div>
                </div>
              </div>
              <Badge className={user?.two_factor_enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                {user?.two_factor_enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle>Address Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <DetailRow label="Address" value={user?.address} />
              <DetailRow label="City" value={user?.city} />
              <DetailRow label="Postal Code" value={user?.postal_code} />
              <DetailRow label="Country" value={user?.country} />
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle>Financial Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <DetailRow 
                label="Demo Balance" 
                value={user?.demo_balance_usd ? `$${Number(user.demo_balance_usd).toLocaleString()}` : '$0'} 
              />
              <DetailRow label="IBAN" value={user?.bank_details_iban} />
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalInfoSection;
