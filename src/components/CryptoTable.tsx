
import React from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Cryptocurrency } from '@/hooks/useCryptocurrencies';
import CryptoTableRow from './CryptoTableRow';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface CryptoTableProps {
  cryptos: Cryptocurrency[];
  onTrade: (crypto: Cryptocurrency) => void;
  onSort: (key: keyof Cryptocurrency) => void;
  sortConfig: { key: keyof Cryptocurrency; direction: 'ascending' | 'descending' } | null;
}

const CryptoTable: React.FC<CryptoTableProps> = ({ cryptos, onTrade, onSort, sortConfig }) => {
  const renderSortIcon = (columnKey: keyof Cryptocurrency) => {
    if (sortConfig?.key !== columnKey) {
      return <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />;
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUp className="ml-2 h-4 w-4 shrink-0" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4 shrink-0" />;
  };

  const createSortHandler = (key: keyof Cryptocurrency) => () => onSort(key);

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-white/10 hover:bg-transparent">
          <TableHead className="w-[80px] p-1">
            <Button variant="ghost" size="sm" onClick={createSortHandler('market_cap_rank')} className="w-full justify-start p-2">
              # {renderSortIcon('market_cap_rank')}
            </Button>
          </TableHead>
          <TableHead className="p-1">
            <Button variant="ghost" size="sm" onClick={createSortHandler('name')} className="w-full justify-start p-2">
              Name {renderSortIcon('name')}
            </Button>
          </TableHead>
          <TableHead className="p-1">
             <Button variant="ghost" size="sm" onClick={createSortHandler('current_price')} className="w-full justify-start p-2 text-left">
              Price {renderSortIcon('current_price')}
            </Button>
          </TableHead>
          <TableHead className="p-1">
            <Button variant="ghost" size="sm" onClick={createSortHandler('price_change_percentage_24h')} className="w-full justify-start p-2">
              24h % {renderSortIcon('price_change_percentage_24h')}
            </Button>
          </TableHead>
          <TableHead className="p-1">
            <Button variant="ghost" size="sm" onClick={createSortHandler('market_cap')} className="w-full justify-start p-2">
              Market Cap {renderSortIcon('market_cap')}
            </Button>
          </TableHead>
          <TableHead className="text-right p-1">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cryptos.map((crypto) => (
          <CryptoTableRow key={crypto.id} crypto={crypto} onTrade={onTrade} />
        ))}
      </TableBody>
    </Table>
  );
};

export default CryptoTable;
