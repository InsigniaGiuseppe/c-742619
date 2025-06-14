
import React from 'react';
import { motion } from 'framer-motion';
import LivePortfolioMetrics from './LivePortfolioMetrics';
import PortfolioAllocation from './PortfolioAllocation';
import EnhancedPortfolioChart from '@/components/EnhancedPortfolioChart';

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

      {/* Portfolio Charts and Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EnhancedPortfolioChart />
        <PortfolioAllocation />
      </div>
    </motion.div>
  );
};

export default AdvancedPortfolioAnalytics;
