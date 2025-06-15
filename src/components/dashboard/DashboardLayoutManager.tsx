
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
  title: string;
  component: React.ComponentType;
  className: string;
}

// Replicating the previous layout with a simpler Tailwind grid.
// Using a 12-column grid system.
const widgetConfigs: WidgetConfig[] = [
  { id: 'balance', title: 'Available Balance', component: BalanceWidget, className: 'md:col-span-6 lg:col-span-3' },
  { id: 'portfolio-value', title: 'Portfolio Value', component: PortfolioValueWidget, className: 'md:col-span-6 lg:col-span-3' },
  { id: 'total-invested', title: 'Total Invested', component: TotalInvestedWidget, className: 'md:col-span-6 lg:col-span-3' },
  { id: 'profit-loss', title: 'Profit/Loss', component: ProfitLossWidget, className: 'md:col-span-6 lg:col-span-3' },
  { id: 'portfolio-growth-chart', title: 'Portfolio Growth', component: PortfolioGrowthChartWidget, className: 'md:col-span-12 lg:col-span-8 lg:row-span-2' },
  { id: 'portfolio-distribution', title: 'Portfolio Distribution', component: PortfolioDistributionWidget, className: 'md:col-span-12 lg:col-span-4 lg:row-span-2' },
  { id: 'portfolio-holdings-table', title: 'Holdings Table', component: PortfolioHoldingsTableWidget, className: 'md:col-span-12 lg:col-span-8 lg:row-span-2' },
  { id: 'recent-transactions', title: 'Recent Transactions', component: RecentTransactionsWidget, className: 'md:col-span-12 lg:col-span-4 lg:row-span-2' },
  { id: 'holdings', title: 'Holdings Count', component: HoldingsWidget, className: 'md:col-span-6 lg:col-span-4' },
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
              title={widget.title}
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
