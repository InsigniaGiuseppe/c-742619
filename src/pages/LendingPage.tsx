
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useLending } from '@/hooks/useLending';
import { PiggyBank, Plus } from 'lucide-react';
import { toast } from 'sonner';
import CryptoLogo from '@/components/CryptoLogo';
import TotalLentCard from '@/components/lending/stats/TotalLentCard';
import PerformanceCard from '@/components/lending/stats/PerformanceCard';
import ReturnsCard from '@/components/lending/stats/ReturnsCard';
import PayoutCard from '@/components/lending/stats/PayoutCard';
import LendingPositionCard from '@/components/lending/LendingPositionCard';
import IdleCryptoSuggestions from '@/components/lending/IdleCryptoSuggestions';

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
      const topCoins = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL'];
      const apy = topCoins.includes(item.crypto.symbol.toUpperCase()) ? 0.05 : 0.03;
      const dailyRate = apy / 365;
      const potential_daily_earnings = availableQuantity * dailyRate * item.crypto.current_price;
      
      return { 
        ...item, 
        available_quantity: availableQuantity,
        potential_daily_earnings
      };
    })
    .filter(item => item.available_quantity > 1e-8); // Use a small epsilon to filter out dust

  const handleStartLending = (cryptoId?: string, amount?: string) => {
    const targetCrypto = cryptoId || selectedCrypto;
    const targetAmount = amount || lendingAmount;
    
    if (!targetCrypto || !targetAmount) {
      toast.error('Please select a cryptocurrency and enter an amount');
      return;
    }

    const amountNum = parseFloat(targetAmount);
    const selectedPosition = availableCryptos.find(p => p.cryptocurrency_id === targetCrypto);

    if (!selectedPosition || amountNum > selectedPosition.available_quantity) {
      toast.error('Insufficient balance for this lending amount');
      return;
    }

    startLending(
      { cryptoId: targetCrypto, amount: amountNum },
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

  const handleQuickLend = (cryptoId: string) => {
    setSelectedCrypto(cryptoId);
    setIsDialogOpen(true);
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
    <div>
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
          Earn passive income by lending your cryptocurrencies • Daily payouts at 9:00 AM • Cancel anytime
        </p>
      </div>

      {/* Enhanced Lending Statistics */}
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

      {/* Idle Crypto Suggestions */}
      {availableCryptos.length > 0 && (
        <div className="mb-8">
          <IdleCryptoSuggestions 
            availableCryptos={availableCryptos}
            onStartLending={handleQuickLend}
          />
        </div>
      )}

      {/* Active Lending Positions */}
      <Card className="glass glass-hover">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Active Lending Positions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {lendingPositions.length} active position{lendingPositions.length !== 1 ? 's' : ''}
                  {lendingPositions.length > 0 && (
                    <> • Earning <span className="text-green-400 font-medium">
                      €{lendingStats.estimatedDailyReturn.toFixed(2)}/day
                    </span></>
                  )}
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
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
                      {selectedCrypto && lendingAmount && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Estimated daily earnings: €{(parseFloat(lendingAmount) * 
                            (availableCryptos.find(c => c.cryptocurrency_id === selectedCrypto)?.potential_daily_earnings || 0) / 
                            (availableCryptos.find(c => c.cryptocurrency_id === selectedCrypto)?.available_quantity || 1)
                          ).toFixed(4)}
                        </p>
                      )}
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
                      onClick={() => handleStartLending()} 
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
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
                  <div className="h-32 bg-gray-800 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : lendingPositions.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <PiggyBank className="w-20 h-20 mx-auto mb-6 opacity-30" />
              <p className="text-xl mb-3">No Active Lending Positions</p>
              <p className="text-sm max-w-md mx-auto leading-relaxed">
                Start your first lending position to begin earning passive income. 
                Your crypto will work for you while you sleep! 
              </p>
              <Button 
                className="mt-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Start Lending Now
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {lendingPositions.map((position) => (
                <LendingPositionCard
                  key={position.id}
                  position={position}
                  onCancel={handleCancelLending}
                  isCancelling={isCancellingLending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LendingPage;
