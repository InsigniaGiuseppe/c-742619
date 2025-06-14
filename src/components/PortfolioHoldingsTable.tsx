
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import FormattedNumber from '@/components/FormattedNumber';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Portfolio } from '@/hooks/usePortfolio';

interface PortfolioHoldingsTableProps {
  portfolio: Portfolio[];
  isRealtime: boolean;
}

const PortfolioHoldingsTable: React.FC<PortfolioHoldingsTableProps> = ({ portfolio, isRealtime }) => {
  return (
    <Card className="glass glass-hover">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Holdings Details</CardTitle>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRealtime ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
          <span className="text-xs text-muted-foreground">
            {isRealtime ? 'Live' : 'Delayed'}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {portfolio.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No holdings found. Start trading to build your portfolio.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead className="text-right">Holdings</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                  <TableHead className="text-right">24h Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolio.map((holding) => {
                  const profitLoss = holding.current_value - holding.invested_amount;
                  const profitLossPercentage = holding.invested_amount > 0 
                    ? ((profitLoss / holding.invested_amount) * 100) 
                    : 0;
                  const priceChange24h = holding.cryptocurrencies?.price_change_percentage_24h || 0;

                  return (
                    <TableRow key={holding.cryptocurrency_id} className="hover:bg-white/5">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                            {holding.cryptocurrencies?.symbol.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{holding.cryptocurrencies?.name}</div>
                            <div className="text-xs text-muted-foreground">{holding.cryptocurrencies?.symbol.toUpperCase()}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <FormattedNumber 
                          value={holding.amount} 
                          type="currency"
                          showTooltip={false}
                          className="font-mono"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <FormattedNumber 
                          value={holding.cryptocurrencies?.current_price || 0} 
                          type="currency"
                          showTooltip={false}
                          className="font-mono"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <FormattedNumber 
                          value={holding.current_value} 
                          type="currency"
                          showTooltip={false}
                          className="font-mono font-medium"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`flex items-center justify-end gap-1 ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {profitLoss >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <div className="font-mono">
                            <FormattedNumber 
                              value={profitLoss} 
                              type="currency"
                              showTooltip={false}
                              className="text-inherit"
                            />
                            <div className="text-xs">
                              ({profitLossPercentage >= 0 ? '+' : ''}{profitLossPercentage.toFixed(2)}%)
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={priceChange24h >= 0 ? 'default' : 'destructive'} className="font-mono text-xs">
                          {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioHoldingsTable;
