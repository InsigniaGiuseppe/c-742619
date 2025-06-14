
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import FormattedNumber from './FormattedNumber';
import { PortfolioItem } from '@/hooks/usePortfolio';

interface PortfolioHoldingsTableProps {
  portfolio: PortfolioItem[];
  isRealtime?: boolean;
}

const PortfolioHoldingsTable: React.FC<PortfolioHoldingsTableProps> = ({ 
  portfolio, 
  isRealtime = false 
}) => {
  if (portfolio.length === 0) {
    return (
      <Card className="glass glass-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Portfolio Holdings
            {isRealtime && (
              <Badge variant="outline" className="text-green-500 border-green-500">
                LIVE
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No holdings found. Start trading to build your portfolio.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass glass-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Portfolio Holdings
          {isRealtime && (
            <Badge variant="outline" className="text-green-500 border-green-500">
              LIVE
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Real-time view of your cryptocurrency holdings
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Current Price</TableHead>
                <TableHead className="text-right">Market Value</TableHead>
                <TableHead className="text-right">Avg. Buy Price</TableHead>
                <TableHead className="text-right">Total Invested</TableHead>
                <TableHead className="text-right">P/L</TableHead>
                <TableHead className="text-right">P/L %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {portfolio.map((holding) => {
                const isProfit = holding.profit_loss >= 0;
                
                return (
                  <TableRow key={holding.id} className="hover:bg-muted/5">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {holding.crypto.logo_url && (
                          <img 
                            src={holding.crypto.logo_url} 
                            alt={holding.crypto.name}
                            className="w-8 h-8 rounded-full"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <div>
                          <div className="font-semibold">{holding.crypto.symbol}</div>
                          <div className="text-sm text-muted-foreground">{holding.crypto.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <FormattedNumber 
                        value={holding.quantity} 
                        type="crypto" 
                        showTooltip={false}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <FormattedNumber 
                        value={holding.crypto.current_price} 
                        type="currency" 
                        showTooltip={false}
                      />
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      <FormattedNumber 
                        value={holding.current_value} 
                        type="currency" 
                        showTooltip={false}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <FormattedNumber 
                        value={holding.average_buy_price} 
                        type="currency" 
                        showTooltip={false}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <FormattedNumber 
                        value={holding.total_invested} 
                        type="currency" 
                        showTooltip={false}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={`flex items-center justify-end gap-1 ${
                        isProfit ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {isProfit ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <FormattedNumber 
                          value={Math.abs(holding.profit_loss)} 
                          type="currency" 
                          showTooltip={false}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant={isProfit ? "default" : "destructive"}
                        className={
                          isProfit 
                            ? "bg-green-500/20 text-green-400 border-green-500/30" 
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                        }
                      >
                        {isProfit ? '+' : ''}{holding.profit_loss_percentage.toFixed(2)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioHoldingsTable;
