
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, UserX, UserCheck, Download, Mail } from 'lucide-react';
import { useUpdateUserStatus } from '@/hooks/useUpdateUserStatus';
import { toast } from 'sonner';

interface User {
  id: string;
  full_name: string | null;
  email: string | null;
  account_status: string | null;
  kyc_status: string | null;
  created_at: string;
}

interface BulkUserOperationsProps {
  users: User[];
  selectedUsers: string[];
  onSelectionChange: (userIds: string[]) => void;
  onRefresh: () => void;
}

const BulkUserOperations: React.FC<BulkUserOperationsProps> = ({
  users,
  selectedUsers,
  onSelectionChange,
  onRefresh
}) => {
  const [bulkAction, setBulkAction] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { mutate: updateUserStatus } = useUpdateUserStatus();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(users.map(user => user.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedUsers, userId]);
    } else {
      onSelectionChange(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) {
      toast.error('Please select users and an action');
      return;
    }

    setIsProcessing(true);
    
    try {
      if (bulkAction === 'block' || bulkAction === 'freeze' || bulkAction === 'activate') {
        const status = bulkAction === 'block' ? 'blocked' : 
                      bulkAction === 'freeze' ? 'frozen' : 'active';
        
        for (const userId of selectedUsers) {
          await new Promise(resolve => {
            updateUserStatus({ userId, status: status as any }, {
              onSuccess: () => resolve(true),
              onError: (error) => {
                console.error(`Failed to update user ${userId}:`, error);
                resolve(false);
              }
            });
          });
        }
        
        toast.success(`Successfully updated ${selectedUsers.length} users`);
        onSelectionChange([]);
        onRefresh();
      } else if (bulkAction === 'export') {
        // Export selected users to CSV
        const csvContent = generateCSV();
        downloadCSV(csvContent, 'users_export.csv');
        toast.success('User data exported successfully');
      } else if (bulkAction === 'email') {
        // Placeholder for bulk email functionality
        toast.info('Bulk email feature coming soon');
      }
    } catch (error) {
      toast.error('Failed to complete bulk action');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateCSV = () => {
    const selectedUserData = users.filter(user => selectedUsers.includes(user.id));
    const headers = ['ID', 'Full Name', 'Email', 'Account Status', 'KYC Status', 'Created At'];
    const rows = selectedUserData.map(user => [
      user.id,
      user.full_name || 'N/A',
      user.email || 'N/A',
      user.account_status || 'N/A',
      user.kyc_status || 'N/A',
      new Date(user.created_at).toLocaleDateString()
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="glass glass-hover mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Bulk Operations
          {selectedUsers.length > 0 && (
            <Badge variant="secondary">{selectedUsers.length} selected</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Select All Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectedUsers.length === users.length && users.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm font-medium">
              Select All ({users.length} users)
            </label>
          </div>

          {/* Bulk Action Controls */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bulk action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      Activate Users
                    </div>
                  </SelectItem>
                  <SelectItem value="freeze">
                    <div className="flex items-center gap-2">
                      <UserX className="w-4 h-4" />
                      Freeze Users
                    </div>
                  </SelectItem>
                  <SelectItem value="block">
                    <div className="flex items-center gap-2">
                      <UserX className="w-4 h-4" />
                      Block Users
                    </div>
                  </SelectItem>
                  <SelectItem value="export">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Export to CSV
                    </div>
                  </SelectItem>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Send Bulk Email
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleBulkAction}
              disabled={isProcessing || selectedUsers.length === 0 || !bulkAction}
              className="button-gradient"
            >
              {isProcessing ? 'Processing...' : 'Execute Action'}
            </Button>
          </div>

          {/* Selected Users Preview */}
          {selectedUsers.length > 0 && (
            <div className="mt-4 p-3 bg-muted/10 rounded-lg">
              <div className="text-sm font-medium mb-2">Selected Users:</div>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.slice(0, 5).map(userId => {
                  const user = users.find(u => u.id === userId);
                  return (
                    <Badge key={userId} variant="outline">
                      {user?.email || user?.full_name || userId.slice(0, 8)}
                    </Badge>
                  );
                })}
                {selectedUsers.length > 5 && (
                  <Badge variant="outline">+{selectedUsers.length - 5} more</Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkUserOperations;
