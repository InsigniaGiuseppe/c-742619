
import React from 'react';
import DashboardWidget from './DashboardWidget';
import BalanceWidget from './widgets/BalanceWidget';
import PortfolioValueWidget from './widgets/PortfolioValueWidget';
import ProfitLossWidget from './widgets/ProfitLossWidget';
import HoldingsWidget from './widgets/HoldingsWidget';
import TotalInvestedWidget from './widgets/TotalInvestedWidget';
import PortfolioGrowthChartWidget from './widgets/PortfolioGrowthChartWidget';
import PortfolioDistributionWidget from './widgets/PortfolioDistributionWidget';
import PortfolioHoldingsTableWidget from './widgets/PortfolioHoldingsTableWidget';
import RecentTransactionsWidget from './widgets/RecentTransactionsWidget';

interface WidgetConfig {
  id: string;
  component: React.ComponentType;
  className: string;
}

const widgetConfigs: WidgetConfig[] = [
  { id: 'recent-transactions', component: RecentTransactionsWidget, className: 'md:col-span-12 lg:col-span-12' },
  { id: 'balance', component: BalanceWidget, className: 'md:col-span-6 lg:col-span-3' },
  { id: 'portfolio-value', component: PortfolioValueWidget, className: 'md:col-span-6 lg:col-span-3' },
  { id: 'total-invested', component: TotalInvestedWidget, className: 'md:col-span-6 lg:col-span-3' },
  { id: 'profit-loss', component: ProfitLossWidget, className: 'md:col-span-6 lg:col-span-3' },
  { id: 'portfolio-growth-chart', component: PortfolioGrowthChartWidget, className: 'md:col-span-12 lg:col-span-7' },
  { id: 'portfolio-distribution', component: PortfolioDistributionWidget, className: 'md:col-span-12 lg:col-span-5' },
  { id: 'portfolio-holdings-table', component: PortfolioHoldingsTableWidget, className: 'md:col-span-12 lg:col-span-9' },
  { id: 'holdings', component: HoldingsWidget, className: 'md:col-span-6 lg:col-span-3' },
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
