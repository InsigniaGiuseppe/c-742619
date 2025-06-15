
import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface DashboardWidgetProps {
  id: string;
  children: ReactNode;
  className?: string;
  headerActions?: ReactNode;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  id,
  children,
  className = '',
  headerActions
}) => {
  return (
    <Card className={`glass glass-hover h-full flex flex-col ${className}`}>
      {headerActions &&
        <CardHeader className="flex flex-row items-center justify-end space-y-0 pb-2 shrink-0">
          <div className="flex items-center gap-2">
            {headerActions}
          </div>
        </CardHeader>
      }
      <CardContent className="flex-1 overflow-auto p-4 card-content">
        <div className="h-full w-full">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardWidget;
