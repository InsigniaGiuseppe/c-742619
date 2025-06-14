
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import FormattedNumber from '@/components/FormattedNumber';
import { usePortfolio } from '@/hooks/usePortfolio';

const PortfolioAllocation = () => {
  const { portfolio, totalValue } = usePortfolio();

  if (portfolio.length === 0) {
    return (
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle>Portfolio Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No portfolio data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const allocations = portfolio
    .map((item) => ({
      ...item,
      percentage: totalValue > 0 ? (item.current_value / totalValue) * 100 : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const getColorForIndex = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500', 
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <Card className="glass glass-hover">
      <CardHeader>
        <CardTitle>Portfolio Allocation</CardTitle>
        <p className="text-sm text-muted-foreground">
          Asset distribution by value
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {allocations.map((allocation, index) => (
          <div key={allocation.cryptocurrency_id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getColorForIndex(index)}`} />
                <div>
                  <span className="font-medium">{allocation.crypto.symbol.toUpperCase()}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {allocation.crypto.name}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  <FormattedNumber 
                    value={allocation.current_value} 
                    type="currency" 
                    showTooltip={false} 
                  />
                </div>
                <Badge variant="outline" className="text-xs">
                  {allocation.percentage.toFixed(1)}%
                </Badge>
              </div>
            </div>
            <Progress value={allocation.percentage} className="h-2" />
          </div>
        ))}
        
        {/* Risk Assessment */}
        <div className="mt-6 pt-4 border-t border-gray-800">
          <h4 className="text-sm font-medium mb-3">Allocation Analysis</h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Top Asset:</span>
              <div className="font-medium">
                {allocations[0]?.crypto.symbol.toUpperCase()} ({allocations[0]?.percentage.toFixed(1)}%)
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Concentration Risk:</span>
              <div className={`font-medium ${allocations[0]?.percentage > 50 ? 'text-yellow-500' : 'text-green-500'}`}>
                {allocations[0]?.percentage > 50 ? 'High' : allocations[0]?.percentage > 30 ? 'Medium' : 'Low'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioAllocation;
