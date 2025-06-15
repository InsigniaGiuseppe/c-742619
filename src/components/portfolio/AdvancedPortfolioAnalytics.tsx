
import React from 'react';
import { motion } from 'framer-motion';
import LivePortfolioMetrics from './LivePortfolioMetrics';
import PortfolioGrowthChart from './PortfolioGrowthChart';
import EnhancedPortfolioChart from '@/components/EnhancedPortfolioChart';
import EnhancedPortfolioAllocation from './EnhancedPortfolioAllocation';

const AdvancedPortfolioAnalytics = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Live Portfolio Metrics */}
      <LivePortfolioMetrics />

      {/* Portfolio Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PortfolioGrowthChart />
        <EnhancedPortfolioChart />
      </div>

      {/* Enhanced Portfolio Allocation with Lending */}
      <EnhancedPortfolioAllocation />
    </motion.div>
  );
};

export default AdvancedPortfolioAnalytics;
