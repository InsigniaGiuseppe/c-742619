
import React, { useState, useCallback } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import DashboardWidget from './DashboardWidget';
import BalanceWidget from './widgets/BalanceWidget';
import PortfolioValueWidget from './widgets/PortfolioValueWidget';
import ProfitLossWidget from './widgets/ProfitLossWidget';
import HoldingsWidget from './widgets/HoldingsWidget';
import PortfolioOverview from '@/components/PortfolioOverview';
import RecentTransactions from '@/components/RecentTransactions';
import { Button } from '@/components/ui/button';
import { RotateCcw, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface WidgetConfig {
  id: string;
  title: string;
  component: React.ComponentType;
  defaultLayout: {
    lg: { x: number; y: number; w: number; h: number };
    md: { x: number; y: number; w: number; h: number };
    sm: { x: number; y: number; w: number; h: number };
  };
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

const DashboardLayoutManager: React.FC = () => {
  const widgetConfigs: WidgetConfig[] = [
    {
      id: 'balance',
      title: 'Available Balance',
      component: BalanceWidget,
      defaultLayout: {
        lg: { x: 0, y: 0, w: 3, h: 2 },
        md: { x: 0, y: 0, w: 6, h: 2 },
        sm: { x: 0, y: 0, w: 12, h: 2 }
      },
      minW: 2,
      minH: 2
    },
    {
      id: 'portfolio-value',
      title: 'Portfolio Value',
      component: PortfolioValueWidget,
      defaultLayout: {
        lg: { x: 3, y: 0, w: 3, h: 2 },
        md: { x: 6, y: 0, w: 6, h: 2 },
        sm: { x: 0, y: 2, w: 12, h: 2 }
      },
      minW: 2,
      minH: 2
    },
    {
      id: 'profit-loss',
      title: 'Profit/Loss',
      component: ProfitLossWidget,
      defaultLayout: {
        lg: { x: 6, y: 0, w: 3, h: 2 },
        md: { x: 0, y: 2, w: 6, h: 2 },
        sm: { x: 0, y: 4, w: 12, h: 2 }
      },
      minW: 2,
      minH: 2
    },
    {
      id: 'holdings',
      title: 'Holdings',
      component: HoldingsWidget,
      defaultLayout: {
        lg: { x: 9, y: 0, w: 3, h: 2 },
        md: { x: 6, y: 2, w: 6, h: 2 },
        sm: { x: 0, y: 6, w: 12, h: 2 }
      },
      minW: 2,
      minH: 2
    },
    {
      id: 'portfolio-overview',
      title: 'Portfolio Overview',
      component: PortfolioOverview,
      defaultLayout: {
        lg: { x: 0, y: 2, w: 8, h: 6 },
        md: { x: 0, y: 4, w: 12, h: 6 },
        sm: { x: 0, y: 8, w: 12, h: 6 }
      },
      minW: 6,
      minH: 4
    },
    {
      id: 'recent-transactions',
      title: 'Recent Transactions',
      component: RecentTransactions,
      defaultLayout: {
        lg: { x: 8, y: 2, w: 4, h: 6 },
        md: { x: 0, y: 10, w: 12, h: 4 },
        sm: { x: 0, y: 14, w: 12, h: 4 }
      },
      minW: 3,
      minH: 3
    }
  ];

  const [activeWidgets, setActiveWidgets] = useState<string[]>(
    widgetConfigs.map(w => w.id)
  );

  const [layouts, setLayouts] = useState<{ [key: string]: Layout[] }>(() => {
    const defaultLayouts: { [key: string]: Layout[] } = {};
    ['lg', 'md', 'sm'].forEach(breakpoint => {
      defaultLayouts[breakpoint] = widgetConfigs.map(widget => ({
        i: widget.id,
        ...widget.defaultLayout[breakpoint as keyof typeof widget.defaultLayout],
        minW: widget.minW,
        minH: widget.minH,
        maxW: widget.maxW,
        maxH: widget.maxH
      }));
    });
    return defaultLayouts;
  });

  const handleLayoutChange = useCallback((layout: Layout[], layouts: { [key: string]: Layout[] }) => {
    setLayouts(layouts);
    // Here you could save to localStorage or database
    localStorage.setItem('dashboardLayouts', JSON.stringify(layouts));
  }, []);

  const handleRemoveWidget = useCallback((widgetId: string) => {
    setActiveWidgets(prev => prev.filter(id => id !== widgetId));
  }, []);

  const handleAddWidget = useCallback((widgetId: string) => {
    if (!activeWidgets.includes(widgetId)) {
      setActiveWidgets(prev => [...prev, widgetId]);
    }
  }, [activeWidgets]);

  const handleResetLayout = useCallback(() => {
    const defaultLayouts: { [key: string]: Layout[] } = {};
    ['lg', 'md', 'sm'].forEach(breakpoint => {
      defaultLayouts[breakpoint] = widgetConfigs.map(widget => ({
        i: widget.id,
        ...widget.defaultLayout[breakpoint as keyof typeof widget.defaultLayout],
        minW: widget.minW,
        minH: widget.minH,
        maxW: widget.maxW,
        maxH: widget.maxH
      }));
    });
    setLayouts(defaultLayouts);
    setActiveWidgets(widgetConfigs.map(w => w.id));
    localStorage.removeItem('dashboardLayouts');
  }, []);

  // Load saved layout on mount
  React.useEffect(() => {
    const savedLayouts = localStorage.getItem('dashboardLayouts');
    if (savedLayouts) {
      try {
        setLayouts(JSON.parse(savedLayouts));
      } catch (e) {
        console.error('Failed to load saved layouts:', e);
      }
    }
  }, []);

  const activeWidgetConfigs = widgetConfigs.filter(w => activeWidgets.includes(w.id));
  const inactiveWidgetConfigs = widgetConfigs.filter(w => !activeWidgets.includes(w.id));

  return (
    <div className="space-y-6">
      {/* Dashboard Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-green-500 border-green-500">
            Customizable Dashboard
          </Badge>
          <span className="text-sm text-muted-foreground">
            Drag widgets to rearrange • Resize by dragging corners
          </span>
        </div>
        <div className="flex items-center gap-2">
          {inactiveWidgetConfigs.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Add:</span>
              {inactiveWidgetConfigs.map(widget => (
                <Button
                  key={widget.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddWidget(widget.id)}
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {widget.title}
                </Button>
              ))}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetLayout}
            className="h-7"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Responsive Grid Layout */}
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        onLayoutChange={handleLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768 }}
        cols={{ lg: 12, md: 12, sm: 12 }}
        rowHeight={60}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        dragHandleClassName="drag-handle"
        resizeHandles={['se']}
        useCSSTransforms={true}
      >
        {activeWidgetConfigs.map(widget => {
          const WidgetComponent = widget.component;
          return (
            <div key={widget.id}>
              <DashboardWidget
                id={widget.id}
                title={widget.title}
                onRemove={handleRemoveWidget}
              >
                <WidgetComponent />
              </DashboardWidget>
            </div>
          );
        })}
      </ResponsiveGridLayout>

      <style jsx global>{`
        .react-grid-item.react-grid-placeholder {
          background: rgba(59, 130, 246, 0.2) !important;
          border: 2px dashed #3b82f6 !important;
          border-radius: 8px !important;
        }
        
        .react-grid-item:hover {
          z-index: 2;
        }
        
        .react-resizable-handle {
          background: none !important;
        }
        
        .react-resizable-handle::after {
          content: '';
          position: absolute;
          right: 3px;
          bottom: 3px;
          width: 5px;
          height: 5px;
          border-right: 2px solid rgba(255, 255, 255, 0.4);
          border-bottom: 2px solid rgba(255, 255, 255, 0.4);
        }
        
        .react-grid-item.react-draggable-dragging {
          transition: none !important;
          z-index: 3;
        }
        
        .react-grid-item.react-resizable-resizing {
          z-index: 3;
        }
        
        .drag-handle {
          cursor: move;
        }
        
        .drag-handle:active {
          cursor: grabbing;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayoutManager;
