
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface FilterState {
  search: string;
  accountStatus: string;
  kycStatus: string;
  accountType: string;
  dateRange: DateRange | undefined;
  balanceMin: string;
  balanceMax: string;
}

interface AdvancedUserFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  activeFilterCount: number;
}

const AdvancedUserFilters: React.FC<AdvancedUserFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  activeFilterCount
}) => {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card className="glass glass-hover mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Advanced Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount} active</Badge>
            )}
          </CardTitle>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Name, email, or ID..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="bg-transparent"
            />
          </div>

          {/* Account Status */}
          <div>
            <Label>Account Status</Label>
            <Select 
              value={filters.accountStatus || 'all'} 
              onValueChange={(value) => updateFilter('accountStatus', value === 'all' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="frozen">Frozen</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* KYC Status */}
          <div>
            <Label>KYC Status</Label>
            <Select 
              value={filters.kycStatus || 'all'} 
              onValueChange={(value) => updateFilter('kycStatus', value === 'all' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All KYC statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All KYC Statuses</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Account Type */}
          <div>
            <Label>Account Type</Label>
            <Select 
              value={filters.accountType || 'all'} 
              onValueChange={(value) => updateFilter('accountType', value === 'all' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Registration Date Range */}
          <div>
            <Label>Registration Date</Label>
            <DatePickerWithRange
              date={filters.dateRange}
              onDateChange={(range) => updateFilter('dateRange', range)}
              placeholder="Select date range"
            />
          </div>

          {/* Balance Range */}
          <div>
            <Label>Min Balance (USD)</Label>
            <Input
              type="number"
              placeholder="0"
              value={filters.balanceMin}
              onChange={(e) => updateFilter('balanceMin', e.target.value)}
              className="bg-transparent"
            />
          </div>

          <div>
            <Label>Max Balance (USD)</Label>
            <Input
              type="number"
              placeholder="No limit"
              value={filters.balanceMax}
              onChange={(e) => updateFilter('balanceMax', e.target.value)}
              className="bg-transparent"
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-sm font-medium mb-2">Active Filters:</div>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="outline">
                  Search: {filters.search}
                  <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => updateFilter('search', '')} />
                </Badge>
              )}
              {filters.accountStatus && (
                <Badge variant="outline">
                  Status: {filters.accountStatus}
                  <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => updateFilter('accountStatus', '')} />
                </Badge>
              )}
              {filters.kycStatus && (
                <Badge variant="outline">
                  KYC: {filters.kycStatus}
                  <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => updateFilter('kycStatus', '')} />
                </Badge>
              )}
              {filters.accountType && (
                <Badge variant="outline">
                  Type: {filters.accountType}
                  <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => updateFilter('accountType', '')} />
                </Badge>
              )}
              {filters.balanceMin && (
                <Badge variant="outline">
                  Min Balance: ${filters.balanceMin}
                  <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => updateFilter('balanceMin', '')} />
                </Badge>
              )}
              {filters.balanceMax && (
                <Badge variant="outline">
                  Max Balance: ${filters.balanceMax}
                  <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => updateFilter('balanceMax', '')} />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedUserFilters;
