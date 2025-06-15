
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Percent, PiggyBank } from 'lucide-react';
import FormattedNumber from '@/components/FormattedNumber';
import { useCombinedPortfolio } from '@/hooks/useCombinedPortfolio';
import { formatCryptoQuantity } from '@/lib/cryptoFormatters';

const EnhancedPortfolioAllocation = () => {
  const { combinedPortfolio, totals, loading } = useCombinedPortfolio();

  if (loading) {
    return (
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle>Enhanced Portfolio Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="animate-pulse">Loading portfolio data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (combinedPortfolio.length === 0) {
    return (
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle>Enhanced Portfolio Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No portfolio data available
          </div>
        </CardContent>
      </Card>
    );
  }

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

  const getLendingColor = (baseColor: string) => {
    return baseColor.replace('bg-', 'bg-opacity-60 bg-');
  };

  return (
    <Card className="glass glass-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Enhanced Portfolio Allocation
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <PiggyBank className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Shows both trading and lending positions</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Trading: <FormattedNumber value={totals.trading} type="currency" showTooltip={false} /></span>
            <span>Lending: <FormattedNumber value={totals.lending} type="currency" showTooltip={false} /></span>
          </div>
          <div className="text-center font-medium">
            Total: <FormattedNumber value={totals.combined} type="currency" showTooltip={false} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {combinedPortfolio.map((allocation, index) => {
          const baseColor = getColorForIndex(index);
          const lendingColor = getLendingColor(baseColor);
          const hasLending = allocation.lending.value > 0;
          const hasTrading = allocation.trading.value > 0;

          return (
            <div key={allocation.cryptocurrency_id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${baseColor}`} />
                  <div className="flex items-center gap-2">
                    {allocation.crypto?.logo_url ? (
                      <img 
                        src={allocation.crypto.logo_url} 
                        alt={allocation.crypto.symbol}
                        className="w-5 h-5 rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                        {allocation.crypto?.symbol?.slice(0, 1).toUpperCase() || 'C'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{allocation.crypto?.symbol?.toUpperCase() || 'Unknown'}</span>
                        {hasLending && (
                          <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/20 text-green-400">
                            <PiggyBank className="w-3 h-3 mr-1" />
                            {allocation.lending.yield.toFixed(1)}% APR
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {allocation.crypto?.name || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    <FormattedNumber 
                      value={allocation.total.value} 
                      type="currency" 
                      showTooltip={false} 
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {allocation.total.percentage.toFixed(1)}%
                    {hasTrading && hasLending && (
                      <span className="ml-1">
                        ({allocation.trading.percentage.toFixed(1)}% + {allocation.lending.percentage.toFixed(1)}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Segmented Progress Bar */}
              <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                {/* Trading portion */}
                {hasTrading && (
                  <div 
                    className={`h-full ${baseColor} transition-all duration-300 ease-out absolute left-0`}
                    style={{
                      width: `${allocation.trading.percentage}%`,
                    }}
                  />
                )}
                
                {/* Lending portion */}
                {hasLending && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className={`h-full ${lendingColor} transition-all duration-300 ease-out absolute pattern-diagonal-lines`}
                          style={{
                            left: `${allocation.trading.percentage}%`,
                            width: `${allocation.lending.percentage}%`,
                            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)`
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">Lending Position</p>
                        <p className="text-xs">Earning {allocation.lending.yield.toFixed(1)}% APR</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              {/* Detailed breakdown */}
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Total Holdings:</span>
                  <span>{formatCryptoQuantity(allocation.total.quantity)} {allocation.crypto?.symbol?.toUpperCase()}</span>
                </div>
                {hasTrading && (
                  <div className="flex justify-between">
                    <span>• Trading:</span>
                    <span>
                      {formatCryptoQuantity(allocation.trading.quantity)} 
                      (<FormattedNumber value={allocation.trading.value} type="currency" showTooltip={false} />)
                    </span>
                  </div>
                )}
                {hasLending && (
                  <div className="flex justify-between">
                    <span>• Lending:</span>
                    <span>
                      {formatCryptoQuantity(allocation.lending.quantity)} 
                      (<FormattedNumber value={allocation.lending.value} type="currency" showTooltip={false} />)
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Enhanced Risk Assessment */}
        <div className="mt-6 pt-4 border-t border-gray-800">
          <h4 className="text-sm font-medium mb-3">Portfolio Analysis</h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Top Asset:</span>
              <div className="font-medium">
                {combinedPortfolio[0]?.crypto?.symbol?.toUpperCase() || 'N/A'} ({combinedPortfolio[0]?.total.percentage.toFixed(1)}%)
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Lending Share:</span>
              <div className={`font-medium ${totals.lending > 0 ? 'text-green-500' : 'text-gray-500'}`}>
                {totals.combined > 0 ? ((totals.lending / totals.combined) * 100).toFixed(1) : 0}%
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Diversification:</span>
              <div className={`font-medium ${combinedPortfolio[0]?.total.percentage > 50 ? 'text-yellow-500' : 'text-green-500'}`}>
                {combinedPortfolio[0]?.total.percentage > 50 ? 'High Risk' : combinedPortfolio[0]?.total.percentage > 30 ? 'Medium Risk' : 'Low Risk'}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Active Positions:</span>
              <div className="font-medium">
                {combinedPortfolio.length} assets
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedPortfolioAllocation;
