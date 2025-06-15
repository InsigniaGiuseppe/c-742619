import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useLending } from '@/hooks/useLending';
import { PiggyBank, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import FormattedNumber from '@/components/FormattedNumber';
import CryptoLogo from '@/components/CryptoLogo';
import TotalLentCard from '@/components/lending/stats/TotalLentCard';
import PerformanceCard from '@/components/lending/stats/PerformanceCard';
import ReturnsCard from '@/components/lending/stats/ReturnsCard';
import PayoutCard from '@/components/lending/stats/PayoutCard';

const LendingPage = () => {
  const { portfolio } = usePortfolio();
  const { 
    lendingPositions, 
    lendingStats,
    loading, 
    startLending, 
    cancelLending, 
    isStartingLending, 
    isCancellingLending 
  } = useLending();
  
  const [selectedCrypto, setSelectedCrypto] = useState<string>('');
  const [lendingAmount, setLendingAmount] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Create a map of lent amounts for quick lookup
  const lentAmounts = lendingPositions.reduce((acc, pos) => {
    if (pos.status === 'active') {
      acc[pos.cryptocurrency_id] = (acc[pos.cryptocurrency_id] || 0) + pos.amount_lent;
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate available cryptos for lending, considering already lent amounts
  const availableCryptos = portfolio
    .map(item => {
      const lentAmount = lentAmounts[item.cryptocurrency_id] || 0;
      const availableQuantity = item.quantity - lentAmount;
      return { ...item, available_quantity: availableQuantity };
    })
    .filter(item => item.available_quantity > 1e-8); // Use a small epsilon to filter out dust

  const handleStartLending = () => {
    if (!selectedCrypto || !lendingAmount) {
      toast.error('Please select a cryptocurrency and enter an amount');
      return;
    }

    const amount = parseFloat(lendingAmount);
    // Find the selected crypto from our calculated availableCryptos list
    const selectedPosition = availableCryptos.find(p => p.cryptocurrency_id === selectedCrypto);

    if (!selectedPosition || amount > selectedPosition.available_quantity) {
      toast.error('Insufficient balance for this lending amount');
      return;
    }

    startLending(
      { cryptoId: selectedCrypto, amount },
      {
        onSuccess: () => {
          toast.success('Lending successful!');
          setIsDialogOpen(false);
          setSelectedCrypto('');
          setLendingAmount('');
        },
        onError: (error) => {
          toast.error(`Failed to start lending: ${error.message}`);
        },
      }
    );
  };

  const handleCancelLending = (positionId: string, symbol: string) => {
    cancelLending(positionId, {
      onSuccess: () => {
        toast.success(`Lending position for ${symbol} cancelled successfully!`);
      },
      onError: (error) => {
        toast.error(`Failed to cancel lending: ${error.message}`);
      },
    });
  };

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 md:px-6 lg:px-8 py-20 pt-24">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
            <img 
              src="/lovable-uploads/3765d287-ffd3-40d5-8628-4f8191064138.png" 
              alt="PROMPTO TRADING Logo" 
              className="w-8 h-8 md:w-10 md:h-10 object-contain"
            />
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">CRYPTO LENDING</h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            Earn passive income by lending your cryptocurrencies
          </p>
        </div>

        {/* Lending Statistics */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TotalLentCard 
            loading={loading}
            totalLentValue={lendingStats.totalLentValue}
            totalEarnedInterest={lendingStats.totalEarnedInterest}
          />
          <PerformanceCard 
            loading={loading}
            averageYield={lendingStats.averageYield}
            activeLendingCount={lendingStats.activeLendingCount}
          />
          <ReturnsCard
            loading={loading}
            estimatedDailyReturn={lendingStats.estimatedDailyReturn}
            estimatedMonthlyReturn={lendingStats.estimatedMonthlyReturn}
          />
          <PayoutCard
            loading={loading}
            nextPayoutIn={lendingStats.nextPayoutIn}
            daysSinceLastPayout={lendingStats.daysSinceLastPayout}
          />
        </div>

        {/* Active Lending Positions */}
        <Card className="glass glass-hover">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Active Lending Positions</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {lendingPositions.length} active position{lendingPositions.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New Lending Position
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-700">
                    <DialogHeader>
                      <DialogTitle>Start New Lending Position</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Select Cryptocurrency</label>
                        <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a cryptocurrency" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCryptos.map((crypto) => (
                              <SelectItem key={crypto.cryptocurrency_id} value={crypto.cryptocurrency_id}>
                                <div className="flex items-center gap-2">
                                  <CryptoLogo 
                                    logo_url={crypto.crypto.logo_url}
                                    name={crypto.crypto.name}
                                    symbol={crypto.crypto.symbol}
                                    size="sm"
                                  />
                                  <span>{crypto.crypto.symbol} - Available: {crypto.available_quantity.toFixed(6)}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Amount to Lend</label>
                        <Input
                          type="number"
                          value={lendingAmount}
                          onChange={(e) => setLendingAmount(e.target.value)}
                          placeholder="Enter amount"
                          step="0.000001"
                          min="0"
                        />
                      </div>

                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <h4 className="text-sm font-medium mb-2 text-blue-400">Interest Rates</h4>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p>• Top coins (BTC, ETH, USDT, BNB, SOL): <span className="text-green-500 font-medium">5% APR</span></p>
                          <p>• Other cryptocurrencies: <span className="text-green-500 font-medium">3% APR</span></p>
                          <p>• Interest paid daily at 9:00 AM</p>
                          <p>• Compound interest automatically applied</p>
                        </div>
                      </div>

                      <Button 
                        onClick={handleStartLending} 
                        className="w-full"
                        disabled={isStartingLending || !selectedCrypto || !lendingAmount || parseFloat(lendingAmount) <= 0}
                      >
                        {isStartingLending ? 'Starting...' : 'Start Lending'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-800 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : lendingPositions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <PiggyBank className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg mb-2">No Active Lending Positions</p>
                <p className="text-sm">Start your first lending position to begin earning passive income. <br/> Click "New Lending Position" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lendingPositions.map((position) => {
                  const dailyRate = position.annual_interest_rate / 365;
                  const dailyReturn = position.amount_lent * dailyRate;
                  const currentValue = position.amount_lent * position.crypto.current_price;
                  const monthlyReturn = dailyReturn * 30 * position.crypto.current_price;
                  
                  return (
                    <div 
                      key={position.id} 
                      className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 border border-white/10 gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <CryptoLogo 
                          logo_url={position.crypto.logo_url}
                          name={position.crypto.name}
                          symbol={position.crypto.symbol}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <h3 className="font-semibold text-lg">{position.crypto.symbol}</h3>
                            <Badge className="bg-green-500/20 text-green-400 self-start sm:self-auto">
                              {(position.annual_interest_rate * 100).toFixed(0)}% APR
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{position.crypto.name}</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Amount: </span>
                              <span className="font-medium">{position.amount_lent.toFixed(6)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Value: </span>
                              <FormattedNumber value={currentValue} type="currency" showTooltip={false} className="font-medium" />
                            </div>
                            <div>
                              <span className="text-muted-foreground">Daily: </span>
                              <FormattedNumber 
                                value={dailyReturn * position.crypto.current_price} 
                                type="currency" 
                                showTooltip={false} 
                                className="font-medium text-green-500" 
                              />
                            </div>
                            <div>
                              <span className="text-muted-foreground">Monthly: </span>
                              <FormattedNumber 
                                value={monthlyReturn} 
                                type="currency" 
                                showTooltip={false} 
                                className="font-medium text-blue-500" 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Interest Earned</div>
                          <FormattedNumber
                            value={position.total_interest_earned * position.crypto.current_price}
                            type="currency"
                            showTooltip={false}
                            className="font-semibold text-green-500"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelLending(position.id, position.crypto.symbol)}
                          disabled={isCancellingLending}
                          className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default LendingPage;
