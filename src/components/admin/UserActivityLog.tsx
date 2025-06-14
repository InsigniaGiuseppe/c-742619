
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserActivity, UserActivityEntry } from '@/hooks/useUserActivity';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, TrendingUp, FileText, Shield, LogIn, LogOut, Wallet } from 'lucide-react';

interface UserActivityLogProps {
  userId: string;
}

const getActivityIcon = (actionType: string) => {
  switch (actionType) {
    case 'trade_execution':
    case 'trade_buy':
    case 'trade_sell':
      return TrendingUp;
    case 'kyc_document_submission':
    case 'kyc_status_update':
      return FileText;
    case 'user_status_update':
      return Shield;
    case 'login':
      return LogIn;
    case 'logout':
      return LogOut;
    case 'wallet_submission':
    case 'wallet_status_update':
      return Wallet;
    default:
      return Activity;
  }
};

const getActivityColor = (actionType: string) => {
  switch (actionType) {
    case 'trade_buy':
      return 'text-green-500';
    case 'trade_sell':
      return 'text-red-500';
    case 'login':
      return 'text-blue-500';
    case 'logout':
      return 'text-gray-500';
    case 'kyc_document_submission':
      return 'text-purple-500';
    case 'wallet_submission':
      return 'text-orange-500';
    default:
      return 'text-primary';
  }
};

const getStatusBadgeVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'verified':
    case 'approved':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'rejected':
    case 'failed':
      return 'destructive';
    default:
      return 'outline';
  }
};

const UserActivityLog: React.FC<UserActivityLogProps> = ({ userId }) => {
  const { data: activities, isLoading, error } = useUserActivity(userId);

  if (isLoading) {
    return (
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle>User Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle>User Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Failed to load activity log
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass glass-hover">
      <CardHeader>
        <CardTitle>User Activity Log</CardTitle>
        <p className="text-sm text-muted-foreground">
          {activities?.length || 0} activities found
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] w-full">
          {!activities || activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No activity found for this user
            </p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity: UserActivityEntry) => {
                const Icon = getActivityIcon(activity.action_type);
                const colorClass = getActivityColor(activity.action_type);
                
                return (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 border border-border rounded-lg bg-card/50">
                    <div className={`p-2 rounded-full bg-background ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{activity.description}</h4>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(activity.created_at), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {activity.table_name}
                        </Badge>
                        {activity.details?.status && (
                          <Badge variant={getStatusBadgeVariant(activity.details.status)} className="text-xs">
                            {activity.details.status}
                          </Badge>
                        )}
                      </div>

                      {/* Additional details based on activity type */}
                      {activity.action_type.includes('trade') && activity.details && (
                        <div className="text-xs text-muted-foreground">
                          {activity.details.crypto?.symbol}: {activity.details.amount} 
                          {activity.details.total_value && ` ($${Number(activity.details.total_value).toFixed(2)})`}
                        </div>
                      )}

                      {activity.action_type.includes('kyc') && activity.details && (
                        <div className="text-xs text-muted-foreground">
                          Document: {activity.details.document_type}
                          {activity.details.admin_notes && (
                            <div className="mt-1 text-xs">Notes: {activity.details.admin_notes}</div>
                          )}
                        </div>
                      )}

                      {activity.action_type.includes('wallet') && activity.details && (
                        <div className="text-xs text-muted-foreground">
                          {activity.details.coin_symbol} on {activity.details.network}
                          {activity.details.wallet_label && ` (${activity.details.wallet_label})`}
                        </div>
                      )}

                      {(activity.action_type === 'login' || activity.action_type === 'logout') && activity.details && (
                        <div className="text-xs text-muted-foreground">
                          {activity.ip_address && `IP: ${activity.ip_address} `}
                          {activity.details.device_name && `Device: ${activity.details.device_name}`}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default UserActivityLog;
