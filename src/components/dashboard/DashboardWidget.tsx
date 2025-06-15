
import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GripVertical, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardWidgetProps {
  id: string;
  title: string;
  children: ReactNode;
  onRemove?: (id: string) => void;
  className?: string;
  headerActions?: ReactNode;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  id,
  title,
  children,
  onRemove,
  className = '',
  headerActions
}) => {
  return (
    <Card className={`glass glass-hover h-full flex flex-col ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-move drag-handle shrink-0">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {headerActions}
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(id)}
              className="h-6 w-6 p-0 hover:bg-red-500/20"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-visible p-4 card-content">
        <div className="h-full w-full overflow-visible">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardWidget;
