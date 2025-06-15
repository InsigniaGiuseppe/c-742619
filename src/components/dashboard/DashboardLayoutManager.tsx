
import React from 'react';
import DashboardWidget from './DashboardWidget';
import BalanceWidget from './widgets/BalanceWidget';
import PortfolioValueWidget from './widgets/PortfolioValueWidget';
import ProfitLossWidget from './widgets/ProfitLossWidget';
import PortfolioGrowthChartWidget from './widgets/PortfolioGrowthChartWidget';
import PortfolioDistributionWidget from './widgets/PortfolioDistributionWidget';
import PortfolioHoldingsTableWidget from './widgets/PortfolioHoldingsTableWidget';

interface WidgetConfig {
  id: string;
  component: React.ComponentType;
  className: string;
}

const widgetConfigs: WidgetConfig[] = [
  { id: 'balance', component: BalanceWidget, className: 'md:col-span-6 lg:col-span-4' },
  { id: 'portfolio-value', component: PortfolioValueWidget, className: 'md:col-span-6 lg:col-span-4' },
  { id: 'profit-loss', component: ProfitLossWidget, className: 'md:col-span-12 lg:col-span-4' },
  { id: 'portfolio-holdings-table', component: PortfolioHoldingsTableWidget, className: 'md:col-span-12' },
  { id: 'portfolio-distribution', component: PortfolioDistributionWidget, className: 'md:col-span-12' },
  { id: 'portfolio-growth-chart', component: PortfolioGrowthChartWidget, className: 'md:col-span-12' },
];

const DashboardLayoutManager: React.FC = () => {
  return (
    <div className="grid grid-cols-12 auto-rows-auto gap-6">
      {widgetConfigs.map(widget => {
        const WidgetComponent = widget.component;
        return (
          <div key={widget.id} className={`col-span-12 ${widget.className}`}>
            <DashboardWidget
              id={widget.id}
            >
              <WidgetComponent />
            </DashboardWidget>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardLayoutManager;
