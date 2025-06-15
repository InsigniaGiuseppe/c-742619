import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Percent, DollarSign, TrendingUp, X } from 'lucide-react';
import FormattedNumber from '@/components/FormattedNumber';
import CryptoLogo from '@/components/CryptoLogo';
import { useLending } from '@/hooks/useLending';
import { usePortfolio } from '@/hooks/usePortfolio';
import { formatCryptoQuantity } from '@/lib/cryptoFormatters';
import { motion } from 'framer-motion';

const LendingPage = () => {
  const { lendingPositions, lendingStats, loading, startLending, cancelLending, isStartingLending, isCancellingLending } = useLending();
  const { portfolio } = usePortfolio();
  
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [lendAmount, setLendAmount] = useState('');

  const getAnnualRate = (symbol: string) => {
    const topCoins = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL'];
    return topCoins.includes(symbol?.toUpperCase()) ? 5 : 3;
  };

  const getDailyReturn = (amount: number, symbol: string) => {
    const annualRate = getAnnualRate(symbol) / 100;
    return (amount * annualRate) / 365;
  };

  const selectedCryptoData = portfolio.find(p => p.cryptocurrency_id === selectedCrypto);
  const lendAmountNum = parseFloat(lendAmount) || 0;
  const expectedDailyReturn = selectedCryptoData ? getDailyReturn(lendAmountNum, selectedCryptoData.crypto?.symbol || '') : 0;
  const expectedDailyReturnUSD = expectedDailyReturn * (selectedCryptoData?.crypto?.current_price || 0);

  const handleStartLending = async () => {
    if (!selectedCrypto || !lendAmount || lendAmountNum <= 0) return;
    
    try {
      await startLending({ cryptoId: selectedCrypto, amount: lendAmountNum });
      setSelectedCrypto('');
      setLendAmount('');
    } catch (error) {
      console.error('Error starting lending:', error);
    }
  };

  const handleCancelLending = async (lendingId: string) => {
    try {
      await cancelLending(lendingId);
    } catch (error) {
      console.error('Error cancelling lending:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-20 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Crypto Lending & Staking</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Earn passive income by lending your cryptocurrency. Top 5 coins earn 5% APR, 
              while other supported coins earn 3% APR with daily payouts.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass glass-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Lent</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <FormattedNumber value={lendingStats.totalLentValue} type="currency" showTooltip={false} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {lendingStats.activeLendingCount} active position{lendingStats.activeLendingCount !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card className="glass glass-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Earned</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  <FormattedNumber value={lendingStats.totalEarnedInterest} type="currency" showTooltip={false} />
                </div>
                <p className="text-xs text-muted-foreground">Interest earned to date</p>
              </CardContent>
            </Card>

            <Card className="glass glass-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Yield</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {lendingStats.averageYield.toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground">Annual percentage rate</p>
              </CardContent>
            </Card>

            <Card className="glass glass-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Daily Yield</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <FormattedNumber value={lendingStats.totalEarnedInterest / 365} type="currency" showTooltip={false} />
                </div>
                <p className="text-xs text-muted-foreground">Estimated daily return</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="positions" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="positions">Active Positions</TabsTrigger>
              <TabsTrigger value="start">Start Lending</TabsTrigger>
            </TabsList>

            <TabsContent value="positions" className="space-y-6">
              <Card className="glass glass-hover">
                <CardHeader>
                  <CardTitle>Active Lending Positions</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse h-16 bg-gray-800 rounded-lg"></div>
                      ))}
                    </div>
                  ) : lendingPositions.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground space-y-2">
                      <div className="text-lg">No active lending positions</div>
                      <div className="text-sm">Start lending to earn passive income on your crypto</div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Coin</TableHead>
                            <TableHead className="text-right">Amount Lent</TableHead>
                            <TableHead className="text-right">Daily Yield</TableHead>
                            <TableHead className="text-right">Total Earned</TableHead>
                            <TableHead className="text-right">APR %</TableHead>
                            <TableHead className="text-right">Date Started</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lendingPositions.map((position) => {
                            const dailyYield = getDailyReturn(position.amount_lent, position.crypto.symbol);
                            const dailyYieldUSD = dailyYield * position.crypto.current_price;
                            
                            return (
                              <TableRow key={position.id} className="hover:bg-white/5">
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <CryptoLogo 
                                      logo_url={position.crypto.logo_url}
                                      name={position.crypto.name}
                                      symbol={position.crypto.symbol}
                                      size="sm"
                                    />
                                    <div>
                                      <div className="font-medium">{position.crypto.name}</div>
                                      <div className="text-xs text-muted-foreground">{position.crypto.symbol.toUpperCase()}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="space-y-1">
                                    <div className="font-mono">{formatCryptoQuantity(position.amount_lent)} {position.crypto.symbol}</div>
                                    <div className="text-xs text-muted-foreground">
                                      <FormattedNumber 
                                        value={position.amount_lent * position.crypto.current_price} 
                                        type="currency" 
                                        showTooltip={false} 
                                      />
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="space-y-1">
                                    <div className="font-mono">{formatCryptoQuantity(dailyYield)} {position.crypto.symbol}</div>
                                    <div className="text-xs text-muted-foreground">
                                      <FormattedNumber value={dailyYieldUSD} type="currency" showTooltip={false} />
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="space-y-1">
                                    <div className="font-mono text-green-500">{formatCryptoQuantity(position.total_interest_earned)} {position.crypto.symbol}</div>
                                    <div className="text-xs text-muted-foreground">
                                      <FormattedNumber 
                                        value={position.total_interest_earned * position.crypto.current_price} 
                                        type="currency" 
                                        showTooltip={false} 
                                      />
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Badge variant="default">
                                    {(position.annual_interest_rate * 100).toFixed(1)}%
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="text-sm">
                                    {new Date(position.lending_started_at).toLocaleDateString()}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Badge variant="default" className="bg-green-500">
                                    Active
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCancelLending(position.id)}
                                    disabled={isCancellingLending}
                                    className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    Cancel
                                  </Button>
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
            </TabsContent>

            <TabsContent value="start" className="space-y-6">
              <Card className="glass glass-hover max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>Start Lending</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Select a cryptocurrency from your portfolio to start earning interest
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {portfolio.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground space-y-2">
                      <div className="text-lg">No holdings available</div>
                      <div className="text-sm">You need to own cryptocurrency to start lending</div>
                    </div>
                  ) : (
                    <>
                      {/* Coin Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="crypto-select">Select Cryptocurrency</Label>
                        <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a crypto to lend" />
                          </SelectTrigger>
                          <SelectContent>
                            {portfolio.map((holding) => (
                              <SelectItem key={holding.cryptocurrency_id} value={holding.cryptocurrency_id}>
                                <div className="flex items-center gap-2">
                                  <CryptoLogo 
                                    logo_url={holding.crypto?.logo_url}
                                    name={holding.crypto?.name || 'Unknown'}
                                    symbol={holding.crypto?.symbol || 'N/A'}
                                    size="sm"
                                  />
                                  <span>{holding.crypto?.symbol} - {formatCryptoQuantity(holding.quantity)} available</span>
                                  <Badge variant="outline" className="ml-auto">
                                    {getAnnualRate(holding.crypto?.symbol || '')}% APR
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Amount Input */}
                      {selectedCrypto && (
                        <div className="space-y-2">
                          <Label htmlFor="lend-amount">Amount to Lend</Label>
                          <Input
                            id="lend-amount"
                            type="number"
                            placeholder="0.00"
                            value={lendAmount}
                            onChange={(e) => setLendAmount(e.target.value)}
                            max={selectedCryptoData?.quantity || 0}
                            step="any"
                            className="font-mono"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Available: {formatCryptoQuantity(selectedCryptoData?.quantity || 0)} {selectedCryptoData?.crypto?.symbol}</span>
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              onClick={() => setLendAmount(selectedCryptoData?.quantity.toString() || '0')}
                            >
                              Use Max
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Expected Returns */}
                      {selectedCrypto && lendAmountNum > 0 && (
                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg space-y-2">
                          <h4 className="font-medium text-blue-400">Expected Returns</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Annual Interest Rate:</span>
                              <span className="font-medium">{getAnnualRate(selectedCryptoData?.crypto?.symbol || '')}% APR</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Daily Return:</span>
                              <span className="font-mono">
                                {formatCryptoQuantity(expectedDailyReturn)} {selectedCryptoData?.crypto?.symbol}
                                <span className="text-muted-foreground ml-1">
                                  (~<FormattedNumber value={expectedDailyReturnUSD} type="currency" showTooltip={false} />)
                                </span>
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Monthly Return:</span>
                              <span className="font-mono">
                                {formatCryptoQuantity(expectedDailyReturn * 30)} {selectedCryptoData?.crypto?.symbol}
                                <span className="text-muted-foreground ml-1">
                                  (~<FormattedNumber value={expectedDailyReturnUSD * 30} type="currency" showTooltip={false} />)
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Start Lending Button */}
                      <Button 
                        onClick={handleStartLending}
                        disabled={!selectedCrypto || !lendAmount || lendAmountNum <= 0 || lendAmountNum > (selectedCryptoData?.quantity || 0) || isStartingLending}
                        className="w-full"
                        size="lg"
                      >
                        {isStartingLending ? 'Starting Lending...' : 'Start Lending'}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default LendingPage;
