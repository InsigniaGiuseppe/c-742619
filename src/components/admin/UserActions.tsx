
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateUserStatus } from '@/hooks/useUpdateUserStatus';
import { useToast } from '@/hooks/use-toast';

type User = {
  id: string;
  account_status: 'active' | 'frozen' | 'blocked' | null;
};

interface UserActionsProps {
  user: User;
}

const UserActions: React.FC<UserActionsProps> = ({ user }) => {
  const [selectedStatus, setSelectedStatus] = useState(user.account_status);
  const { mutate: updateUser, isPending } = useUpdateUserStatus();
  const { toast } = useToast();

  useEffect(() => {
    setSelectedStatus(user.account_status);
  }, [user.account_status]);

  const handleUpdate = () => {
    if (!selectedStatus || selectedStatus === user.account_status) {
      toast({
        title: 'No changes',
        description: 'The user status has not been changed.',
      });
      return;
    }

    updateUser({ userId: user.id, status: selectedStatus });
  };

  const statusOptions: Array<'active' | 'frozen' | 'blocked'> = ['active', 'frozen', 'blocked'];

  return (
    <Card className="glass glass-hover mt-8">
      <CardHeader>
        <CardTitle>Account Actions</CardTitle>
        <CardDescription>Modify user account settings and status.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-end gap-4">
        <div>
          <label htmlFor="status-select" className="block text-sm font-medium text-muted-foreground mb-2">Change Account Status</label>
          <Select
            value={selectedStatus || ''}
            onValueChange={(value) => setSelectedStatus(value as 'active' | 'frozen' | 'blocked')}
          >
            <SelectTrigger id="status-select" className="w-[180px] bg-background/80">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(status => (
                <SelectItem key={status} value={status}>
                  <span className="capitalize">{status}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
            onClick={handleUpdate} 
            disabled={isPending || selectedStatus === user.account_status}
            className="button-gradient"
        >
          {isPending ? 'Updating...' : 'Update Status'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserActions;
