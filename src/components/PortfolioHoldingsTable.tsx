
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import FormattedNumber from '@/components/FormattedNumber';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCryptoQuantity } from '@/lib/cryptoFormatters';
import SellCryptoModal from './SellCryptoModal';

interface Portfolio {
  id: string;
  cryptocurrency_id: string;
  quantity: number;
  current_value: number;
  total_invested: number;
  crypto?: {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    price_change_percentage_24h: number;
    logo_url?: string;
  };
}

interface PortfolioHoldingsTableProps {
  portfolio: Portfolio[];
  isRealtime: boolean;
}

const PortfolioHoldingsTable: React.FC<PortfolioHoldingsTableProps> = ({ portfolio, isRealtime }) => {
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<Portfolio | null>(null);

  const handleSellClick = (holding: Portfolio) => {
    if (holding.crypto) {
      setSelectedHolding(holding);
      setSellModalOpen(true);
    }
  };

  // Mobile Card View Component
  const MobileHoldingCard = ({ holding }: { holding: Portfolio }) => {
    const profitLoss = holding.current_value - holding.total_invested;
    const profitLossPercentage = holding.total_invested > 0 
      ? ((profitLoss / holding.total_invested) * 100) 
      : 0;
    const priceChange24h = holding.crypto?.price_change_percentage_24h || 0;

    return (
      <Card className="glass glass-hover p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {holding.crypto?.logo_url ? (
              <img 
                src={holding.crypto.logo_url} 
                alt={holding.crypto.symbol}
                className="w-10 h-10 rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                {holding.crypto?.symbol?.slice(0, 2).toUpperCase() || 'CR'}
              </div>
            )}
            <div>
              <div className="font-medium text-sm">{holding.crypto?.name || 'Unknown Cryptocurrency'}</div>
              <div className="text-xs text-muted-foreground">{holding.crypto?.symbol?.toUpperCase() || 'N/A'}</div>
            </div>
          </div>
          <Badge variant={priceChange24h >= 0 ? 'default' : 'destructive'} className="text-xs">
            {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground text-xs">Holdings</div>
            <div className="font-mono">{formatCryptoQuantity(holding.quantity)}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Price</div>
            <FormattedNumber 
              value={holding.crypto?.current_price || 0} 
              type="currency"
              showTooltip={false}
              className="font-mono"
            />
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Value</div>
            <FormattedNumber 
              value={holding.current_value} 
              type="currency"
              showTooltip={false}
              className="font-mono font-medium"
            />
          </div>
          <div>
            <div className="text-muted-foreground text-xs">P&L</div>
            <div className={`flex items-center gap-1 ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {profitLoss >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <div className="font-mono text-xs">
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
          </div>
        </div>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleSellClick(holding)}
          disabled={!holding.crypto}
          className="w-full text-red-400 border-red-400 hover:bg-red-400 hover:text-white disabled:opacity-50"
        >
          <Minus className="w-3 h-3 mr-1" />
          Sell
        </Button>
      </Card>
    );
  };

  return (
    <>
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
            <>
              {/* Mobile View - Cards */}
              <div className="block md:hidden space-y-4">
                {portfolio.map((holding) => (
                  <MobileHoldingCard key={holding.cryptocurrency_id} holding={holding} />
                ))}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead className="text-right">Holdings</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">P&L</TableHead>
                      <TableHead className="text-right">24h Change</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {portfolio.map((holding) => {
                      const profitLoss = holding.current_value - holding.total_invested;
                      const profitLossPercentage = holding.total_invested > 0 
                        ? ((profitLoss / holding.total_invested) * 100) 
                        : 0;
                      const priceChange24h = holding.crypto?.price_change_percentage_24h || 0;

                      return (
                        <TableRow key={holding.cryptocurrency_id} className="hover:bg-white/10">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {holding.crypto?.logo_url ? (
                                <img 
                                  src={holding.crypto.logo_url} 
                                  alt={holding.crypto.symbol}
                                  className="w-8 h-8 rounded-full"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                                  {holding.crypto?.symbol?.slice(0, 2).toUpperCase() || 'CR'}
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{holding.crypto?.name || 'Unknown Cryptocurrency'}</div>
                                <div className="text-xs text-muted-foreground">{holding.crypto?.symbol?.toUpperCase() || 'N/A'}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-mono">
                              {formatCryptoQuantity(holding.quantity)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <FormattedNumber 
                              value={holding.crypto?.current_price || 0} 
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
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSellClick(holding)}
                              disabled={!holding.crypto}
                              className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white disabled:opacity-50"
                            >
                              <Minus className="w-3 h-3 mr-1" />
                              Sell
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {selectedHolding && selectedHolding.crypto && (
        <SellCryptoModal
          isOpen={sellModalOpen}
          onClose={() => {
            setSellModalOpen(false);
            setSelectedHolding(null);
          }}
          holding={{
            cryptocurrency_id: selectedHolding.cryptocurrency_id,
            quantity: selectedHolding.quantity,
            current_value: selectedHolding.current_value,
            crypto: selectedHolding.crypto
          }}
        />
      )}
    </>
  );
};

export default PortfolioHoldingsTable;
