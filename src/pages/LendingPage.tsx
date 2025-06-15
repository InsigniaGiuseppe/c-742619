import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimePortfolio } from '@/hooks/useRealtimePortfolio';
import { useLending } from '@/hooks/useLending';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import LendingStatsCard from '@/components/lending/LendingStatsCard';
import LendingPositionCard from '@/components/lending/LendingPositionCard';
import IdleCryptoSuggestions from '@/components/lending/IdleCryptoSuggestions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FormattedNumber from '@/components/FormattedNumber';

interface NewLendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCryptos: Array<any>;
  onLendingStarted: () => void;
}

const NewLendingModal: React.FC<NewLendingModalProps> = ({ isOpen, onClose, availableCryptos, onLendingStarted }) => {
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedCrypto || !amount) return;

    setIsSubmitting(true);
    try {
      const selectedCryptoData = availableCryptos.find(c => c.cryptocurrency_id === selectedCrypto);
      if (!selectedCryptoData) throw new Error('Crypto not found');

      const lendingAmount = parseFloat(amount);
      if (lendingAmount <= 0 || lendingAmount > selectedCryptoData.quantity) {
        throw new Error('Invalid lending amount');
      }

      // Start lending position
      const { error: lendingError } = await supabase
        .from('user_lending')
        .insert({
          user_id: user.id,
          cryptocurrency_id: selectedCrypto,
          amount_lent: lendingAmount,
          original_amount_lent: lendingAmount,
          annual_interest_rate: ['BTC', 'ETH', 'USDT', 'SOL'].includes(selectedCryptoData.crypto.symbol.toUpperCase()) ? 0.05 : 0.03,
          status: 'active'
        });

      if (lendingError) throw lendingError;

      // Update portfolio
      const { error: portfolioError } = await supabase
        .from('user_portfolios')
        .update({
          quantity: selectedCryptoData.quantity - lendingAmount
        })
        .eq('user_id', user.id)
        .eq('cryptocurrency_id', selectedCrypto);

      if (portfolioError) throw portfolioError;

      // Add transaction record with correct type
      const { error: transactionError } = await supabase
        .from('transaction_history')
        .insert({
          user_id: user.id,
          cryptocurrency_id: selectedCrypto,
          transaction_type: 'lending_start',
          amount: lendingAmount,
          usd_value: lendingAmount * selectedCryptoData.crypto.current_price,
          description: `Started lending ${lendingAmount} ${selectedCryptoData.crypto.symbol}`,
          status: 'completed'
        });

      if (transactionError) throw transactionError;

      toast.success(`Successfully started lending ${amount} ${selectedCryptoData.crypto.symbol}`);
      onLendingStarted();
      onClose();
      setSelectedCrypto('');
      setAmount('');
    } catch (error: any) {
      console.error('Lending error:', error);
      toast.error(`Failed to start lending: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>New Lending Position</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Cryptocurrency</label>
              <select 
                value={selectedCrypto} 
                onChange={(e) => setSelectedCrypto(e.target.value)}
                className="w-full p-2 border rounded bg-background"
                required
              >
                <option value="">Choose crypto to lend</option>
                {availableCryptos.map((crypto) => (
                  <option key={crypto.cryptocurrency_id} value={crypto.cryptocurrency_id}>
                    {crypto.crypto.symbol} - Available: {crypto.quantity.toFixed(6)}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedCrypto && (
              <div>
                <label className="block text-sm font-medium mb-2">Amount to Lend</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  max={availableCryptos.find(c => c.cryptocurrency_id === selectedCrypto)?.quantity || 0}
                  step="0.000001"
                  className="w-full p-2 border rounded bg-background"
                  placeholder="Enter amount"
                  required
                />
              </div>
            )}
            
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !selectedCrypto || !amount}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                {isSubmitting ? 'Starting...' : 'Start Lending'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const LendingPage: React.FC = () => {
  const { user } = useAuth();
  const { portfolio } = useRealtimePortfolio();
  const { lendingPositions, refetch: refetchLending } = useLending();
  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  const [isNewLendingModalOpen, setIsNewLendingModalOpen] = useState(false);

  // Calculate available cryptos for lending
  const availableCryptos = portfolio?.filter(item => item.quantity > 0).map(item => ({
    ...item,
    available_quantity: item.quantity,
    potential_daily_earnings: item.quantity * item.crypto.current_price * 0.05 / 365
  })) || [];

  // Calculate lending stats for the stats card
  const totalLentValue = lendingPositions?.reduce((sum, pos) => sum + (pos.amount_lent * pos.crypto.current_price), 0) || 0;
  const totalEarnedInterest = lendingPositions?.reduce((sum, pos) => sum + (pos.total_interest_earned * pos.crypto.current_price), 0) || 0;
  const estimatedDailyReturn = lendingPositions?.reduce((sum, pos) => {
    const dailyRate = pos.annual_interest_rate / 365;
    return sum + (pos.amount_lent * dailyRate * pos.crypto.current_price);
  }, 0) || 0;
  const estimatedMonthlyReturn = estimatedDailyReturn * 30;
  const averageYield = lendingPositions && lendingPositions.length > 0 
    ? (lendingPositions.reduce((sum, pos) => sum + pos.annual_interest_rate, 0) / lendingPositions.length) * 100 
    : 0;

  // Calculate next payout time
  const now = new Date();
  const tomorrow9AM = new Date();
  tomorrow9AM.setDate(tomorrow9AM.getDate() + 1);
  tomorrow9AM.setHours(9, 0, 0, 0);
  
  let nextPayoutIn: string;
  if (now.getHours() < 9) {
    const today9AM = new Date();
    today9AM.setHours(9, 0, 0, 0);
    const hoursUntil = Math.ceil((today9AM.getTime() - now.getTime()) / (1000 * 60 * 60));
    nextPayoutIn = hoursUntil <= 1 ? 'In less than 1 hour' : `In ${hoursUntil} hours`;
  } else {
    const hoursUntil = Math.ceil((tomorrow9AM.getTime() - now.getTime()) / (1000 * 60 * 60));
    nextPayoutIn = `In ${hoursUntil} hours`;
  }

  const stats = {
    totalLentValue,
    totalEarnedInterest,
    averageYield,
    activeLendingCount: lendingPositions?.length || 0,
    estimatedDailyReturn,
    estimatedMonthlyReturn,
    daysSinceLastPayout: 0,
    nextPayoutIn
  };

  const handleCancelLending = async (positionId: string, symbol: string) => {
    if (!user) return;
    
    setIsCancelling(positionId);
    try {
      const position = lendingPositions?.find(p => p.id === positionId);
      if (!position) throw new Error('Position not found');

      // Cancel lending position
      const { error: lendingError } = await supabase
        .from('user_lending')
        .update({
          status: 'cancelled',
          lending_cancelled_at: new Date().toISOString()
        })
        .eq('id', positionId);

      if (lendingError) throw lendingError;

      // Return crypto to portfolio
      const { data: existingPortfolio } = await supabase
        .from('user_portfolios')
        .select('quantity')
        .eq('user_id', user.id)
        .eq('cryptocurrency_id', position.cryptocurrency_id)
        .single();

      const newQuantity = (existingPortfolio?.quantity || 0) + position.amount_lent;
      
      const { error: portfolioError } = await supabase
        .from('user_portfolios')
        .upsert({
          user_id: user.id,
          cryptocurrency_id: position.cryptocurrency_id,
          quantity: newQuantity
        });

      if (portfolioError) throw portfolioError;

      // Add transaction record
      const { error: transactionError } = await supabase
        .from('transaction_history')
        .insert({
          user_id: user.id,
          cryptocurrency_id: position.cryptocurrency_id,
          transaction_type: 'lending_cancelled',
          amount: position.amount_lent,
          usd_value: position.amount_lent * position.crypto.current_price,
          description: `Cancelled lending position for ${position.amount_lent} ${symbol}`,
          status: 'completed'
        });

      if (transactionError) throw transactionError;

      toast.success(`Successfully cancelled lending position for ${symbol}`);
      refetchLending();
    } catch (error: any) {
      console.error('Cancel lending error:', error);
      toast.error(`Failed to cancel lending: ${error.message}`);
    } finally {
      setIsCancelling(null);
    }
  };

  const handleStartLendingFromSuggestion = (cryptoId: string) => {
    setIsNewLendingModalOpen(true);
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p className="text-muted-foreground">Please log in to access the lending platform.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-3 mb-4">
            <img 
              src="/lovable-uploads/3765d287-ffd3-40d5-8628-4f8191064138.png" 
              alt="PROMPTO TRADING Logo" 
              className="w-8 h-8 md:w-10 md:h-10 object-contain mx-auto sm:mx-0"
            />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">Crypto Lending</h1>
          </div>
          <p className="mt-4 text-lg text-muted-foreground">
            Lend your crypto assets and earn passive income with daily interest payments.
          </p>
        </div>

        {/* Lending Stats */}
        <LendingStatsCard 
          stats={stats}
          loading={false}
        />

        {/* Active Lending Positions */}
        <Card className="glass glass-hover">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl mb-2">Active Lending Positions</CardTitle>
                {lendingPositions && lendingPositions.length > 0 && (
                  <p className="text-lg font-semibold text-muted-foreground">
                    {lendingPositions.length} active position{lendingPositions.length !== 1 ? 's' : ''} • Earning{' '}
                    <FormattedNumber 
                      value={estimatedDailyReturn} 
                      type="currency" 
                      showTooltip={false} 
                      className="text-green-400 font-bold" 
                    />
                    /day
                  </p>
                )}
              </div>
              <Button
                onClick={() => setIsNewLendingModalOpen(true)}
                className="bg-green-500 hover:bg-green-600 text-white"
                disabled={availableCryptos.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Lending Position
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {lendingPositions && lendingPositions.length > 0 ? (
              <div className="grid gap-4">
                {lendingPositions.map((position) => (
                  <LendingPositionCard
                    key={position.id}
                    position={position}
                    onCancel={handleCancelLending}
                    isCancelling={isCancelling === position.id}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-2">No Active Lending Positions</p>
                <p className="text-sm">Start lending your crypto to earn daily interest.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Idle Crypto Suggestions */}
        {availableCryptos.length > 0 && (
          <IdleCryptoSuggestions
            availableCryptos={availableCryptos}
            onStartLending={handleStartLendingFromSuggestion}
          />
        )}

        {/* New Lending Modal */}
        <NewLendingModal
          isOpen={isNewLendingModalOpen}
          onClose={() => setIsNewLendingModalOpen(false)}
          availableCryptos={availableCryptos}
          onLendingStarted={refetchLending}
        />
      </div>
    </div>
  );
};

export default LendingPage;
