
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, UserCheck, UserX, Shield, Eye, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with real data from Supabase
  const users = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      status: 'Active',
      accountType: 'Standard',
      dateJoined: '2024-01-15',
      kycStatus: 'Approved'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'Active',
      accountType: 'VIP',
      dateJoined: '2024-02-20',
      kycStatus: 'Pending'
    }
  ];

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500/20 text-green-400';
      case 'Frozen': return 'bg-yellow-500/20 text-yellow-400';
      case 'Blocked': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-500/20 text-green-400';
      case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'Rejected': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-20 pt-24">
        <div className="mb-8">
          <Button 
            onClick={() => navigate('/admin')}
            variant="outline" 
            className="glass mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Dashboard
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <img 
              src="/lovable-uploads/a2c0bb3a-a47b-40bf-ba26-d79f2f9e741b.png" 
              alt="PROMPTO TRADING Logo" 
              className="w-10 h-10 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <h1 className="text-4xl font-bold">User Management</h1>
              <p className="text-muted-foreground">Manage user accounts, KYC status, and permissions</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="glass glass-hover mb-8">
          <CardHeader>
            <CardTitle>Search Users</CardTitle>
            <CardDescription>Find users by name, email, or user ID</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/80"
                />
              </div>
              <Button className="button-gradient">Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="glass glass-hover">
          <CardHeader>
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
            <CardDescription>Click on a user to view detailed information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead>KYC Status</TableHead>
                    <TableHead>Date Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/5">
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.accountType}</TableCell>
                      <TableCell>
                        <Badge className={getKycStatusColor(user.kycStatus)}>
                          {user.kycStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.dateJoined}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="glass"
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="glass text-yellow-400 border-yellow-500/30"
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminUsers;
