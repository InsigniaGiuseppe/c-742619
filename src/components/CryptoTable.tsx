
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

interface CryptoTableProps {
  cryptos: Cryptocurrency[];
  onTrade: (crypto: Cryptocurrency) => void;
}

const CryptoTable: React.FC<CryptoTableProps> = ({ cryptos, onTrade }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-white/10">
          <TableHead className="w-[50px]">#</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>24h %</TableHead>
          <TableHead>Market Cap</TableHead>
          <TableHead className="text-right">Action</TableHead>
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
