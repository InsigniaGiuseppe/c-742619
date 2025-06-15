
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Cryptocurrency } from '@/hooks/useCryptocurrencies';
import CryptoLogo from './CryptoLogo';
import FormattedNumber from './FormattedNumber';

interface CryptoTableRowProps {
  crypto: Cryptocurrency;
  onTrade: (crypto: Cryptocurrency) => void;
}

const CryptoTableRow: React.FC<CryptoTableRowProps> = ({ crypto, onTrade }) => {
  const navigate = useNavigate();
  const priceChangePercentage = crypto.price_change_percentage_24h || 0;
  const isPositiveChange = priceChangePercentage >= 0;

  const handleRowClick = () => {
    navigate(`/crypto/${crypto.symbol.toLowerCase()}`);
  };

  return (
    <TableRow onClick={handleRowClick} className="cursor-pointer hover:bg-white/5">
      <TableCell className="font-medium text-muted-foreground">{crypto.market_cap_rank || '-'}</TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <CryptoLogo logo_url={crypto.logo_url} name={crypto.name} symbol={crypto.symbol} size="sm" />
          <div>
            <div className="font-bold">{crypto.name}</div>
            <div className="text-muted-foreground text-sm">{crypto.symbol.toUpperCase()}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <FormattedNumber value={crypto.current_price} type="currency" />
      </TableCell>
      <TableCell className={isPositiveChange ? 'text-green-500' : 'text-red-500'}>
        {priceChangePercentage.toFixed(2)}%
      </TableCell>
      <TableCell>
        <FormattedNumber value={crypto.market_cap || 0} type="currency" compact />
      </TableCell>
      <TableCell className="text-right">
        <Button 
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation(); // prevent row click from navigating
            onTrade(crypto);
          }}
          className="button-gradient"
        >
          Trade
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default CryptoTableRow;
