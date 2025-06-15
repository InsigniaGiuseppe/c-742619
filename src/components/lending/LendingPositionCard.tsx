
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import FormattedNumber from '@/components/FormattedNumber';
import CryptoLogo from '@/components/CryptoLogo';
import { LendingPosition } from '@/hooks/useLending';

interface LendingPositionCardProps {
  position: LendingPosition;
  onCancel: (positionId: string, symbol: string) => void;
  isCancelling: boolean;
}

const LendingPositionCard: React.FC<LendingPositionCardProps> = ({ position, onCancel, isCancelling }) => {
  const dailyRate = position.annual_interest_rate / 365;
  const dailyReturn = position.amount_lent * dailyRate;
  const currentValue = position.amount_lent * position.crypto.current_price;
  const monthlyReturn = dailyReturn * 30 * position.crypto.current_price;
  
  // Calculate time since lending started
  const lendingStarted = new Date(position.lending_started_at);
  const now = new Date();
  const hoursElapsed = Math.floor((now.getTime() - lendingStarted.getTime()) / (1000 * 60 * 60));
  const daysElapsed = Math.floor(hoursElapsed / 24);
  
  // Next payout calculation
  const getNextPayoutTime = () => {
    const tomorrow9AM = new Date();
    tomorrow9AM.setDate(tomorrow9AM.getDate() + 1);
    tomorrow9AM.setHours(9, 0, 0, 0);
    
    if (now.getHours() < 9) {
      const today9AM = new Date();
      today9AM.setHours(9, 0, 0, 0);
      const hoursUntil = Math.ceil((today9AM.getTime() - now.getTime()) / (1000 * 60 * 60));
      return hoursUntil <= 1 ? 'In less than 1 hour' : `In ${hoursUntil} hours`;
    } else {
      const hoursUntil = Math.ceil((tomorrow9AM.getTime() - now.getTime()) / (1000 * 60 * 60));
      return `In ${hoursUntil} hours`;
    }
  };

  const showEarningsPreview = position.total_interest_earned === 0 && hoursElapsed < 24;

  return (
    <div className="group relative p-6 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <CryptoLogo 
            logo_url={position.crypto.logo_url}
            name={position.crypto.name}
            symbol={position.crypto.symbol}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-bold text-xl text-white">{position.crypto.symbol}</h3>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1">
                {(position.annual_interest_rate * 100).toFixed(0)}% APR
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{position.crypto.name}</p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCancel(position.id, position.crypto.symbol)}
          disabled={isCancelling}
          className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-colors"
        >
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Amount Lent</p>
          <p className="font-semibold text-white">{position.amount_lent.toFixed(6)}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Current Value</p>
          <FormattedNumber value={currentValue} type="currency" showTooltip={false} className="font-semibold text-white" />
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Daily Earnings</p>
          <FormattedNumber 
            value={dailyReturn * position.crypto.current_price} 
            type="currency" 
            showTooltip={false} 
            className="font-semibold text-green-400" 
          />
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Monthly Est.</p>
          <FormattedNumber 
            value={monthlyReturn} 
            type="currency" 
            showTooltip={false} 
            className="font-semibold text-blue-400" 
          />
        </div>
      </div>

      {/* Interest Earned Section */}
      <div className="mb-4 p-4 bg-black/20 rounded-lg border border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Interest Earned</p>
            {showEarningsPreview ? (
              <div className="space-y-1">
                <p className="text-orange-400 font-medium">First payout {getNextPayoutTime()}</p>
                <p className="text-xs text-muted-foreground">
                  Expected: <FormattedNumber value={dailyReturn * position.crypto.current_price} type="currency" showTooltip={false} className="text-green-400" />
                </p>
              </div>
            ) : (
              <FormattedNumber
                value={position.total_interest_earned * position.crypto.current_price}
                type="currency"
                showTooltip={false}
                className="font-bold text-xl text-green-400"
              />
            )}
          </div>
          
          <div className="text-right text-xs text-muted-foreground">
            {daysElapsed > 0 ? (
              <p>Active for {daysElapsed} day{daysElapsed !== 1 ? 's' : ''}</p>
            ) : (
              <p>Started {hoursElapsed}h ago</p>
            )}
          </div>
        </div>
      </div>

      {/* Next Payout Info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Next payout: {getNextPayoutTime()}</span>
        <span>Paid at 9:00 AM daily</span>
      </div>
    </div>
  );
};

export default LendingPositionCard;
