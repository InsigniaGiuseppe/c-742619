
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Eye, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useAdminReserves } from '@/hooks/useAdminReserves';
import CryptoLogo from '@/components/CryptoLogo';
import FormattedNumber from '@/components/FormattedNumber';

const AdminReservePage: React.FC = () => {
  const { reserves, loading, error, totalValue, totalCryptoValue, totalEurValue } = useAdminReserves();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredReserves = reserves?.filter(reserve => 
    reserve.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reserve.asset_symbol.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK':
        return 'text-green-400 bg-green-500/20';
      case 'Low':
        return 'text-orange-400 bg-orange-500/20';
      case 'Critical':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK':
        return <CheckCircle className="w-4 h-4" />;
      case 'Low':
        return <AlertTriangle className="w-4 h-4" />;
      case 'Critical':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
          <h1 className="text-3xl font-bold">The Reserve</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="glass">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-700 animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
          <h1 className="text-3xl font-bold">The Reserve</h1>
        </div>
        <Card className="glass">
          <CardContent className="p-6">
            <p className="text-red-400">Error loading reserve data: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">R</span>
        </div>
        <h1 className="text-3xl font-bold">The Reserve</h1>
        <Badge variant="outline" className="ml-auto">
          Platform Liquidity Pool
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reserve Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <FormattedNumber value={totalValue} type="currency" currency="EUR" />
            </div>
            <p className="text-xs text-muted-foreground">Combined crypto + EUR</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Crypto Reserves
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <FormattedNumber value={totalCryptoValue} type="currency" currency="EUR" />
            </div>
            <p className="text-xs text-muted-foreground">All cryptocurrency holdings</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              EUR Liquidity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <FormattedNumber value={totalEurValue} type="currency" currency="EUR" />
            </div>
            <p className="text-xs text-muted-foreground">Fiat reserves available</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center gap-4">
            <CardTitle>Reserve Assets</CardTitle>
            <div className="relative ml-auto">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Reserve Amount</TableHead>
                <TableHead>EUR Value</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReserves.map((reserve) => (
                <TableRow key={reserve.asset_symbol}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {reserve.asset_symbol === 'EUR' ? (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">€</span>
                        </div>
                      ) : (
                        <CryptoLogo
                          logo_url={reserve.logo_url}
                          name={reserve.asset_name}
                          symbol={reserve.asset_symbol}
                          size="sm"
                        />
                      )}
                      <div>
                        <div className="font-medium">{reserve.asset_name}</div>
                        <div className="text-sm text-muted-foreground">{reserve.asset_symbol}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono">
                      <FormattedNumber value={reserve.reserve_amount} type="price" />
                      <span className="ml-1 text-sm text-muted-foreground">
                        {reserve.asset_symbol}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <FormattedNumber value={reserve.eur_value} type="currency" currency="EUR" />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {reserve.last_updated}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(reserve.status)}>
                      {getStatusIcon(reserve.status)}
                      <span className="ml-1">{reserve.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View Logs
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReservePage;
