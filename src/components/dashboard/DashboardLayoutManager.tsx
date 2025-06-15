
import React, { useState, useCallback } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import DashboardWidget from './DashboardWidget';
import BalanceWidget from './widgets/BalanceWidget';
import PortfolioValueWidget from './widgets/PortfolioValueWidget';
import ProfitLossWidget from './widgets/ProfitLossWidget';
import HoldingsWidget from './widgets/HoldingsWidget';
import LivePortfolioMetricsWidget from './widgets/LivePortfolioMetricsWidget';
import PortfolioGrowthChartWidget from './widgets/PortfolioGrowthChartWidget';
import PortfolioDistributionWidget from './widgets/PortfolioDistributionWidget';
import PortfolioHoldingsTableWidget from './widgets/PortfolioHoldingsTableWidget';
import RecentTransactionsWidget from './widgets/RecentTransactionsWidget';
import { Button } from '@/components/ui/button';
import { RotateCcw, Plus, Settings, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
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
  category?: string;
}

const DashboardLayoutManager: React.FC = () => {
  const widgetConfigs: WidgetConfig[] = [
    {
      id: 'balance',
      title: 'Available Balance',
      component: BalanceWidget,
      category: 'metrics',
      defaultLayout: {
        lg: { x: 0, y: 0, w: 3, h: 3 },
        md: { x: 0, y: 0, w: 6, h: 3 },
        sm: { x: 0, y: 0, w: 12, h: 3 }
      },
      minW: 2,
      minH: 3
    },
    {
      id: 'portfolio-value',
      title: 'Portfolio Value',
      component: PortfolioValueWidget,
      category: 'metrics',
      defaultLayout: {
        lg: { x: 3, y: 0, w: 3, h: 3 },
        md: { x: 6, y: 0, w: 6, h: 3 },
        sm: { x: 0, y: 3, w: 12, h: 3 }
      },
      minW: 2,
      minH: 3
    },
    {
      id: 'profit-loss',
      title: 'Profit/Loss',
      component: ProfitLossWidget,
      category: 'metrics',
      defaultLayout: {
        lg: { x: 6, y: 0, w: 3, h: 3 },
        md: { x: 0, y: 3, w: 6, h: 3 },
        sm: { x: 0, y: 6, w: 12, h: 3 }
      },
      minW: 2,
      minH: 3
    },
    {
      id: 'holdings',
      title: 'Holdings Count',
      component: HoldingsWidget,
      category: 'metrics',
      defaultLayout: {
        lg: { x: 9, y: 0, w: 3, h: 3 },
        md: { x: 6, y: 3, w: 6, h: 3 },
        sm: { x: 0, y: 9, w: 12, h: 3 }
      },
      minW: 2,
      minH: 3
    },
    {
      id: 'live-portfolio-metrics',
      title: 'Portfolio Metrics',
      component: LivePortfolioMetricsWidget,
      category: 'analytics',
      defaultLayout: {
        lg: { x: 0, y: 3, w: 12, h: 6 },
        md: { x: 0, y: 6, w: 12, h: 6 },
        sm: { x: 0, y: 12, w: 12, h: 8 }
      },
      minW: 8,
      minH: 5
    },
    {
      id: 'portfolio-growth-chart',
      title: 'Portfolio Growth',
      component: PortfolioGrowthChartWidget,
      category: 'charts',
      defaultLayout: {
        lg: { x: 0, y: 9, w: 8, h: 8 },
        md: { x: 0, y: 12, w: 12, h: 8 },
        sm: { x: 0, y: 20, w: 12, h: 8 }
      },
      minW: 6,
      minH: 6
    },
    {
      id: 'portfolio-distribution',
      title: 'Portfolio Distribution',
      component: PortfolioDistributionWidget,
      category: 'charts',
      defaultLayout: {
        lg: { x: 8, y: 9, w: 4, h: 8 },
        md: { x: 0, y: 20, w: 12, h: 8 },
        sm: { x: 0, y: 28, w: 12, h: 8 }
      },
      minW: 4,
      minH: 6
    },
    {
      id: 'portfolio-holdings-table',
      title: 'Holdings Table',
      component: PortfolioHoldingsTableWidget,
      category: 'data',
      defaultLayout: {
        lg: { x: 0, y: 17, w: 8, h: 6 },
        md: { x: 0, y: 28, w: 12, h: 6 },
        sm: { x: 0, y: 36, w: 12, h: 8 }
      },
      minW: 6,
      minH: 4
    },
    {
      id: 'recent-transactions',
      title: 'Recent Transactions',
      component: RecentTransactionsWidget,
      category: 'data',
      defaultLayout: {
        lg: { x: 8, y: 17, w: 4, h: 6 },
        md: { x: 0, y: 34, w: 12, h: 6 },
        sm: { x: 0, y: 44, w: 12, h: 6 }
      },
      minW: 3,
      minH: 4
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

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleLayoutChange = useCallback((layout: Layout[], layouts: { [key: string]: Layout[] }) => {
    if (isCustomizing) {
      setLayouts(layouts);
      setHasUnsavedChanges(true);
    }
  }, [isCustomizing]);

  const handleRemoveWidget = useCallback((widgetId: string) => {
    if (isCustomizing) {
      setActiveWidgets(prev => prev.filter(id => id !== widgetId));
      setHasUnsavedChanges(true);
    }
  }, [isCustomizing]);

  const handleAddWidget = useCallback((widgetId: string) => {
    if (!activeWidgets.includes(widgetId)) {
      setActiveWidgets(prev => [...prev, widgetId]);
      setHasUnsavedChanges(true);
    }
  }, [activeWidgets]);

  const handleSaveLayout = useCallback(() => {
    localStorage.setItem('dashboardLayouts', JSON.stringify(layouts));
    localStorage.setItem('dashboardActiveWidgets', JSON.stringify(activeWidgets));
    setHasUnsavedChanges(false);
    setIsCustomizing(false);
    toast.success('Dashboard layout saved successfully!');
  }, [layouts, activeWidgets]);

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
    setHasUnsavedChanges(true);
    toast.info('Layout reset to default');
  }, []);

  const toggleCustomizeMode = useCallback(() => {
    if (isCustomizing && hasUnsavedChanges) {
      // Ask user if they want to save changes
      const shouldSave = window.confirm('You have unsaved changes. Do you want to save them?');
      if (shouldSave) {
        handleSaveLayout();
        return;
      } else {
        // Reload saved layout
        const savedLayouts = localStorage.getItem('dashboardLayouts');
        const savedActiveWidgets = localStorage.getItem('dashboardActiveWidgets');
        if (savedLayouts) {
          setLayouts(JSON.parse(savedLayouts));
        }
        if (savedActiveWidgets) {
          setActiveWidgets(JSON.parse(savedActiveWidgets));
        }
        setHasUnsavedChanges(false);
      }
    }
    setIsCustomizing(!isCustomizing);
  }, [isCustomizing, hasUnsavedChanges, handleSaveLayout]);

  // Load saved layout on mount
  React.useEffect(() => {
    const savedLayouts = localStorage.getItem('dashboardLayouts');
    const savedActiveWidgets = localStorage.getItem('dashboardActiveWidgets');
    
    if (savedLayouts) {
      try {
        setLayouts(JSON.parse(savedLayouts));
      } catch (e) {
        console.error('Failed to load saved layouts:', e);
      }
    }
    
    if (savedActiveWidgets) {
      try {
        setActiveWidgets(JSON.parse(savedActiveWidgets));
      } catch (e) {
        console.error('Failed to load saved active widgets:', e);
      }
    }
  }, []);

  const activeWidgetConfigs = widgetConfigs.filter(w => activeWidgets.includes(w.id));
  const inactiveWidgetConfigs = widgetConfigs.filter(w => !activeWidgets.includes(w.id));

  // Group inactive widgets by category
  const groupedInactiveWidgets = inactiveWidgetConfigs.reduce((acc, widget) => {
    const category = widget.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(widget);
    return acc;
  }, {} as Record<string, WidgetConfig[]>);

  return (
    <>
      <style>
        {`
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
            width: 8px;
            height: 8px;
            border-right: 2px solid rgba(255, 255, 255, 0.6);
            border-bottom: 2px solid rgba(255, 255, 255, 0.6);
            border-radius: 0 0 4px 0;
          }
          
          .react-grid-item.react-draggable-dragging {
            transition: none !important;
            z-index: 3;
            transform: rotate(2deg) !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
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
          
          /* Hide drag handles and resize handles when not customizing */
          ${!isCustomizing ? `
            .react-grid-item .drag-handle {
              display: none !important;
            }
            .react-grid-item .react-resizable-handle {
              display: none !important;
            }
            .react-grid-item {
              cursor: default !important;
            }
          ` : `
            .react-grid-item {
              border: 1px dashed rgba(59, 130, 246, 0.3) !important;
              border-radius: 8px !important;
            }
            .react-grid-item:hover {
              border-color: rgba(59, 130, 246, 0.6) !important;
            }
            .react-resizable-handle {
              opacity: 0.8 !important;
            }
            .react-resizable-handle:hover {
              opacity: 1 !important;
            }
          `}
          
          /* Ensure no internal scrolling */
          .react-grid-item .card-content {
            overflow: visible !important;
            height: 100% !important;
          }
          
          .react-grid-item .glass {
            height: 100% !important;
          }
        `}
      </style>
      <div className="space-y-6">
        {/* Dashboard Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="text-green-500 border-green-500">
              {isCustomizing ? 'Editing Mode' : 'Dashboard'}
            </Badge>
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Customize</span>
              <Switch 
                checked={isCustomizing} 
                onCheckedChange={toggleCustomizeMode}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>
            {!isCustomizing && (
              <span className="text-xs text-muted-foreground">
                Enable customize mode to rearrange widgets
              </span>
            )}
            {isCustomizing && (
              <span className="text-xs text-muted-foreground">
                Drag widgets to rearrange • Resize by dragging corners
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isCustomizing && hasUnsavedChanges && (
              <Button
                onClick={handleSaveLayout}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Layout
              </Button>
            )}
            
            {isCustomizing && Object.keys(groupedInactiveWidgets).length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Add:</span>
                {Object.entries(groupedInactiveWidgets).map(([category, widgets]) => (
                  <div key={category} className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground capitalize">{category}:</span>
                    {widgets.map(widget => (
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
                ))}
              </div>
            )}
            
            {isCustomizing && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetLayout}
                className="h-7"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Responsive Grid Layout */}
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          onLayoutChange={handleLayoutChange}
          breakpoints={{ lg: 1200, md: 996, sm: 768 }}
          cols={{ lg: 12, md: 12, sm: 12 }}
          rowHeight={50}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          dragHandleClassName={isCustomizing ? "drag-handle" : ""}
          resizeHandles={['se']}
          useCSSTransforms={true}
          isDraggable={isCustomizing}
          isResizable={isCustomizing}
          compactType="vertical"
        >
          {activeWidgetConfigs.map(widget => {
            const WidgetComponent = widget.component;
            return (
              <div key={widget.id}>
                <DashboardWidget
                  id={widget.id}
                  title={widget.title}
                  onRemove={isCustomizing ? handleRemoveWidget : undefined}
                  className="h-full"
                >
                  <WidgetComponent />
                </DashboardWidget>
              </div>
            );
          })}
        </ResponsiveGridLayout>
      </div>
    </>
  );
};

export default DashboardLayoutManager;
